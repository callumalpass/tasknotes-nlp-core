import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NaturalLanguageParserCore } from "../dist/index.js";

const fields = ["text", "list", "number", "boolean", "date"].map(type => ({
	id: type, key: type, displayName: type, type,
}));
const triggers = { triggers: [
	{ propertyId: "tags", trigger: "#", enabled: true },
	{ propertyId: "contexts", trigger: "@", enabled: true },
	{ propertyId: "projects", trigger: "+", enabled: true },
	...fields.map(field => ({ propertyId: field.id, trigger: `${field.id}:`, enabled: true })),
] };
const parser = (language = "en", config = triggers, scheduled = true) =>
	new NaturalLanguageParserCore([], [], scheduled, language, config, fields);

function noMarkers(result) {
	assert.doesNotMatch(JSON.stringify(result), /__TASKNOTES_NLP_LITERAL_\d+__/);
}

describe("nested literal restoration", () => {
	for (const quote of ['"', "'", "`"]) {
		it(`restores ${quote} quoted links in every textual field`, () => {
			const result = parser().parseInput(`Review ${quote}[[Email@domain.com]]${quote} +${quote}[[Project @ Work]]${quote} text:${quote}[[Reference]]${quote} list:${quote}[[Other]]${quote}\n${quote}[[Details]]${quote}`);
			assert.equal(result.title, "Review [[Email@domain.com]]");
			assert.deepEqual(result.projects, ["[[Project @ Work]]"]);
			assert.equal(result.userFields.text, "[[Reference]]");
			assert.deepEqual(result.userFields.list, ["[[Other]]"]);
			assert.equal(result.details, "[[Details]]");
			noMarkers(result);
		});
	}
	it("retains established wikilink-first project ordering", () => {
		assert.deepEqual(parser().parseInput("Task +simple +[[Linked]] +other").projects, ["[[Linked]]", "simple", "other"]);
	});
});

describe("original-input selector boundaries", () => {
	for (const input of ["Send jane+work@example.com email", "Visit https://example.com/path#section", "Visit https://example.com/@user/path", "Learn C++programming", "Task (@work)", "task@work", "Task url/text:value", "Task xlist:value", "Task xboolean:true", "Task xnumber:12", "Task xdate:value"]) {
		it(`preserves ${input}`, () => {
			const result = parser().parseInput(input);
			assert.equal(result.title, input);
			assert.deepEqual(result.tags, []);
			assert.deepEqual(result.contexts, []);
			assert.deepEqual(result.projects, []);
			assert.equal(result.userFields, undefined);
		});
	}
	it("does not manufacture boundaries after earlier removals", () => {
		for (const input of ["Task @work+project", "Task #tag@work", "Task +project text:value+next", "Task @worklist:value"]) {
			const result = parser().parseInput(input);
			if (input === "Task @work+project") {
				assert.deepEqual(result.projects, []);
				assert.equal(result.title, "Task +project");
			} else if (input === "Task #tag@work") {
				assert.deepEqual(result.contexts, []);
				assert.equal(result.title, "Task @work");
			} else if (input.includes("+next")) {
				assert.deepEqual(result.projects, ["project"]);
				assert.equal(result.title, "Task +next");
			} else {
				assert.equal(result.userFields, undefined);
			}
		}
	});
	it("accepts start, spaces, tabs and multi-character triggers", () => {
		const result = parser().parseInput("#tag\t@home +project text:value list:one list:two number:12 boolean:true date:2026-05-13 Task");
		assert.equal(result.title, "Task");
		assert.deepEqual(result.tags, ["tag"]);
		assert.deepEqual(result.contexts, ["home"]);
		assert.deepEqual(result.projects, ["project"]);
		assert.deepEqual(result.userFields, { text: "value", list: ["one", "two"], number: "12", boolean: "true", date: "2026-05-13" });
		const custom = parser("en", { triggers: [{ propertyId: "projects", trigger: "::", enabled: true }] });
		assert.deepEqual(custom.parseInput("Task ::project x::literal").projects, ["project"]);
	});
});

describe("repeated project prefixes", () => {
	it("consumes exactly one prefix and keeps the rest in the project name", () => {
		const result = parser().parseInput("Test-03 ++personal");
		assert.equal(result.title, "Test-03");
		assert.deepEqual(result.projects, ["+personal"]);
		assert.deepEqual(parser().parseInput("Task +++personal").projects, ["++personal"]);
		const custom = parser("en", { triggers: [{ propertyId: "projects", trigger: "::", enabled: true }] });
		assert.deepEqual(custom.parseInput("Task ::::personal").projects, ["::personal"]);
	});
	it("never rewrites protected or non-title text", () => {
		for (const [input, title] of [["Review [[Note ++personal]]", "Review [[Note ++personal]]"], ['Review "++personal"', "Review ++personal"], ["Review \\++personal", "Review ++personal"]]) {
			assert.equal(parser().parseInput(input).title, title);
			assert.deepEqual(parser().parseInput(input).projects, []);
		}
		assert.equal(parser().parseInput("Review\nAdd ++personal to notes").details, "Add ++personal to notes");
		assert.equal(parser("en", { triggers: [{ propertyId: "projects", trigger: "+", enabled: false }] }).parseInput("Task ++personal").title, "Task ++personal");
	});
});

describe("Italian relative dates", () => {
	it("parses local calendar days, including due/scheduled combinations and DST", (t) => {
		for (const now of [new Date(2026, 7, 29, 12), new Date(2026, 2, 28, 12), new Date(2026, 9, 24, 12)]) {
			t.mock.timers.enable({ apis: ["Date"], now });
			const iso = offset => {
				const date = new Date(now);
				date.setDate(date.getDate() + offset);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
			};
			for (const [word, offset] of [["oggi", 0], ["domani", 1], ["dopodomani", 2]]) {
				for (const prefix of ["", "entro ", "per "]) {
					const result = parser("it").parseInput(`Comprare pane ${prefix}${word}`);
					assert.equal(result.title, "Comprare pane");
					assert.equal(prefix ? result.dueDate : result.scheduledDate, iso(offset));
				}
			}
			const both = parser("it").parseInput("Comprare pane programmato per oggi entro dopodomani");
			assert.equal(both.scheduledDate, iso(0));
			assert.equal(both.dueDate, iso(2));
			assert.equal(both.title, "Comprare pane");
			assert.equal(parser("it", triggers, false).parseInput("Comprare pane domani").dueDate, iso(1));
			const apostrophes = parser("it").parseInput("L'amico arriva oggi e l'altro domani");
			assert.equal(apostrophes.scheduledDate, iso(0));
			assert.equal(apostrophes.title, "L'amico arriva e l'altro domani");
			t.mock.timers.reset();
		}
	});
	it("preserves links, metadata, escapes, Unicode words, details and quotes", (t) => {
		t.mock.timers.enable({ apis: ["Date"], now: new Date(2026, 7, 29, 12) });
		for (const [input, title] of [["Rivedere [[oggi]]", "Rivedere [[oggi]]"], ["Rivedere +[[domani]]", "Rivedere"], ["Rivedere #domani", "Rivedere"], ["Rivedere @oggi", "Rivedere"], ["Rivedere \\oggi", "Rivedere oggi"], ["Rivedere àoggi", "Rivedere àoggi"], ["Rivedere\noggi è il titolo del documento", "Rivedere"], ['Rivedere "oggi \\" domani"', 'Rivedere oggi \\" domani']]) {
			const result = parser("it").parseInput(input);
			assert.equal(result.title, title);
			assert.equal(result.dueDate, undefined);
			assert.equal(result.scheduledDate, undefined);
			if (input.includes("#")) assert.deepEqual(result.tags, ["domani"]);
			if (input.includes("@")) assert.deepEqual(result.contexts, ["oggi"]);
			if (input.includes("+")) assert.deepEqual(result.projects, ["[[domani]]"]);
			if (input.includes("\n")) assert.equal(result.details, "oggi è il titolo del documento");
			noMarkers(result);
		}
		assert.equal(parser().parseInput("Rivedere oggi").scheduledDate, undefined);
	});
});

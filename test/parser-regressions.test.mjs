import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NaturalLanguageParserCore } from "../dist/index.js";

const createParser = (options = {}) =>
	new NaturalLanguageParserCore(
		options.statuses || [],
		options.priorities || [],
		options.defaultToScheduled ?? false,
		options.language || "en",
		options.triggers,
		options.userFields,
		options.parserOptions
	);

describe("date trigger phrase matching", () => {
	it("removes explicit date triggers and their connecting text from titles", () => {
		for (const input of ["Task due 2026-05-13", "Task scheduled for 2026-05-13"]) {
			const result = createParser().parseInput(input);

			assert.equal(result.title, "Task");
		}
	});

	it("parses standalone scheduled and start triggers without losing due dates", () => {
		for (const input of [
			"Scheduled 2026-05-01 Due 2026-05-13",
			"Start 2026-05-01 Due 2026-05-13",
		]) {
			const result = createParser().parseInput(input);

			assert.equal(result.title, "Untitled Task");
			assert.equal(result.scheduledDate, "2026-05-01");
			assert.equal(result.dueDate, "2026-05-13");
		}
	});

	it("prefers longer triggers before standalone triggers", () => {
		const result = createParser().parseInput("Scheduled for 2026-05-01 Due 2026-05-13");

		assert.equal(result.title, "Untitled Task");
		assert.equal(result.scheduledDate, "2026-05-01");
		assert.equal(result.dueDate, "2026-05-13");
	});

	it("does not match short triggers inside longer words", () => {
		for (const input of ["one 2026-05-01", "only 2026-05-01", "started 2026-05-01"]) {
			const result = createParser().parseInput(input);

			assert.equal(result.title, input.split(" ")[0]);
			assert.equal(result.dueDate, "2026-05-01");
			assert.equal(result.scheduledDate, undefined);
		}
	});

	it("handles standalone German scheduled triggers", () => {
		for (const input of [
			"Geplant 2026-05-01 fällig 2026-05-13",
			"Starten 2026-05-01 fällig 2026-05-13",
		]) {
			const result = createParser({ language: "de" }).parseInput(input);

			assert.equal(result.title, "Untitled Task");
			assert.equal(result.scheduledDate, "2026-05-01");
			assert.equal(result.dueDate, "2026-05-13");
		}
	});
});

describe("locale-aware numeric date parsing", () => {
	it("parses DD/MM/YYYY for day-first date locales", () => {
		const parser = createParser({
			defaultToScheduled: true,
			parserOptions: { dateLocale: "en-GB" },
		});

		const result = parser.parseInput("11/06/2026");

		assert.equal(result.scheduledDate, "2026-06-11");
	});

	it("parses explicit trigger dates with day-first date locales", () => {
		const parser = createParser({
			parserOptions: { dateLocale: "en-GB" },
		});

		const result = parser.parseInput("due 11/06/2026");

		assert.equal(result.dueDate, "2026-06-11");
	});

	it("keeps MM/DD/YYYY for month-first date locales", () => {
		const parser = createParser({
			defaultToScheduled: true,
			parserOptions: { dateLocale: "en-US" },
		});

		const result = parser.parseInput("11/06/2026");

		assert.equal(result.scheduledDate, "2026-11-06");
	});

	it("accepts YYYY/MM/DD regardless of date locale", () => {
		const parser = createParser({
			defaultToScheduled: true,
			parserOptions: { dateLocale: "en-GB" },
		});

		const result = parser.parseInput("2026/06/11");

		assert.equal(result.scheduledDate, "2026-06-11");
	});

	it("supports explicit date order override", () => {
		const parser = createParser({
			defaultToScheduled: true,
			parserOptions: { dateOrder: "day-first" },
		});

		const result = parser.parseInput("11.06.2026");

		assert.equal(result.scheduledDate, "2026-06-11");
	});
});

describe("literal escapes", () => {
	it("keeps quoted course-code hours in the title instead of parsing a time estimate", () => {
		const result = createParser().parseInput('BIO "123H" - HW1');

		assert.equal(result.title, "BIO 123H - HW1");
		assert.equal(result.estimate, undefined);
	});

	it("keeps quoted date words in the title instead of parsing dates", () => {
		const result = createParser().parseInput('Something "Today"');

		assert.equal(result.title, "Something Today");
		assert.equal(result.scheduledDate, undefined);
		assert.equal(result.dueDate, undefined);
	});

	it("supports backtick and single-quote literal spans", () => {
		const backtickResult = createParser().parseInput("Read `tomorrow` magazine");
		const singleQuoteResult = createParser().parseInput("Review 'Today is the Day' book");

		assert.equal(backtickResult.title, "Read tomorrow magazine");
		assert.equal(backtickResult.scheduledDate, undefined);
		assert.equal(singleQuoteResult.title, "Review Today is the Day book");
		assert.equal(singleQuoteResult.scheduledDate, undefined);
	});

	it("keeps escaped triggers in the title without the escape slash", () => {
		const result = createParser().parseInput("Some task \\@ABC");

		assert.equal(result.title, "Some task @ABC");
		assert.deepEqual(result.contexts, []);
	});

	it("keeps escaped date words in the title", () => {
		const result = createParser({ defaultToScheduled: true }).parseInput(
			"Read \\tomorrow magazine"
		);

		assert.equal(result.title, "Read tomorrow magazine");
		assert.equal(result.scheduledDate, undefined);
		assert.equal(result.dueDate, undefined);
	});

	it("keeps escaped time estimates in the title", () => {
		const result = createParser().parseInput("BIO \\123H - HW1");

		assert.equal(result.title, "BIO 123H - HW1");
		assert.equal(result.estimate, undefined);
	});

	it("does not treat path backslashes as NLP escapes", () => {
		const result = createParser().parseInput("Use C:\\Users folder");

		assert.equal(result.title, "Use C:\\Users folder");
	});

	it("preserves quoted user field values after literal protection", () => {
		const parser = createParser({
			triggers: {
				triggers: [{ propertyId: "assignee", trigger: "assignee:", enabled: true }],
			},
			userFields: [
				{
					id: "assignee",
					displayName: "Assignee",
					key: "assignee",
					type: "text",
				},
			],
		});

		const result = parser.parseInput('my task assignee:"John Doe"');

		assert.equal(result.title, "my task");
		assert.equal(result.userFields.assignee, "John Doe");
	});
});

describe("custom status and priority phrase matching", () => {
	const statuses = [
		{
			id: "done",
			value: "done",
			label: "Done",
			color: "#22c55e",
			isCompleted: true,
			order: 0,
		},
	];
	const priorities = [
		{
			id: "high",
			value: "high",
			label: "High",
			color: "#ef4444",
			weight: 100,
		},
	];

	it("accepts punctuation as a separator", () => {
		const parser = createParser({ statuses, priorities });

		assert.deepEqual(parser.parseInput("Done, file taxes"), {
			title: "file taxes",
			tags: [],
			contexts: [],
			projects: [],
			status: "done",
		});
		assert.deepEqual(parser.parseInput("High: file taxes"), {
			title: "file taxes",
			tags: [],
			contexts: [],
			projects: [],
			priority: "high",
		});
	});

	it("does not match inside longer words", () => {
		const parser = createParser({ statuses, priorities });

		assert.equal(parser.parseInput("redone file taxes").status, undefined);
		assert.equal(parser.parseInput("highlight file taxes").priority, undefined);
	});
});

describe("CJK priority phrase matching", () => {
	it("does not treat the Japanese word for priority as high priority inside a title", () => {
		const parser = createParser({ language: "ja" });
		const result = parser.parseInput("タスク 優先度 高");

		assert.equal(result.priority, "high");
		assert.equal(result.title, "タスク 優先度");
	});

	it("does not treat the Chinese word for priority as high priority inside a title", () => {
		const parser = createParser({ language: "zh" });
		const result = parser.parseInput("任务 优先级 高");

		assert.equal(result.priority, "high");
		assert.equal(result.title, "任务 优先级");
	});
});

describe("fallback status and priority phrase matching", () => {
	it("uses the same boundary rules for built-in words", () => {
		const parser = createParser();

		assert.deepEqual(parser.parseInput("Done, file taxes"), {
			title: "file taxes",
			tags: [],
			contexts: [],
			projects: [],
			status: "done",
		});
		assert.deepEqual(parser.parseInput("High: file taxes"), {
			title: "file taxes",
			tags: [],
			contexts: [],
			projects: [],
			priority: "high",
		});
		assert.equal(parser.parseInput("redone file taxes").status, undefined);
		assert.equal(parser.parseInput("highlight file taxes").priority, undefined);
	});
});

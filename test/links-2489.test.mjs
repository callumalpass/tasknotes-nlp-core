import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTaskParser } from "../dist/index.js";
import { referenceDate } from "./languages/examples.mjs";

// tasknotes#2489: text inside a link is part of the link, not task syntax.
const tomorrow = {
	en: "tomorrow", de: "morgen", fr: "demain", es: "mañana", it: "domani", pt: "amanhã",
	nl: "morgen", sv: "imorgon", ru: "завтра", uk: "завтра", ja: "明日", zh: "明天",
};

for (const [language, word] of Object.entries(tomorrow)) {
	describe(`${language}: links are kept whole`, () => {
		const parser = createTaskParser({ language, referenceDate });
		const links = [
			`[[2026-11-03 Meeting ${word} #tag @ctx !high]]`,
			`[[Notes/2026-11-03|${word}]]`,
			`[2026-11-03 ${word} #tag](<2026-11-03 Meeting.md>)`,
			`![${word}](2026-11-03.png)`,
			`https://example.com/2026-11-03/${word}#tag`,
		];

		for (const link of links) {
			it(link, () => {
				const task = parser.parse(`review ${link}`).task;
				assert.equal(task.title, `review ${link}`);
				assert.equal(task.scheduled, undefined);
				assert.equal(task.due, undefined);
				assert.deepEqual([task.tags, task.contexts, task.priority], [[], [], undefined]);
			});

			it(`${link} with a date outside it`, () => {
				const { task, spans } = parser.parse(`review ${link} ${word}`);
				assert.equal(task.title, `review ${link}`);
				assert.deepEqual(task.scheduled, { date: "2026-10-30" });
				assert.deepEqual(spans.map((span) => span.text), [word]);
			});
		}
	});
}

describe("link triggers", () => {
	const parser = createTaskParser({ language: "en", referenceDate });

	it("still reads +[[project]] and +[project](link)", () => {
		const task = parser.parse("review +[[2026-11-03 Meeting]] +[Plan](Plan.md) tomorrow").task;
		assert.equal(task.title, "review");
		assert.deepEqual(task.projects, ["[[2026-11-03 Meeting]]", "[Plan](Plan.md)"]);
		assert.deepEqual(task.scheduled, { date: "2026-10-30" });
	});

	it("keeps sentence punctuation out of a bare URL", () => {
		const { task, spans } = parser.parse("read https://example.com/a, tomorrow");
		assert.equal(task.title, "read https://example.com/a");
		assert.deepEqual(spans.map((span) => span.text), ["tomorrow"]);
	});
});

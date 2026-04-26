import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NaturalLanguageParserCore } from "../dist/index.js";

const createParser = (options = {}) =>
	new NaturalLanguageParserCore(
		options.statuses || [],
		options.priorities || [],
		options.defaultToScheduled ?? false,
		options.language || "en"
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

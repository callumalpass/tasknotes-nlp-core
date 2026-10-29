import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NaturalLanguageParserCore } from "../dist/index.js";

// Thursday 29 October 2026, 10:00 local time.
const referenceDate = () => new Date(2026, 9, 29, 10, 0);
const priorities = ["low", "normal", "high", "urgent"].map((value, weight) => ({
	id: value,
	value,
	label: value[0].toUpperCase() + value.slice(1),
	color: "#000",
	weight,
}));

const parse = (input) =>
	new NaturalLanguageParserCore([], priorities, true, "en", undefined, [], {
		referenceDate,
	}).parseInput(input);

const fields = (result) =>
	Object.fromEntries(
		Object.entries(result).filter(
			([key, value]) => !Array.isArray(value) || value.length > 0
		)
	);

describe("titles keep only the task text", () => {
	for (const [input, expected] of [
		["write blog post, should take about 2 hours", { title: "write blog post", estimate: 120 }],
		["email Jo in three days, takes 10 minutes", { title: "email Jo", scheduledDate: "2026-11-01", estimate: 10 }],
		["review contract tmrw 2:15pm, 45m", { title: "review contract", scheduledDate: "2026-10-30", scheduledTime: "14:15", estimate: 45 }],
		["lunch with Sam at noon tomorrow", { title: "lunch with Sam", scheduledDate: "2026-10-30", scheduledTime: "12:00" }],
		["pay rent every month on the 1st", { title: "pay rent", scheduledDate: "2026-11-01", recurrence: "FREQ=MONTHLY" }],
		["high priority deploy the hotfix", { title: "deploy the hotfix", priority: "high" }],
		["urgent: fix prod", { title: "fix prod", priority: "urgent" }],
		["Call dentist (tomorrow)", { title: "Call dentist", scheduledDate: "2026-10-30" }],
		["Buy milk tomorrow, then eggs", { title: "Buy milk, then eggs", scheduledDate: "2026-10-30" }],
		// A possessive date sets the date but stays part of the title.
		["prep slides for monday's meeting", { title: "prep slides for monday's meeting", scheduledDate: "2026-11-02" }],
	]) {
		it(input, () => assert.deepEqual(fields(parse(input)), expected));
	}
});

describe("words that only look like values stay in the title", () => {
	for (const input of [
		"deploy the high-availability cluster",
		"meeting with Sun Ltd",
		"sit in the sun",
		"review the 2nd draft",
		"look at the logs",
	]) {
		it(input, () => assert.deepEqual(fields(parse(input)), { title: input }));
	}
});

describe("dates", () => {
	for (const [input, expected] of [
		["fix bug due before friday", { title: "fix bug", dueDate: "2026-10-30" }],
		["do taxes before april 5", { title: "do taxes", dueDate: "2027-04-05" }],
		["finish draft by eod", { title: "finish draft", dueDate: "2026-10-29" }],
		["finish report by end of next week", { title: "finish report", dueDate: "2026-11-06" }],
		["quarterly review at the end of the month", { title: "quarterly review", scheduledDate: "2026-10-31", recurrence: "FREQ=MONTHLY;INTERVAL=3" }],
		["gym on the 15th at 7am", { title: "gym", scheduledDate: "2026-11-15", scheduledTime: "07:00" }],
		["book flights for christmas", { title: "book flights", scheduledDate: "2026-12-25" }],
		["pick up kids at half past four", { title: "pick up kids", scheduledDate: "2026-10-29", scheduledTime: "16:30" }],
		["meet Alex at 3", { title: "meet Alex", scheduledDate: "2026-10-29", scheduledTime: "15:00" }],
		["meet Alex at 03:30", { title: "meet Alex", scheduledDate: "2026-10-30", scheduledTime: "03:30" }],
		["call back in 2 hours", { title: "call back", scheduledDate: "2026-10-29", scheduledTime: "12:00" }],
	]) {
		it(input, () => assert.deepEqual(fields(parse(input)), expected));
	}
});

describe("recurrence", () => {
	for (const [input, expected] of [
		["team standup every weekday at 9am", { title: "team standup", scheduledDate: "2026-10-30", scheduledTime: "09:00", recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" }],
		["gym every mon, wed and fri", { title: "gym", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR" }],
		["swim tuesdays and thursdays", { title: "swim", recurrence: "FREQ=WEEKLY;BYDAY=TU,TH" }],
		// The time lands on the next recurring day, not today or tomorrow.
		["call mum every sunday at 6pm", { title: "call mum", scheduledDate: "2026-11-01", scheduledTime: "18:00", recurrence: "FREQ=WEEKLY;BYDAY=SU" }],
	]) {
		it(input, () => assert.deepEqual(fields(parse(input)), expected));
	}
});

describe("estimates", () => {
	for (const [input, expected] of [
		["review PR 1.5h", { title: "review PR", estimate: 90 }],
		["yoga for half an hour", { title: "yoga", estimate: 30 }],
		["write tests 1 hour 30 minutes", { title: "write tests", estimate: 90 }],
	]) {
		it(input, () => assert.deepEqual(fields(parse(input)), expected));
	}
});

describe("parseInputWithSpans", () => {
	it("returns the data with input offsets", () => {
		const input = "Pay rent tomorrow #finance";
		const { data, spans } = new NaturalLanguageParserCore([], priorities, true, "en", undefined, [], {
			referenceDate,
		}).parseInputWithSpans(input);
		assert.equal(data.title, "Pay rent");
		assert.deepEqual(
			spans.map(({ kind, start, end }) => [kind, input.slice(start, end)]),
			[["scheduled", "tomorrow"], ["tag", "#finance"]]
		);
	});
});

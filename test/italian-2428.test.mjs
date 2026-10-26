import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NaturalLanguageParserCore, getAvailableLanguages, getLanguageConfig } from "../dist/index.js";

const parser = (language = "it") => new NaturalLanguageParserCore([], [], true, language);
const title = "Nome Attività";

describe("tasknotes#2428 Italian date expressions", () => {
	for (const expression of ["entro le 20:00", "entro 20:00"]) {
		it(expression, () => {
			const result = parser().parseInput(`${title} ${expression}`);
			assert.equal(result.title, title);
			assert.equal(result.dueTime, "20:00");
			assert.equal(result.scheduledDate, undefined);
			assert.equal(result.scheduledTime, undefined);
		});
	}
	for (const trigger of [
		"programmato per il", "programmata per", "programmata il",
		"programmata per il", "programmato per", "programmato il",
	]) {
		it(`${trigger} 25/12/2026`, () => {
			const result = parser().parseInput(`${title} ${trigger} 25/12/2026`);
			assert.equal(result.title, title);
			assert.equal(result.scheduledDate, "2026-12-25");
			assert.equal(result.dueDate, undefined);
		});
	}
	for (const trigger of ["entro il", "per il"]) {
		it(`${trigger} is due, not the nested scheduled il`, () => {
			const result = parser().parseInput(`${title} ${trigger} 25/12/2026`);
			assert.equal(result.title, title);
			assert.equal(result.dueDate, "2026-12-25");
			assert.equal(result.scheduledDate, undefined);
		});
	}
	for (const expression of [
		"programmata per il 25/12/2026 entro il 26/12/2026",
		"entro il 26/12/2026 programmata per il 25/12/2026",
	]) {
		it(`retains both fields: ${expression}`, () => {
			const result = parser().parseInput(`${title} ${expression}`);
			assert.equal(result.title, title);
			assert.equal(result.scheduledDate, "2026-12-25");
			assert.equal(result.dueDate, "2026-12-26");
		});
	}
	for (const [weekday, code] of [
		["lunedì", "MO"], ["martedì", "TU"], ["mercoledì", "WE"],
		["giovedì", "TH"], ["venerdì", "FR"], ["sabato", "SA"], ["domenica", "SU"],
	]) {
		for (const suffix of ["", ","]) {
			it(`ogni ${weekday}${suffix}`, () => {
				const result = parser().parseInput(`${title} ogni ${weekday}${suffix}`);
				assert.equal(result.title, `${title}${suffix ? ` ${suffix}` : ""}`);
				assert.equal(result.recurrence, `FREQ=WEEKLY;BYDAY=${code}`);
			});
		}
	}
	it("supports accented plural and ordinal weekday endings", () => {
		for (const [expression, recurrence] of [
			["lunedì", "FREQ=WEEKLY;BYDAY=MO"],
			["ogni secondo lunedì", "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=2"],
		]) {
			const result = parser().parseInput(`${title} ${expression}`);
			assert.equal(result.title, title);
			assert.equal(result.recurrence, recurrence);
		}
	});
	it("does not extract weekdays from longer Unicode words or compounds", () => {
		for (const word of ["lunedìx", "lunedìé", "lunedì2", "lunedì_", "lunedì\u0301", "lunedì-extra", "élunedì"]) {
			const result = parser().parseInput(`${title} ogni ${word}`);
			assert.equal(result.recurrence, undefined, word);
			assert.equal(result.title, `${title} ogni ${word}`);
		}
	});
});

describe("recurrence boundaries across all configured languages", () => {
	const codes = { monday: "MO", tuesday: "TU", wednesday: "WE", thursday: "TH", friday: "FR", saturday: "SA", sunday: "SU" };
	for (const language of getAvailableLanguages()) {
		const code = language.value;
		it(`${code}: all weekday spellings, including accented endings`, () => {
			const config = getLanguageConfig(code).recurrence;
			for (const [day, names] of Object.entries(config.weekdays)) {
				for (const name of names) {
					// Portuguese "todo" is also a fallback status; use the unambiguous "cada".
					const every = code === "pt" ? "cada" : config.every[0];
					const result = parser(code).parseInput(`Task ${every} ${name}`);
					assert.equal(result.recurrence, `FREQ=WEEKLY;BYDAY=${codes[day]}`, name);
					assert.equal(result.title, "Task", name);
				}
			}
		});
	}
});

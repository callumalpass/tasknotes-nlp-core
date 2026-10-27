import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";
import { NaturalLanguageParserCore, getAvailableLanguages, getLanguageConfig } from "../dist/index.js";

const parser = (language = "it") =>
	new NaturalLanguageParserCore([], [], true, language, undefined, undefined, { dateLocale: "it-IT" });
const parse = (expression, language) => parser(language).parseInput(`Nome attività ${expression}`);
const fields = (result) => ({
	title: result.title,
	dueDate: result.dueDate,
	dueTime: result.dueTime,
	scheduledDate: result.scheduledDate,
	scheduledTime: result.scheduledTime,
	recurrence: result.recurrence,
	estimate: result.estimate,
});
const expectFields = (expression, expected, language) =>
	assert.deepEqual(fields(parse(expression, language)), {
		title: "Nome attività",
		dueDate: undefined,
		dueTime: undefined,
		scheduledDate: undefined,
		scheduledTime: undefined,
		recurrence: undefined,
		estimate: undefined,
		...expected,
	});

// Wednesday 2026-10-28, 10:00 local time.
before(() => mock.timers.enable({ apis: ["Date"], now: new Date(2026, 9, 28, 10) }));
after(() => mock.timers.reset());

describe("tasknotes#2433 invalid numeric dates", () => {
	for (const literal of ["32/12/2026", "31/04/2026", "29/02/2027", "00/12/2026", "15/13/2026", "2026/13/01", "2026.02.30"]) {
		for (const expression of [`entro ${literal}`, literal]) {
			it(`preserves ${expression}`, () => {
				expectFields(expression, { title: `Nome attività ${expression}` });
			});
		}
	}
	it("accepts valid dates, including leap days", () => {
		expectFields("entro 31/12/2026", { dueDate: "2026-12-31" });
		expectFields("entro 29/02/2028", { dueDate: "2028-02-29" });
		expectFields("29/02/2028", { scheduledDate: "2028-02-29" });
	});
	it("still parses a valid date beside an invalid one", () => {
		expectFields("32/12/2026 entro 31/12/2026", { title: "Nome attività 32/12/2026", dueDate: "2026-12-31" });
	});
});

describe("tasknotes#2433 decimal estimates", () => {
	for (const [expression, estimate] of [
		["1,5 ore", 90], ["0,5 ore", 30], ["2,5 ore", 150], ["1.5 ore", 90], ["1,25 ore", 75],
		["2 ore", 120], ["1 ora 30 minuti", 90], ["1,5h", 90],
	]) {
		it(expression, () => expectFields(expression, { estimate }));
	}
	it("supports decimal hours in other languages", () => {
		expectFields("1.5 hours", { estimate: 90 }, "en");
	});
	for (const expression of ["1.5 minutes", "1.5 min", "1.333 hours", "v1.5 hours", "2.5.3 hours"]) {
		it(`keeps unsupported English decimals literal: ${expression}`, () => {
			expectFields(expression, { title: `Nome attività ${expression}` }, "en");
		});
	}
	for (const expression of ["1,5 minuti", "2.5.3 ore", "1,500 ore", "v1.5 ore"]) {
		it(`only matches whole numbers: ${expression}`, () => {
			expectFields(expression, { title: `Nome attività ${expression}` });
		});
	}
});

describe("tasknotes#2433 Italian weekdays", () => {
	const weekdays = [
		["lunedì", "MO", "2026-11-02"], ["martedì", "TU", "2026-11-03"],
		["mercoledì", "WE", "2026-10-28"], ["giovedì", "TH", "2026-10-29"],
		["venerdì", "FR", "2026-10-30"], ["sabato", "SA", "2026-10-31"],
		["domenica", "SU", "2026-11-01"],
	];
	for (const [weekday, code, date] of weekdays) {
		it(`entro ${weekday} is a one-off due date`, () => {
			expectFields(`entro ${weekday}`, { dueDate: date });
		});
		it(`${weekday} alone is a one-off scheduled date`, () => {
			expectFields(weekday, { scheduledDate: date });
		});
		it(`ogni ${weekday} stays weekly`, () => {
			expectFields(`ogni ${weekday}`, { recurrence: `FREQ=WEEKLY;BYDAY=${code}` });
		});
	}
	it("keeps distinct plural forms as recurrence", () => {
		expectFields("sabati", { recurrence: "FREQ=WEEKLY;BYDAY=SA" });
		expectFields("domeniche", { recurrence: "FREQ=WEEKLY;BYDAY=SU" });
	});
	it("keeps Spanish los lunes as recurrence and bare lunes as a date", () => {
		expectFields("los lunes", { recurrence: "FREQ=WEEKLY;BYDAY=MO" }, "es");
		expectFields("lunes", { scheduledDate: "2026-11-02" }, "es");
	});
	for (const [weekday, code] of [["lunes", "MO"], ["martes", "TU"], ["miércoles", "WE"], ["jueves", "TH"], ["viernes", "FR"], ["sábados", "SA"], ["domingos", "SU"]]) {
		it(`los ${weekday} is explicitly recurring`, () => {
			expectFields(`los ${weekday}`, { recurrence: `FREQ=WEEKLY;BYDAY=${code}` }, "es");
		});
	}
	for (const text of ["Revisar los 3 días de feria", "Pagar los 2 meses atrasados"]) {
		it(`does not treat a Spanish article as every: ${text}`, () => {
			assert.deepEqual(fields(parser("es").parseInput(text)), {
				title: text, dueDate: undefined, dueTime: undefined, scheduledDate: undefined,
				scheduledTime: undefined, recurrence: undefined, estimate: undefined,
			});
		});
	}
	it("combines recurrence with a separate due date", () => {
		expectFields("ogni lunedì entro venerdì", { recurrence: "FREQ=WEEKLY;BYDAY=MO", dueDate: "2026-10-30" });
	});
	it("ignores weekdays inside longer words", () => {
		for (const word of ["lunedìx", "lunedì-extra", "élunedì"]) {
			expectFields(`entro ${word}`, { title: `Nome attività entro ${word}` });
		}
	});
});

describe("tasknotes#2433 Italian date and time connectors", () => {
	for (const [expression, expected] of [
		["domani alle 20:00", { scheduledDate: "2026-10-29", scheduledTime: "20:00" }],
		["domani 20:00", { scheduledDate: "2026-10-29", scheduledTime: "20:00" }],
		["domani, alle 9:00", { scheduledDate: "2026-10-29", scheduledTime: "09:00" }],
		["entro il 25/12/2026 alle 20:00", { dueDate: "2026-12-25", dueTime: "20:00" }],
		["entro il 25/12/2026 20:00", { dueDate: "2026-12-25", dueTime: "20:00" }],
		["entro venerdì alle ore 18:30", { dueDate: "2026-10-30", dueTime: "18:30" }],
		["programmata per il 25/12/2026 alle 9:00", { scheduledDate: "2026-12-25", scheduledTime: "09:00" }],
		["entro le 20:00", { dueDate: "2026-10-28", dueTime: "20:00" }],
	]) {
		it(expression, () => expectFields(expression, expected));
	}
	it("keeps mixed scheduled and due dates with times", () => {
		const expected = {
			scheduledDate: "2026-10-29", scheduledTime: "09:00",
			dueDate: "2026-12-26", dueTime: "18:00",
		};
		expectFields("programmata per domani alle 9:00 entro il 26/12/2026 alle 18:00", expected);
		expectFields("entro il 26/12/2026 alle 18:00 programmata per domani alle 9:00", expected);
	});
});

describe("tasknotes#2433 weekdays after due triggers in all languages", () => {
	for (const { value: code } of getAvailableLanguages()) {
		it(`${code}: a due weekday is a date, not recurrence`, () => {
			const config = getLanguageConfig(code);
			const due = config.dateTriggers.due[0];
			for (const names of Object.values(config.recurrence.weekdays)) {
				const result = parser(code).parseInput(`Task ${due} ${names[0]}`);
				assert.equal(result.recurrence, undefined, names[0]);
				assert.equal(result.title, "Task", names[0]);
				assert.ok(result.dueDate, names[0]);
			}
		});
	}
});

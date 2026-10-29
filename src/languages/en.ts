import type { NLPLanguageConfig } from "./types.js";

/**
 * English language configuration for Natural Language Processing
 * Based on existing patterns from NaturalLanguageParser.ts
 */
export const enConfig: NLPLanguageConfig = {
	code: "en",
	name: "English",
	chronoLocale: "en",

	dateTriggers: {
		due: ["due", "deadline", "must be done by", "no later than", "by", "before"],
		scheduled: ["scheduled for", "start on", "begin on", "work on", "on", "scheduled", "start"],
	},

	recurrence: {
		frequencies: {
			daily: ["daily", "every day"],
			weekly: ["weekly", "every week"],
			monthly: ["monthly", "every month"],
			yearly: ["yearly", "annually", "every year"],
		},

		every: ["every"],
		other: ["other"],

		weekdays: {
			monday: ["monday", "mon"],
			tuesday: ["tuesday", "tue", "tues"],
			wednesday: ["wednesday", "wed"],
			thursday: ["thursday", "thu", "thur", "thurs"],
			friday: ["friday", "fri"],
			saturday: ["saturday", "sat"],
			sunday: ["sunday", "sun"],
		},

		pluralWeekdays: {
			monday: ["mondays"],
			tuesday: ["tuesdays"],
			wednesday: ["wednesdays"],
			thursday: ["thursdays"],
			friday: ["fridays"],
			saturday: ["saturdays"],
			sunday: ["sundays"],
		},

		weekdayGroups: {
			weekdays: ["every weekday", "every workday", "every business day", "weekdays", "workdays"],
			weekends: ["every weekend", "weekends"],
		},

		listConjunctions: ["and"],

		phrases: [
			{ phrase: "fortnightly", rule: "FREQ=WEEKLY;INTERVAL=2" },
			{ phrase: "every fortnight", rule: "FREQ=WEEKLY;INTERVAL=2" },
			{ phrase: "biweekly", rule: "FREQ=WEEKLY;INTERVAL=2" },
			{ phrase: "quarterly", rule: "FREQ=MONTHLY;INTERVAL=3" },
			{ phrase: "every quarter", rule: "FREQ=MONTHLY;INTERVAL=3" },
		],

		adjectives: ["daily", "weekly", "monthly", "yearly", "annual", "fortnightly", "biweekly", "quarterly"],

		until: ["until", "till", "through"],
		count: ["{n} times", "for {n} times"],

		ordinals: {
			first: ["first"],
			second: ["second"],
			third: ["third"],
			fourth: ["fourth"],
			last: ["last"],
		},

		periods: {
			day: ["day", "days"],
			week: ["week", "weeks"],
			month: ["month", "months"],
			year: ["year", "years"],
		},
	},

	timeEstimate: {
		hours: ["h", "hr", "hrs", "hour", "hours"],
		minutes: ["m", "min", "mins", "minute", "minutes"],
		relativePrefixes: ["in", "within", "after"],
		phrases: [
			{ phrase: "an hour and a half", minutes: 90 },
			{ phrase: "half an hour", minutes: 30 },
			{ phrase: "half hour", minutes: 30 },
			{ phrase: "an hour", minutes: 60 },
		],
	},

	connectors: {
		date: ["at", "on", "on the", "in", "for", "around", "from"],
		estimate: [
			"should take about",
			"should take around",
			"should take",
			"will take about",
			"will take",
			"takes about",
			"takes around",
			"takes",
			"take about",
			"take",
			"for about",
			"for around",
			"for",
			"about",
			"around",
			"approximately",
			"approx.",
			"approx",
			"roughly",
			"estimate",
			"est.",
			"~",
		],
		recurrence: ["on", "repeating", "repeats", "repeat"],
	},

	dates: {
		endOf: [
			...(["day", "week", "month", "year"] as const).flatMap((period) => [
				{ phrase: `end of ${period}`, period },
				{ phrase: `end of the ${period}`, period },
				{ phrase: `end of this ${period}`, period },
				{ phrase: `the end of the ${period}`, period },
				{ phrase: `the end of this ${period}`, period },
				{ phrase: `end of next ${period}`, period, next: true },
				{ phrase: `the end of next ${period}`, period, next: true },
			]),
			{ phrase: "eod", period: "day" },
			{ phrase: "eow", period: "week" },
			{ phrase: "eom", period: "month" },
			{ phrase: "eoy", period: "year" },
		],
		holidays: [
			{ phrase: "christmas eve", month: 12, day: 24 },
			{ phrase: "christmas day", month: 12, day: 25 },
			{ phrase: "christmas", month: 12, day: 25 },
			{ phrase: "xmas", month: 12, day: 25 },
			{ phrase: "new year's eve", month: 12, day: 31 },
			{ phrase: "new year's day", month: 1, day: 1 },
			{ phrase: "new year's", month: 1, day: 1 },
			{ phrase: "halloween", month: 10, day: 31 },
			{ phrase: "valentine's day", month: 2, day: 14 },
		],
		dayOfMonth: ["the {n}", "the {n} of the month", "the {n} of this month"],
		ordinalSuffixes: ["st", "nd", "rd", "th"],
		clockPhrases: [
			{ phrase: "half past {h}", minute: 30 },
			{ phrase: "half after {h}", minute: 30 },
			{ phrase: "quarter past {h}", minute: 15 },
			{ phrase: "quarter after {h}", minute: 15 },
			{ phrase: "quarter to {h}", minute: 45, hourOffset: -1 },
			{ phrase: "{h} o'clock", minute: 0 },
		],
		hourWords: {
			one: 1,
			two: 2,
			three: 3,
			four: 4,
			five: 5,
			six: 6,
			seven: 7,
			eight: 8,
			nine: 9,
			ten: 10,
			eleven: 11,
			twelve: 12,
		},
		bareHoursAreAfternoon: true,
		wordLikeWeekdays: ["sun", "sat", "wed"],
		nonDateWordsBefore: ["the", "a", "an", "with", "of", "in", "from"],
	},

	priorityWords: ["priority", "prio"],

	fallbackStatus: {
		open: ["todo", "to do", "open"],
		inProgress: ["in progress", "in-progress", "doing"],
		done: ["done", "completed", "finished"],
		cancelled: ["cancelled", "canceled"],
		waiting: ["waiting", "blocked", "on hold"],
	},

	fallbackPriority: {
		urgent: ["urgent", "critical", "highest"],
		high: ["high", "important"],
		normal: ["medium", "normal"],
		low: ["low", "minor"],
	},
};

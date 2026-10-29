import type { NLPLanguageConfig } from "./languages/types.js";

/**
 * Additions to a locale's chrono parser from the language's `dates` data:
 * end-of-period phrases, fixed annual dates, a day of the month on its own,
 * clock phrases such as "half past four", afternoon bare hours and word-like
 * weekday abbreviations.
 */

const NOT_WORD_BEFORE = "(?<![\\p{L}\\p{N}\\p{M}_])";
const NOT_WORD_AFTER = "(?![\\p{L}\\p{N}\\p{M}_])";
const MERIDIEM = "(?:\\s*([ap])\\.?m\\.?)?";

type Period = "day" | "week" | "month" | "year";
type Components = { year: number; month: number; day: number };

function toComponents(date: Date): Components {
	return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function atNoon(reference: Date): Date {
	const date = new Date(reference);
	date.setHours(12, 0, 0, 0);
	return date;
}

/** Next date (today or later) with this day of month, skipping months without it. */
function nextDayOfMonth(reference: Date, day: number): Date | null {
	const today = atNoon(reference);
	for (let offset = 0; offset < 12; offset += 1) {
		const candidate = new Date(today.getFullYear(), today.getMonth() + offset, day, 12);
		if (candidate.getDate() === day && candidate >= today) return candidate;
	}
	return null;
}

function nextAnnualDate(reference: Date, month: number, day: number): Date {
	const today = atNoon(reference);
	const candidate = new Date(today.getFullYear(), month - 1, day, 12);
	if (candidate < today) candidate.setFullYear(candidate.getFullYear() + 1);
	return candidate;
}

/**
 * End of a day, week, month or year, optionally the next one. A week ends on
 * weekEnd: Friday for a working week, Sunday for a calendar week.
 */
function endOf(reference: Date, period: Period, next: boolean, weekEnd: number): Date {
	const date = atNoon(reference);
	switch (period) {
		case "week": {
			const daysToEnd = (weekEnd - date.getDay() + 7) % 7;
			// The week starts on Monday: after a Friday end, the weekend belongs to that week.
			const weekStartOffset = (date.getDay() + 6) % 7;
			const endOffset = (weekEnd + 6) % 7;
			const passed = weekStartOffset > endOffset;
			date.setDate(date.getDate() + daysToEnd + (next && !passed ? 7 : 0));
			return date;
		}
		case "month":
			return new Date(date.getFullYear(), date.getMonth() + (next ? 2 : 1), 0, 12);
		case "year":
			return new Date(date.getFullYear() + (next ? 1 : 0), 11, 31, 12);
		default:
			if (next) date.setDate(date.getDate() + 1);
			return date;
	}
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Turns a phrase into a pattern source: spaces match any whitespace, ' matches ’. */
function phraseSource(phrase: string, slots: Record<string, string> = {}): string {
	return phrase
		.trim()
		.split(/(\{[a-z]+\})/)
		.map((part) => slots[part] ?? escapeRegex(part).replace(/\s+/g, "\\s+").replace(/'/g, "['’]?"))
		.join("");
}

function alternatives(phrases: string[], slots?: Record<string, string>): string {
	return [...phrases]
		.sort((a, b) => b.length - a.length)
		.map((phrase) => phraseSource(phrase, slots))
		.join("|");
}

export function extendChronoParser(parser: any, language: NLPLanguageConfig): any {
	const dates = language.dates ?? {};

	const before = language.spaceless ? "" : NOT_WORD_BEFORE;
	const after = language.spaceless ? "" : NOT_WORD_AFTER;
	const wrap = (source: string) => new RegExp(`${before}(?:${source})${after}`, "iu");

	const hourWords = Object.fromEntries(
		Object.entries(dates.hourWords ?? {}).map(([word, hour]) => [word.toLowerCase(), hour])
	);
	// An hour is not the start of a written time: "kl 15" but not "kl 15:30".
	const hourSlot = `(\\d{1,2}(?![:.]\\d)|${Object.keys(hourWords).map(escapeRegex).join("|") || "(?!)"})`;
	const parseHour = (text: string) => hourWords[text.toLowerCase()] ?? Number(text);
	const suffixes = (dates.ordinalSuffixes ?? []).map(escapeRegex).join("|");
	const daySlot = `(\\d{1,2})(?!\\d)${suffixes ? `(?:${suffixes})?` : ""}`;

	for (const clock of dates.clockPhrases ?? []) {
		const hasHour = clock.phrase.includes("{h}");
		parser.parsers.push({
			pattern: () =>
				wrap(`${phraseSource(clock.phrase, { "{h}": hourSlot })}${hasHour ? MERIDIEM : ""}`),
			extract: (_context: any, match: RegExpMatchArray) => {
				if (!hasHour) return { hour: clock.hour ?? 12, minute: clock.minute };
				let hour = parseHour(match[1]) + (clock.hourOffset ?? 0);
				if (hour < 1) hour += 12;
				if (hour > 24) return null;
				return withMeridiem({ hour, minute: clock.minute }, match[2]);
			},
		});
	}

	if (dates.dayOfMonth?.length) {
		// Only before the end of the phrase, punctuation, metadata, a number or a date
		// word: "the 15th at 7am" is a date, "review the 2nd draft" is not.
		const followers = [
			...(language.connectors?.date ?? []),
			...language.dateTriggers.due,
			...language.dateTriggers.scheduled,
			...(language.recurrence.listConjunctions ?? []),
		].filter((word) => word.trim());
		const followerSource = followers.length ? `|(?:${alternatives(followers)})${after}` : "";
		const source = alternatives(dates.dayOfMonth, { "{n}": daySlot });
		// Spaceless languages mark the day explicitly (15号, 15日), so anything may follow.
		// A unit after the day makes it a quantity: 15日分 is "15 days' worth".
		const units = alternatives([
			...language.timeEstimate.hours,
			...language.timeEstimate.minutes,
			...(language.timeEstimate.relativeSuffixes ?? []),
		]);
		const follower = language.spaceless
			? units
				? `(?!${units})`
				: ""
			: `(?=\\s*(?:$|[,;.)#@+]|\\d${followerSource}))`;
		parser.parsers.push({
			pattern: () => new RegExp(`${before}(?:${source})${follower}`, "iu"),
			extract: (context: any, match: RegExpMatchArray) => {
				const day = Number(match.slice(1).find((group) => group !== undefined));
				const date = nextDayOfMonth(context.refDate, day);
				return date ? toComponents(date) : null;
			},
		});
	}

	for (const entry of dates.endOf ?? []) {
		parser.parsers.push({
			pattern: () => wrap(phraseSource(entry.phrase)),
			extract: (context: any) =>
				toComponents(endOf(context.refDate, entry.period, Boolean(entry.next), dates.weekEnd ?? 5)),
		});
	}

	for (const entry of dates.relativeDays ?? []) {
		parser.parsers.push({
			pattern: () => wrap(phraseSource(entry.phrase)),
			extract: (context: any) => {
				const date = atNoon(context.refDate);
				date.setDate(date.getDate() + entry.days);
				return toComponents(date);
			},
		});
	}

	for (const holiday of dates.holidays ?? []) {
		parser.parsers.push({
			pattern: () => wrap(phraseSource(holiday.phrase)),
			extract: (context: any) =>
				toComponents(nextAnnualDate(context.refDate, holiday.month, holiday.day)),
		});
	}

	addRelativeDurations(parser, language, before, after);
	if (language.code !== "en" && language.code !== "it") addWeekdays(parser, language, before, after);
	parser.refiners.push({ refine: (context: any, results: any[]) => mergeDateAndTime(context, results, language) });

	const wordLike = new Set((dates.wordLikeWeekdays ?? []).map((word) => word.toLowerCase()));
	const nonDateBefore = new Set((dates.nonDateWordsBefore ?? []).map((word) => word.toLowerCase()));
	// Before chrono's own refiners, so forwardDate sees the corrected hour.
	parser.refiners.unshift(
		{
			refine: (context: any, results: any[]) =>
				results.filter((result) => !isWordLikeWeekday(context.text, result, wordLike, nonDateBefore)),
		},
		{
			refine: (_context: any, results: any[]) => {
				if (!dates.bareHoursAreAfternoon) return results;
				for (const result of results) {
					assumeAfternoon(result.text, result.start);
					if (result.end) assumeAfternoon(result.text, result.end);
				}
				return results;
			},
		}
	);

	return parser;
}

function withMeridiem(
	components: { hour: number; minute: number },
	meridiem: string | undefined
): Record<string, number> {
	if (!meridiem) return components;
	const pm = meridiem.toLowerCase() === "p";
	const hour = (components.hour % 12) + (pm ? 12 : 0);
	return { ...components, hour, meridiem: pm ? 1 : 0 };
}

/** "at 3" means 15:00. Written 24-hour times ("03:30") and explicit am/pm keep their hour. */
function assumeAfternoon(text: string, components: any): void {
	if (!components.isCertain("hour") || components.isCertain("meridiem")) return;
	const hour = components.get("hour");
	if (hour < 1 || hour > 6 || /(?<!\d)0\d/.test(text) || /\b(?:am|a\.m\.)/i.test(text)) return;
	components.assign("hour", hour + 12);
	components.assign("meridiem", 1);
}

function isWordLikeWeekday(
	text: string,
	result: any,
	wordLike: Set<string>,
	nonDateBefore: Set<string>
): boolean {
	const matched = result.text.trim().replace(/\.$/, "");
	if (!wordLike.has(matched.toLowerCase())) return false;

	const previous = text.slice(0, result.index).trim().split(/\s+/).pop()?.toLowerCase() ?? "";
	if (nonDateBefore.has(previous)) return true;

	// A capitalised abbreviation followed by a capitalised word reads as a name.
	const following = text.slice(result.index + result.text.length).trim();
	return /^\p{Lu}/u.test(matched) && /^\p{Lu}/u.test(following);
}

/** "in 2 hours", "dans une demi-heure", 3小时后: the reference time plus a duration. */
function addRelativeDurations(parser: any, language: NLPLanguageConfig, before: string, after: string): void {
	const estimate = language.timeEstimate;
	const prefixes = estimate.relativePrefixes ?? [];
	const suffixes = estimate.relativeSuffixes ?? [];
	if (prefixes.length === 0 && suffixes.length === 0) return;

	const hours = alternatives(estimate.hours);
	const minutes = alternatives(estimate.minutes);
	const phrases = estimate.phrases ?? [];
	const number = "(\\d+(?:[.,]\\d+)?)";
	const duration = [
		`${number}\\s*(?:${hours})(?:\\s*(\\d+)\\s*(?:${minutes}))?`,
		`(\\d+)\\s*(?:${minutes})`,
		...(phrases.length ? [`(${alternatives(phrases.map((phrase) => phrase.phrase))})`] : []),
	].join("|");
	const durationEnd = language.spaceless ? "" : NOT_WORD_AFTER;
	const forms = [
		...(prefixes.length ? [`(?:${alternatives(prefixes)})\\s*(?:${duration})${durationEnd}`] : []),
		...(suffixes.length ? [`(?:${duration})\\s*(?:${alternatives(suffixes)})`] : []),
	];

	for (const form of forms) {
		parser.parsers.push({
			pattern: () => new RegExp(`${before}${form}${after}`, "iu"),
			extract: (context: any, match: RegExpMatchArray) => {
				const [, hourCount, extraMinutes, minuteCount, phrase] = match;
				let total = 0;
				if (hourCount) total = Number(hourCount.replace(",", ".")) * 60 + Number(extraMinutes ?? 0);
				else if (minuteCount) total = Number(minuteCount);
				else if (phrase) {
					total =
						phrases.find((entry) => entry.phrase.toLowerCase() === phrase.toLowerCase().replace(/\s+/g, " "))
							?.minutes ?? 0;
				}
				if (!total) return null;
				const date = new Date(context.refDate.getTime() + Math.round(total) * 60000);
				return {
					...toComponents(date),
					hour: date.getHours(),
					minute: date.getMinutes(),
				};
			},
		});
	}
}

/**
 * Weekday names from the language data, for names chrono's locale misses:
 * German "Sonnabend", Ukrainian "п’ятницю" with a typographic apostrophe, Russian
 * "пятнице". The next such day, today included. Short names are left to chrono.
 */
function addWeekdays(parser: any, language: NLPLanguageConfig, before: string, after: string): void {
	const keys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
	const names = keys.map((key) =>
		language.recurrence.weekdays[key].filter((name) => [...name].length >= 4).map((name) => name.toLowerCase())
	);
	const all = names.flat();
	if (all.length === 0) return;
	parser.parsers.push({
		pattern: () => new RegExp(`${before}(${alternatives(all)})${after}`, "iu"),
		extract: (context: any, match: RegExpMatchArray) => {
			const text = match[1].toLowerCase().replace(/[’ʼ]/g, "'");
			const target = names.findIndex((group) => group.some((name) => name.replace(/[’ʼ]/g, "'") === text));
			if (target === -1) return null;
			const date = atNoon(context.refDate);
			date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7));
			return { ...toComponents(date), weekday: target };
		},
	});
}

/**
 * Joins a date and a time next to each other, as in "imorgon kl 15" or
 * "amanhã às dezesseis e meia", when the locale's own refiners did not.
 */
function mergeDateAndTime(context: any, results: any[], language: NLPLanguageConfig): any[] {
	const words = [
		...(language.connectors?.date ?? []),
		...(language.timeEstimate.clockPrefixes ?? []),
	].filter((word) => word.trim());
	const gapPattern = new RegExp(
		`^[\\s,]*(?:(?:${words.length ? alternatives(words) : "(?!)"})[\\s,]*)*$`,
		"iu"
	);
	const hasDay = (components: any) =>
		components.isCertain("day") || components.isCertain("weekday") || components.isCertain("month");
	const isTimeOnly = (result: any) => !result.end && result.start.isCertain("hour") && !hasDay(result.start);
	const isDateOnly = (result: any) => !result.end && !result.start.isCertain("hour") && hasDay(result.start);

	const merged: any[] = [];
	for (const result of [...results].sort((a, b) => a.index - b.index)) {
		const previous = merged[merged.length - 1];
		const gap = previous ? context.text.substring(previous.index + previous.text.length, result.index) : "";
		if (previous && previous.index + previous.text.length <= result.index && gapPattern.test(gap)) {
			const [date, time] = isDateOnly(previous) && isTimeOnly(result)
				? [previous, result]
				: isTimeOnly(previous) && isDateOnly(result)
					? [result, previous]
					: [null, null];
			if (date && time) {
				for (const key of ["hour", "minute", "meridiem"]) {
					if (time.start.isCertain(key)) date.start.assign(key, time.start.get(key));
				}
				date.index = previous.index;
				date.text = context.text.substring(previous.index, result.index + result.text.length);
				merged[merged.length - 1] = date;
				continue;
			}
		}
		merged.push(result);
	}
	return merged;
}

/**
 * Language configuration for Natural Language Processing
 * Defines patterns and keywords for different languages
 */

export interface NLPLanguageConfig {
	/** Language code (e.g., 'en', 'es', 'fr') */
	code: string;

	/** Display name of the language */
	name: string;

	/** Chrono-node locale key (e.g., 'en', 'es', 'fr') */
	chronoLocale: string;

	/** Date-related trigger words */
	dateTriggers: {
		/** Due date triggers (e.g., "due", "deadline", "by") */
		due: string[];

		/** Scheduled date triggers (e.g., "scheduled", "start", "on") */
		scheduled: string[];
	};

	/** Recurrence pattern keywords */
	recurrence: {
		/** General frequency words */
		frequencies: {
			daily: string[];
			weekly: string[];
			monthly: string[];
			yearly: string[];
		};

		/** "every" keyword variations */
		every: string[];

		/** "other" keyword for "every other" patterns */
		other: string[];

		/** Weekday names (full forms) */
		weekdays: {
			monday: string[];
			tuesday: string[];
			wednesday: string[];
			thursday: string[];
			friday: string[];
			saturday: string[];
			sunday: string[];
		};

		/** Plural weekday forms for recurrence (e.g. "mondays" implies recurring) */
		pluralWeekdays: {
			monday: string[];
			tuesday: string[];
			wednesday: string[];
			thursday: string[];
			friday: string[];
			saturday: string[];
			sunday: string[];
		};

		/** Weekday groups for recurrence, such as "every weekday" or "weekends" */
		weekdayGroups?: {
			/** Phrases meaning Monday to Friday */
			weekdays: string[];
			/** Phrases meaning Saturday and Sunday */
			weekends: string[];
		};

		/** Words joining weekdays in a list, such as "and" in "every monday and thursday" */
		listConjunctions?: string[];

		/**
		 * Whole phrases with their RRULE: "fortnightly" is "FREQ=WEEKLY;INTERVAL=2",
		 * "quarterly" is "FREQ=MONTHLY;INTERVAL=3".
		 */
		phrases?: Array<{ phrase: string; rule: string }>;

		/**
		 * Frequency words that can describe the next word and stay in the title, such as
		 * "weekly" in "weekly review". The recurrence still applies. Leave out adverbs
		 * that cannot describe a noun.
		 */
		adjectives?: string[];

		/**
		 * Where those adjectives go: "before" the noun they describe (English "weekly
		 * review", the default) or "after" it (Spanish "reunión semanal").
		 */
		adjectivePosition?: "before" | "after";

		/** Words after "every first monday" that are part of it: "of the month", "du mois". */
		ordinalSuffixes?: string[];

		/** Words that end a recurrence at a date: "until" in "every day until friday" */
		until?: string[];

		/** Phrases that limit a recurrence to a number of times, `{n}` standing for the number: "{n} times" */
		count?: string[];

		/** Ordinal indicators for "every [ordinal] [weekday]" */
		ordinals: {
			first: string[];
			second: string[];
			third: string[];
			fourth: string[];
			last: string[];
		};

		/** Time period words */
		periods: {
			day: string[];
			week: string[];
			month: string[];
			year: string[];
		};
	};

	/** Time estimate keywords */
	timeEstimate: {
		/** Hour indicators */
		hours: string[];

		/** Minute indicators */
		minutes: string[];

		/**
		 * Words that make a duration a relative date instead of an estimate,
		 * such as "in" in "call back in 2 hours"
		 */
		relativePrefixes?: string[];

		/** Word durations, such as "half an hour" */
		phrases?: Array<{ phrase: string; minutes: number }>;

		/**
		 * Words after a duration that make it a relative date, such as Chinese 后 in
		 * 3小时后 ("in 3 hours"). Prefixes go in relativePrefixes.
		 */
		relativeSuffixes?: string[];

		/**
		 * Words that introduce a clock time, so the hours after them are a time and not
		 * an estimate: French "à" in "à 15h", Swedish "kl".
		 */
		clockPrefixes?: string[];
	};

	/**
	 * Words that introduce a parsed value and are removed from the title with it,
	 * such as "at" in "call Jo at 3pm" or "takes" in "takes 10 minutes".
	 * Keyword connectors introduce priorities and statuses.
	 */
	connectors?: {
		date?: string[];
		estimate?: string[];
		recurrence?: string[];
		keyword?: string[];
	};

	/**
	 * Date phrases chrono does not know for this language. In phrases, spaces match
	 * any whitespace and ' also matches ’.
	 */
	dates?: {
		/** Relative days chrono misses: "the day after tomorrow" is 2. */
		relativeDays?: Array<{ phrase: string; days: number }>;

		/**
		 * Last day of the week for "end of the week", as a JavaScript day number:
		 * 5 (Friday, the default) for a working week, 0 for Sunday.
		 */
		weekEnd?: number;

		/** End of a period: "end of the month", "eow". `next` means the following one. */
		endOf?: Array<{ phrase: string; period: "day" | "week" | "month" | "year"; next?: boolean }>;
		/** Fixed annual dates, resolved to their next occurrence: "christmas". */
		holidays?: Array<{ phrase: string; month: number; day: number }>;
		/**
		 * A day of the month without a month, `{n}` standing for the number: "the {n}"
		 * matches "the 15th". Only parsed before the end of the text, punctuation or
		 * a date word, so "the 2nd draft" stays text.
		 */
		dayOfMonth?: string[];
		/** Suffixes that may follow `{n}`: "st", "nd", "rd", "th". */
		ordinalSuffixes?: string[];
		/**
		 * Times said in words, `{h}` standing for an hour (digits or hourWords):
		 * "half past {h}" is minute 30; "quarter to {h}" is minute 45 with hourOffset -1.
		 * A phrase without `{h}` gives `hour` itself: "noon" is hour 12, minute 0.
		 */
		clockPhrases?: Array<{ phrase: string; minute: number; hourOffset?: number; hour?: number }>;
		/** Hour words for `{h}`: "four": 4. */
		hourWords?: Record<string, number>;
		/** Whether a bare hour from 1 to 6, as in "at 3", means the afternoon. */
		bareHoursAreAfternoon?: boolean;
		/** Weekday abbreviations that are also ordinary words: "sun", "sat". */
		wordLikeWeekdays?: string[];
		/** Words after which a word-like abbreviation is not a weekday: "the sun". */
		nonDateWordsBefore?: string[];
	};

	/** Whether words are written without spaces between them, as in Chinese and Japanese. */
	spaceless?: boolean;

	/** Words that may accompany a priority and are removed with it, such as "priority" in "high priority" */
	priorityWords?: string[];

	/** Fallback status keywords (only used if user hasn't configured custom ones) */
	fallbackStatus: {
		open: string[];
		inProgress: string[];
		done: string[];
		cancelled: string[];
		waiting: string[];
	};

	/** Fallback priority keywords (only used if user hasn't configured custom ones) */
	fallbackPriority: {
		urgent: string[];
		high: string[];
		normal: string[];
		low: string[];
	};
}

/** Registry of available language configurations */
export interface LanguageRegistry {
	[languageCode: string]: NLPLanguageConfig;
}

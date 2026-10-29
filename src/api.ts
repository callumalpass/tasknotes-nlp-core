import {
	TaskParserEngine,
	type EngineConfig,
	type NumericDateOrder,
	type ParsedTaskData,
} from "./TaskParserEngine.js";
import { getLanguageConfig, mergeLanguageConfig, type LanguageOverrides } from "./languages/index.js";
import type { NLPTriggersConfig, UserMappedField } from "./types.js";

export type { NumericDateOrder };

/** A status the parser can recognise, by label, value or alias. */
export interface StatusOption {
	value: string;
	label?: string;
	aliases?: string[];
	/** Whether the status means the task is done. */
	completed?: boolean;
}

/** A priority the parser can recognise, by label, value or alias. */
export interface PriorityOption {
	value: string;
	label?: string;
	aliases?: string[];
}

export type CustomFieldType = "text" | "number" | "date" | "boolean" | "list";

/** A custom field set with a trigger, such as `assignee:jo` or `points:3`. */
export interface CustomFieldOption {
	id: string;
	trigger: string;
	type: CustomFieldType;
}

/** Trigger characters for metadata. `false` disables one. */
export interface TriggerOptions {
	/** Default `#` */
	tag?: string | false;
	/** Default `@` */
	context?: string | false;
	/** Default `+` */
	project?: string | false;
	/** Default `*`, as in `*done` or `*in progress*` */
	status?: string | false;
	/** Disabled by default. When set, as in `!high`, the bare word still matches too. */
	priority?: string | false;
}

/** Parts of the parser that can be turned off. All are on by default. */
export interface ParserFeatures {
	dates?: boolean;
	recurrence?: boolean;
	estimate?: boolean;
	priority?: boolean;
	status?: boolean;
}

export interface TaskParserOptions {
	/** Language code, such as `en` or `de`, or a locale such as `en-GB`. Default `en`. */
	language?: string;
	/**
	 * Locale for numeric dates: `en-GB` reads 11/06/2026 as 11 June. Defaults to
	 * `language` when it is a locale.
	 */
	locale?: string;
	/** Overrides the locale's numeric date order. */
	dateOrder?: NumericDateOrder;
	/** What relative dates resolve against. Defaults to the time of each parse. */
	referenceDate?: Date | (() => Date);
	/** Field a date without a due or scheduled word goes to. Default `scheduled`. */
	defaultDateField?: "scheduled" | "due";
	/** Statuses to recognise. Without any, the language's built-in status words apply. */
	statuses?: StatusOption[];
	/** Priorities to recognise. Without any, the language's built-in priority words apply. */
	priorities?: PriorityOption[];
	triggers?: TriggerOptions;
	fields?: CustomFieldOption[];
	features?: ParserFeatures;
	/**
	 * Additions to the language's phrases. Arrays are appended to the built-in ones,
	 * objects are merged and other values replace them.
	 */
	languageOverrides?: LanguageOverrides;
}

/** A date, with a time when one was given. */
export interface TaskDate {
	/** `YYYY-MM-DD` */
	date: string;
	/** `HH:mm`, 24-hour */
	time?: string;
}

export interface ParsedTask {
	/** The input left after parsing. Empty when nothing is left. */
	title: string;
	/** Lines after the first. */
	details?: string;
	scheduled?: TaskDate;
	due?: TaskDate;
	status?: string;
	/** Whether the status means done. */
	completed?: boolean;
	priority?: string;
	tags: string[];
	contexts: string[];
	projects: string[];
	/** An RFC 5545 RRULE without DTSTART, such as `FREQ=WEEKLY;BYDAY=MO`. */
	recurrence?: string;
	/** Minutes */
	estimate?: number;
	/** Custom field values by field ID: numbers, booleans, `YYYY-MM-DD` dates, lists. */
	fields: Record<string, string | number | boolean | string[]>;
}

export type SpanKind =
	| "tag"
	| "context"
	| "project"
	| "field"
	| "status"
	| "priority"
	| "recurrence"
	| "estimate"
	| "scheduled"
	| "due";

/** Where a value was found in the input. */
export interface ParsedSpan {
	kind: SpanKind;
	/** Offset in the input, in UTF-16 code units. */
	start: number;
	end: number;
	/** `input.slice(start, end)` */
	text: string;
	/** The custom field ID, for `field` spans. */
	field?: string;
	/** Whether the text stayed in the title, as a possessive date does ("monday's meeting"). */
	inTitle?: boolean;
}

export interface ParseResult {
	task: ParsedTask;
	/** Recognised values in input order. */
	spans: ParsedSpan[];
}

export interface TaskParser {
	readonly language: string;
	parse(input: string, options?: { referenceDate?: Date }): ParseResult;
}

/**
 * Creates a parser for task input such as
 * `Pay rent tomorrow 9am #finance every month`.
 */
export function createTaskParser(options: TaskParserOptions = {}): TaskParser {
	const engine = new TaskParserEngine(toEngineConfig(options));
	const fields = options.fields ?? [];
	const statuses = options.statuses ?? [];

	return {
		language: engine.languageCode,
		parse(input, parseOptions = {}) {
			const { data, spans } = engine.parse(input, parseOptions.referenceDate);
			return { task: toTask(data, fields, statuses, (text) => engine.parseDateValue(text, parseOptions.referenceDate)), spans };
		},
	};
}

export function toEngineConfig(options: TaskParserOptions): EngineConfig {
	const [languageCode, region] = (options.language ?? "en").split(/[-_]/);
	const language = mergeLanguageConfig(
		getLanguageConfig(languageCode.toLowerCase()),
		options.languageOverrides
	);
	const triggers = options.triggers ?? {};
	const trigger = (value: string | false | undefined, fallback: string | false) =>
		value === undefined ? fallback : value;

	const entries: Array<[string, string | false]> = [
		["tags", trigger(triggers.tag, "#")],
		["contexts", trigger(triggers.context, "@")],
		["projects", trigger(triggers.project, "+")],
		["status", trigger(triggers.status, "*")],
		["priority", trigger(triggers.priority, false)],
		...(options.fields ?? []).map((field): [string, string] => [field.id, field.trigger]),
	];
	const nlpTriggers: NLPTriggersConfig = {
		triggers: entries.map(([propertyId, value]) => ({
			propertyId,
			trigger: value || "",
			enabled: Boolean(value),
		})),
	};
	const userFields: UserMappedField[] = (options.fields ?? []).map((field) => ({
		id: field.id,
		displayName: field.id,
		key: field.id,
		type: field.type,
	}));

	return {
		language,
		statuses: (options.statuses ?? []).map((status) => ({
			value: status.value,
			label: status.label ?? status.value,
			aliases: status.aliases ?? [],
		})),
		priorities: (options.priorities ?? []).map((priority) => ({
			value: priority.value,
			label: priority.label ?? priority.value,
			aliases: priority.aliases ?? [],
		})),
		defaultToScheduled: (options.defaultDateField ?? "scheduled") === "scheduled",
		triggers: nlpTriggers,
		userFields,
		dateLocale: options.locale ?? (region ? options.language : undefined),
		dateOrder: options.dateOrder,
		referenceDate: options.referenceDate,
		features: {
			dates: options.features?.dates ?? true,
			recurrence: options.features?.recurrence ?? true,
			estimate: options.features?.estimate ?? true,
			priority: options.features?.priority ?? true,
			status: options.features?.status ?? true,
		},
	};
}

const BUILT_IN_COMPLETED_STATUSES = new Set(["done", "cancelled"]);

function toTask(
	data: ParsedTaskData,
	fields: CustomFieldOption[],
	statuses: StatusOption[],
	parseDate: (text: string) => string | undefined
): ParsedTask {
	const task: ParsedTask = {
		title: data.title,
		tags: data.tags,
		contexts: data.contexts,
		projects: data.projects,
		fields: {},
	};
	if (data.details) task.details = data.details;
	if (data.scheduledDate) {
		task.scheduled = { date: data.scheduledDate, ...(data.scheduledTime && { time: data.scheduledTime }) };
	}
	if (data.dueDate) task.due = { date: data.dueDate, ...(data.dueTime && { time: data.dueTime }) };
	if (data.status) {
		task.status = data.status;
		const configured = statuses.find((status) => status.value === data.status);
		task.completed = configured
			? Boolean(configured.completed)
			: statuses.length === 0 && BUILT_IN_COMPLETED_STATUSES.has(data.status);
	}
	if (data.priority) task.priority = data.priority;
	if (data.recurrence) task.recurrence = data.recurrence;
	if (data.estimate) task.estimate = data.estimate;

	for (const [id, value] of Object.entries(data.userFields ?? {})) {
		const type = fields.find((field) => field.id === id)?.type;
		task.fields[id] = normalizeFieldValue(value, type, parseDate);
	}
	return task;
}

function normalizeFieldValue(
	value: string | string[],
	type: CustomFieldType | undefined,
	parseDate: (text: string) => string | undefined
): string | number | boolean | string[] {
	if (Array.isArray(value)) return value;
	switch (type) {
		case "boolean": {
			const normalized = value.trim().toLowerCase();
			return normalized === "true" ? true : normalized === "false" ? false : value;
		}
		case "number": {
			const number = Number(value.replace(",", "."));
			return value.trim() !== "" && Number.isFinite(number) ? number : value;
		}
		case "date":
			return parseDate(value) ?? value;
		case "list":
			return [value];
		default:
			return value;
	}
}

import { format, isValid } from "date-fns";
import type { NLPTriggersConfig, UserMappedField } from "./types.js";
import * as chrono from "chrono-node";
import type { NLPLanguageConfig } from "./languages/index.js";
import { TriggerConfigService } from "./TriggerConfigService.js";
import { ClaimedText, type ClaimKind, type TextView } from "./ClaimedText.js";
import { MappedText } from "./MappedText.js";
import { extendChronoParser } from "./dateExtensions.js";

// Indexed by JavaScript day number, Sunday = 0.
const RRULE_WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const WEEKDAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export interface ParsedTaskData {
	title: string;
	details?: string;
	dueDate?: string;
	scheduledDate?: string;
	dueTime?: string;
	scheduledTime?: string;
	priority?: string;
	status?: string;
	tags: string[];
	contexts: string[];
	projects: string[];
	recurrence?: string;
	estimate?: number; // in minutes
	isCompleted?: boolean;
	userFields?: Record<string, string | string[]>; // Custom user-defined fields
}

export type NumericDateOrder = "day-first" | "month-first";

/** A status or priority the engine recognises by label, value or alias. */
export interface KeywordOption {
	value: string;
	label: string;
	aliases: string[];
}

export interface EngineFeatures {
	dates: boolean;
	recurrence: boolean;
	estimate: boolean;
	priority: boolean;
	status: boolean;
}

export interface EngineConfig {
	language: NLPLanguageConfig;
	statuses: KeywordOption[];
	priorities: KeywordOption[];
	defaultToScheduled: boolean;
	triggers: NLPTriggersConfig;
	userFields: UserMappedField[];
	/** Locale for ambiguous numeric dates such as 11/06/2026. */
	dateLocale?: string;
	/** Overrides the numeric date order of dateLocale. */
	dateOrder?: NumericDateOrder;
	/** What relative dates resolve against when a parse gives none. */
	referenceDate?: Date | (() => Date);
	features: EngineFeatures;
}

export type EngineSpanKind =
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

export interface EngineSpan {
	kind: EngineSpanKind;
	start: number;
	end: number;
	text: string;
	field?: string;
	inTitle?: boolean;
}

/**
 * Pipeline processor for modular parsing stages
 */
interface ParseProcessor {
	name: string;
	enabled: boolean;
	process(state: ClaimedText, result: ParsedTaskData, context: ParseContext): void;
}

type DateField = "due" | "scheduled";

/** Facts one parse records for later stages. */
interface ParseContext {
	/** Whether each parsed date named a day, rather than only a time ("at 6pm"). */
	dateHasDay: Partial<Record<DateField, boolean>>;
	/** Recognised values, in working-text offsets. */
	spans: Array<Omit<EngineSpan, "text">>;
	now: Date;
}

interface BoundaryConfig {
	boundary: string;
	endBoundary: string;
	spaceless: boolean;
}

interface PhraseMatch {
	fullMatch: string;
	phrase: string;
	startIndex: number;
	endIndex: number;
}

type SpanRecorder = (start: number, end: number, kind: EngineSpanKind, field?: string) => void;

const LITERAL_PLACEHOLDER = (index: number) => `__TASKNOTES_NLP_LITERAL_${index}__`;

/**
 * Parses one task line into structured data. Each stage claims the text it uses
 * from a ClaimedText, so later stages never see it and the title is built once
 * from what is left. Use createTaskParser for the public API.
 */
export class TaskParserEngine {
	private readonly recurrencePatterns: Array<{
		regex: RegExp;
		handler: (match: RegExpMatchArray) => string;
		/** One-word frequencies ("weekly") that can describe the next word instead. */
		adjective?: boolean;
	}>;
	private readonly languageConfig: NLPLanguageConfig;
	private readonly processingPipeline: ParseProcessor[];
	private readonly boundaries: BoundaryConfig;
	private readonly triggerConfig: TriggerConfigService;
	private chronoParser?: any;

	constructor(private readonly config: EngineConfig) {
		this.languageConfig = config.language;
		this.triggerConfig = new TriggerConfigService(config.triggers, config.userFields);
		this.boundaries = this.createBoundaryConfig();
		this.recurrencePatterns = this.buildRecurrencePatterns();
		this.processingPipeline = this.buildProcessingPipeline();
	}

	/** Whitespace between words: optional in languages written without spaces. */
	private get wordGap(): string {
		return this.boundaries.spaceless ? "\\s*" : "\\s+";
	}

	get languageCode(): string {
		return this.languageConfig.code;
	}

	get statuses(): KeywordOption[] {
		return this.config.statuses;
	}

	getUserField(fieldId: string): UserMappedField | undefined {
		return this.triggerConfig.getUserField(fieldId);
	}

	isValidRecurrence(rule: string): boolean {
		return this.isValidRRuleString(rule);
	}

	/**
	 * Word boundaries for patterns. Languages written without spaces have none;
	 * others treat any letter, digit or mark as part of a word, in any script.
	 */
	private createBoundaryConfig(): BoundaryConfig {
		const spaceless = Boolean(this.languageConfig.spaceless);
		return {
			boundary: spaceless ? "" : "(?<![\\p{L}\\p{N}\\p{M}_])",
			endBoundary: spaceless ? "" : "(?![\\p{L}\\p{N}\\p{M}_])",
			spaceless,
		};
	}

	/**
	 * Get the appropriate chrono parser for the configured language.
	 */
	private getChronoParser(): any {
		this.chronoParser ??= this.createChronoParser();
		return this.chronoParser;
	}

	private createChronoParser(): any {
		const locale = this.languageConfig.chronoLocale;
		const casual = ((chrono as any)[locale] ?? (chrono as any).en)?.casual;
		// Without a cloneable parser (as in some test mocks), use chrono as it is.
		if (typeof casual?.clone !== "function") return (chrono as any)[locale] || chrono;
		if (this.languageConfig.code !== "it") {
			return extendChronoParser(casual.clone(), this.languageConfig);
		}
		return extendChronoParser(this.createItalianParser(), this.languageConfig);
	}

	/**
	 * Italian uses chrono's English parser with Italian relative days and weekdays,
	 * as chrono's Italian locale is missing from older chrono versions.
	 */
	private createItalianParser(): any {
		// Extended only in the date stage, where literals, metadata and details have
		// already been separated.
		const parser = chrono.en.casual.clone();
		parser.parsers.push({
			pattern: () => /(?<![\p{L}\p{N}\p{M}_])(dopodomani|domani|oggi)(?![\p{L}\p{N}\p{M}_])/iu,
			extract: (context, match) => {
				const offset = { oggi: 0, domani: 1, dopodomani: 2 }[match[1].toLowerCase()]!;
				const date = new Date(context.refDate);
				date.setHours(12, 0, 0, 0);
				date.setDate(date.getDate() + offset);
				return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
			},
		});
		// Indexed by JavaScript day number, Sunday = 0.
		const configuredWeekdays = this.languageConfig.recurrence.weekdays;
		const weekdays = (
			["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
		).map((day) => configuredWeekdays[day].map((name) => name.toLowerCase()));
		const weekdayPattern = weekdays.flat().map(this.escapeRegex).join("|");
		parser.parsers.push({
			pattern: () =>
				new RegExp(`(?<![\\p{L}\\p{N}\\p{M}_-])(${weekdayPattern})(?![\\p{L}\\p{N}\\p{M}_-])`, "iu"),
			extract: (context, match) => {
				// Like chrono's other locales with forwardDate, today's weekday means today.
				const target = weekdays.findIndex((names) => names.includes(match[1].toLowerCase()));
				const date = new Date(context.refDate);
				date.setHours(12, 0, 0, 0);
				date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7));
				return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
			},
		});
		// Merge "domani alle 20:00" and "2026-12-25 alle 20:00" into one result, as
		// chrono's English refiner only joins dates and times across English connectors.
		parser.refiners.push({
			refine: (context, results) =>
				results.reduce<typeof results>((merged, result) => {
					const date = merged[merged.length - 1];
					const gap = date
						? context.text.substring(date.index + date.text.length, result.index)
						: "";
					if (
						date &&
						!date.end &&
						!result.end &&
						!date.start.isCertain("hour") &&
						result.start.isCertain("hour") &&
						!result.start.isCertain("day") &&
						!result.start.isCertain("weekday") &&
						/^\s*,?\s*(?:alle(?:\s+ore)?|alla|ore|a)?\s*$/iu.test(gap)
					) {
						date.start.assign("hour", result.start.get("hour") ?? 0);
						date.start.assign("minute", result.start.get("minute") ?? 0);
						date.text = context.text.substring(date.index, result.index + result.text.length);
						return merged;
					}
					merged.push(result);
					return merged;
				}, []),
		});
		return parser;
	}

	/**
	 * Build the modular processing pipeline.
	 * Each stage reads the unclaimed text and claims the spans it uses, so later
	 * stages never see them and the title is built once from what is left.
	 */
	private buildProcessingPipeline(): ParseProcessor[] {
		const { features } = this.config;
		const pipeline: ParseProcessor[] = [
			{
				name: "extractMetadata",
				enabled: true,
				process: (state, result, context) => {
					// Selector passes blank their tokens in place, keeping offsets stable, and
					// each pass checks the original preceding character, not exposed spaces.
					const view = state.view();
					const record: SpanRecorder = (start, end, kind, field) =>
						context.spans.push({
							kind,
							start: view.map[start],
							end: view.map[end - 1] + 1,
							...(field && { field }),
						});
					let remaining = this.extractTags(view.text, result, view.text, record);
					remaining = this.extractContexts(remaining, result, view.text, record);
					remaining = this.extractProjects(remaining, result, view.text, record);
					remaining = this.extractUserFields(remaining, result, view.text, record);
					this.claimBlankedText(state, view, remaining);
				},
			},
			{
				name: "extractPriority",
				enabled: features.priority,
				process: (state, result, context) => this.extractPriority(state, result, context),
			},
			{
				name: "extractStatus",
				enabled: features.status,
				process: (state, result, context) => this.extractStatus(state, result, context),
			},
			{
				name: "extractRecurrence",
				enabled: features.recurrence,
				process: (state, result, context) => this.extractRecurrence(state, result, context),
			},
			{
				name: "extractTimeEstimate",
				enabled: features.estimate,
				process: (state, result, context) => this.extractTimeEstimate(state, result, context),
			},
			{
				name: "parseUnifiedDatesAndTimes",
				enabled: features.dates,
				process: (state, result, context) =>
					this.parseUnifiedDatesAndTimes(state, result, context),
			},
		];
		return pipeline.filter((processor) => processor.enabled);
	}

	/**
	 * Parses one task. The first line is parsed; later lines become details. Spans
	 * give where each value was found, as offsets in the input.
	 */
	public parse(input: string, referenceDate?: Date): { data: ParsedTaskData; spans: EngineSpan[] } {
		const result: ParsedTaskData = {
			title: "",
			tags: [],
			contexts: [],
			projects: [],
		};

		// 1. Protect literals, normalize numeric dates, and separate the title line from details
		const literals: string[] = [];
		const protectedInput = this.protectNlpLiterals(input, literals);
		const normalizedInput = this.normalizeNumericDateLiterals(protectedInput, literals);
		const [working, details] = this.extractTitleAndDetails(normalizedInput);
		if (details) {
			result.details = details;
		}

		// 2. Run through the processing pipeline
		const state = new ClaimedText(working.text);
		const context: ParseContext = {
			dateHasDay: {},
			spans: [],
			now: referenceDate ? new Date(referenceDate.getTime()) : this.defaultNow(),
		};

		for (const processor of this.processingPipeline) {
			try {
				processor.process(state, result, context);
			} catch (error) {
				console.debug(`Error in processor ${processor.name}:`, error);
				// Continue with other processors even if one fails
			}
		}

		// 3. The unclaimed remainder is the title
		result.title = state.hasClaims()
			? state.buildTitle(this.languageConfig.connectors ?? {}, {
					spaceless: this.boundaries.spaceless,
				})
			: working.text.trim();
		this.alignDatesWithRecurrence(result, context);

		// 4. Validate and finalize the result
		const finalized = this.validateAndCleanupResult(result);
		this.restoreProtectedLiterals(finalized, literals);
		// Preserve linked-project-first ordering, with input order within each group.
		finalized.projects.sort((a, b) => Number(b.startsWith("[[")) - Number(a.startsWith("[[")));

		const spans = context.spans
			.map((span): EngineSpan => {
				const [start, end] = working.sourceRange(span.start, span.end);
				return { ...span, start, end, text: input.slice(start, end) };
			})
			.sort((a, b) => a.start - b.start || a.end - b.end);
		return { data: finalized, spans };
	}

	/** Parses a date such as a custom field value ("next friday") to YYYY-MM-DD. */
	public parseDateValue(text: string, referenceDate?: Date): string | undefined {
		const iso = /^\d{4}-\d{2}-\d{2}$/.test(text.trim()) ? text.trim() : undefined;
		if (iso) return iso;
		const parsed = this.parseChrono(text, referenceDate ?? this.defaultNow())[0];
		return parsed ? format(parsed.start.date(), "yyyy-MM-dd") : undefined;
	}

	/** Claims a span for a stage and records it as a parsed value. */
	private claimSpan(
		state: ClaimedText,
		view: TextView,
		start: number,
		end: number,
		claimKind: ClaimKind,
		context: ParseContext,
		kind: EngineSpanKind
	): void {
		const range = state.claim(view, start, end, claimKind);
		if (range) context.spans.push({ kind, start: range[0], end: range[1] });
	}

	/** Claims the characters a blanking pass replaced with spaces. */
	private claimBlankedText(state: ClaimedText, view: TextView, blanked: string): void {
		let start = -1;
		for (let index = 0; index <= view.text.length; index += 1) {
			const isBlanked = index < view.text.length && blanked[index] !== view.text[index];
			if (isBlanked && start === -1) start = index;
			if (!isBlanked && start !== -1) {
				state.claim(view, start, index, "metadata");
				start = -1;
			}
		}
	}

	private protectNlpLiterals(input: string, literals: string[]): MappedText {
		const structured = this.protectObsidianLinks(MappedText.from(input), literals);
		const quoted = this.protectQuotedLiterals(structured, literals);
		return this.protectEscapedLiterals(quoted, literals);
	}

	private protectObsidianLinks(input: MappedText, literals: string[]): MappedText {
		const source = input.text;
		const output = new MappedText();
		let index = 0;

		while (index < source.length) {
			const endIndex = source.startsWith("[[", index) ? source.indexOf("]]", index + 2) : -1;
			if (endIndex === -1) {
				output.appendFrom(input, index, index + 1);
				index += 1;
				continue;
			}

			const literal = source.slice(index, endIndex + 2);
			output.appendReplacing(input, index, endIndex + 2, this.protectLiteral(literal, literals));
			index = endIndex + 2;
		}

		return output;
	}

	private protectQuotedLiterals(input: MappedText, literals: string[]): MappedText {
		const source = input.text;
		const output = new MappedText();
		let index = 0;

		while (index < source.length) {
			const char = source[index];
			const endIndex =
				this.isQuoteDelimiter(char) && this.isEligibleQuoteStart(source, index)
					? this.findClosingQuote(source, index + 1, char)
					: -1;
			const literal = endIndex === -1 ? "" : source.slice(index + 1, endIndex);
			if (
				endIndex === -1 ||
				!this.isEligibleQuoteEnd(source, endIndex) ||
				literal.trim().length === 0
			) {
				output.appendFrom(input, index, index + 1);
				index += 1;
				continue;
			}

			output.appendReplacing(input, index, endIndex + 1, this.protectLiteral(literal, literals));
			index = endIndex + 1;
		}

		return output;
	}

	private protectEscapedLiterals(input: MappedText, literals: string[]): MappedText {
		const source = input.text;
		const output = new MappedText();
		let index = 0;

		while (index < source.length) {
			const literalStart = index + 1;
			if (
				source[index] !== "\\" ||
				literalStart >= source.length ||
				!this.shouldProtectEscapedLiteral(source, index, literalStart)
			) {
				output.appendFrom(input, index, index + 1);
				index += 1;
				continue;
			}

			let literalEnd = literalStart;
			while (literalEnd < source.length && !/\s/u.test(source[literalEnd])) {
				literalEnd += 1;
			}

			const literal = source.slice(literalStart, literalEnd);
			output.appendReplacing(input, index, literalEnd, this.protectLiteral(literal, literals));
			index = literalEnd;
		}

		return output;
	}

	private restoreProtectedLiterals(parsed: ParsedTaskData, literals: string[]): void {
		if (literals.length === 0) return;

		parsed.title = this.restoreProtectedLiteralsInText(parsed.title, literals)
			.replace(/\s+/g, " ")
			.trim();
		parsed.tags = parsed.tags.map((tag) => this.restoreProtectedLiteralsInText(tag, literals));
		parsed.contexts = parsed.contexts.map((context) =>
			this.restoreProtectedLiteralsInText(context, literals)
		);
		parsed.projects = parsed.projects.map((project) =>
			this.restoreProtectedLiteralsInText(project, literals)
		);
		if (parsed.details) {
			parsed.details = this.restoreProtectedLiteralsInText(parsed.details, literals);
		}
		if (parsed.userFields) {
			for (const [key, value] of Object.entries(parsed.userFields)) {
				if (typeof value === "string") {
					parsed.userFields[key] = this.restoreProtectedLiteralsInText(value, literals);
				} else {
					parsed.userFields[key] = value.map((item) =>
						this.restoreProtectedLiteralsInText(item, literals)
					);
				}
			}
		}
	}

	private restoreProtectedLiteralsInText(text: string, literals: string[]): string {
		let restored = text;
		// Later literals can contain placeholders for earlier protected spans.
		for (let index = literals.length - 1; index >= 0; index -= 1) {
			restored = restored.split(LITERAL_PLACEHOLDER(index)).join(literals[index]);
		}
		return restored;
	}

	private isQuoteDelimiter(char: string): boolean {
		return char === "\"" || char === "'" || char === "`";
	}

	private isEligibleQuoteStart(input: string, index: number): boolean {
		const char = input[index];
		if (char !== "'") return true;

		const previous = index > 0 ? input[index - 1] : "";
		return !this.isWordCharacter(previous);
	}

	private isEligibleQuoteEnd(input: string, index: number): boolean {
		const char = input[index];
		if (char !== "'") return true;

		const next = index + 1 < input.length ? input[index + 1] : "";
		return !this.isWordCharacter(next);
	}

	private findClosingQuote(input: string, startIndex: number, delimiter: string): number {
		for (let index = startIndex; index < input.length; index += 1) {
			if (input[index] !== delimiter) continue;

			const previous = index > 0 ? input[index - 1] : "";
			if (previous === "\\") continue;

			return index;
		}

		return -1;
	}

	private shouldProtectEscapedLiteral(
		input: string,
		escapeIndex: number,
		literalStart: number
	): boolean {
		if (this.startsWithEscapableTrigger(input, literalStart)) {
			return true;
		}

		const previous = escapeIndex > 0 ? input[escapeIndex - 1] : "";
		if (previous && !/\s/u.test(previous)) {
			return false;
		}

		return /[\p{L}\p{N}]/u.test(input[literalStart]);
	}

	private startsWithEscapableTrigger(input: string, index: number): boolean {
		return this.getEscapableTriggers().some((trigger) => input.startsWith(trigger, index));
	}

	private getEscapableTriggers(): string[] {
		const configured = this.triggerConfig
			.getTriggersOrderedByLength()
			.map((trigger) => trigger.trigger)
			.filter((trigger) => trigger.length > 0);

		return configured.length > 0 ? configured : ["#", "@", "+", "*", "!"];
	}

	private protectLiteral(literal: string, literals: string[]): string {
		literals.push(literal);
		return LITERAL_PLACEHOLDER(literals.length - 1);
	}

	/**
	 * Rewrites valid numeric dates as ISO dates. Invalid ones, such as 32/12/2026 or
	 * 29/02/2027, are protected as literals so chrono cannot parse a fragment of them.
	 */
	private normalizeNumericDateLiterals(input: MappedText, literals: string[]): MappedText {
		const yearFirst = input.replace(
			/(?<![\p{L}\p{N}_])(\d{4})[/.](\d{1,2})[/.](\d{1,2})(?![\p{L}\p{N}_])/gu,
			(match) =>
				this.toValidatedISODate(Number(match[1]), Number(match[2]), Number(match[3])) ??
				this.protectLiteral(match[0], literals)
		);

		const dayFirst = this.getNumericDateOrder() === "day-first";
		return yearFirst.replace(
			/(?<![\p{L}\p{N}_])(\d{1,2})[/.](\d{1,2})[/.](\d{4})(?![\p{L}\p{N}_])/gu,
			(match) => {
				const [first, second, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
				if (dayFirst) {
					return this.toValidatedISODate(year, second, first) ?? this.protectLiteral(match[0], literals);
				}
				// Month-first locales keep chrono's day-first fallback for dates like 13/12/2026.
				return this.toValidatedISODate(year, first, second) ||
					this.toValidatedISODate(year, second, first)
					? null
					: this.protectLiteral(match[0], literals);
			}
		);
	}

	private getNumericDateOrder(): NumericDateOrder {
		if (this.config.dateOrder) {
			return this.config.dateOrder;
		}

		const locale = this.config.dateLocale || this.languageConfig.code;
		try {
			const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2006, 10, 22));
			const firstDatePart = parts.find((part) =>
				part.type === "day" || part.type === "month" || part.type === "year"
			);
			if (firstDatePart?.type === "day") {
				return "day-first";
			}
		} catch {
			// Fall back to month-first, matching chrono's English numeric-date default.
		}

		return "month-first";
	}

	private toValidatedISODate(year: number, month: number, day: number): string | null {
		const parsed = new Date(Date.UTC(year, month - 1, day));
		if (
			parsed.getUTCFullYear() !== year ||
			parsed.getUTCMonth() !== month - 1 ||
			parsed.getUTCDate() !== day
		) {
			return null;
		}

		return `${year}-${this.padDatePart(month)}-${this.padDatePart(day)}`;
	}

	private padDatePart(value: number): string {
		return String(value).padStart(2, "0");
	}

	/**
	 * Splits the input into the trimmed first line (for parsing) and the rest (for details).
	 */
	private extractTitleAndDetails(input: MappedText): [MappedText, string | undefined] {
		const text = input.text;
		const start = text.search(/\S/u);
		if (start === -1) return [new MappedText(), undefined];

		const end = text.trimEnd().length;
		const lineBreak = text.indexOf("\n", start);
		if (lineBreak === -1 || lineBreak >= end) {
			return [input.slice(start, end), undefined];
		}

		const titleEnd = start + text.slice(start, lineBreak).trimEnd().length;
		return [input.slice(start, titleEnd), text.slice(lineBreak + 1, end).trim()];
	}

	/** Extracts tags from the text and adds them to the result object. */
	private extractTags(
		text: string,
		result: ParsedTaskData,
		original: string,
		record: SpanRecorder
	): string {
		const trigger = this.triggerConfig.getTagTrigger();
		if (!trigger) return text; // Tags disabled

		const escapedTrigger = this.escapeRegex(trigger);
		// Use Unicode-aware pattern to support non-ASCII characters (accented, Cyrillic, CJK, etc.)
		const tagPattern = new RegExp(`${escapedTrigger}[\\p{L}\\p{N}\\p{M}_/-]+`, "gu");
		const tagMatches = this.matchTriggerTokens(text, tagPattern, original);

		if (tagMatches) {
			result.tags.push(...tagMatches.map((tag) => tag[0].substring(trigger.length)));
			return this.removeTriggerTokens(text, tagMatches, record, "tag");
		}
		return text;
	}

	/** Extracts contexts from the text and adds them to the result object. */
	private extractContexts(
		text: string,
		result: ParsedTaskData,
		original: string,
		record: SpanRecorder
	): string {
		const trigger = this.triggerConfig.getContextTrigger();
		if (!trigger) return text; // Contexts disabled

		const escapedTrigger = this.escapeRegex(trigger);
		// Use Unicode-aware pattern to support non-ASCII characters (accented, Cyrillic, CJK, etc.)
		const contextPattern = new RegExp(`${escapedTrigger}[\\p{L}\\p{N}\\p{M}_/-]+`, "gu");
		const contextMatches = this.matchTriggerTokens(text, contextPattern, original);

		if (contextMatches) {
			result.contexts.push(...contextMatches.map((context) => context[0].substring(trigger.length)));
			return this.removeTriggerTokens(text, contextMatches, record, "context");
		}
		return text;
	}

	/** Extracts projects and [[wikilinks]] from the text and adds them to the result object. */
	private extractProjects(
		text: string,
		result: ParsedTaskData,
		original: string,
		record: SpanRecorder
	): string {
		const trigger = this.triggerConfig.getProjectTrigger();
		if (!trigger) return text; // Projects disabled

		let workingText = text;
		const escapedTrigger = this.escapeRegex(trigger);

		// Extract trigger[[wikilink]] patterns first (more specific)
		const wikilinkPattern = new RegExp(`${escapedTrigger}\\[\\[.*?\\]\\]`, "g");
		const wikilinkProjectMatches = this.matchTriggerTokens(workingText, wikilinkPattern, original);
		if (wikilinkProjectMatches) {
			result.projects.push(
				...wikilinkProjectMatches.map((project) => {
					// Remove the trigger prefix but keep [[ ]]
					const projectName = project[0].slice(trigger.length); // Remove just the trigger
					// Keep the full wikilink as-is for now - resolution will happen in InstantTaskConvertService
					return projectName;
				})
			);
			workingText = this.removeTriggerTokens(workingText, wikilinkProjectMatches, record, "project");
		}

		// Extract simple word projects
		// Use Unicode-aware pattern to support non-ASCII characters (accented, Cyrillic, CJK, etc.)
		const projectPattern = new RegExp(`(?:${escapedTrigger})+[\\p{L}\\p{N}\\p{M}_/-]+`, "gu");
		const projectMatches = this.matchTriggerTokens(workingText, projectPattern, original);
		if (projectMatches) {
			result.projects.push(...projectMatches.map((project) => project[0].substring(trigger.length)));
			workingText = this.removeTriggerTokens(workingText, projectMatches, record, "project");
		}

		return workingText;
	}

	/**
	 * Extracts user-defined field values from the text
	 * Supports quoted values for multi-word content: trigger "multi word value"
	 */
	private extractUserFields(
		text: string,
		result: ParsedTaskData,
		original: string,
		record: SpanRecorder
	): string {
		let workingText = text;

		// Get all enabled user field triggers
		const userFieldTriggers = this.triggerConfig
			.getAllEnabledTriggers()
			.filter((t) => this.triggerConfig.isUserField(t.propertyId));

		// Process each user field trigger
		for (const triggerDef of userFieldTriggers) {
			const userField = this.triggerConfig.getUserField(triggerDef.propertyId);
			if (!userField) {
				continue;
			}

			const escapedTrigger = this.escapeRegex(triggerDef.trigger);

			// For list fields, extract multiple values (supports quoted multi-word values)
			if (userField.type === "list") {
				// Match trigger followed by either:
				// 1. Quoted string: "anything inside quotes"
				// 2. Single/double word: word or word-with-dash (Unicode-aware)
				const pattern = new RegExp(`${escapedTrigger}(?:"([^"]+)"|(\\[[^\\]]+\\]\\([^)\\s]+\\)|[\\p{L}\\p{N}\\p{M}_/-]+))`, "gu");
				const values: string[] = [];
				const matches = this.matchTriggerTokens(workingText, pattern, original);

				for (const match of matches) {
					// Group 1 is quoted value, Group 2 is unquoted value
					const value = match[1] || match[2];
					values.push(value);
				}

				if (values.length > 0) {
					if (!result.userFields) result.userFields = {};
					result.userFields[userField.id] = values;
					workingText = this.removeTriggerTokens(workingText, matches, record, "field", userField.id);
				}
			}
			// For text/boolean/number fields, extract single value (supports quoted multi-word)
			else if (userField.type === "text" || userField.type === "boolean" || userField.type === "number") {
				// Match trigger followed by either:
				// 1. Quoted string: "anything inside quotes"
				// 2. Single word: word or word-with-dash (Unicode-aware)
				const pattern = new RegExp(`${escapedTrigger}(?:"([^"]+)"|(\\[[^\\]]+\\]\\([^)\\s]+\\)|[\\p{L}\\p{N}\\p{M}_/-]+))`, "u");
				const match = this.matchTriggerTokens(workingText, pattern, original)[0];

				if (match) {
					// Group 1 is quoted value, Group 2 is unquoted value
					const value = match[1] || match[2];
					if (!result.userFields) result.userFields = {};

					// Convert to boolean if needed
					if (userField.type === "boolean") {
						result.userFields[userField.id] =
							value.toLowerCase() === "true" ? "true" : "false";
					} else {
						result.userFields[userField.id] = value;
					}

					workingText = this.removeTriggerTokens(workingText, [match], record, "field", userField.id);
				}
			}
			// For date fields, try to parse as date (supports quoted values too)
			else if (userField.type === "date") {
				// Match trigger followed by either quoted or unquoted date-like pattern (Unicode-aware)
				const pattern = new RegExp(`${escapedTrigger}(?:"([^"]+)"|(\\[[^\\]]+\\]\\([^)\\s]+\\)|[\\p{L}\\p{N}\\p{M}_/-]+))`, "u");
				const match = this.matchTriggerTokens(workingText, pattern, original)[0];

				if (match) {
					const value = match[1] || match[2];
					if (!result.userFields) result.userFields = {};
					result.userFields[userField.id] = value; // Store as-is, let consuming code parse
					workingText = this.removeTriggerTokens(workingText, [match], record, "field", userField.id);
				}
			}
		}

		return workingText;
	}

	private matchTriggerTokens(text: string, pattern: RegExp, original: string): RegExpMatchArray[] {
		const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
		// In languages written without spaces a trigger may follow a word directly
		// (買い物#家事), but not ASCII text, which keeps emails and URLs whole.
		return Array.from(text.matchAll(globalPattern)).filter(
			(match) =>
				match.index === 0 ||
				/\s/u.test(original[match.index - 1]) ||
				(this.boundaries.spaceless && !/[\x21-\x7e]/.test(original[match.index - 1]))
		);
	}

	private removeTriggerTokens(
		text: string,
		matches: RegExpMatchArray[],
		record: SpanRecorder,
		kind: EngineSpanKind,
		field?: string
	): string {
		let remaining = text;
		for (const match of matches) {
			const start = match.index!;
			record(start, start + match[0].length, kind, field);
			remaining = remaining.slice(0, start) + " ".repeat(match[0].length) + remaining.slice(start + match[0].length);
		}
		return remaining;
	}

	/** Extracts priority using shared phrase matching for custom and fallback priorities. */
	private extractPriority(state: ClaimedText, result: ParsedTaskData, context: ParseContext): void {
		const view = state.view();
		const match = this.findKeywordMatch(
			view.text,
			this.config.priorities,
			"priority",
			[
				{ value: "urgent", phrases: this.languageConfig.fallbackPriority.urgent },
				{ value: "high", phrases: this.languageConfig.fallbackPriority.high },
				{ value: "normal", phrases: this.languageConfig.fallbackPriority.normal },
				{ value: "low", phrases: this.languageConfig.fallbackPriority.low },
			]
		);
		if (!match) return;

		result.priority = match.value;
		const [start, end] = this.includePriorityWords(view.text, match.startIndex, match.endIndex);
		this.claimSpan(state, view, start, end, "keyword", context, "priority");
	}

	/** Extracts status using shared phrase matching for custom and fallback statuses. */
	private extractStatus(state: ClaimedText, result: ParsedTaskData, context: ParseContext): void {
		const view = state.view();
		const langConfig = this.languageConfig.fallbackStatus;
		const match = this.findKeywordMatch(view.text, this.config.statuses, "status", [
			{ value: "open", phrases: langConfig.open },
			{ value: "in-progress", phrases: langConfig.inProgress },
			{ value: "done", phrases: langConfig.done },
			{ value: "cancelled", phrases: langConfig.cancelled },
			{ value: "waiting", phrases: langConfig.waiting },
		]);
		if (!match) return;

		result.status = match.value;
		this.claimSpan(state, view, match.startIndex, match.endIndex, "keyword", context, "status");
	}

	/**
	 * Finds a configured priority or status by label, value or alias, preferring
	 * trigger forms ("*in progress*", "!high") and longer names. Without configured
	 * values, the language's fallback phrases apply.
	 */
	private findKeywordMatch(
		text: string,
		configs: KeywordOption[],
		propertyId: "priority" | "status",
		fallback: Array<{ value: string; phrases: string[] }>
	): { value: string; startIndex: number; endIndex: number } | null {
		const triggerDef = this.triggerConfig.getTriggerForProperty(propertyId);
		const trigger = triggerDef?.enabled ? triggerDef.trigger : "";
		const groups =
			configs.length > 0
				? configs.map((config) => ({
						value: config.value,
						phrases: [config.label, config.value, ...config.aliases],
					}))
				: fallback;

		// "*in progress*" closes a multi-word status, then "*done", then the bare word.
		const forms = trigger
			? [(name: string) => trigger + name + trigger, (name: string) => trigger + name, (name: string) => name]
			: [(name: string) => name];
		for (const form of forms) {
			const candidates = groups
				.flatMap((group) =>
					group.phrases
						.filter((phrase) => phrase && phrase.trim() !== "")
						.map((phrase) => ({ value: group.value, phrase: form(phrase) }))
				)
				.sort((a, b) => b.phrase.length - a.phrase.length);
			// Configured names keep their order of preference: longest first, anywhere.
			// Fallback words take the earliest match.
			if (configs.length > 0) {
				for (const candidate of candidates) {
					const match = this.findTextMatch(text, candidate.phrase);
					if (match) {
						return {
							value: candidate.value,
							startIndex: match.startIndex,
							endIndex: match.startIndex + match.fullMatch.length,
						};
					}
				}
				continue;
			}
			const match = this.findPhraseValueMatch(
				text,
				candidates.map((candidate) => ({ value: candidate.value, phrases: [candidate.phrase] }))
			);
			if (match) {
				return {
					value: match.value,
					startIndex: match.match.startIndex,
					endIndex: this.includeTrailingPhraseSeparator(text, match.match.endIndex),
				};
			}
		}
		return null;
	}

	/** Extends a priority match over "priority" words: "high priority", "priority: high". */
	private includePriorityWords(text: string, start: number, end: number): [number, number] {
		const words = this.languageConfig.priorityWords ?? [];
		if (words.length === 0) return [start, end];

		const alternatives = words.map((word) => this.escapeRegex(word)).join("|");
		const after = new RegExp(`^\\s*(?:${alternatives})(?![\\p{L}\\p{N}\\p{M}_])[:,;]?`, "iu").exec(
			text.slice(end)
		);
		if (after) return [start, end + after[0].length];

		const before = new RegExp(`(?<![\\p{L}\\p{N}\\p{M}_])(?:${alternatives})\\s*:?\\s*$`, "iu").exec(
			text.slice(0, start)
		);
		return before ? [before.index, end] : [start, end];
	}

	/**
	 * Finds a match using case-insensitive string search with boundary checking.
	 * Returns the match details or null if no valid match found.
	 */
	private findTextMatch(
		text: string,
		searchText: string
	): { fullMatch: string; startIndex: number } | null {
		const match = this.findPhraseMatch(text, [searchText]);
		if (!match) {
			return null;
		}

		const fullMatchEndIndex = this.includeTrailingPhraseSeparator(text, match.endIndex);
		return {
			fullMatch: text.substring(match.startIndex, fullMatchEndIndex),
			startIndex: match.startIndex,
		};
	}

	/**
	 * Finds the earliest whole-phrase match, preferring the longest phrase at the same position.
	 */
	private findPhraseMatch(text: string, phrases: string[]): PhraseMatch | null {
		const searchablePhrases = phrases
			.filter((phrase) => phrase && phrase.trim() !== "")
			.sort((a, b) => b.length - a.length);
		if (searchablePhrases.length === 0) {
			return null;
		}

		const lowerText = text.toLowerCase();
		let bestMatch: PhraseMatch | null = null;

		for (const phrase of searchablePhrases) {
			const lowerPhrase = phrase.toLowerCase();
			let searchIndex = 0;

			while (searchIndex <= lowerText.length) {
				const index = lowerText.indexOf(lowerPhrase, searchIndex);
				if (index === -1) {
					break;
				}

				const endIndex = index + phrase.length;
				if (this.hasPhraseBoundaries(text, index, endIndex)) {
					const candidate: PhraseMatch = {
						fullMatch: text.substring(index, endIndex),
						phrase,
						startIndex: index,
						endIndex,
					};

					if (
						!bestMatch ||
						candidate.startIndex < bestMatch.startIndex ||
						(candidate.startIndex === bestMatch.startIndex &&
							candidate.phrase.length > bestMatch.phrase.length)
					) {
						bestMatch = candidate;
					}
				}

				searchIndex = index + 1;
			}
		}

		return bestMatch;
	}

	/** Finds every whole-phrase match in order, preferring the longest phrase at a position. */
	private findPhraseMatches(text: string, phrases: string[]): PhraseMatch[] {
		const matches: PhraseMatch[] = [];
		let offset = 0;
		while (offset < text.length) {
			const match = this.findPhraseMatch(text.slice(offset), phrases);
			if (!match) break;
			matches.push({
				...match,
				startIndex: match.startIndex + offset,
				endIndex: match.endIndex + offset,
			});
			offset += match.startIndex + 1;
		}
		return matches;
	}

	private findPhraseValueMatch(
		text: string,
		groups: Array<{ value: string; phrases: string[] }>
	): { value: string; match: PhraseMatch } | null {
		let bestMatch: { value: string; match: PhraseMatch } | null = null;

		for (const group of groups) {
			const match = this.findPhraseMatch(text, group.phrases);
			if (
				match &&
				(!bestMatch ||
					match.startIndex < bestMatch.match.startIndex ||
					(match.startIndex === bestMatch.match.startIndex &&
						match.phrase.length > bestMatch.match.phrase.length))
			) {
				bestMatch = { value: group.value, match };
			}
		}

		return bestMatch;
	}

	private hasPhraseBoundaries(text: string, startIndex: number, endIndex: number): boolean {
		if (this.boundaries.spaceless) {
			return true;
		}

		const beforeChar = this.getCodePointBefore(text, startIndex);
		const afterChar = this.getCodePointAt(text, endIndex);
		// A hyphen joins words: "high" is not a phrase inside "high-availability".
		const joinedBefore =
			beforeChar === "-" &&
			this.isWordCharacter(this.getCodePointBefore(text, startIndex - beforeChar.length));
		const joinedAfter =
			afterChar === "-" &&
			this.isWordCharacter(this.getCodePointAt(text, endIndex + afterChar.length));

		return (
			!this.isWordCharacter(beforeChar) &&
			!this.isWordCharacter(afterChar) &&
			!joinedBefore &&
			!joinedAfter
		);
	}

	private getCodePointBefore(text: string, index: number): string {
		if (index <= 0) {
			return "";
		}

		return Array.from(text.slice(0, index)).pop() || "";
	}

	private getCodePointAt(text: string, index: number): string {
		if (index >= text.length) {
			return "";
		}

		return Array.from(text.slice(index))[0] || "";
	}

	private isWordCharacter(char: string): boolean {
		return char !== "" && /[\p{L}\p{N}\p{M}_]/u.test(char);
	}

	private includeTrailingPhraseSeparator(text: string, endIndex: number): number {
		return /[:,;]/.test(text[endIndex] || "") ? endIndex + 1 : endIndex;
	}

	/**
	 * Unified method to parse all dates and times with internationalized context awareness.
	 * Combines the functionality of extractExplicitDates and parseDatesAndTimes.
	 *
	 * Processing order:
	 * 1. Look for explicit trigger patterns: "due tomorrow", "scheduled for friday"
	 * 2. Parse implicit dates using chrono-node with language-specific parser
	 * 3. Determine if date is due/scheduled based on context and defaultToScheduled setting
	 *
	 * Trigger pattern examples:
	 * - English: "due\s+", "scheduled\s+for"
	 * - French: "échéance\s+", "programmé\s+pour"
	 * - German: "fällig\s+am", "geplant\s+für"
	 *
	 * @param text Input text to parse
	 * @param result ParsedTaskData object to populate with date/time fields
	 * @returns Text with date/time patterns removed
	 */
	private parseUnifiedDatesAndTimes(
		state: ClaimedText,
		result: ParsedTaskData,
		context: ParseContext
	): void {
		const langTriggers = this.languageConfig.dateTriggers;

		// First, try to find explicit trigger phrases.
		const triggerPatterns: Array<{ type: DateField; phrases: string[] }> = [
			{
				type: "due",
				phrases: langTriggers.due,
			},
			{
				type: "scheduled",
				phrases: langTriggers.scheduled,
			},
		];

		// Triggers can overlap in both directions: due "pour" is inside scheduled
		// "programmée pour", but scheduled "il" is also inside due "entro il". Prefer
		// the more specific matched phrase, not either field unconditionally.
		{
			const text = state.view().text;
			triggerPatterns.sort((a, b) =>
				(this.findPhraseMatch(text, b.phrases)?.phrase.length ?? 0) -
				(this.findPhraseMatch(text, a.phrases)?.phrase.length ?? 0)
			);
		}

		// Check for explicit triggers - process all triggers, not just the first one (Issue #1421).
		// A trigger without a date after it ("by phone") does not stop a later one ("by friday").
		let foundExplicitTrigger = false;
		for (const triggerPattern of triggerPatterns) {
			const view = state.view();
			for (const match of this.findPhraseMatches(view.text, triggerPattern.phrases)) {
				const chronoParsed = this.parseChronoFromPosition(
					view.text.substring(match.endIndex),
					context.now
				);
				if (!chronoParsed) continue;

				foundExplicitTrigger = true;
				this.assignDate(result, triggerPattern.type, chronoParsed.date, chronoParsed.time);
				context.dateHasDay[triggerPattern.type] = chronoParsed.hasDay;
				// Claim the entire matched expression (trigger + connector text + date).
				this.claimSpan(
					state,
					view,
					match.startIndex,
					match.endIndex + chronoParsed.endIndex,
					"date",
					context,
					triggerPattern.type
				);
				break;
			}
		}

		// Return early if we found explicit triggers - no need for implicit parsing
		if (foundExplicitTrigger) {
			return;
		}

		// If no explicit triggers found, parse the first remaining date with context
		const view = state.view();
		const primaryMatch = this.parseChrono(view.text, context.now)[0];
		if (!primaryMatch) {
			return;
		}

		const startDate = primaryMatch.start.date();
		const endDate = primaryMatch.end?.date();

		// Only a trigger introducing the date counts: "voor" in "kwart voor vier" does not.
		const isDue = this.findPhraseMatch(primaryMatch.text, langTriggers.due)?.startIndex === 0;
		const isScheduled = this.findPhraseMatch(primaryMatch.text, langTriggers.scheduled)?.startIndex === 0;

		const spanKinds: DateField[] = [];
		const isRange = endDate !== undefined && isValid(endDate) && endDate.getTime() !== startDate.getTime();
		const isSameDayTimeRange =
			endDate !== undefined &&
			isRange &&
			primaryMatch.start.isCertain("hour") &&
			primaryMatch.end?.isCertain("hour") &&
			format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd") &&
			endDate > startDate;

		// A time range on one day is a scheduled time with an estimate: "3-4pm".
		if (isSameDayTimeRange && endDate) {
			this.assignDate(result, "scheduled", format(startDate, "yyyy-MM-dd"), format(startDate, "HH:mm"));
			context.dateHasDay.scheduled = this.hasCertainDay(primaryMatch.start);
			result.estimate ??= Math.round((endDate.getTime() - startDate.getTime()) / 60000);
			spanKinds.push("scheduled");
		}
		// Handle date ranges (e.g., "from tomorrow to next friday")
		else if (isRange && endDate) {
			spanKinds.push("scheduled", "due");
			this.assignDate(
				result,
				"scheduled",
				format(startDate, "yyyy-MM-dd"),
				primaryMatch.start.isCertain("hour") ? format(startDate, "HH:mm") : undefined
			);
			this.assignDate(
				result,
				"due",
				format(endDate, "yyyy-MM-dd"),
				primaryMatch.end?.isCertain("hour") ? format(endDate, "HH:mm") : undefined
			);
			context.dateHasDay.scheduled = this.hasCertainDay(primaryMatch.start);
			context.dateHasDay.due = this.hasCertainDay(primaryMatch.end);
		}
		// Handle single dates
		else if (isValid(startDate)) {
			// Prioritize explicit keywords, otherwise use default setting
			const field: DateField =
				isDue && !isScheduled
					? "due"
					: isScheduled && !isDue
						? "scheduled"
						: this.config.defaultToScheduled
							? "scheduled"
							: "due";
			this.assignDate(
				result,
				field,
				format(startDate, "yyyy-MM-dd"),
				primaryMatch.start.isCertain("hour") ? format(startDate, "HH:mm") : undefined
			);
			context.dateHasDay[field] = this.hasCertainDay(primaryMatch.start);
			spanKinds.push(field);
		}

		// A possessive date describes the title: "prep slides for monday's meeting".
		const start = this.findChronoTextStart(view.text, primaryMatch);
		const end = start + primaryMatch.text.length;
		if (/^['\u2019]s(?![\p{L}\p{N}])/u.test(view.text.slice(end))) {
			for (const kind of spanKinds) {
				context.spans.push({ kind, start: view.map[start], end: view.map[end - 1] + 1, inTitle: true });
			}
			return;
		}
		const range = state.claim(view, start, end, "date");
		if (range) {
			for (const kind of spanKinds) context.spans.push({ kind, start: range[0], end: range[1] });
		}
	}

	private assignDate(
		result: ParsedTaskData,
		field: DateField,
		date: string,
		time: string | undefined
	): void {
		if (field === "due") {
			result.dueDate = date;
			result.dueTime = time;
		} else {
			result.scheduledDate = date;
			result.scheduledTime = time;
		}
		if (!time) delete result[field === "due" ? "dueTime" : "scheduledTime"];
	}

	private hasCertainDay(components: any): boolean {
		return Boolean(
			components &&
				(components.isCertain("day") ||
					components.isCertain("weekday") ||
					components.isCertain("month"))
		);
	}

	/** Runs the language's chrono parser, skipping results that are not usable dates. */
	private parseChrono(text: string, now: Date): any[] {
		return this.getChronoParser()
			.parse(text, now, { forwardDate: true })
			.filter((parsed: any) => isValid(parsed.start.date()) && this.isWholeWords(text, parsed));
	}

	/** Whether a chrono result is whole words: Ukrainian "квіт" (April) inside "квіти" is not. */
	private isWholeWords(text: string, parsed: { index: number; text: string }): boolean {
		if (this.boundaries.spaceless) return true;
		const start = this.findChronoTextStart(text, parsed);
		const end = start + parsed.text.length;
		return (
			!this.isWordCharacter(this.getCodePointBefore(text, start)) &&
			!this.isWordCharacter(this.getCodePointAt(text, end))
		);
	}

	/**
	 * Parses the date directly after a trigger word.
	 *
	 * The date must start within the first 3 characters, allowing for prepositions such
	 * as "on", "at", "le" or "am", or after connector and trigger words only ("due before friday").
	 *
	 * @param text Text to parse (typically after a trigger word)
	 * @returns The formatted date and time, and where the date ends in text
	 */
	private parseChronoFromPosition(
		text: string,
		now: Date
	): { date: string; time?: string; endIndex: number; hasDay: boolean } | null {
		try {
			const firstMatch = this.parseChrono(text, now)[0];
			if (!firstMatch) return null;

			const startIndex = this.findChronoTextStart(text, firstMatch);
			if (startIndex > 3 && !this.isConnectorGap(text.slice(0, startIndex))) {
				return null;
			}

			const parsedDate = firstMatch.start.date();
			return {
				date: format(parsedDate, "yyyy-MM-dd"),
				// Check if time is included and certain
				time: firstMatch.start.isCertain("hour") ? format(parsedDate, "HH:mm") : undefined,
				endIndex: startIndex + firstMatch.text.length,
				hasDay: this.hasCertainDay(firstMatch.start),
			};
		} catch (error) {
			console.debug("Error parsing date with chrono:", error);
		}

		return null;
	}

	/** Where a chrono result's text starts; chrono can report an index that does not point at it. */
	private findChronoTextStart(text: string, parsed: { index: number; text: string }): number {
		if (text.startsWith(parsed.text, parsed.index)) return parsed.index;
		const actualStart = text.indexOf(parsed.text);
		return actualStart !== -1 ? actualStart : parsed.index;
	}

	/** Whether text between a trigger and its date holds only connector and trigger words. */
	private isConnectorGap(gap: string): boolean {
		const words = [
			...(this.languageConfig.connectors?.date ?? []),
			...this.languageConfig.dateTriggers.due,
			...this.languageConfig.dateTriggers.scheduled,
		].filter((word) => word.trim().length > 0);
		if (words.length === 0) return false;

		const alternatives = words
			.sort((a, b) => b.length - a.length)
			.map((word) => this.escapeRegex(word.trim()).replace(/\s+/g, "\\s+"))
			.join("|");
		return new RegExp(`^[\\s,:]*(?:(?:${alternatives})(?:\\s+|$))+$`, "iu").test(gap);
	}

	/**
	 * Aligns a time-only date with weekly recurrence days. In "call mum every sunday at 6pm",
	 * the time would otherwise land today or tomorrow instead of on the next Sunday.
	 */
	private alignDatesWithRecurrence(result: ParsedTaskData, context: ParseContext): void {
		const byDay = /^FREQ=WEEKLY(?:;INTERVAL=\d+)?;BYDAY=((?:MO|TU|WE|TH|FR|SA|SU)(?:,(?:MO|TU|WE|TH|FR|SA|SU))*)$/.exec(
			result.recurrence ?? ""
		);
		if (!byDay) return;

		const days = byDay[1].split(",").map((code) => RRULE_WEEKDAYS.indexOf(code));
		for (const field of ["scheduled", "due"] as const) {
			const key = field === "due" ? "dueDate" : "scheduledDate";
			const value = result[key];
			if (!value || context.dateHasDay[field] !== false) continue;

			const date = new Date(`${value}T12:00:00`);
			while (!days.includes(date.getDay())) {
				date.setDate(date.getDate() + 1);
			}
			result[key] = format(date, "yyyy-MM-dd");
		}
	}

	/**
	 * Builds comprehensive recurrence patterns from language configuration.
	 * Patterns are ordered by priority (most specific first) and cached for performance.
	 */
	private buildRecurrencePatterns(): Array<{
		regex: RegExp;
		handler: (match: RegExpMatchArray) => string;
		adjective?: boolean;
	}> {
		const lang = this.languageConfig.recurrence;
		const patterns = [];

		// Frequencies inside compound words are title text, not commands.
		// Retain whitespace boundaries for languages that require them.
		const boundary = this.boundaries.spaceless ? "" : "(?<![\\p{L}\\p{N}\\p{M}_-])";
		const endBoundary = this.boundaries.spaceless ? "" : "(?![\\p{L}\\p{N}\\p{M}_-])";

		// Helper function to escape and join patterns
		const escapeAndJoin = (patterns: string[]) =>
			[...patterns]
				.filter((p) => p.trim())
				.sort((a, b) => b.length - a.length)
				.map((p) => this.escapeRegex(p))
				.join("|");

		// Build patterns in priority order (most specific first)
		patterns.push(
			...this.buildOrdinalWeekdayPatterns(lang, boundary, endBoundary, escapeAndJoin)
		);
		patterns.push(...this.buildWeekdayGroupPatterns(lang, boundary, endBoundary, escapeAndJoin));
		patterns.push(
			...[...(lang.phrases ?? [])]
				.sort((a, b) => b.phrase.length - a.phrase.length)
				.map(({ phrase, rule }) => ({
					regex: new RegExp(`${boundary}(${this.phraseSource(phrase)})${endBoundary}`, "iu"),
					handler: () => rule,
					adjective: this.isFrequencyAdjective(phrase),
				}))
		);
		patterns.push(...this.buildIntervalPatterns(lang, boundary, endBoundary, escapeAndJoin));
		patterns.push(...this.buildEveryOtherPatterns(lang, boundary, endBoundary, escapeAndJoin));
		patterns.push(...this.buildWeekdayPatterns(lang, boundary, endBoundary, escapeAndJoin));
		patterns.push(...this.buildFrequencyPatterns(lang, boundary, endBoundary, escapeAndJoin));

		return patterns;
	}

	/**
	 * Builds "every [ordinal] [weekday]" patterns (e.g., "every second monday").
	 * These have highest priority as they are most specific.
	 */
	private buildOrdinalWeekdayPatterns(
		lang: any,
		boundary: string,
		endBoundary: string,
		escapeAndJoin: (patterns: string[]) => string
	) {
		const everyKeywords = escapeAndJoin(lang.every);
		if (!everyKeywords) return [];
		const ordinalPatterns = escapeAndJoin([
			...lang.ordinals.first,
			...lang.ordinals.second,
			...lang.ordinals.third,
			...lang.ordinals.fourth,
			...lang.ordinals.last,
		]);
		const weekdayPatterns = escapeAndJoin([
			...lang.weekdays.monday,
			...lang.weekdays.tuesday,
			...lang.weekdays.wednesday,
			...lang.weekdays.thursday,
			...lang.weekdays.friday,
			...lang.weekdays.saturday,
			...lang.weekdays.sunday,
		]);

		const suffixes = escapeAndJoin(lang.ordinalSuffixes ?? []).replace(/ /g, "\\s+");
		const ordinalSuffix = suffixes ? `(?:${this.wordGap}(?:${suffixes}))?` : "";

		return [
			{
				regex: new RegExp(
					`${boundary}(${everyKeywords})${this.wordGap}(${ordinalPatterns})${this.wordGap}(${weekdayPatterns})${ordinalSuffix}${endBoundary}`,
					"iu"
				),
				handler: (match: RegExpMatchArray) => {
					const ordinalText = match[2].toLowerCase();
					const dayText = match[3].toLowerCase();

					// Find ordinal position
					let position = 1;
					if (lang.ordinals.second.some((o: string) => o.toLowerCase() === ordinalText))
						position = 2;
					else if (
						lang.ordinals.third.some((o: string) => o.toLowerCase() === ordinalText)
					)
						position = 3;
					else if (
						lang.ordinals.fourth.some((o: string) => o.toLowerCase() === ordinalText)
					)
						position = 4;
					else if (
						lang.ordinals.last.some((o: string) => o.toLowerCase() === ordinalText)
					)
						position = -1;

					// Find weekday
					const rruleDay = this.getWeekdayRRuleCode(dayText, lang);
					return `FREQ=MONTHLY;BYDAY=${rruleDay};BYSETPOS=${position}`;
				},
			},
		];
	}

	/**
	 * Builds "every [N] [period]" patterns (e.g., "every 3 days", "every 2 weeks").
	 */
	private buildIntervalPatterns(
		lang: any,
		boundary: string,
		endBoundary: string,
		escapeAndJoin: (patterns: string[]) => string
	) {
		const everyKeywords = escapeAndJoin(lang.every);
		if (!everyKeywords) return [];
		const periodPatterns = escapeAndJoin([
			...lang.periods.day,
			...lang.periods.week,
			...lang.periods.month,
			...lang.periods.year,
		]);

		return [
			{
				regex: new RegExp(
					`${boundary}(${everyKeywords})${this.wordGap}(\\d+)${this.wordGap}(${periodPatterns})${endBoundary}`,
					"iu"
				),
				handler: (match: RegExpMatchArray) => {
					const interval = parseInt(match[2]);
					const periodText = match[3].toLowerCase();
					const freq = this.getPeriodFrequency(periodText, lang);
					return `FREQ=${freq};INTERVAL=${interval}`;
				},
			},
		];
	}

	/**
	 * Builds "every other [period]" patterns (e.g., "every other week").
	 */
	private buildEveryOtherPatterns(
		lang: any,
		boundary: string,
		endBoundary: string,
		escapeAndJoin: (patterns: string[]) => string
	) {
		const everyKeywords = escapeAndJoin(lang.every);
		const otherKeywords = escapeAndJoin(lang.other);
		if (!everyKeywords || !otherKeywords) return [];
		const periodPatterns = escapeAndJoin([
			...lang.periods.day,
			...lang.periods.week,
			...lang.periods.month,
			...lang.periods.year,
		]);

		return [
			{
				regex: new RegExp(
					`${boundary}(${everyKeywords})${this.wordGap}(${otherKeywords})${this.wordGap}(${periodPatterns})${endBoundary}`,
					"iu"
				),
				handler: (match: RegExpMatchArray) => {
					const periodText = match[3].toLowerCase();
					const freq = this.getPeriodFrequency(periodText, lang);
					return `FREQ=${freq};INTERVAL=2`;
				},
			},
		];
	}

	/**
	 * Builds weekday patterns ("every [weekday]" and plural weekdays).
	 */
	private buildWeekdayPatterns(
		lang: any,
		boundary: string,
		endBoundary: string,
		escapeAndJoin: (patterns: string[]) => string
	) {
		const everyKeywords = escapeAndJoin(lang.every);
		if (!everyKeywords) return [];
		const weekdayPatterns = escapeAndJoin([
			...lang.weekdays.monday,
			...lang.weekdays.tuesday,
			...lang.weekdays.wednesday,
			...lang.weekdays.thursday,
			...lang.weekdays.friday,
			...lang.weekdays.saturday,
			...lang.weekdays.sunday,
		]);
		// Invariable plurals such as Italian "lunedì" are also the singular day, which
		// means a single date ("entro lunedì"). Only distinct plural forms imply recurrence.
		const singularWeekdays = new Set(
			Object.values(lang.weekdays as Record<string, string[]>)
				.flat()
				.map((day) => day.toLowerCase())
		);
		const pluralWeekdays = [
			...lang.pluralWeekdays.monday,
			...lang.pluralWeekdays.tuesday,
			...lang.pluralWeekdays.wednesday,
			...lang.pluralWeekdays.thursday,
			...lang.pluralWeekdays.friday,
			...lang.pluralWeekdays.saturday,
			...lang.pluralWeekdays.sunday,
		].filter((day: string) => !singularWeekdays.has(day.toLowerCase()));

		// Weekdays may be listed: "every monday, wednesday and friday".
		const separator = this.weekdayListSeparator();
		const list = (days: string) => `(?:${days})(?:${separator}(?:${days}))*`;

		// After "every", later items may repeat it: 每周一、每周三.
		const allNames = Object.fromEntries(
			WEEKDAY_KEYS.map((key) => [key, [...lang.weekdays[key], ...lang.pluralWeekdays[key]]])
		);
		const listItems = escapeAndJoin(Object.values(allNames).flat() as string[]);
		const patterns = [
			// "every [weekday]" patterns
			{
				regex: new RegExp(
					`${boundary}(${everyKeywords})${this.wordGap}((?:${weekdayPatterns})(?:${separator}(?:${listItems}))*)${endBoundary}`,
					"iu"
				),
				handler: (match: RegExpMatchArray) =>
					`FREQ=WEEKLY;BYDAY=${this.getListedWeekdayCodes(match[2], allNames, separator)}`,
			},
		];
		if (pluralWeekdays.length > 0) {
			// Plural weekdays ("mondays", "tuesdays and thursdays")
			patterns.push({
				regex: new RegExp(
					`${boundary}(${list(escapeAndJoin(pluralWeekdays))})${endBoundary}`,
					"iu"
				),
				handler: (match: RegExpMatchArray) =>
					`FREQ=WEEKLY;BYDAY=${this.getListedWeekdayCodes(match[1], lang.pluralWeekdays, separator)}`,
			});
		}
		return patterns;
	}

	/**
	 * Builds general frequency patterns (daily, weekly, monthly, yearly).
	 */
	private buildFrequencyPatterns(
		lang: any,
		boundary: string,
		endBoundary: string,
		escapeAndJoin: (patterns: string[]) => string
	) {
		return (
			[
				["daily", "FREQ=DAILY"],
				["weekly", "FREQ=WEEKLY"],
				["monthly", "FREQ=MONTHLY"],
				["yearly", "FREQ=YEARLY"],
			] as const
		).flatMap(([key, rule]) => {
			const phrases: string[] = lang.frequencies[key];
			const words = phrases.filter((phrase) => this.isFrequencyAdjective(phrase));
			const others = phrases.filter((phrase) => !this.isFrequencyAdjective(phrase));
			return [others, words]
				.filter((group) => group.length > 0)
				.map((group) => ({
					regex: new RegExp(`${boundary}(${escapeAndJoin(group)})${endBoundary}`, "iu"),
					handler: () => rule,
					adjective: group === words,
				}));
		});
	}

	/**
	 * Builds weekday group patterns ("every weekday", "weekends").
	 */
	private buildWeekdayGroupPatterns(
		lang: any,
		boundary: string,
		endBoundary: string,
		escapeAndJoin: (patterns: string[]) => string
	) {
		const groups = lang.weekdayGroups;
		if (!groups) return [];

		return [
			{ phrases: groups.weekdays as string[], rule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" },
			{ phrases: groups.weekends as string[], rule: "FREQ=WEEKLY;BYDAY=SA,SU" },
		]
			.filter((group) => group.phrases.length > 0)
			.map((group) => ({
				regex: new RegExp(`${boundary}(${escapeAndJoin(group.phrases)})${endBoundary}`, "iu"),
				handler: () => group.rule,
			}));
	}

	/** Converts a matched weekday list ("mon, wed and fri") to RRule codes ("MO,WE,FR"). */
	private getListedWeekdayCodes(
		listText: string,
		names: Record<string, string[]>,
		separator: string
	): string {
		const codes = listText
			.split(new RegExp(separator, "iu"))
			.map((dayText) => {
				const day = Object.keys(names).find((key) =>
					names[key].some((name) => name.toLowerCase() === dayText.trim().toLowerCase())
				);
				return day ? RRULE_WEEKDAYS[WEEKDAY_KEYS.indexOf(day)] : undefined;
			})
			.filter((code): code is string => Boolean(code));
		return [...new Set(codes)].join(",");
	}

	/**
	 * Helper to determine frequency type from period text.
	 */
	private getPeriodFrequency(periodText: string, lang: any): string {
		if (lang.periods.week.some((p: string) => p.toLowerCase() === periodText)) return "WEEKLY";
		if (lang.periods.month.some((p: string) => p.toLowerCase() === periodText))
			return "MONTHLY";
		if (lang.periods.year.some((p: string) => p.toLowerCase() === periodText)) return "YEARLY";
		return "DAILY"; // default
	}

	/**
	 * Helper to get RRule weekday code from weekday text.
	 */
	private getWeekdayRRuleCode(dayText: string, lang: any): string {
		if (lang.weekdays.tuesday.some((d: string) => d.toLowerCase() === dayText)) return "TU";
		if (lang.weekdays.wednesday.some((d: string) => d.toLowerCase() === dayText)) return "WE";
		if (lang.weekdays.thursday.some((d: string) => d.toLowerCase() === dayText)) return "TH";
		if (lang.weekdays.friday.some((d: string) => d.toLowerCase() === dayText)) return "FR";
		if (lang.weekdays.saturday.some((d: string) => d.toLowerCase() === dayText)) return "SA";
		if (lang.weekdays.sunday.some((d: string) => d.toLowerCase() === dayText)) return "SU";
		return "MO"; // default to Monday
	}

	/**
	 * Extracts recurrence from text and generates rrule strings using cached language-aware patterns.
	 * All patterns are internationalized and sourced from language configurations.
	 */
	private extractRecurrence(state: ClaimedText, result: ParsedTaskData, context: ParseContext): void {
		const view = state.view();
		for (const pattern of this.recurrencePatterns) {
			const match = view.text.match(pattern.regex);
			if (!match) continue;

			let rule = pattern.handler(match);
			const start = match.index!;
			let end = start + match[0].length;

			// "every 2 weeks on monday and thursday"
			if (/^FREQ=WEEKLY(?:;INTERVAL=\d+)?$/.test(rule)) {
				const days = this.matchWeekdaySuffix(view.text.slice(end));
				if (days) {
					rule += `;BYDAY=${days.codes}`;
					end += days.length;
				}
			}
			if (!this.isValidRRuleString(rule)) continue;

			// "weekly review" names the task: keep the word in the title. After an
			// article, as in "buy a weekly planner", it is not a recurrence at all.
			const after = this.languageConfig.recurrence.adjectivePosition === "after";
			// Where adjectives follow their noun, an article right before the word
			// makes it a noun: "pagar a diária do hotel".
			if (pattern.adjective && after && this.followsNonDateWord(view.text.slice(0, start))) continue;
			const isAdjective =
				pattern.adjective &&
				rule === pattern.handler(match) &&
				(after
					? this.describesPreviousWord(view.text.slice(0, start))
					: this.describesNextWord(view.text.slice(end)));
			// "buy a weekly planner", "comprar una agenda semanal"
			const article = after
				? this.followsNonDateWord(view.text.slice(0, start).replace(/[\p{L}\p{M}][\p{L}\p{N}\p{M}_-]*\s*$/u, ""))
				: this.followsNonDateWord(view.text.slice(0, start));
			if (isAdjective && article) continue;
			if (isAdjective) {
				result.recurrence = rule;
				const range = state.claim(view, start, end, "shield");
				if (range) context.spans.push({ kind: "recurrence", start: range[0], end: range[1], inTitle: true });
				return;
			}

			// "every day until friday", "every week 6 times"
			const limit = this.matchRecurrenceLimit(view.text.slice(end), context.now);
			if (limit) {
				rule += limit.rule;
				end += limit.length;
			}

			result.recurrence = rule;
			this.claimSpan(state, view, start, end, "recurrence", context, "recurrence");
			return;
		}
	}

	/** A weekday list after a weekly rule, optionally after a connector such as "on". */
	private matchWeekdaySuffix(text: string): { codes: string; length: number } | null {
		const lang = this.languageConfig.recurrence;
		const names = Object.fromEntries(
			WEEKDAY_KEYS.map((key) => [
				key,
				[
					...lang.weekdays[key as keyof typeof lang.weekdays],
					...lang.pluralWeekdays[key as keyof typeof lang.pluralWeekdays],
				],
			])
		);
		const days = this.alternatives(Object.values(names).flat());
		const connectors = this.alternatives(this.languageConfig.connectors?.recurrence ?? []);
		const separator = this.weekdayListSeparator();
		const pattern = new RegExp(
			`^\\s*(?:(?:${connectors || "(?!)"})\\s+)?((?:${days})(?:${separator}(?:${days}))*)${this.boundaries.endBoundary}`,
			"iu"
		);
		const match = pattern.exec(text);
		if (!match) return null;
		const codes = this.getListedWeekdayCodes(match[1], names, separator);
		return codes ? { codes, length: match[0].length } : null;
	}

	/** "until friday" or "10 times" directly after a recurrence. */
	private matchRecurrenceLimit(text: string, now: Date): { rule: string; length: number } | null {
		const lang = this.languageConfig.recurrence;
		const count = (lang.count ?? []).filter((phrase) => phrase.includes("{n}"));
		if (count.length > 0) {
			const pattern = new RegExp(
				`^\\s*,?\\s*(?:${count
					.sort((a, b) => b.length - a.length)
					.map((phrase) => this.phraseSource(phrase, { "{n}": "(\\d+)" }))
					.join("|")})${this.boundaries.endBoundary}`,
				"iu"
			);
			const match = pattern.exec(text);
			const times = match?.slice(1).find((group) => group !== undefined);
			if (match && times && Number(times) > 0) return { rule: `;COUNT=${Number(times)}`, length: match[0].length };
		}

		const until = this.alternatives(lang.until ?? []);
		if (!until) return null;
		const prefix = new RegExp(`^\\s*,?\\s*(?:${until})${this.boundaries.endBoundary}`, "iu").exec(text);
		if (!prefix) return null;
		const parsed = this.parseChronoFromPosition(text.slice(prefix[0].length), now);
		if (!parsed) return null;
		return {
			rule: `;UNTIL=${parsed.date.replace(/-/g, "")}`,
			length: prefix[0].length + parsed.endIndex,
		};
	}

	private isFrequencyAdjective(phrase: string): boolean {
		const adjectives = this.languageConfig.recurrence.adjectives ?? [];
		return adjectives.some((adjective) => adjective.toLowerCase() === phrase.trim().toLowerCase());
	}

	/** Whether text ends with a word such as "the" or "a", after which a value is ordinary text. */
	private followsNonDateWord(text: string): boolean {
		const previous = /([\p{L}\p{M}]+)\s*$/u.exec(text)?.[1]?.toLowerCase();
		return Boolean(
			previous &&
				(this.languageConfig.dates?.nonDateWordsBefore ?? []).some(
					(word) => word.toLowerCase() === previous
				)
		);
	}

	/** Whether text ends with a word that a following frequency adjective could describe. */
	private describesPreviousWord(text: string): boolean {
		return this.isDescribableWord(/([\p{L}\p{M}][\p{L}\p{N}\p{M}_-]*)\s+$/u.exec(text)?.[1]);
	}

	/** Whether text starts with a word that a frequency adjective could describe. */
	private describesNextWord(text: string): boolean {
		return this.isDescribableWord(/^\s+([\p{L}\p{M}][\p{L}\p{N}\p{M}_-]*)/u.exec(text)?.[1]);
	}

	private isDescribableWord(match: string | undefined): boolean {
		const word = match?.toLowerCase();
		if (!word || this.boundaries.spaceless) return false;
		const connectors = this.languageConfig.connectors ?? {};
		const notNouns = new Set(
			[
				...(connectors.date ?? []),
				...(connectors.recurrence ?? []),
				...(connectors.estimate ?? []),
				...this.languageConfig.dateTriggers.due,
				...this.languageConfig.dateTriggers.scheduled,
				...(this.languageConfig.recurrence.until ?? []),
				...(this.languageConfig.recurrence.listConjunctions ?? []),
				...Object.values(this.languageConfig.recurrence.frequencies).flat(),
			].map((phrase) => phrase.trim().split(/\s+/)[0].toLowerCase())
		);
		return !notNouns.has(word);
	}

	private weekdayListSeparator(): string {
		const conjunctions = this.alternatives(this.languageConfig.recurrence.listConjunctions ?? []);
		const gap = this.wordGap;
		return conjunctions
			? `(?:\\s*[,&、]\\s*(?:(?:${conjunctions})${gap})?|${gap}(?:${conjunctions})${gap})`
			: "\\s*[,&、]\\s*";
	}

	/** A phrase as a pattern source: spaces match any whitespace and slots fill {placeholders}. */
	private phraseSource(phrase: string, slots: Record<string, string> = {}): string {
		return phrase
			.trim()
			.split(/(\{[a-z]+\})/)
			.map((part) => slots[part] ?? this.escapeRegex(part).replace(/\s+/g, "\\s+"))
			.join("");
	}

	private alternatives(phrases: string[]): string {
		return phrases
			.filter((phrase) => phrase.trim())
			.sort((a, b) => b.length - a.length)
			.map((phrase) => this.phraseSource(phrase))
			.join("|");
	}

	/**
	 * Validate an rrule string to prevent parsing errors
	 */
	private isValidRRuleString(rruleString: string): boolean {
		// Check for empty or undefined BYDAY values
		if (
			rruleString.includes("BYDAY=undefined") ||
			rruleString.includes("BYDAY=;") ||
			rruleString.includes("BYDAY=")
		) {
			const byDayMatch = rruleString.match(/BYDAY=([^;]*)/);
			if (
				byDayMatch &&
				(!byDayMatch[1] || byDayMatch[1] === "undefined" || byDayMatch[1].trim() === "")
			) {
				return false;
			}
		}

		// Check for basic FREQ requirement
		if (!rruleString.includes("FREQ=")) {
			return false;
		}

		return true;
	}

	/**
	 * Extracts time estimate from text using language-aware patterns.
	 * Supports combined formats (1h30m), hours only (2hrs), and minutes only (45min).
	 *
	 * Pattern examples:
	 * - Combined: "2h 30m" → 150 minutes
	 * - Hours: "3 hours" → 180 minutes
	 * - Minutes: "45 minutes" → 45 minutes
	 *
	 * @param text Input text to parse
	 * @param result ParsedTaskData object to populate
	 * @returns Text with time estimate patterns removed
	 */
	private extractTimeEstimate(state: ClaimedText, result: ParsedTaskData, context: ParseContext): void {
		const langConfig = this.languageConfig.timeEstimate;

		// Use pre-configured boundary matching
		const { boundary, endBoundary } = this.boundaries;

		const hours = langConfig.hours.map((p) => this.escapeRegex(p)).join("|");
		const minutes = langConfig.minutes.map((p) => this.escapeRegex(p)).join("|");
		// Numbers must be whole tokens: "5 ore" inside "1,5 ore" or "2.5.3 ore" is not an estimate.
		const number = "(?<!\\d[.,])(\\d+)";
		const decimal = "(?<!\\d[.,])(\\d+(?:[.,]\\d{1,2})?)";
		const phrases = [...(langConfig.phrases ?? [])].sort((a, b) => b.phrase.length - a.phrase.length);

		const patterns = [
			// Combined format: 1h30m, 1 hour 30 minutes
			{
				regex: new RegExp(
					`${boundary}${number}\\s*(${hours})\\s*(\\d+)\\s*(${minutes})${endBoundary}`,
					"giu"
				),
				handler: (m: RegExpMatchArray) => parseInt(m[1]) * 60 + parseInt(m[3]),
			},
			// Hours: 1hr, 2 hours, 3h, 1.5 hours, 1,5 ore
			{
				regex: new RegExp(`${boundary}${decimal}\\s*(${hours})${endBoundary}`, "giu"),
				handler: (m: RegExpMatchArray) => Math.round(Number(m[1].replace(",", ".")) * 60),
			},
			// Minutes: 30min, 45 m, 15 minutes
			{
				regex: new RegExp(`${boundary}${number}\\s*(${minutes})${endBoundary}`, "giu"),
				handler: (m: RegExpMatchArray) => parseInt(m[1]),
			},
			// Word durations: "half an hour"
			...(phrases.length > 0
				? [
						{
							regex: new RegExp(
								`${boundary}(${phrases.map((p) => this.escapeRegex(p.phrase)).join("|")})${endBoundary}`,
								"giu"
							),
							handler: (m: RegExpMatchArray) =>
								phrases.find((p) => p.phrase.toLowerCase() === m[1].toLowerCase())?.minutes ?? 0,
						},
					]
				: []),
		];

		// "in 2 hours" and 3小时后 are relative dates for the date stage, and "à 15h"
		// is a time: none is an estimate.
		const before = this.boundaries.spaceless ? "" : "(?:^|\\s)";
		const prefixes = this.alternatives([
			...(langConfig.relativePrefixes ?? []),
			...(langConfig.clockPrefixes ?? []),
		]);
		const notEstimateBefore = prefixes ? new RegExp(`${before}(?:${prefixes})\\s*$`, "iu") : null;
		const suffixes = this.alternatives(langConfig.relativeSuffixes ?? []);
		const notEstimateAfter = suffixes ? new RegExp(`^\\s*(?:${suffixes})`, "iu") : null;

		const view = state.view();
		// Blank each claimed estimate so shorter patterns cannot match inside it.
		let text = view.text;
		let totalEstimate = 0;

		for (const pattern of patterns) {
			const match = Array.from(text.matchAll(pattern.regex)).find(
				(candidate) =>
					!notEstimateBefore?.test(text.slice(0, candidate.index)) &&
					!notEstimateAfter?.test(text.slice(candidate.index! + candidate[0].length))
			);
			if (!match) continue;

			totalEstimate += pattern.handler(match);
			const start = match.index!;
			const end = start + match[0].length;
			this.claimSpan(state, view, start, end, "estimate", context, "estimate");
			text = text.slice(0, start) + " ".repeat(end - start) + text.slice(end);
		}

		if (totalEstimate > 0) {
			result.estimate = totalEstimate;
		}

		// Keep unsupported decimal durations ("1.5 min", "1.333 hours", "v1.5 hours") in
		// the title, hidden from the date stage so chrono cannot read part of them.
		for (const literal of text.matchAll(
			new RegExp(
				`(?<![\\p{N}.,])\\d+(?:[.,]\\d+)+\\s*(?:${hours}|${minutes})(?![\\p{L}\\p{N}_])`,
				"giu"
			)
		)) {
			state.claim(view, literal.index!, literal.index! + literal[0].length, "shield");
		}
	}

	/**
	 * Ensures the final parsed data is valid and clean.
	 */
	private validateAndCleanupResult(result: ParsedTaskData): ParsedTaskData {
		// Sanitize and remove duplicates from arrays
		result.tags = [...new Set(result.tags.filter(Boolean))];
		result.contexts = [...new Set(result.contexts.filter(Boolean))];
		result.projects = [...new Set(result.projects.filter(Boolean))];

		// Ensure date and time strings are valid formats (defensive check)
		if (result.dueDate && !this.isValidDateString(result.dueDate)) delete result.dueDate;
		if (result.scheduledDate && !this.isValidDateString(result.scheduledDate))
			delete result.scheduledDate;
		if (result.dueTime && !this.isValidTimeString(result.dueTime)) delete result.dueTime;
		if (result.scheduledTime && !this.isValidTimeString(result.scheduledTime))
			delete result.scheduledTime;

		return result;
	}

	private defaultNow(): Date {
		const reference = this.config.referenceDate;
		if (typeof reference === "function") return reference();
		return reference ? new Date(reference.getTime()) : new Date();
	}

	private isValidDateString = (dateString: string): boolean =>
		/^\d{4}-\d{2}-\d{2}$/.test(dateString);
	private isValidTimeString = (timeString: string): boolean =>
		/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
	private escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

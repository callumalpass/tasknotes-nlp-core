import * as rruleModule from "rrule";
import type { StatusConfig, PriorityConfig, NLPTriggersConfig, UserMappedField } from "./types.js";
import { getLanguageConfig } from "./languages/index.js";
import type { ParsedSpan } from "./api.js";
import { DEFAULT_NLP_TRIGGERS } from "./defaults.js";
import { TaskParserEngine, type NumericDateOrder, type ParsedTaskData } from "./TaskParserEngine.js";

const RRule = rruleModule.RRule;

export interface NaturalLanguageParserOptions {
	/**
	 * Locale used for ambiguous numeric dates such as 11/06/2026.
	 * This is intentionally separate from languageCode so English parsing can still
	 * respect regional date order such as en-GB.
	 */
	dateLocale?: string;
	/**
	 * Explicit numeric date order override. When omitted, dateLocale is used.
	 */
	dateOrder?: NumericDateOrder;
	/**
	 * Date that relative dates such as "tomorrow" resolve against. Defaults to the
	 * current time at each parse.
	 */
	referenceDate?: Date | (() => Date);
}

/**
 * The TaskNotes plugin's parser interface. New code should use createTaskParser,
 * which also returns spans and typed field values.
 */
export class NaturalLanguageParserCore {
	private readonly engine: TaskParserEngine;
	private readonly statusConfigs: StatusConfig[];

	constructor(
		statusConfigs: StatusConfig[] = [],
		priorityConfigs: PriorityConfig[] = [],
		defaultToScheduled = true,
		languageCode = "en",
		nlpTriggers?: NLPTriggersConfig,
		userFields?: UserMappedField[],
		options: NaturalLanguageParserOptions = {}
	) {
		this.statusConfigs = statusConfigs;
		this.engine = new TaskParserEngine({
			language: getLanguageConfig(languageCode),
			statuses: statusConfigs.map(({ value, label }) => ({ value, label, aliases: [] })),
			priorities: priorityConfigs.map(({ value, label }) => ({ value, label, aliases: [] })),
			defaultToScheduled,
			triggers: nlpTriggers || DEFAULT_NLP_TRIGGERS,
			userFields: userFields || [],
			dateLocale: options.dateLocale,
			dateOrder: options.dateOrder,
			referenceDate: options.referenceDate,
			features: { dates: true, recurrence: true, estimate: true, priority: true, status: true },
		});
	}

	/** Parses task input. An input with nothing left for a title gets "Untitled Task". */
	public parseInput(input: string): ParsedTaskData {
		return this.parseInputWithSpans(input).data;
	}

	/** Parses task input and also returns where each value was found, in input order. */
	public parseInputWithSpans(input: string): { data: ParsedTaskData; spans: ParsedSpan[] } {
		const { data, spans } = this.engine.parse(input);
		if (!data.title) data.title = "Untitled Task";
		return { data, spans };
	}

	/**
	 * Generates a user-friendly preview of the parsed data.
	 * Icons are placeholders for the UI layer to interpret.
	 */
	public getPreviewData(parsed: ParsedTaskData): Array<{ icon: string; text: string }> {
		const parts: Array<{ icon: string; text: string }> = [];

		if (parsed.title) parts.push({ icon: "edit-3", text: `"${parsed.title}"` });
		if (parsed.details)
			parts.push({
				icon: "file-text",
				text: `Details: "${parsed.details.substring(0, 50)}${parsed.details.length > 50 ? "..." : ""}"`,
			});
		if (parsed.dueDate) {
			const dateStr = parsed.dueTime
				? `${parsed.dueDate} at ${parsed.dueTime}`
				: parsed.dueDate;
			parts.push({ icon: "calendar", text: `Due: ${dateStr}` });
		}
		if (parsed.scheduledDate) {
			const dateStr = parsed.scheduledTime
				? `${parsed.scheduledDate} at ${parsed.scheduledTime}`
				: parsed.scheduledDate;
			parts.push({ icon: "calendar-clock", text: `Scheduled: ${dateStr}` });
		}
		if (parsed.priority)
			parts.push({ icon: "alert-triangle", text: `Priority: ${parsed.priority}` });
		if (parsed.status) parts.push({ icon: "activity", text: `Status: ${parsed.status}` });
		if (parsed.contexts && parsed.contexts.length > 0)
			parts.push({
				icon: "map-pin",
				text: `Contexts: ${parsed.contexts.map((c) => "@" + c).join(", ")}`,
			});
		if (parsed.projects && parsed.projects.length > 0) {
			// Display projects with + prefix (no need to wrap in brackets - just show what was parsed)
			const projectDisplay = parsed.projects.map((p) => `+${p}`).join(", ");
			parts.push({ icon: "folder", text: `Projects: ${projectDisplay}` });
		}
		if (parsed.tags && parsed.tags.length > 0)
			parts.push({
				icon: "tag",
				text: `Tags: ${parsed.tags.map((t) => "#" + t).join(", ")}`,
			});
		if (parsed.recurrence) {
			let recurrenceText = "Invalid recurrence";
			try {
				if (this.engine.isValidRecurrence(parsed.recurrence)) {
					recurrenceText = RRule.fromString(parsed.recurrence).toText();
				}
			} catch (error) {
				console.debug("Error parsing rrule for preview:", error);
			}
			parts.push({ icon: "repeat", text: `Recurrence: ${recurrenceText}` });
		}
		if (parsed.estimate)
			parts.push({ icon: "clock", text: `Estimate: ${parsed.estimate} min` });

		// User-defined fields
		if (parsed.userFields && Object.keys(parsed.userFields).length > 0) {
			for (const [fieldId, value] of Object.entries(parsed.userFields)) {
				const displayName = this.engine.getUserField(fieldId)?.displayName || fieldId;
				const displayValue = Array.isArray(value) ? value.join(", ") : value;
				parts.push({ icon: "box", text: `${displayName}: ${displayValue}` });
			}
		}

		return parts;
	}

	/**
	 * Generates a simple text-only preview of the parsed data.
	 */
	public getPreviewText(parsed: ParsedTaskData): string {
		return this.getPreviewData(parsed)
			.map((part) => part.text)
			.join(" • ");
	}

	/**
	 * Get status suggestions for autocomplete
	 */
	getStatusSuggestions(
		query: string,
		limit = 10
	): Array<{ value: string; label: string; display: string }> {
		const q = query.toLowerCase();
		return this.statusConfigs
			.filter((s) => s && typeof s.value === "string" && typeof s.label === "string")
			.filter((s) => s.value.trim() !== "" && s.label.trim() !== "")
			.filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
			.slice(0, limit)
			.map((s) => ({
				value: s.value,
				label: s.label,
				display: s.label,
			}));
	}
}

import type { LanguageRegistry, NLPLanguageConfig } from "./types.js";
import { enConfig } from "./en.js";
import { esConfig } from "./es.js";
import { frConfig } from "./fr.js";
import { deConfig } from "./de.js";
import { ruConfig } from "./ru.js";
import { zhConfig } from "./zh.js";
import { jaConfig } from "./ja.js";
import { itConfig } from "./it.js";
import { nlConfig } from "./nl.js";
import { ptConfig } from "./pt.js";
import { svConfig } from "./sv.js";
import { ukConfig } from "./uk.js";

/**
 * Registry of all available language configurations
 */
export const languageRegistry: LanguageRegistry = {
	en: enConfig,
	es: esConfig,
	fr: frConfig,
	de: deConfig,
	ru: ruConfig,
	zh: zhConfig,
	ja: jaConfig,
	it: itConfig,
	nl: nlConfig,
	pt: ptConfig,
	sv: svConfig,
	uk: ukConfig,
};

/**
 * Get available languages as options for settings dropdown
 */
export function getAvailableLanguages(): Array<{ value: string; label: string }> {
	return Object.values(languageRegistry).map((config) => ({
		value: config.code,
		label: config.name,
	}));
}

/**
 * Get language configuration by code, fallback to English
 */
export function getLanguageConfig(languageCode: string): NLPLanguageConfig {
	return languageRegistry[languageCode] || languageRegistry["en"];
}

/**
 * Detect system language and return supported language code
 * Falls back to English if system language is not supported
 */
export function detectSystemLanguage(): string {
	// Try to detect from browser/system locale
	const systemLang = typeof navigator !== "undefined" ? navigator.language?.split("-")[0] : "en";

	// Return system language if supported, otherwise default to English
	return languageRegistry[systemLang] ? systemLang : "en";
}

type DeepPartialMerge<T> = {
	[K in keyof T]?: T[K] extends Array<infer U> ? U[] : T[K] extends object ? DeepPartialMerge<T[K]> : T[K];
};

/** Additions to a language configuration; see mergeLanguageConfig. */
export type LanguageOverrides = DeepPartialMerge<NLPLanguageConfig>;

/**
 * Returns a copy of a language configuration with additions: arrays are appended
 * to the built-in ones, objects are merged and other values replace them.
 */
export function mergeLanguageConfig(
	base: NLPLanguageConfig,
	overrides?: LanguageOverrides
): NLPLanguageConfig {
	return overrides ? (merge(base, overrides) as NLPLanguageConfig) : base;
}

function merge(base: unknown, override: unknown): unknown {
	if (override === undefined) return base;
	if (Array.isArray(base) && Array.isArray(override)) return [...base, ...override];
	if (isObject(base) && isObject(override)) {
		const merged: Record<string, unknown> = { ...base };
		for (const [key, value] of Object.entries(override)) merged[key] = merge(base[key], value);
		return merged;
	}
	return override;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Re-export types for convenience
export * from "./types.js";

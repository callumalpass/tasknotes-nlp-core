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

// Re-export types for convenience
export * from "./types.js";

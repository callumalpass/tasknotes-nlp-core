import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTaskParser } from "../../dist/index.js";

// Thursday 29 October 2026, 10:00 local time.
export const referenceDate = new Date(2026, 9, 29, 10, 0);

/**
 * Checks each example's task against the expected fields. Fields left out of an
 * expectation must be empty: no date, no recurrence, no tags and so on.
 */
export function runExamples(language, groups, options = {}) {
	const parser = createTaskParser({ language, referenceDate, ...options });
	for (const [group, examples] of Object.entries(groups)) {
		describe(`${language}: ${group}`, () => {
			for (const [input, expected] of examples) {
				it(input, () => assert.deepEqual(compact(parser.parse(input).task), expected));
			}
		});
	}
}

function compact(task) {
	return Object.fromEntries(
		Object.entries(task).filter(([key, value]) => {
			if (key === "completed") return false;
			if (Array.isArray(value)) return value.length > 0;
			if (value && typeof value === "object") return Object.keys(value).length > 0;
			return value !== undefined;
		})
	);
}

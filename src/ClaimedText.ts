/**
 * Kinds of claimed text. Metadata (tags, contexts, projects, custom fields) is
 * removed as-is. Value spans also remove the connector words that introduce them,
 * such as "at" before a time or "takes" before an estimate. Shielded spans stay in
 * the title but are hidden from later stages.
 */
export type ClaimKind = "metadata" | "date" | "estimate" | "recurrence" | "keyword" | "shield";

export type ConnectorKind = "date" | "estimate" | "recurrence" | "keyword";

export interface TextView {
	/** Unclaimed text with claimed characters blanked and whitespace runs collapsed. */
	text: string;
	/** Maps each view index to its index in the original text. */
	map: number[];
}

const MARKERS: Record<ConnectorKind, string> = {
	date: "",
	estimate: "",
	recurrence: "",
	keyword: "",
};
const ANY_MARKER = "[-]";
const MARKER_RUN = `${ANY_MARKER}(?:\\s*${ANY_MARKER})*`;
const SEPARATOR = "[,;:–—，；：、-]";

/**
 * Tracks which parts of a task line each parsing stage has used, so stages work on
 * stable original offsets and the title is built once from what remains.
 */
export class ClaimedText {
	private readonly kinds: Array<ClaimKind | undefined>;

	constructor(readonly text: string) {
		this.kinds = new Array(text.length);
	}

	/**
	 * Returns the text later stages should read: unclaimed, trimmed, with each blank
	 * left by a claim collapsed to one space. Other whitespace is kept as written.
	 */
	view(): TextView {
		let text = "";
		const map: number[] = [];

		for (let index = 0; index < this.text.length; ) {
			if (!this.isBlank(index)) {
				text += this.text[index];
				map.push(index);
				index += 1;
				continue;
			}

			const start = index;
			let touchesClaim = false;
			while (index < this.text.length && this.isBlank(index)) {
				touchesClaim ||= this.kinds[index] !== undefined;
				index += 1;
			}
			if (text.length === 0 || index === this.text.length) continue;
			if (touchesClaim) {
				text += " ";
				map.push(start);
			} else {
				text += this.text.slice(start, index);
				for (let offset = start; offset < index; offset += 1) map.push(offset);
			}
		}

		return { text, map };
	}

	private isBlank(index: number): boolean {
		return this.kinds[index] !== undefined || /\s/u.test(this.text[index]);
	}

	/**
	 * Claims view[start, end) for a stage and returns the range in the original text.
	 * Already-claimed characters keep their kind.
	 */
	claim(view: TextView, start: number, end: number, kind: ClaimKind): [number, number] | null {
		if (end <= start || start < 0 || end > view.map.length) return null;
		const originalStart = view.map[start];
		const originalEnd = view.map[end - 1] + 1;
		for (let index = originalStart; index < originalEnd; index += 1) {
			this.kinds[index] ??= kind;
		}
		return [originalStart, originalEnd];
	}

	hasClaims(): boolean {
		return this.kinds.some((kind) => kind !== undefined && kind !== "shield");
	}

	/**
	 * Builds the title from unclaimed text, removing the connectors and separators that
	 * only made sense next to a removed value ("call Jo at 3pm" -> "call Jo").
	 */
	buildTitle(
		connectors: Partial<Record<ConnectorKind, string[]>>,
		{ spaceless = false }: { spaceless?: boolean } = {}
	): string {
		// Without spaces between words, a removed value leaves nothing behind.
		const gap = spaceless ? "" : " ";
		let title = "";
		for (let index = 0; index < this.text.length; index += 1) {
			const kind = this.kinds[index];
			if (kind === undefined || kind === "shield") {
				title += this.text[index];
			} else if (kind === "metadata") {
				title += " ";
			} else if (index === 0 || this.kinds[index - 1] !== kind) {
				// One marker per run; a space keeps neighbouring words apart.
				title += `${gap}${MARKERS[kind]}${gap}`;
			}
		}

		title = this.removeConnectors(title, connectors, spaceless);
		return this.removeMarkers(title, gap);
	}

	private removeConnectors(
		title: string,
		connectors: Partial<Record<ConnectorKind, string[]>>,
		spaceless: boolean
	): string {
		for (const [kind, phrases] of Object.entries(connectors) as Array<[ConnectorKind, string[]]>) {
			const alternatives = phrases
				.filter((phrase) => phrase.trim().length > 0)
				.sort((a, b) => b.length - a.length)
				.map((phrase) => phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
				.join("|");
			if (!alternatives) continue;

			// Repeat so chained connectors go too: "should take about 2h".
			const pattern = new RegExp(
				`(${spaceless ? "" : "^|[\\s(]"})(?:${alternatives})\\s*(?=${MARKERS[kind]})`,
				"iu"
			);
			let previous;
			do {
				previous = title;
				title = title.replace(pattern, "$1");
			} while (title !== previous);
		}
		return title;
	}

	private removeMarkers(title: string, gap: string): string {
		const rules: Array<[RegExp, string]> = [
			[new RegExp(MARKER_RUN, "gu"), ""],
			// "urgent: fix it" -> "fix it"
			[new RegExp(`^\\s*${ANY_MARKER}\\s*${SEPARATOR}+\\s*`, "u"), ""],
			// "write post, about 2h" -> "write post"; "task every monday," -> "task"
			[new RegExp(`\\s*${SEPARATOR}*\\s*${ANY_MARKER}\\s*${SEPARATOR}*\\s*$`, "u"), ""],
			// "call (tomorrow)" -> "call"
			[new RegExp(`\\s*\\(\\s*${ANY_MARKER}\\s*\\)`, "gu"), ""],
			// "a, tomorrow, b" -> "a, b"
			[new RegExp(`(${SEPARATOR})\\s*${ANY_MARKER}\\s*${SEPARATOR}`, "gu"), "$1"],
			// "email Jo in 3 days, takes" leaves "Jo <m>, <m>": drop markers before punctuation.
			[new RegExp(`\\s*${ANY_MARKER}\\s*(?=[,;:.!?)\\]，。！？；：、）])`, "gu"), ""],
		];

		let previous;
		do {
			previous = title;
			for (const [pattern, replacement] of rules) {
				title = title.replace(pattern, replacement);
			}
		} while (title !== previous);

		return title.replace(new RegExp(ANY_MARKER, "gu"), gap).replace(/\s+/g, " ").trim();
	}
}

/**
 * Text derived from an input string that remembers where each character came from,
 * so positions found after rewriting (placeholders, normalized dates) can be
 * reported against the original input.
 */
export class MappedText {
	text = "";
	private readonly starts: number[] = [];
	private readonly ends: number[] = [];

	static from(source: string): MappedText {
		const mapped = new MappedText();
		mapped.text = source;
		for (let index = 0; index < source.length; index += 1) {
			mapped.starts.push(index);
			mapped.ends.push(index + 1);
		}
		return mapped;
	}

	/** Appends replacement text standing for source[sourceStart, sourceEnd). */
	append(text: string, sourceStart: number, sourceEnd: number): void {
		this.text += text;
		for (let index = 0; index < text.length; index += 1) {
			this.starts.push(sourceStart);
			this.ends.push(sourceEnd);
		}
	}

	/** Appends this[start, end) of another mapped text, keeping its mapping. */
	appendFrom(other: MappedText, start: number, end: number): void {
		this.text += other.text.slice(start, end);
		this.starts.push(...other.starts.slice(start, end));
		this.ends.push(...other.ends.slice(start, end));
	}

	/** Appends text standing for other[start, end): a replacement of that range. */
	appendReplacing(other: MappedText, start: number, end: number, text: string): void {
		const [sourceStart, sourceEnd] = other.sourceRange(start, end);
		this.append(text, sourceStart, sourceEnd);
	}

	slice(start: number, end = this.text.length): MappedText {
		const sliced = new MappedText();
		sliced.appendFrom(this, start, end);
		return sliced;
	}

	/** Source range for text[start, end). */
	sourceRange(start: number, end: number): [number, number] {
		if (this.text.length === 0) return [0, 0];
		const first = Math.min(Math.max(start, 0), this.text.length - 1);
		const last = Math.min(Math.max(end - 1, first), this.text.length - 1);
		return [this.starts[first], this.ends[last]];
	}

	/**
	 * Replaces matches of a global pattern. The callback returns the replacement,
	 * or null to keep the match unchanged.
	 */
	replace(pattern: RegExp, replacer: (match: RegExpExecArray) => string | null): MappedText {
		const result = new MappedText();
		let last = 0;
		for (const match of this.text.matchAll(pattern)) {
			const replacement = replacer(match as RegExpExecArray);
			if (replacement === null) continue;
			const start = match.index!;
			const end = start + match[0].length;
			result.appendFrom(this, last, start);
			result.appendReplacing(this, start, end, replacement);
			last = end;
		}
		result.appendFrom(this, last, this.text.length);
		return result;
	}
}

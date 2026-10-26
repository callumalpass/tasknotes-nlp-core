# Changelog

## Unreleased

- Resolve overlapping Italian date triggers by phrase specificity, preserving `entro il` and `per il` deadlines as well as full scheduling phrases.
- Fix Italian `entro le` deadlines, feminine scheduling phrases and accented weekday recurrence (tasknotes#2428). Thanks to @starise for the report.

## 0.2.1

- Keep recurrence words in hyphenated task titles, such as `weekly-review`, instead of removing part of the title and setting a repeat schedule.

## 0.2.0

- Tag, context, project and custom-field selectors now require start-of-input or preceding whitespace, checked against original input positions. Punctuation-adjacent selectors such as `(@work)` no longer extract metadata. Emails, URL fragments and C++ tokens are no longer split by these selectors.
- Restore nested quoted/backtick/single-quoted wikilinks without leaking internal literal markers. Keep linked projects before simple projects.
- Repeated project prefixes consume exactly one prefix: `++personal` produces project `+personal` without rewriting links, quoted/escaped text or details.
- Add partial Italian date parsing for `oggi`, `domani` and `dopodomani`, including `entro`/`per` Due and `programmato per` Scheduled forms, using local calendar days after literal and metadata protection.
- Italian: the standalone trigger `per` now sets Due rather than Scheduled; use `programmato per` for Scheduled.

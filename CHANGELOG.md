# Changelog

## Unreleased

- Fix Italian dates, times, estimates and weekdays (tasknotes#2433). Thanks to @starise for the report.
  - Invalid numeric dates such as `32/12/2026` or `29/02/2027` stay in the title instead of setting a partial date.
  - Decimal hour estimates with one or two decimal places, such as `1,5 ore` and `1.5 hours`, are supported. Numbers are matched as whole tokens, so `1,5 ore` no longer becomes 5 hours. Other decimal durations, such as `1.5 min` or `1.333 hours`, stay in the title instead of setting a time.
  - `alle` and `alle ore` join a date and time, so `domani alle 20:00`, `domani, alle 9:00` and `entro il 25/12/2026 alle 20:00` keep both.
  - Italian weekday names parse as dates, so `entro lunedì` sets a due date. As in other languages, today's weekday means today.
  - In all languages, a weekday that is also its own plural (Italian `lunedì`, Spanish `lunes`, Chinese and Japanese weekdays) no longer implies recurrence on its own; it sets a one-off date. Use an every keyword (`ogni lunedì`, Spanish `los lunes` or `cada lunes`) or a distinct plural such as `sabati` for weekly recurrence.
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

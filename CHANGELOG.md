# Changelog

## 0.3.0

- Add `createTaskParser`, a parser API that returns a typed task (`scheduled: { date, time }`, `fields` with numbers, booleans and dates) and spans giving where each value was found in the input. It takes statuses and priorities with aliases, per-parse reference dates, feature switches and language additions (`languageOverrides`). `NaturalLanguageParserCore` keeps its interface and output.
- Recurrence: `fortnightly`, `quarterly`, `every 2 weeks on monday and thursday`, `every week on friday`, `until friday` (`UNTIL`) and `10 times` (`COUNT`). A frequency describing the next word stays in the title and still sets the recurrence: `weekly review`. After an article it is ordinary text: `buy a weekly planner`.
- A time range on one day, such as `3-4pm tomorrow`, sets the scheduled time and an estimate.
- Statuses and priorities match their aliases, a status can be wrapped in its trigger (`*in progress*`), and with the status trigger enabled `*done` removes the trigger with the word.
- Custom field values can be markdown links.
- `NaturalLanguageParserCore.parseInputWithSpans` returns the parsed data with its spans, for highlighting recognised text in an input.
- Every language now has full date, recurrence, estimate, status and priority data, with examples tested per language. New optional language data: relative day phrases (`dopodomani`), the last day of the week for end-of-week phrases, clock phrases without an hour (`midi`), words that introduce a clock time (`à 15h`, `kl 15`), relative-time suffixes (`3小时后`), frequency adjectives after their noun (`reunión semanal`) and words that follow an ordinal recurrence (`du mois`).
- In every language: a relative time such as `dans 2 heures` sets a date rather than an estimate, a date followed by a time (`imorgon kl 15`) keeps both, the longest date trigger decides between due and scheduled, weekday names from the language data parse as dates when chrono misses them, and chrono matches inside longer words are ignored.
- Portuguese `diária` after a noun sets a daily recurrence (`reunião diária`). After an article it is a noun (`pagar a diária do hotel`), in every language whose adjectives follow the noun.
- Languages written without spaces: recurrence and lists need no spaces (`每3天`, `毎月第2火曜日`, `每周一、每周三`), metadata may follow text directly (`買い物#家事`), and a day of the month may be followed by text (`15号交房租`) unless a duration unit follows (`15日分`).
- Language data now covers date phrases chrono does not know (end of a period, fixed holidays, a day of the month, clock phrases), word-like weekday abbreviations and afternoon bare hours, through the optional `dates` config. Languages written without spaces set `spaceless`, and word boundaries work for every script.
- Rebuild title extraction on claimed spans. Each stage marks the text it uses instead of deleting it, so later stages see stable positions and the title is built once. Titles no longer keep the words around removed values:
  - Connector words before a value go with it: `call Jo at 3pm`, `email Jo in three days, takes 10 minutes`, `write post, should take about 2 hours`, `high priority deploy the hotfix` give `call Jo`, `email Jo`, `write post` and `deploy the hotfix`. English sets these words in the new optional `connectors` language config.
  - Separators and brackets left by a removed value are removed: `urgent: fix prod`, `Call dentist (tomorrow)`.
  - A possessive date stays in the title: `prep slides for monday's meeting`.
  - Priorities and statuses are removed where they matched, not at their first occurrence in the title.
- A priority or status inside a hyphenated word no longer matches: `deploy the high-availability cluster` has no priority.
- Recurrence and dates work together: in `call mum every sunday at 6pm` the date is the next Sunday, not today or tomorrow.
- English recurrence: weekday lists (`every mon, wed and fri`, `tuesdays and thursdays`), `every weekday`, `weekends` and abbreviated weekdays (`every wed`).
- English dates: `half past four`, `quarter to 5`, `4 o'clock`, `the 15th`, `end of the month`, `end of next week`, `eod`, `christmas` and other fixed dates. Bare hours from 1 to 6 mean the afternoon (`at 3` is 15:00). `Sun`, `Sat` and `Wed` used as words (`meeting with Sun Ltd`) are not dates.
- Due triggers may be followed by connector words (`due before friday`), every occurrence of a trigger is tried, and English adds `before` and `no later than` as due triggers.
- English estimates: `1 hour 30 minutes`, `half an hour` and `an hour`. `in 2 hours` is a relative time, not an estimate.
- Add the `referenceDate` option for resolving relative dates against a fixed date.
- The chrono parser is created once per parser instance instead of on every parse.
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

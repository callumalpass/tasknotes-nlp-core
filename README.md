# tasknotes-nlp-core

Framework-agnostic natural-language task parsing for TaskNotes-style workflows.

`tasknotes-nlp-core` turns free text like:

```text
Pay rent tomorrow 9am #finance @home +admin every month
```

into structured task data (title, dates, tags, contexts, projects, recurrence, estimates, and custom fields).

## Install

```bash
npm install tasknotes-nlp-core
```

## What This Package Provides

- `createTaskParser`: the parser API. It returns a typed task and the spans where each value was found.
- `NaturalLanguageParserCore`: the TaskNotes plugin's interface, kept for compatibility
- `TriggerConfigService`: helper for trigger/property mapping
- Built-in defaults via `DEFAULT_NLP_TRIGGERS`
- Language registry and helpers (`getAvailableLanguages`, `getLanguageConfig`, `mergeLanguageConfig`, `detectSystemLanguage`)
- Shared types for status/priority/trigger/user-field config

## Parsing a task

```ts
import { createTaskParser } from "tasknotes-nlp-core";

const parser = createTaskParser({
  language: "en-GB",
  statuses: [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In progress", aliases: ["doing", "wip"] },
    { value: "done", label: "Done", completed: true },
  ],
  priorities: [{ value: "high", label: "High", aliases: ["p1"] }],
  fields: [{ id: "points", trigger: "pts:", type: "number" }],
});

const { task, spans } = parser.parse("Standup every weekday at 9am #team pts:2 *in progress*");
```

`task` is:

```ts
{
  title: "Standup",
  scheduled: { date: "2026-10-30", time: "09:00" },
  recurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  status: "in-progress",
  completed: false,
  tags: ["team"],
  contexts: [],
  projects: [],
  fields: { points: 2 },
}
```

`spans` lists each recognised value with its offsets in the input, in input order, so an editor can highlight them:

```ts
[
  { kind: "recurrence", start: 8, end: 21, text: "every weekday" },
  { kind: "scheduled", start: 22, end: 28, text: "at 9am" },
  { kind: "tag", start: 29, end: 34, text: "#team" },
  { kind: "field", field: "points", start: 35, end: 40, text: "pts:2" },
  { kind: "status", start: 41, end: 54, text: "*in progress*" },
]
```

A span with `inTitle: true` set a value but its text stayed in the title, as in `prep slides for monday's meeting` or `weekly review`. A date range sets a `scheduled` and a `due` span over the same text.

### Options

| Option | Default | |
| --- | --- | --- |
| `language` | `"en"` | Language code or locale (`de`, `en-GB`). The region sets the numeric date order. |
| `locale`, `dateOrder` | from `language` | Override numeric date reading (`day-first` or `month-first`). |
| `referenceDate` | now | Date or function giving the date relative dates resolve against. `parse(input, { referenceDate })` overrides it for one parse. |
| `defaultDateField` | `"scheduled"` | Field for a date without a due or scheduled word. |
| `statuses`, `priorities` | language words | Values with `label` and `aliases`. Without any, the language's built-in words apply (`done`, `urgent` and so on). |
| `triggers` | `#` `@` `+` `*` | Trigger characters for `tag`, `context`, `project`, `status` and `priority`; `false` turns one off. A status can be wrapped, `*in progress*`, to end a multi-word name. |
| `fields` | none | Custom fields: `{ id, trigger, type }` with type `text`, `number`, `boolean`, `date` or `list`. Values are typed: numbers, booleans, `YYYY-MM-DD` dates (from `next friday` too) and lists. Quoted values (`assignee:"Jo Bloggs"`), wikilinks and markdown links are kept whole. |
| `features` | all on | Turn off `dates`, `recurrence`, `estimate`, `priority` or `status`. |
| `languageOverrides` | none | Additions to the language: arrays are appended, objects merged. For example `{ dateTriggers: { due: ["deadline:"] } }`. |

An input with nothing left for a title gives an empty `title`. `NaturalLanguageParserCore` uses `Untitled Task` instead.

## NaturalLanguageParserCore

```ts
import {
  NaturalLanguageParserCore,
  DEFAULT_NLP_TRIGGERS,
  type StatusConfig,
  type PriorityConfig,
} from "tasknotes-nlp-core";

const statusConfigs: StatusConfig[] = [
  {
    id: "open",
    value: "open",
    label: "Open",
    color: "#64748b",
    isCompleted: false,
    order: 0,
    autoArchive: false,
    autoArchiveDelay: 0,
  },
  {
    id: "done",
    value: "done",
    label: "Done",
    color: "#22c55e",
    isCompleted: true,
    order: 1,
    autoArchive: true,
    autoArchiveDelay: 7,
  },
];

const priorityConfigs: PriorityConfig[] = [
  { id: "urgent", value: "urgent", label: "Urgent", color: "#ef4444", weight: 100 },
  { id: "normal", value: "normal", label: "Normal", color: "#3b82f6", weight: 50 },
];

const parser = new NaturalLanguageParserCore(
  statusConfigs,
  priorityConfigs,
  true,                  // defaultToScheduled
  "en",                 // language code
  DEFAULT_NLP_TRIGGERS   // optional trigger config
);

const parsed = parser.parseInput(
  "Pay rent tomorrow 9am #finance @home +admin every month 30m"
);

console.log(parsed);
```

`parseInputWithSpans()` returns `{ data, spans }`: the same data, plus the spans described under [Parsing a task](#parsing-a-task), for highlighting recognised text as the user types.

## Parsed Output Shape

`parseInput()` returns:

```ts
interface ParsedTaskData {
  title: string;
  details?: string;
  dueDate?: string;        // yyyy-MM-dd
  scheduledDate?: string;  // yyyy-MM-dd
  dueTime?: string;        // HH:mm
  scheduledTime?: string;  // HH:mm
  priority?: string;
  status?: string;
  tags: string[];
  contexts: string[];
  projects: string[];
  recurrence?: string;     // rrule string
  estimate?: number;       // minutes
  isCompleted?: boolean;
  userFields?: Record<string, string | string[]>;
}
```

## Constructor Options

```ts
new NaturalLanguageParserCore(
  statusConfigs?,
  priorityConfigs?,
  defaultToScheduled?,
  languageCode?,
  nlpTriggers?,
  userFields?,
  options?
)
```

- `statusConfigs`: optional custom status list. If omitted, language fallback matching is used.
- `priorityConfigs`: optional custom priority list. If omitted, language fallback matching is used.
- `defaultToScheduled`:
  - `true`: ambiguous date text (for example `tomorrow`) goes to `scheduledDate`
  - `false`: ambiguous date text goes to `dueDate`
- `languageCode`: one of supported codes (defaults to `en`).
- `nlpTriggers`: trigger map for tags/contexts/projects/status/priority.
- `userFields`: custom field definitions with trigger support.
- `options.dateLocale`: locale used for ambiguous numeric dates, for example `en-GB` parses `11/06/2026` as `2026-06-11`.
- `options.dateOrder`: explicit numeric date order override, either `day-first` or `month-first`.
- `options.referenceDate`: the date relative phrases such as `tomorrow` resolve against, as a `Date` or a function returning one. Defaults to the current time at each parse.

Quoted spans and backslash-prefixed literals are preserved as plain title text
instead of being parsed as NLP syntax. For example, `"Today"` and `\tomorrow`
remain literal text, and `\@ABC` remains `@ABC` instead of becoming a context.

## Trigger Configuration

Starting with 0.2.0, tag, context, project and custom-field selectors match only
at the start of input or after whitespace (including tabs). The boundary is
checked against original input positions: removing `@work` from
`Task @work+project` does not make `+project` a selector. `task@work`, `(@work)`,
email addresses, URL fragments and `C++programming` stay literal under these
selector rules. Status/priority phrase fallback and date parsing are unchanged
by this boundary contract; this is not a universal URL/code shield.

Only the first line is parsed; subsequent lines are details. Wikilinks, quoted
spans (double quotes, single quotes or backticks), and escaped tokens are
protected before extraction, including nested quoted wikilinks.

A repeated project prefix removes exactly one configured prefix:
`++personal` produces project `+personal`, and `::::personal` with prefix `::`
produces project `::personal`. Linked projects are returned before simple
projects, preserving input order within each group.

Default triggers:

- `#` -> `tags`
- `@` -> `contexts`
- `+` -> `projects`
- `*` -> `status`
- `!` -> `priority` (disabled by default)

Example custom trigger config:

```ts
const customTriggers = {
  triggers: [
    { propertyId: "tags", trigger: "#", enabled: true },
    { propertyId: "contexts", trigger: "@", enabled: true },
    { propertyId: "projects", trigger: ">", enabled: true },
    { propertyId: "status", trigger: "~", enabled: true },
    { propertyId: "priority", trigger: "!", enabled: true },
  ],
};
```

## User-Defined Fields

`userFields` supports these types:

- `text`
- `number`
- `date`
- `boolean`
- `list`

List and text-like values support quoted multi-word input (for example `~client "Acme Corp"`).

## Language Support

Built-in languages:

- `en`, `es`, `fr`, `de`, `ru`, `zh`, `ja`, `it`, `nl`, `pt`, `sv`, `uk`

Helpers:

```ts
import { getAvailableLanguages, detectSystemLanguage } from "tasknotes-nlp-core";
```

Note: `detectSystemLanguage()` uses `navigator.language` when available; in non-browser runtimes it falls back to `en`.

Italian relative days `oggi`, `domani` and `dopodomani` use the local calendar
date. Bare words follow `defaultToScheduled`; `entro` and `per` set Due, while
`programmato per` sets Scheduled. This is partial Italian date support, not a
complete Italian Chrono locale. Only unprotected title text is date-parsed;
`[[oggi]]`, `+[[domani]]`, `#domani`, `@oggi`, `\\oggi`, and details stay literal.

## How Titles Are Built

Each parsing stage claims the spans of the title line it uses: metadata, priority,
status, recurrence, estimate, then dates. Later stages only read unclaimed text, and
the title is what is left. Words that only introduced a removed value, set per
language in `connectors`, go with it, as do separators left dangling:

| Input | Title |
|---|---|
| `call Jo at 3pm` | `call Jo` |
| `write post, should take about 2 hours` | `write post` |
| `high priority deploy the hotfix` | `deploy the hotfix` |
| `pay rent every month on the 1st` | `pay rent` |

A possessive date sets the date but stays in the title: `prep slides for monday's meeting`.

## English Dates

Beyond chrono's English parser, these are recognised:

- `half past four`, `quarter to 5`, `4 o'clock`
- `the 15th`, the next 15th of a month, when it ends the phrase or comes before a time
  (`review the 2nd draft` stays a title)
- `end of the day`, `end of the week` (Friday), `end of next month`, `eod`, `eow`, `eom`, `eoy`
- `christmas`, `christmas eve`, `new year's eve`, `new year's day`, `halloween`
- Bare hours from 1 to 6 mean the afternoon: `at 3` is 15:00. `03:30` and `3am` are kept.
- `Sun`, `Sat` and `Wed` are not weekdays after `the`, `a`, `with`, `of`, `in` or `from`,
  or when capitalised before another capitalised word (`Sun Ltd`).
- A due trigger may be followed by connector words: `due before friday`. `before` and
  `no later than` are due triggers.
- `in`, `within` and `after` make a duration a relative date: `call back in 2 hours`
  schedules a time instead of setting an estimate.

## Recurrence Output

Recurrence phrases are parsed into RRULE strings (for example `FREQ=WEEKLY;BYDAY=MO`).

English also supports weekday lists (`every mon, wed and fri`, `tuesdays and thursdays`)
and groups (`every weekday`, `weekends`). When the only date given is a time, as in
`call mum every sunday at 6pm`, the date is moved to the next recurring day.

For display, you can convert RRULE text with `rrule` or use parser preview helpers:

```ts
const previewItems = parser.getPreviewData(parsed);
const previewText = parser.getPreviewText(parsed);
```

## Integration Pattern

This package is intentionally UI/framework agnostic. A common setup is:

1. Keep app-specific config/state in your host app.
2. Instantiate `NaturalLanguageParserCore` in an adapter service.
3. Map parsed fields to your storage schema.
4. Keep UI behavior (suggesters, editor state, persistence) outside this package.

## Development

```bash
npm install
npm run build
```

## Release

```bash
npm run release:patch   # x.y.z -> x.y.(z+1)
npm run release:minor   # x.y.z -> x.(y+1).0
npm run release:major   # x.y.z -> (x+1).0.0
```

These commands run `npm version`, create a git tag, and push `main` with tags. GitHub Actions verifies and publishes the tagged version to npm.

## License

MIT

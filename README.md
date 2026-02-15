# tasknotes-nlp-core

Shared, framework-agnostic NLP parsing core for TaskNotes.

## Install

```bash
npm install tasknotes-nlp-core
```

## Release

```bash
npm run release:patch   # 0.1.0 -> 0.1.1
npm run release:minor   # 0.1.0 -> 0.2.0
npm run release:major   # 0.1.0 -> 1.0.0
```

These commands run `npm version`, create a git tag, and publish to npm.

## Package Contents

- Natural language task parser core
- Trigger configuration service
- Built-in language configs
- Shared NLP types

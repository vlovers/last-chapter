# Last Chapter — Between the Lines

A browser-first **pixel-art small-town bookshop narrative game**. Customers arrive to buy books, talk about their lives and pass along rumors. The player can listen, investigate and decide when to keep or share information, with consequences for relationships across the town.

**Status:** a short playable five-day narrative prototype plus an isolated Phaser bookshop vertical slice. Neither demonstrates a finished episode's target runtime or release-level art. The slice provides exploration, animated characters, contextual interactions and one branching Ukrainian encounter; it preserves the narrative app and saves.

## Quick start

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL displayed by Vite for the narrative game, or `/phaser-prototype/` for the playable bookshop. See the [slice guide](docs/art/PHASER-VERTICAL-SLICE.md) for controls and architecture. Run `npm run check` for formatting, lint, type checks, unit tests and build. A committed `package-lock.json` pins dependencies. CI uses `npm ci` for reproducible installation.

## Intended play loop

- **Day:** meet visitors, have optional conversations, recommend books, hear rumors, note observations.
- **Evening:** read the notebook, compare conflicting accounts and choose how to act.
- **Town:** events have a fixed truth; different characters have different beliefs, secrets and information.
- **Replay:** branching consequences and authored initial variations, not arbitrary random endings.
- **Art:** consistent pixel-art scenes with restrained animation and accessible dialogue text.

## Docs

[Agent rules](AGENTS.md) · [Architecture](docs/ARCHITECTURE.md) · [Story direction](docs/NARRATIVE.md) · [Development](docs/DEVELOPMENT.md) · [Testing](docs/TESTING.md) · [Roadmap](docs/ROADMAP.md) · [Contribution guide](CONTRIBUTING.md)

Issue → scoped work → implementation → tests → PR → CI → review → merge. Do not merge solely because CI is green.

## Language

The game is **Ukrainian-only** (`uk-UA`). Engineering documentation and source identifiers may remain English. See [Localization policy](docs/LOCALIZATION.md).

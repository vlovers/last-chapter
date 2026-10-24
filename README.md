# Last Chapter — Between the Lines

A browser-first **pixel-art small-town bookshop narrative game**. Customers arrive to buy books, talk about their lives and pass along rumors. The player can listen, investigate and decide when to keep or share information, with consequences for relationships across the town.

**Status:** engineering bootstrap and disposable interaction spike. This is **not** a finished 40-minute story, polished pixel-art release, or full simulation of NPCs. Current dialogue is a placeholder and graphics are CSS pixel-inspired blocks.

## Quick start
Requires Node.js 22 and npm.

```sh
npm install
npm run dev
```

Open the localhost URL displayed by Vite. Run `npm run check` for formatting, lint, type checks, unit tests and build. **Bootstrap gap:** a reproducible lockfile has not yet been generated in this environment; generate and commit `package-lock.json`, switch to `npm ci` in both CI and docs, and verify clean installation before treating the setup as complete.

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

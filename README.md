# Last Chapter — Between the Lines

A browser-first **pixel-art small-town bookshop narrative game**. Customers arrive to buy books, talk about their lives and pass along rumors. The player can listen, investigate and decide when to keep or share information, with consequences for relationships across the town.

**Status (2026-11-08):** the canonical Phaser bookshop includes the five-day Living Story integrated into `main` through [PR #41](https://github.com/vlovers/last-chapter/pull/41) ([merge commit `46bfb96`](https://github.com/vlovers/last-chapter/commit/46bfb96da0fe11189d6736dd45703d5b301c5924)). It provides a stable mobile viewport, overlay dialogue, compact catalog recommendations for three customers, an investigation journal and an interactive Frank with a cat tree. `/phaser-prototype/` preserves the isolated single-encounter slice. The [PR-head CI run #2547](https://github.com/vlovers/last-chapter/actions/runs/42440820434) passed 15/15 jobs, including mobile, save-recovery, finale and narrative browser checks; this evidence is specific to that tested head, **not proof of a production deployment or of subsequent commits passing**. **v0.2 is not yet publicly released**: physical-device and cross-browser acceptance, independent Ukrainian editorial review, accessibility review, measured playtime, asset-license review and deployment verification remain open in [release acceptance #42](https://github.com/vlovers/last-chapter/issues/42). `package.json` still reports `0.1.0` until versioning is approved. The [historical release-candidate report](docs/release/RELEASE-CANDIDATE.md) and [mobile overhaul QA](docs/qa/mobile-overhaul/README.md) preserve earlier evidence; their pre-merge instructions are historical, not current release gates.

The [stabilization report](docs/qa/stabilization/README.md) records CI repairs,
order/save regression coverage, UX changes and measured limits. The
[narrative readiness plan](docs/integration/NARRATIVE-READINESS.md) separates
playable content from the unapproved design pack and lists concrete integration tasks.

## Quick start

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL displayed by Vite for the five-day bookshop, or `/phaser-prototype/` for the isolated encounter. See the [slice guide](docs/art/PHASER-VERTICAL-SLICE.md) for controls and architecture. Run `npm run check` for formatting, lint, type checks, unit tests and build. A committed `package-lock.json` pins dependencies. CI uses `npm ci` for reproducible installation.

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

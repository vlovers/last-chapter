# Last Chapter — Between the Lines

A Ukrainian-language pixel-art browser game about a small-town bookshop. Meet visitors, recommend books, investigate conflicting accounts and choose what to keep private. Choices carry into relationships and endings across five days.

## Current status

The five-day **Living Story is implemented in `main`** through [PR #41](https://github.com/vlovers/last-chapter/pull/41). The canonical game includes responsive paginated dialogue, staged character actions, deterministic time/weather, three customer orders, a journal, optional conversations, interactive Frank and versioned local saves with recovery.

**v0.2 is not publicly released.** The package remains `0.1.0`. Physical-device and Safari/Firefox checks, independent Ukrainian editorial and accessibility review, measured playtime, distribution licenses and release approval remain tracked in [release acceptance #42](https://github.com/vlovers/last-chapter/issues/42). Historical QA reports apply to their recorded commits; they are not current release approval.

Oliver's optional dialogue (#44), the editorial UI refresh (#45) and governance reconciliation (#43) are **open PRs**, outside current `main`. Older narrative packs are retained for reconciliation. See the [roadmap](docs/ROADMAP.md) for priorities and PR status.

## Run locally

Use Node.js **22.13+ within Node 22**, or **Node 24**, and npm. `.nvmrc` selects the Node 22 line.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. `/` is the five-day game; `/phaser-prototype/` is the isolated Mara encounter. No backend, database, environment secrets or external game services are required.

## Stack and structure

TypeScript, JavaScript, Phaser 3.90, Vite, Vitest, ESLint and Prettier. Dependencies are pinned by `package-lock.json`.

| Path                            | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `src/content/`                  | Authored Ukrainian scenes, character and book data               |
| `src/game/`                     | Pure dialogue, knowledge, progression, save codec and endings    |
| `src/phaser/`                   | Browser adapters, UI panels, optional conversations and recovery |
| `phaser-prototype/`             | Browser entries and shared stylesheet                            |
| `public/phaser-prototype/`      | Phaser scene, movement, dialogue presentation and art generation |
| `public/art/`, `public/assets/` | Local artwork and provenance                                     |
| `tests/`, `scripts/qa-*.mjs`    | Deterministic regressions and browser QA                         |
| `docs/`                         | Architecture, story design, development and historical QA        |

`src/main.ts` and `src/styles/` retain the earlier DOM spike; neither current Vite entry loads it.

## Verify

```sh
npm run check          # format, lint, TypeScript, all unit/integration tests, build
npm run test:narrative # focused five-day, ending and save regression matrices
npm run test:browser:mobile
npm run test:browser:save-recovery
```

Browser tests require a running game server and optional Playwright tooling; see [Testing](docs/TESTING.md) for setup and all suites. CI runs quality/security checks and the browser matrix in [ci.yml](.github/workflows/ci.yml).

## Roadmap and documentation

Next: complete [v0.2 release acceptance](https://github.com/vlovers/last-chapter/issues/42), reconcile unique work in open PRs, then plan further bookshop/content expansion. Runtime targets remain unmeasured; mobile-store packaging and additional neighborhoods are planned work.

[Agent rules](AGENTS.md) · [Architecture](docs/ARCHITECTURE.md) · [Story direction](docs/NARRATIVE.md) · [Development](docs/DEVELOPMENT.md) · [Testing](docs/TESTING.md) · [Roadmap](docs/ROADMAP.md) · [Contributing](CONTRIBUTING.md) · [Localization](docs/LOCALIZATION.md)

All player-facing text is Ukrainian (`uk-UA`). Engineering documentation and identifiers may be English.

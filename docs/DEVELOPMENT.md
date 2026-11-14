# Development

Use Node **22.13+ within Node 22** (`.nvmrc` selects 22), or **Node 24**, and npm. Node 22.12 runs Vite but does not satisfy the locked ESLint dependency's engine requirement.

```sh
npm ci
npm run dev
```

Open Vite's printed local URL. `/` is the canonical five-day game; `/phaser-prototype/` is the isolated Mara encounter. Phaser 3.90.0 is bundled locally. No environment variables, backend, Docker services or database migrations are required.

`npm run build` writes both entries into `dist/`. For a production smoke:

```sh
npm run build
npm exec vite preview -- --host 127.0.0.1 --port 4173
```

Deployment is not configured. Release acceptance remains tracked in [#42](https://github.com/vlovers/last-chapter/issues/42).

## Editing and checks

Use the committed lockfile with `npm ci`; preserve it when installing optional browser tools. Run existing focused tests during implementation and `npm run check` before review. [Testing](TESTING.md) lists browser setup, save/load, dialogue and mobile suites. [Architecture](ARCHITECTURE.md) maps runtime ownership.

Keep `src/game/` deterministic and independent of browser storage. Browser adapters and recovery live in `src/phaser/`; authored Ukrainian prose lives in `src/content/`. The retained `src/main.ts` DOM spike is outside both Vite entries.

## Living Story presentation

`DialogueNode.staging` contains presentation commands, never simulation effects.
`storyEnvironment(stage, node)` derives time/weather from persisted story progress.
Topic aliases use `DialogueOption.topic` to share completion visibility while retaining original edge-based save keys. New alias groups need matching completion/reopen semantics and legacy-save regressions.

`node scripts/qa-living-story.mjs` checks the dedicated presentation scenarios using the same optional browser setup as other runners. Historical [implementation evidence](qa/living-story/README.md) does not replace checks on a new commit.

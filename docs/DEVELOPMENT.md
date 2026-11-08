# Development

Prerequisites: Node 22, npm. Run `npm ci` then `npm run dev` and open the local URL shown. `npm run check` runs the full code quality suite. `npm run build` writes `dist/`; deployment is not configured. No environment variables, Docker services or database migrations exist.

The committed `package-lock.json` was generated in GitHub Actions; CI installs dependencies with `npm ci`.

## Playable Phaser slice

Open `http://localhost:5173/phaser-prototype/` after starting Vite. Node 22.13+ is
recommended within the project's Node 22 line to satisfy current lint dependencies.
Phaser 3.90.0 is pinned locally; the slice does not require a CDN or external art/audio.
`npm run build` includes both the narrative app and the slice. For a production-build
smoke test run `npm exec vite preview -- --host 127.0.0.1 --port 4173`.

[Slice guide](art/PHASER-VERTICAL-SLICE.md) documents controls, modules, original asset
provenance and limits. [Testing](TESTING.md) documents optional browser QA tooling.

## Living Story presentation

See [issue #40 implementation and visual evidence](qa/living-story/README.md).
`DialogueNode.staging` contains presentation commands, never simulation effects.
`storyEnvironment(stage, node)` derives time/weather from persisted story progress.
Topic aliases use `DialogueOption.topic` to share completion visibility while
retaining the original edge-based save keys. New alias groups must have matching
completion/reopen semantics and legacy-save regression coverage.

Local browser checks: `node scripts/qa-living-story.mjs`. The optional Playwright
module and base URL can be supplied through `PLAYWRIGHT_MODULE` and `BASE_URL`.

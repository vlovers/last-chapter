# Architecture

Single browser application using TypeScript and Vite. **No backend, database, monorepo or Docker** currently justified.

**Implemented:** `src/game/model.ts` pure deterministic transition functions, `src/content/intro.ts` temporary fixture, `src/main.ts` standalone DOM renderer, `src/styles/main.css` temporary pixel-inspired look, `tests/model.test.ts` unit tests.

**Data flow:** UI action → pure state transition → render. All state is in memory and resets on reload. There is currently no persistence, NPC social graph, book matching, story scripting engine, translations, endings or runtime AI.

**Proposed future boundaries, not implemented:** typed events and dialogue gates, provenance-aware information graph, deterministic town seeds, content localization EN/UK, versioned save schema, art asset manifest and accessibility-tested narrative interface. Introduce only when justified by actual authored content. See [ADR 0001](DECISIONS/0001-browser-first.md).

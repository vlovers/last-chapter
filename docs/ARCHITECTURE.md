# Architecture

Vite serves two independent browser entries. There is no backend or database.

The production narrative at `/` uses TypeScript: `src/content/` contains authored
Ukrainian scene data and fixtures, `src/game/` contains deterministic dialogue,
knowledge/provenance, book matching, chapter progression and ending logic, and
`src/main.ts` renders the DOM interface. `src/game/save.ts` validates and migrates
versioned saves. The renderer owns browser persistence; the simulation does not
import the DOM or persistence APIs. Regression scenarios cover the five-day path,
trust, event order, branching and save continuity. This remains a short narrative
prototype; a finished episode's runtime has not been demonstrated.

The isolated Phaser bookshop at `/phaser-prototype/` has a separate Vite entry and
module tree in `public/phaser-prototype/`. It implements exploration, collision,
animated characters and one Ukrainian Mara encounter. Its pure spatial/dialogue/state
helpers have no Phaser, DOM, production-state or persistence imports. The scene composes
rendering, interactions, audio, dialogue presentation and lifecycle handling. It never
reads or writes production saves. Phaser is bundled locally and loaded only by this entry.

See [Phaser V1 architecture, controls and asset pipeline](art/PHASER-VERTICAL-SLICE.md),
[save format](SAVE-FORMAT.md), [testing](TESTING.md), and [ADR 0001](DECISIONS/0001-browser-first.md).
Any future production/Phaser state bridge requires explicit approval and parity tests.

# Architecture

Vite serves two independent browser entries. There is no backend or database.

The canonical `/` route combines the Phaser room with the shared five-day narrative.
`phaser-prototype/main.js` loads `FiveDayStory` and mounts the accessible DOM panels;
`public/phaser-prototype/scene.js` composes movement and interactions. `src/content/`
contains authored Ukrainian scenes; `src/game/` contains deterministic dialogue,
knowledge/provenance, book matching, chapter progression and endings. `src/main.ts`
is the earlier disposable DOM spike, not the canonical route. `src/game/save.ts`
validates and migrates saves; the browser adapter owns persistence. The simulation
does not import DOM or storage. Regression scenarios cover all five days, trust,
branching and save continuity. The finished episode's runtime remains unmeasured.

`phaser-prototype/style.css` defines the shared autumn UI system. DialogueUI renders
transient player speech before the resulting NPC reply without repeating a choice
or serializing presentation state. `player-turn.js` recognizes wholly quoted legacy
speech and optional explicit delivery metadata; it never expands action labels into
invented dialogue. `story-panels.ts` owns catalog/journal/optional conversations;
`journal-view.ts` derives only already-known facts. Integer camera composition and
projected touch geometry live in `viewport.js`. A native exploration modal routes
offscreen object selection through the same pathfinding as direct pointer input.

The isolated Phaser bookshop at `/phaser-prototype/` has a separate Vite entry and
shares the module tree in `public/phaser-prototype/`. It implements exploration, collision,
animated characters and one Ukrainian Mara encounter. Its pure spatial/dialogue/state
helpers have no Phaser, DOM, production-state or persistence imports. The scene composes
rendering, interactions, audio, dialogue presentation and lifecycle handling. It never
reads or writes production saves. Phaser is bundled locally and loaded only by this entry.

See [Phaser V1 architecture, controls and asset pipeline](art/PHASER-VERTICAL-SLICE.md),
[save format](SAVE-FORMAT.md), [testing](TESTING.md), and [ADR 0001](DECISIONS/0001-browser-first.md).
The canonical bridge is covered by five-day, save and browser regressions; the
isolated entry continues to leave production saves untouched.

# V5 — canonical Phaser route and shared narrative bridge

Status: **canonical gameplay integrated; browser-smoke verified; needs full human playthrough and character-art polish before merging**.

## Implemented in this branch

- The root `/` serves the V4 Phaser scene instead of the legacy DOM scene.
- The bundled Phaser entry initializes `FiveDayStory` only on `/`; the standalone `/phaser-prototype/` remains an isolated regression fixture.
- `FiveDayStory` calls the existing `src/game/chapter.ts`, `dialogue.ts`, `save.ts`, `cast.ts`, and book-selection lookup. It never duplicates the authored five-day dialogue graphs.
- The scene's visitor interaction opens the current canonical narrative node; choices use the shared transition functions. Day checkpoints and the season ending are navigable.
- Existing `last-chapter:save:v1` is loaded and updated through the existing codec. No migration/reset of prior saves is performed.
- The root scene now includes a stage-aware visitor silhouette palette, five-day timeline, canonical journal and catalogue, detailed book recommendations and discoverable room notes.

## Known incomplete parts (do not call V5 finished)

- Original procedural palettes now distinguish each of the eight named visitors; however they still share one generic silhouette and arrival position. Unique silhouettes, character-specific animations and staging remain needed.
- The old standalone Phaser fixture remains at `/phaser-prototype/`, by design.
- The canonical route now offers the five-day progress bar, searchable-by-category catalog, journal facts, completed orders, and detailed recommendation cards. The remaining task is to improve their visual design and cross-input accessibility; do not claim parity without browser QA.
- The root narrative still uses a shared visitor interaction point; characters do not yet have independent stage-specific entrances/departures.
- Root Chrome smoke now checks entry, catalog, journal, first visit, save/reload, 19-stage story traversal and season ending. It does not yet exercise every stage through the live dialogue UI or verify mobile, touch and the isolated V4 regression fixture.
- The old DOM implementation is retained in source as migration reference, not rendered on `/`.

## Verification before review

1. Run `npm ci && npm run check`.
2. Open `/`, confirm the first visitor is Mrs Miller, not Mara.
3. Play all 19 stages including day boundaries, conditional dialogue options and final epilogue.
4. Reload during a conversation and at each day boundary; verify progress, flags and endings.
5. Verify `/phaser-prototype/` still works as an isolated regression fixture.
6. Test keyboard-only, touch, missing portrait, reduced motion and production build.
7. Do **not** merge to main until a human verifies all of the above.

## Architecture direction

The shared TypeScript story module should remain the source of truth. As the migration progresses, replace the global bridge with an explicit injected controller and retire the duplicated standalone dialogue state only after equivalent coverage exists.

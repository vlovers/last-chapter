# V5 — canonical Phaser route and shared narrative bridge

Status: **first integration pass; requires local verification and further gameplay/art work**.

## Implemented in this branch
- The root `/` serves the V4 Phaser scene instead of the legacy DOM scene.
- The bundled Phaser entry initializes `FiveDayStory` only on `/`; the standalone `/phaser-prototype/` remains an isolated regression fixture.
- `FiveDayStory` calls the existing `src/game/chapter.ts`, `dialogue.ts`, `save.ts`, `cast.ts`, and book-selection lookup. It never duplicates the authored five-day dialogue graphs.
- The scene's visitor interaction opens the current canonical narrative node; choices use the shared transition functions. Day checkpoints and the season ending are navigable.
- Existing `last-chapter:save:v1` is loaded and updated through the existing codec. No migration/reset of prior saves is performed.

## Known incomplete parts (do not call V5 finished)
- The V4 actor art and arrival animation still depict Mara for **every** visitor. Stage-aware sprites, arrival/departure choreography and a full cast are still needed.
- The old standalone Phaser fixture remains at `/phaser-prototype/`, by design.
- The existing catalog browser, journal, exploration flags and detailed book recommendation cards from `src/main.ts` are **not yet** presented in the Phaser route. Book choices are offered using the original graph, but the richer recommendation UI is outstanding.
- The root narrative currently uses a shared visitor interaction location rather than multiple independently animated characters.
- The existing root-specific browser QA must be expanded; existing V4 screenshots and checks do not prove the new route.
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

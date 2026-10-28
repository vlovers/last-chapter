# Mobile bookshop overhaul — implementation and QA

The canonical `/` route now uses a fixed screen-sized canvas, an integer-zoom camera,
reading overlays, compact catalog recommendations and an interactive resident cat.
The existing five-day graph, chapter save key and authored choices remain in use.
This is a playable prototype; a finished forty-minute episode remains out of scope.

## Implementation

- The world remains 640 × 360 native pixels. Character sheets remain 32 × 48, with
  approximately 43 pixels of visible height. The counter is 128 × 42, the reading
  table 72 × 32, and the armchair 36 × 36. Their navigation solids and interaction
  rectangles match the new paint. The chair is usable for sitting with a book.
- Phone and tablet cameras show a crop at integer zoom and follow horizontal
  movement. Landscape uses the same world and collision graph. Dialogue reframes
  the camera above the bottom sheet, while the canvas rectangle and zoom remain
  unchanged. Hotspots project from camera scroll coordinates and keep 44px targets.
- Dialogue supports portraits, typewriter skipping, scrollable choices, keyboard
  navigation and closing to resume later. All reference panels block world input,
  trap keyboard focus and return focus to their opener. Ukrainian text uses system
  fonts with Ukrainian glyphs; browser zoom remains available outside canvas gestures.
- The catalog searches the five existing books and filters their genres. Expanded
  details preserve the original descriptions. It does not invent unknown authors.
  Miller, Mara and Anna can clarify requests, try unsuitable books, choose different
  suitable books and resume their original authored purchase dialogue. Order receipts
  come from existing flags; no currency or relationship reward is added.
- The journal separates people, observed clues, orders, rumors and editable personal
  notes. Undiscovered clue details and future visitors stay hidden. Rumors never
  become facts through a recommendation or a journal action.
- Frank walks through the collision graph, sleeps, sits, grooms, plays, eats and
  climbs continuously to a three-level tree with a cubby and cushion. Petting,
  feeding, play, calling and climbing have cooldowns. The player has right of way.
  Cat history and cooldowns persist; exact ambient position/pose restarts on reload.
- Shared actor cues cover greeting, conversation gestures, book handoff and sitting.
  Visitors retain their existing walk/idle sheets, browsing/page turns, reactions,
  entrances and now visible departures. Unchoreographed scenes use safe idle poses.
- Rain and dust draw at 30Hz; a sustained slow frame budget lowers weather to 15Hz
  and removes dust. Low-core devices begin with fewer effects. Reduced-motion
  settings stop decorative motion. Hidden documents skip scene updates. New effects
  reuse graphics; Frank's disposal releases listeners and is safe to call twice.

## Saves and narrative integration

`last-chapter:save:v1` and its decoder are unchanged. Optional, validated sidecars
store service questions/attempt IDs and Frank's cooldowns/counts. Missing or malformed
sidecars use defaults. Completed purchases still derive from original chapter flags,
so old saves retain progress and reloading cannot award another completion.
Personal notes are browser-local text, rendered through safe DOM text/value APIs.

This branch incorporates the current gameplay branch's new narrative commits. Two
missing content commas prevented startup and were repaired without changing prose.
Rumor and conditional-variant tests now follow the new authored response scenes and
select variants by their required flags rather than their array position. Their
mutual-exclusion and branch assertions remain intact.

## Verification

Verified with Node 22: `npm run check` passed formatting, lint, types, all 541 tests
in 110 files and the production build. For browser QA, start Vite and use an available
Playwright installation, as described in [Testing](../../TESTING.md):

```sh
npm run test:browser:mobile
node scripts/qa-frank-overhaul.mjs
node scripts/qa-bookshop-performance.mjs
```

The browser suite checks 375 × 667, 390 × 844, 430 × 932, 768 × 1024,
1440 × 900 and 844 × 390, including touch movement, keyboard movement, stable canvas
geometry/zoom, search, private journal content, saved notes and focus behavior.
It also rotates a running phone viewport. A second journey plays all 19 checkpoints
and completes Miller, Mara and Anna through the actual catalog, including a rejected
suggestion, reload during an open request and reload after each completed purchase.
The Frank runner exercises proximity, pet cooldown, feeding/eating, playing,
climbing/resting, saved history and the reading chair through real UI interactions.
`npm run test:browser`, `npm run test:browser:v5` and `npm run test:browser:polish`
also passed. Their existing story, audio, fallback, privacy and save-isolation checks
remain; canvas assertions now verify the resized renderer against a stable viewport.
See [slice results](legacy-results.json), [five-day results](v5-results.json) and
[optional-conversation results](polish-results.json).
Unit tests cover navigation, cooldown validation, continuous climbing/descent,
cleanup, frame-budget degradation, old-save defaults and original narrative outcomes.

The measured ten-second Chrome samples were about 58–60 FPS at normal speed and
60 FPS with simulated 4× CPU slowdown; scene object count stayed at 31. See
[performance.json](performance.json), [layout/story results](results.json) and
[Frank results](frank-results.json). These are desktop Chrome measurements with a
mobile viewport, not physical phone benchmarks or a claim of universal 60 FPS.

## Visual evidence

| View               | Screenshot                         |
| ------------------ | ---------------------------------- |
| Small phone room   | [375 × 667](375-room.png)          |
| Phone dialogue     | [390 × 844](390-dialogue.png)      |
| Character portrait | [Phone portrait](390-portrait.png) |
| Phone catalog      | [Catalog](390-catalog.png)         |
| Phone journal      | [Journal](390-journal.png)         |
| Tablet             | [768 × 1024](768-room.png)         |
| Desktop room       | [1440 × 900](1440-room.png)        |
| Desktop dialogue   | [Dialogue](1440-dialogue.png)      |
| Phone landscape    | [844 × 390](844-room.png)          |
| Customer order     | [Anna](order-anna.png)             |
| Frank being petted | [Petting](frank-pet.png)           |
| Frank eating       | [Food bowl](frank-eating.png)      |
| Frank playing      | [Ribbon](frank-play.png)           |
| Frank in the tree  | [Resting](frank-tree.png)          |
| Reading chair      | [Sitting](reading-chair.png)       |
| Five-day finale    | [Finale](five-day-finale.png)      |

## Remaining verification limits

Physical iPhones/Android devices, Safari/VoiceOver/TalkBack, audio listening quality,
long-duration thermal behavior and real device safe-area insets require device review.
Chrome viewport tests cover layout and input but cannot establish those properties.
The existing Phaser bundle still produces Vite's large-chunk advisory; no threshold
was raised and no check was disabled. New art is original code-native geometry;
see the [provenance record](../../../public/art/bookshop/ATTRIBUTION.md).

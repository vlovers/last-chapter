# Gameplay & visual polish V1

Implementation on top of the current narrative-production branch (PR #12), not a
rewrite or Phaser major-version upgrade. The installed engine is Phaser 3.90.0;
“V5” is the existing project migration label. No third-party assets were added.

## Behavior and narrative review

- The shared deterministic dialogue engine consumes choices on completed return
  loops and terminal exits. Entry alone does not complete a topic. Explicit
  repeatability, conditional reopening, and suspended returns coexist with
  `requires`, `unless`, `grants`, and conditional narration.
- Audited Miller and Mara's Day 1 topic hubs and nested returns; Iris, Anna, Leo,
  Eleanor, Thomas and Nora's gated callbacks; Day 3 club, the three Day 4 visits,
  and the Day 5 gathering. Optional callbacks retain their authored conditions.
  The Day 4 and Day 5 unresolved letter returns explicitly suspend: players can
  return without prematurely settling a consent decision. The ending explicitly
  retains authored variant priority so combined community callbacks cannot hide
  private-letter consequences; other scenes retain upstream specificity selection.
- Optional Mara topics no longer offer an unconditional restart. Completed topics
  disappear, interrupted topics retain their current node, later-day topics still
  unlock, and new-game resets are explicit. Main story facts and old saves persist.
- Frank is an ordinary ambient cat. Five destinations use the room's existing
  pathfinder and foot collision clearance. He walks at 26 native pixels/second,
  pauses for 12–19 seconds and naps for 28 seconds, yielding to the player's feet.
  A ten-minute deterministic simulation checks every step against furniture.
  He is never added as a player collider. Approaching him holds his position;
  dialogue, settings and reading panels pause ambient movement.
- Petting, watching, calling and leaving have brief Ukrainian responses tied to
  his activity. His new art has a slender grey body, wedge face, stepped large
  ears, curly-coat highlights, breathing, footfall, tail, blink and grooming poses.
  Geometry is authored at native room density, not an enlarged placeholder.
- The bookmark clue now belongs to the window display. Existing collected clues
  persist. Petting Frank neither reveals private information nor grants clues.

## Room and interface

Supported window display and returns trolley replace unsupported floor books.
The central table has a face-out book on an easel; restrained rug weave connects
the reading nook. Existing authored shelves, furniture, light pools, window rain
and day-specific weather grades are reused. Native pixels and existing collision
footprints remain aligned. Hover/focus corners, proximity prompts and visited
indicators retain the calm interaction loop; available optional topics have a count.

Desktop uses a constrained dialogue page beside the complete room. Tablet and
mobile stack a bounded reading area below it. Text and choices scroll internally;
opening dialogue does not scroll the document. A ResizeObserver updates Phaser's
parent bounds and hotspot alignment. Character portraits reuse the same palette
and drawing system as scene sprites; narration does not borrow a character face.
Choices have focus and pressed states, arrow/Tab navigation, Enter and Escape.
Reference panels pause movement, close with Escape or their close button, and
Continue closes them before resuming the story.

## Verification and evidence

Commands (Node 22):

```sh
npm run check
npm run test:browser
npm run test:browser:v5
npm run test:browser:polish
```

Set `BASE_URL` for a different Vite port, `BROWSER_CHANNEL` for the installed
browser, and `QA_OUTPUT` for screenshots/results. Playwright is the repository's
optional QA dependency; CI installs it separately from game dependencies.

The new browser suite traverses every one of the 19 stages through real UI
choices on 1280×900 desktop, 820×1180 tablet, 390×844 mobile and 1280×720 compact
desktop. It checks completed optional topics after reload, keyboard selection,
Frank's real autonomous movement and petting, dialogue pause, narrative save/load,
viewport bounds, canvas/hotspot alignment and an explicit new-game reset. Every
day has a screenshot on each viewport; `results.json` records measured layout and
ambient FPS samples. Existing suites also exercise reduced motion, unavailable
Web Audio, missing portraits, object navigation and both gift endings.

Final local verification on 2026-10-26: **492 tests in 103 files passed**; all
three browser commands passed. All four viewports completed all 19 stages with
zero page/console errors and no document overflow. The raw final measurements
are in [results.json](results.json). The core Mara hub regression reloads both
an unfinished bakery discussion and its completed return to the hub.

Before screenshots were captured from `0a6387b` before implementation. Committed
representatives live in [screenshots](screenshots/). The [desktop portrait](screenshots/desktop-portrait.png),
[completed Mara hub](screenshots/desktop-mara-completed-topic.png),
[Frank interaction](screenshots/frank-petting.png),
[tablet](screenshots/tablet-portrait.png) and
[mobile](screenshots/mobile-portrait.png) are representative final captures.
Full day-by-day captures are
available from the browser QA artifact in CI. Screenshots were visually inspected,
including desktop portrait/choices, tablet, mobile and Frank interaction.

## Remaining limits

This remains the existing short five-day narrative fixture, not a fully authored
40-minute episode. Frank uses deliberately simple procedural pixel animation and
a fixed ambient schedule; his exact position is not saved. Very long narration and
the large finale menu need scrolling inside their bounded panel (the broader
finale grouping work is tracked in #15). Browser QA is Chrome with emulated
viewport sizes, not physical-device or Safari/Firefox certification. The existing
Phaser bundle still triggers Vite's large-chunk warning. Ukrainian editorial and
human visual/narrative review remain necessary before release.

# UX/UI production pass

Base: `c5580f1` on `feat/narrative-production-v1-20261025` (PR #12). It includes
`integration/last-chapter-playtest-20261103` and its subsequent verified release
documentation. PR #9 is open; #10 and #12 are open drafts. No prerequisite PR is
merged. PR #33 (`feat/narrative-player-voice-depth-20261105`) changes only authored
content; this pass does not edit `src/content/*` or merge that branch.

## A — dialogue and design system

Replaces the accumulated CSS passes with one autumn palette and consistent paper,
wood, borders, spacing, readable Ukrainian type and short reduced-motion-aware
transitions. The world retains integer zoom and pixel rendering. Dialogue uses a
smaller stable dock, compact object/narrator notes, two desktop answer columns,
full-width phone prose, numbered choices and keyboard-scrollable text. Native Tab
order includes the catalog shortcut. Arrows scroll focused prose and navigate
answers. Existing four-choice pagination and stale-button guards remain in place.

Player speech appears as a separate **Ви** turn followed by the NPC within the
same scrollable exchange. Both are immediately available; there is no timer or
extra confirmation screen. NPC typewriting can be skipped independently. The
renderer consumes only the selected visible label and never calls the simulation
again. Turns are transient and disappear on close/reload, so older saves need no
migration and no selected line is replayed. Fully quoted legacy labels are speech;
unquoted actions, book suggestions and internal navigation remain actions.
Editors can explicitly set `delivery: 'speech' | 'action'` and `spokenText` on
options. These fields are presentation metadata and do not enter saves. No new
spoken prose is invented by the UI. The four legacy optional Mara topics were
reviewed: their unquoted labels are direct speech, so the adapter supplies explicit
speech delivery there. Future action labels can opt out. Optional replies also
share a 220ms guard against rapid repeated activation.

## B — books and investigation journal

Five original geometric pixel covers, a compact responsive shelf, visible short
descriptions, complete descriptions in native details, search, genre filters and
live result count. Filtering preserves the search input and mobile keyboard.
Original recommendations, receipts and outcomes are retained.

The paper notebook separates people, discoveries, events, current tasks, orders,
rumors and private notes. This preserves the existing dedicated rumor/order views
while adding the requested event/task structure. Portraits reuse existing assets.
Only the story's knowledge-filtered getters supply entries; evidence kind/source
remain explicit and inferences/rumors have dashed amber edges. New-entry markers
and unread counts are session-local UI state. Notes keep the original key, safe
text rendering, length limit and future-save write protection; storage failures
now produce visible feedback.

## C — mobile and Phaser

All reading surfaces scroll internally without resizing the canvas. Phone controls
retain 44px targets and safe-area padding. Landscape places dialogue beside the
speakers and frames them in the exposed part of the room. Partial edge hotspots
have clamped touch areas. The **Оглянути** modal exposes all currently available
objects, including offscreen Frank, and uses the original approach/pathfinding
and interaction functions. It contains no future plot information. World input
is blocked while the native modal is open.

Initial viewport resizing publishes hit areas synchronously with camera geometry;
this fixes an immediate first-tap race that the unchanged Frank runner exposed at
390px. Large cropped hit areas are clipped before the 44px minimum is applied, so
offscreen shelves cannot shift onto walkable floor in landscape.

## D — verification

Executed locally using Node **22.23.4** and Google Chrome. `npm ci` and
`npm run check` passed: Prettier, ESLint, TypeScript, **271 files / 2786 tests**
(24 new regressions), and production build. No existing check was disabled.
`npm run test:browser:ux` is added to the existing CI browser matrix.

| Executed browser suite | Result and evidence                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Standard browser smoke | Passed; keyboard/pointer, isolated route, failure recovery and save isolation. [Results](standard-results.json)                                        |
| V5 five-day root smoke | Passed through season completion. [Results](v5-results.json)                                                                                           |
| Mobile overhaul        | Passed all nine sizes, rotation, keyboard/touch, search/focus, all 19 story checkpoints and three saved catalog orders. [Results](mobile-results.json) |
| Frank overhaul         | Passed 1440×900, 320×568 and 390×844: proximity, pet cooldown, feeding, play, climbing, reload and restart. [Results](frank-results.json)              |
| Save recovery          | Passed missing, corrupt, future-version and blocked storage; actual replies and optional-conversation writes remain protected.                         |
| Narrative mutual route | Passed on production preview at 390×844: **155 choices, 7 reloads, all five days, 0 runtime errors**. [Results](narrative-results.json)                |

The initial browser passes found and fixed cropped shelf targets stealing floor
taps, a one-pixel landscape toolbar overflow, and stale first-frame hit areas.
The new runner also waits for image decoding before checking local covers and
sends immediate repeat events without Playwright stability waits that could
otherwise exceed the real 220ms guard. These changes preserve the tested assertions.

The final UX suite runs against the built production preview. Results are in
[after/results.json](after/results.json). It exercises all nine sizes, sequential
player/NPC turns, actions, rapid activation, compatible legacy saves, reopened
optional dialogue and long Ukrainian prose. Browser fixture shutdown occasionally
hits the repository's existing bounded cleanup path; successful assertions and
the resulting process exit code are checked separately.

### Visual comparisons

| View                 | Before                               | After                                                           |
| -------------------- | ------------------------------------ | --------------------------------------------------------------- |
| Desktop dialogue     | [1440×900](before/1440-dialogue.png) | [Player then NPC](after/1440-900-player-turn.png)               |
| Desktop catalog      | [List](before/1440-catalog.png)      | [Book shelf](after/1440-900-catalog.png)                        |
| Phone dialogue       | [390×844](before/390-dialogue.png)   | [Player then NPC](after/390-844-player-turn.png)                |
| Phone catalog        | [List](before/390-catalog.png)       | [Book shelf](after/390-844-catalog.png)                         |
| Phone journal        | [Notebook](before/390-journal.png)   | [Paper journal](after/390-844-journal.png)                      |
| Smallest phone       | [320×568](before/320-dialogue.png)   | [Dialogue](after/320-568-player-turn.png)                       |
| Landscape            | —                                    | [Speakers beside dialogue](after/844-390-player-turn.png)       |
| Long Ukrainian turns | —                                    | [Scrollable prose at 320px](after/320-long-ukrainian-turns.png) |

Full implementation/artifact inventory: [FILES.md](FILES.md). Issue #34 is the linked
acceptance issue, not an additional pull request.

### Acceptance limits

Chrome viewport/touch emulation does not establish physical iOS/Android behavior,
Safari rendering, virtual-keyboard resizing or screen-reader announcement quality.
Independent Ukrainian editorial review and episode timing remain separate release
acceptance work. The existing Vite Phaser chunk-size advisory is not suppressed.

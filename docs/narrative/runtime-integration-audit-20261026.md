# Last Chapter — verified runtime integration audit (Codex mobile branch)

**Audit date:** 2026-10-26. **Read-only code inspection:** `feat/mobile-bookshop-overhaul`; this document is written to narrative design branch. **Status:** no runtime edits or test execution. Branch can change after this audit.

## Inspected files

- `package.json`: Phaser **3.90.0**, Vite 7, TypeScript, Vitest; despite narrative design references to Phaser v5, the inspected package does not use Phaser 5.
- `src/main.ts`: main DOM presentation and chapter transitions, localStorage restore/persist.
- `src/game/chapter.ts`: finite `ChapterStage` union, fixed stage-to-story routing and explicit transition functions.
- `src/game/dialogue.ts`: nodes, options, `requires`, `unless`, `grants`, `textWhen`, `repeatability`, `reopensWhen`, `suspend`, completion/history tracking.
- `src/game/save.ts`: `SAVE_KEY = 'last-chapter:save:v1'`, `VERSION=1`, stage/node/flags/history/completed/pending validation; no arbitrary new save-object fields.
- `src/game/service.ts`: receipts **derived from flags**, not a standalone persisted order array.
- `src/game/exploration.ts`: exactly five inspected hotspot IDs: `shelves`, `window`, `counter`, `plant`, `frank`; each awards one discovery flag. No object inventory or document-comparison subsystem shown.

## Verified existing day routing

Day 1: `miller → mara → evening → complete`.

Day 2: `iris → anna → leo → day2-complete`.

Day 3: `eleanor → thomas → nora → book-club → day3-complete`.

Day 4: `day4-iris → day4-mara → day4-leo → day4-complete`.

Day 5: `day5-reading → season-complete`.

**Integration hazard:** chapter transition functions require current dialogue's node to have no remaining options. Adding a new optional topic to a mandatory stage can accidentally prevent advancing if it never terminates or cannot be suspended. Do not create a parallel day progression controller.

## Verified order flags and book IDs

| Customer | Existing flags | Existing catalog book ID |
|---|---|---|
| Miller | `sold_orchard` | `orchard` |
| Miller | `sold_witnesses` | `witnesses` |
| Mara | `sold_station` | `station` |
| Mara | `sold_roads` | `roads` |
| Mara | `sold_letters` | `letters` |
| Anna | `anna_chose_maps` | `roads` |
| Anna | `anna_chose_mystery` | `witnesses` |

**Editorial correction:** `anna-bookclub-day5-v1.md` has three conceptual book branches. Current receipts expose **two Anna selections**, `roads` and `witnesses`; the third must not be implemented as an actual available purchase until confirmed in live dialogue/catalog. Map `roads` to maps/adventure and `witnesses` to mystery/unreliable narrator only after reading actual `src/content/anna.ts` and `src/content/books.ts`.

## Save and dialogue implications

- `ChapterState` contains `stage`, `dialogue`, `flags` only. Put simple event booleans in existing flags, or implement a deliberate versioned save migration if structured data becomes necessary.
- `decodeSave` validates current stage and node against `stageStory`; renaming/removing live nodes can invalidate existing saves.
- New flags are cumulative. Contradictory one-of-three choices need explicit `unless` guards and tests; the engine does not inherently enforce exclusive flag groups.
- A dialogue option's `grants` updates `dialogue.flags`, and `chooseChapterOption` folds these into `ChapterState.flags`.
- `inspectShopSpot` updates both world and dialogue flags; the current hotspot action is one-time by discovery flag.
- `service.completedOrders` can return multiple receipts if multiple mutually exclusive sale flags are granted; do not assume a single book per customer unless the authored dialogue guarantees it.
- `SAVE_LIMITS` allows 1024 flags, 16,384 history entries, 8192 completed entries and 1 MB raw input; preserve these validation constraints.

## P0 tasks before writing playable investigation

1. Inspect `src/content/evening.ts`, `src/content/day-four-iris.ts`, `src/content/day-five.ts`, `src/content/anna.ts`, `src/content/books.ts` and their tests. Record **actual** letter, privacy, reading and ending flags. The present audit does not claim their exact names.
2. Determine whether the canonical reservation card and closing log are already represented as dialogue flags, narrative lines or objects. Do not add duplicate discoveries.
3. Add an investigation topic **without** making the five existing hotspots mandatory. Options: contextual submenu from `shelves` and `counter`, or dedicated inspectable items with keyboard/touch parity. Existing one-time hotspot discovery must not prevent later letter/log inspection.
4. Implement nonblocking optional conversations as hub topics or separate modal encounters, preserving explicit chapter transition behavior. Test early exit, deferral and reentry.
5. Add story flags only after auditing existing names. Never grant letter-opened from merely inspecting envelope.
6. Wire Anna's Day 5 callback to actual `anna_chose_maps` / `anna_chose_mystery` or no-order state.
7. Run `npm run check`, browser QA suites and save migration/reload tests **after** implementation, not as part of this document-only audit.

## Suggested engineering batches

**Batch A — runtime inventory and guard tests:** catalog exact flags and IDs; add tests that existing save fixtures still decode, stage transitions complete, and optional dialogue does not softlock.

**Batch B — letter vertical slice:** reservation card/letter exterior + optional opening; closing log; evidence provenance; persistence and accessible inspection.

**Batch C — relationships and consent:** Iris consent and Leo acceptance, Nora boundary, Thomas/Anna/Miller rumor outcomes, skip paths.

**Batch D — callbacks and endings:** two real Anna book choices plus fallback; Day 5 public reading; privacy-aware epilogues; full five-day browser runs.

## Noncanonical content exclusion

Do not wire `mystery-clue-graph-v1.md`, `day5-finale-branches-v1.md` or archive-theft parts of earlier drafts into runtime. Canonical story sources: `docs/story/07-FIVE-DAY-DRAMATIC-MAP.md`, `docs/narrative/canonical-letter-investigation-v1.md`, `docs/narrative/canonical-miller-thomas-nora-v1.md`.

## Unverified

Actual code state of PR #23 after this read; browser CI status; physical Safari; contents of story modules not inspected here; whether there are additional Phaser 5 files or a separate experimental branch. **Do not call this a completed playable integration.**

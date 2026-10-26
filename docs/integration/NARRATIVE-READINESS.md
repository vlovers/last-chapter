# Narrative integration readiness — 2026-10-26

This is an implementation handoff, not approval to replace the existing story.
Runtime reviewed: PR #23 on `feat/mobile-bookshop-overhaul`; parent head
`4be9d770e9c7fa1db48ace3f8200d8573f0f1b5a`.
Design snapshot: `narrative/customer-orders-design-20261026` at
`2ef13fd9131a3f59d47ee72fb1197d931d272693`.
The design branch was inspected and tested in an isolated temporary copy. It was
not merged or copied into the playable route.

## What is playable now

[Machine-readable inventory](runtime-inventory.json) records actual imported data:
19 chapter/checkpoint states backed by 14 distinct `DialogueStory` graphs, three
catalog orders and four optional Mara topics. Graph size is not a runtime estimate.

| Area                   | Existing implementation                                                                                                                                | Limits                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Five days              | Miller → Mara → evening; Iris → Anna → Leo; Eleanor → Thomas → Nora → club; day-four visits; reading/finale                                            | A prototype, not a verified forty-minute episode                                                                      |
| Orders                 | `order_miller_day1`, `order_mara_day1`, `order_anna_day2`                                                                                              | Seven accepted book branches across five actual catalog entries; eight other customer/book combinations stay open     |
| Optional conversations | `mara.book-club.v1`, `mara.after-hours.v1`, `mara.return-visit.v1`, `mara.letter-decision.v1`                                                          | Day availability and completion persist; opening additionally requires Mara's current visit                           |
| Investigation          | Sealed letter, reservation/repair records, Eleanor's timeline comparison, consent and rumor consequences; optional bookmark/stamp/shelf board          | No implemented missing-manuscript/archive-chair case                                                                  |
| Journal                | Known people, discovered records/testimony/observations, explicitly labelled deductions, orders, rumors, private notes                                 | Not a general source-comparison workbench                                                                             |
| Shop life              | Collision-safe visitors, browsing/page turns, gestures, entrances/departures, reading chair, rain/light/dust, autonomous Frank, food/play/petting/tree | No random authored town-event system, inventory economy, multi-person encounter scheduler or flower decoration system |

The three current orders are original adaptations. A matching theme in a document
does not mean that document's exact scene has shipped.

## Design-pack inventory: all 30 proposed units

| Proposed units                                                                                            | Status in PR #23                         | State elsewhere / integration action                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orders 1–3: Miller, Mara, Anna                                                                            | Playable original versions               | `customer-orders-v1.md` contains alternative prose and incompatible accepted-book outcomes; reconcile before replacement                                                                |
| Orders 4–8: Thomas, Nora, Iris, Leo, Eleanor                                                              | Not implemented                          | `customer-orders-v2.md` only; resolve real catalog fits, stage/node locations and receipt flags                                                                                         |
| Conflicts: Anna–Miller; Nora–Eleanor; Mara–Leo; Iris–Miller; public reading                               | Exact scenes not implemented             | Existing rumor, autonomy, exhibition and finale choices have related themes, not these archive/manuscript scenes                                                                        |
| Ordinary: Mara walk/lemonade; Thomas chair; Anna bookmarks; Nora bad novel; Iris painting; Eleanor shelf  | Exact pack not implemented               | Existing bakery/repair/art/reading flavor overlaps. The design branch has different short Bellwick prototypes; do not count them as the full pack                                       |
| Deep: Nora, Thomas, Mara, Iris, Eleanor                                                                   | All five Markdown scripts remain unwired | Some existing character topics cover similar subjects. New long scenes must extend/deduplicate those, not replay the same opening                                                       |
| Cozy: Oliver unread book; Oliver tournament; Oliver good day; Sophie flowers; Sophie game; Sophie staying | None playable in the canonical route     | An isolated typed Oliver unread-book prototype exists in the design branch / PR #20. Other documents remain proposals; the branch's short Sophie prototype is not all three Sophie arcs |

The branch also contains ten typed short `bellwickEncounters` and day-only menu
wiring. That is more than documentation, but it is not production-ready integration:

- Its own `npm run typecheck` fails at `src/phaser/story-panels.ts:456`: `"bellwick"`
  is passed to a toggle type that excludes it.
- Its own focused tests report **29 passed / 1 failed** across the optional Oliver,
  Bellwick and long-save files. `validateDialogue` rejects empty `end`/`exit` text
  in the Bellwick batch. Do not disable the validator to import those scenes.
- A day-only menu does not establish character presence. Oliver and Sophie have
  neither current Phaser actor sheets nor current `cast` entries. The eight-person
  renderer cannot silently become a multi-actor scene manager.
- The branch changes chapter guards, saves, endings and content as well as docs.
  It is not a documentation-only merge.

## Canon and product decisions that block blind integration

| Draft detail                                                                                     | Current authority / conflict                                                                                                                            | Required decision                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mara refuses `letters`                                                                           | Current `letters` choice grants `sold_letters`; her authored reply explicitly says she takes it                                                         | Preserve old receipts and outcomes. Approve a new, versioned refusal path rather than rewriting old purchases                                                       |
| Anna accepts `orchard`                                                                           | Existing choices are `maps → roads` and `mystery → witnesses`                                                                                           | Approve an additional reaction/receipt and its later classroom callbacks; do not substitute one book ID for another                                                 |
| Miller rejects unreliable narration                                                              | Current `witnesses` is a valid alternative                                                                                                              | Reconcile voice/reaction without invalidating an existing sale                                                                                                      |
| Archive chairs, missing manuscript/page, changed inventory/event dates, access logs              | Current main mystery is an undelivered private letter and a reservation/flood timeline; Thomas rumor concerns leaving the community center with a woman | Approve an additive case with a fixed truth table, provenance and an alternate essential-evidence route, or retain the current case. Do not alias the two mysteries |
| Nora's archival expertise / access; Eleanor's key control                                        | Nora works at the community center and handles town memories; Eleanor knows the shop's old records                                                      | Confirm roles, access, dates and who can know each fact. A claim about access is not proof of access                                                                |
| Mara managing "her bakery"; Thomas's brother/clock; Iris's first sale; Eleanor's excluded author | New biography or potentially different responsibility from the current employer/relationship setup                                                      | Editorial review. Keep established facts and existing consequences authoritative                                                                                    |
| Restoration manual, local history, illustrated prose, experimental/unfamiliar author             | Catalog has five fiction books and no author metadata or such nonfiction SKUs                                                                           | Author accepted alternatives using existing IDs, or separately approve new books/metadata. This stage added none                                                    |
| Ordinary scenes at times when their NPC is absent; two/three-person conflicts                    | Canonical renderer has one active visitor plus a departing visitor                                                                                      | Add presence/scheduling support before invitations; do not teleport NPCs into a menu                                                                                |
| Forty-minute episode versus multi-hour targets in the orchestration draft                        | Repository purpose still describes an unimplemented ~40-minute episode                                                                                  | Agree scope and measure actual routes. Do not add filler to meet either target                                                                                      |

## Reuse the existing engines

`src/game/dialogue.ts` already provides deterministic nodes, flag conditions,
most-specific/authored variants, once-only completion, pending topics, explicit
suspension and legacy-history reconstruction. Use **that `DialogueStory`** for new
packs. Do not implement the illustrative line/choice/end engine from
`runtime-dialogue-contract-v1.md` as another runtime.

Keep the four existing Mara `ConversationTopic` sessions compatible. Their
single-memory conditions are narrower than `DialogueStory`'s arrays; use an
adapter only if migrating them deliberately, with fixture-based migrations. Do not
merge optional memories into canonical flags implicitly.

Suggested metadata wrapper, not another graph interpreter:

```ts
interface SceneDefinition {
  id: string; // stable authored ID, never a display title
  contentRevision: number;
  priority: 'required' | 'optional';
  window: { day: 1 | 2 | 3 | 4 | 5; stages: readonly ChapterStage[] };
  actors: readonly PersonId[];
  requires: readonly string[];
  unless: readonly string[];
  story: DialogueStory;
  canSuspend: boolean;
}
```

Availability = valid window AND actual actor presence AND canonical prerequisites
AND once-only completion. It must not depend on animation finishing. Required
chapter transitions never inspect optional scene completion. Surface at most 2–3
optional invitations and one extended invitation per day; intentional additional
conversations can remain available if presence and continuity allow.

## Concrete order integration seam shipped in this stabilization

`src/content/customer-orders.ts` owns stable IDs, authored request/reactions,
`stage`, `node`, accepted catalog IDs, original choice IDs and receipt flags.
`validateOrderDefinition` verifies books, graph options, grants and reactions.
`FiveDayStory` derives availability from the current node/options and refuses a
second catalog sale if its receipt already exists. Neither order completion nor a
book recommendation awards a new morality score or verified clue.

Adding one of the next five orders requires:

1. An approved Ukrainian request, optional questions, distinct reactions and a
   short refusal/exit path, with all books mapped to the real catalog.
2. An actual node/choice in the existing chapter graph or an independently saved
   optional graph; availability cannot point to a Markdown heading.
3. An approved receipt flag and explicit later callbacks, then one validated
   `CustomerOrderDefinition`. Do not add another stage switch inside the catalog.
4. Receipt projection in `completedOrders` and tests for accepted/rejected books,
   skipped questions, resume, day transition, unknown IDs and replayed commands.

Existing bindings remain:

| Order  | Choice → book → receipt                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------- |
| Miller | `orchard → orchard → sold_orchard`; `witnesses → witnesses → sold_witnesses`                         |
| Mara   | `station → station → sold_station`; `roads → roads → sold_roads`; `letters → letters → sold_letters` |
| Anna   | `maps → roads → anna_chose_maps`; `mystery → witnesses → anna_chose_mystery`                         |

Future receipt names such as `order_thomas_day3_completed` are **proposals**, not
shipped flags. Do not mark an order complete because an invitation was opened or a
question declined. If the approved design permits refusing a sale, keep a distinct
`declined` outcome and allow chapter progression without pretending a book sold.

## New durable state, with explicit ownership

| State                                                                        | Proposed owner                                                          | Rules                                                                                    |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Active optional scene/node, completed/pending topic ledger, visited/finished | Versioned optional-scene sidecar keyed by stable scene ID               | Closing preserves node; only a terminal marks finished; visited does not equal completed |
| Selected book and order outcome                                              | Existing receipt flag plus validated order record                       | One committed accepted selection; rejected attempts remain bounded diagnostics           |
| Per-scene tone/current banter                                                | Local scene state                                                       | Persist only if needed to resume, never a global morality number                         |
| Actual actor presence / optional invitation queue                            | Scene presentation/scheduler                                            | Reconstruct from day/visit; animation/cat position never blocks story                    |
| New testimony/document/inference entry                                       | Explicit journal projection with source, day and triggering node/choice | Record only what was actually heard/inspected; preserve conflicting testimony            |
| Approved cross-scene callbacks                                               | Canonical flag registry                                                 | Namespaced, reviewed grants; no automatic forgiveness or deleted old flags               |

The draft's `clue_miller_envelope_testimony`, `clue_anna_chairs_testimony`,
`clue_thomas_denial_testimony`, `clue_nora_date_memory`, document-inspection IDs,
`clue_date_discrepancy_verified`, `rumor_thomas_amplified` and
`iris_breach_acknowledged` are **not current flags**. Register them only after canon
approval. Verified discrepancy must require both directly inspected documents AND
an explicit compare action; Nora's memory, Thomas's denial and an accepted book
must never grant the verified record. A supported inference still is not a culprit.

For the existing letter case, reuse `opened_private_letter`,
`iris_letter_breach_admitted`, `iris_letter_choice_respected`, reservation/repair
flags and current finale outcomes rather than similarly named duplicates. Verify
actual producer/consumer spelling in code before authoring a new dependency.

## Long/short routes and save compatibility

- Each new optional graph needs an immediate short exit and an exit/deferral at
  every hub. Core choices remain explicit; "skip" must not secretly choose a book,
  disclose a letter or decide a relationship. The current visible **Пізніше**
  control preserves the node instead of inventing an outcome.
- The long route adds optional branches that return to hubs and complete once.
  Validate reachable endings, dead-end cycles, guarded choices and combined flags.
  Long text scrolls within the existing overlay. Paginate large invitation/topic
  lists without changing canvas size or zoom.
- Keep `last-chapter:save:v1` and all old IDs. This stabilization accepts bounded
  larger histories/flags/ledgers; an explicit completion ledger remains authoritative
  when diagnostic history is compacted. Old short saves retain their shape.
- Add a new scene-sidecar version when independent sessions are implemented.
  Missing optional data defaults to unvisited; malformed optional data must not
  reset the chapter. Persist IDs/state, never executable effects or whole graphs.
- Current service sidecar v1 is compatible and remains bounded. A future v2 for
  multiple orders in one stage must migrate legacy stage keys to stable order IDs.
  Existing receipt flags override missing/stale diagnostics and prevent duplicate sales.
- Stable node IDs are an authoring contract. Removed/renamed nodes need an explicit
  old-ID alias migration. Never recover a removed node by silently restarting a day.

## Ordered implementation tasks and acceptance gates

1. **NAR-01 — canon/catalog reconciliation (editor + developer).** Resolve every
   conflict above; publish approved book mapping, objective truth and knowledge
   table. Acceptance: no missing SKUs or contradictory legacy purchase outcomes.
2. **NAR-02 — clean source branch (developer).** Repair the `bellwick` type error,
   author valid terminal copy, resolve the five merge conflicts listed in
   [merge simulation](merge-simulation.json), and compare chapter/save changes
   individually. Acceptance: branch typecheck and validators pass without exclusions.
3. **NAR-03 — scene registry/presence adapter (developer).** Add the wrapper above,
   use `DialogueStory`, preserve current Mara saves, and expose only present NPCs.
   Acceptance: absent actors cannot start scenes; optional scenes cannot gate a day.
4. **NAR-04 — versioned session store (developer).** Separate optional sessions from
   chapter progress; add explicit revision aliases and idempotent effects.
   Acceptance: old, malformed-sidecar, mid-topic and completed-topic fixtures round trip.
5. **NAR-05 — tiny Oliver pilot (author + developer).** Review the isolated proposal,
   replace any nonexistent purchasable SKU with approved data, add actor/portrait
   fallback and one legitimate visit. Acceptance: every route including decline
   reaches an end, no mystery/reward grants, touch/keyboard/reload pass.
6. **NAR-06 — five additional orders (author + developer).** Add Thomas/Nora first,
   then Iris/Leo, then Eleanor once author metadata/visit timing is settled.
   Acceptance: full catalog matrix, refusals, short paths, persistent receipts and
   all 19 current checkpoints pass after each batch.
7. **NAR-07 — approved clue graph (narrative + developer).** Add provenance records,
   explicit document comparison and separate rumor/inference outcomes.
   Acceptance: skipped optional orders still leave an essential-evidence path;
   exhaustive grants/forbidden-grants tests preserve privacy and objective facts.
8. **NAR-08 — long/cozy packs (author + UX).** Merge Nora's shared opening, avoid
   repeating Thomas repairs/Mara escape/Iris windows/Eleanor shelf arcs, add
   post-conflict variants. Acceptance: short/long route tests and measured reading
   sessions; no duration claim based on Markdown volume.
9. **NAR-09 — release route matrix (QA).** Minimal, social-first, investigative,
   hostile, quiet, interrupted, out-of-order, every-order, absent-Frank and mobile
   routes. Acceptance: CI, physical-device, Ukrainian editorial and narrative review.

## PR dependency and merge order

Current ancestry is **#5 → #7 → #8 → #9 → #10 → #12 → #18 → #23**. These parents
are still open; #18's checks on `4be9d77` are failing. PR #23 contains the previously
reviewed missing-comma/test-path repairs and its own green checks do not make the
parent independently green. Backport narrowly scoped parent fixes and verify each
parent before its human-approved merge; do not merge child features into a broken
parent just to clear a status.

`merge-tree` reports no textual conflict with current `main` or the parent, but a
clean tree is not narrative approval. Preserve the existing PR, then retarget each
child only after its parent lands and rerun checks against the new base. No merge,
force-push or retarget was performed in this stabilization.

PRs #19 and #21 use the same narrative head with different bases; #20 contains the
isolated Oliver proposal. Reconcile their scope/redundancy before integrating one
reviewed content change. Do not merge the same head twice or create another duplicate
PR. The content branch currently conflicts in `src/game/save.ts`,
`src/phaser/story-panels.ts` and three narrative tests; its broader chapter changes
also require semantic review even where Git can merge cleanly.

# Five-day consequence integrity — 2026-11-05

## Baseline and coordination

Fetched origin and inspected open PRs/issues before editing. `main` is still the
bootstrap commit (`4bbf414`), not the playable game. The common playable release
baseline is `feat/narrative-production-v1-20261025` (`c5580f1`, PR #12).

| Work                        | Observed head / owner                               | Treatment in this batch                                                                 |
| --------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Narrative voices            | PR #33, `062bcf9`                                   | Already inherited; do not duplicate its editorial pass                                  |
| Narrative/save continuity   | PR #36, `e73ec77`                                   | Stacked PR base; retains its fixes                                                      |
| Local continuity follow-up  | `c8e6c23`                                           | Present and unpublished at task start; preserved as an ancestor                         |
| UI/mobile/player speech     | PR #35, `131b6ad`                                   | Leave renderer, CSS, mobile and speech delivery ownership there                         |
| UI integration              | `integration/narrative-ux-20261105`, also `131b6ad` | Currently contains the UI lineage, not PR #33/#36; combined integration is a dependency |
| Finale grouping             | Issue #15                                           | Reuse existing pagination; do not rebuild the interface                                 |
| Quiet manuscript provenance | PR #32                                              | No parallel implementation or changes to that branch                                    |

Only one local worktree and no uncommitted changes were present initially. Open
PRs establish overlapping ownership; they do not prove whether another agent is
currently running. No branches, PRs or external work were merged or overwritten.
This feature branch is based on the latest local narrative state and targets
PR #36's branch. It is intentionally stacked: integrating it with PR #35 requires
human review of that combined lineage. It must not target bootstrap `main`.

Read the working agreement, architecture, localization/save/testing guidance,
character voice bible, existing continuity audit, all stage transitions, dialogue
completion/variant selection, save decoder and ending logic. Reviewed authored
school, rumor, gift, evidence and finale callbacks against existing tests. The
initial Node 22 run passed **273 files / 2,870 tests**.

## Verified defects and implemented behavior

| Finding                                                                    | Evidence                                                                                                                          | Resolution                                                                                                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Anna's Day 2 chairs follow-up needs a Day 3 flag                           | `thomas_chairs_discussed` is earned in Thomas's Day 3 visit                                                                       | Earn Anna's existing stance facts from the reachable Day 5 school scene; later Anna dialogue now acknowledges them                   |
| Thomas's early follow-up depends on that inaccessible Anna conversation    | Prerequisite fixed-point audit propagates the blocked producer; existing tests had seeded facts directly                          | Day 5 Thomas now gives three distinct replies to defending him, listening to Anna, or discussing the reading                         |
| A later scene forgets the couple just agreed on a time, or were left space | School and couple scenes can be visited in that order                                                                             | Later Anna/Thomas replies acknowledge the actual Day 5 result, without inventing a completed reconciliation or a past phone call     |
| Speculation and immediately withdrawing it receive the same later response | `rumor_amplification_reconsidered` previously had no reader                                                                       | Miller recalls the withdrawal; the epilogue distinguishes it while preserving `rumor_amplified` and the separate need for an apology |
| Suggesting chairs becomes a purchase                                       | Day 3 avoidance proposes chairs; Day 5 Thomas claimed to have bought them                                                         | Canonical avoidance says he proposed buying chairs                                                                                   |
| Classroom floor, missed time and fallback cause disagree                   | Earlier Anna says second floor; Day 5 says third; Day 3 says evening after missing the morning; fallback invents a delivery error | Second floor and morning stay consistent; fallback only states the missed promise                                                    |
| A retained older stance can mask the current evening's choice              | Legacy saves can contain an earlier Anna stance alongside a new one                                                               | Current school stance has display priority; older facts stay in the save                                                             |

No choice or scene identifiers were removed, no relationship scores were added,
and no save schema/key/version changed. Existing dialogue grants, completion
ledgers, explicit day transitions, variant selection and production pagination
remain the architecture. Spoken option labels and gameplay action labels keep
their existing delivery semantics; no UI or action-to-speech conversion is added.
Anna's three existing stance flags are additionally earned by equivalent Day 5
choices. No flags are removed to rewrite the past.

The early Anna/Thomas nodes remain loadable for older saves. Their chronology
problems are explicitly inventoried, not described as newly reachable early
visits. Their canonical consequences are now observable on Day 5. Independent
Ukrainian editorial acceptance remains necessary; this is an implementation and
continuity review, not a claim that every line has received an independent edit.

## Deterministic scenario matrix

Every listed route starts on Day 1 with no injected story facts and reaches the
saved season ending. Counts include dialogue/actions and checkpoint advances.
Every selection is followed by a reload and comparison of prose, every choice
page, journal, evidence and flags. Pagination must expose each ID exactly once,
show at most four buttons, and leave the save unchanged.

| Scenario                        | Existing fixture     | Days | Choices / reloads | Ending behavior                                                                    |
| ------------------------------- | -------------------- | ---- | ----------------- | ---------------------------------------------------------------------------------- |
| Trusting / honest               | `mutual`             | 1–5  | 155 / 155         | Mutual private conversation, manuscript sealed                                     |
| Secretive / avoidant            | `concealed`          | 1–5  | 101 / 101         | Undisclosed opening remains acknowledged; letter kept private                      |
| Mixed                           | `admitted`           | 1–5  | 101 / 101         | Breach admitted; consequences remain, no automatic forgiveness                     |
| Minimal interaction             | `minimal-evidence`   | 1–5  | 69 / 69           | Optional evidence and school scenes skipped; private ending remains reachable      |
| Completionist compatible topics | `optional-completed` | 1–5  | 177 / 177         | Compatible investigation, readers, counter, cat and aftercare topics completed     |
| Legacy continuation             | `maximum-evidence`   | 1–5  | 185 / 185         | Ledger-free v1 save restored after every selection; evidence-rich ending preserved |

These six routes exercise **788 selections and reloads**. Completionist means
many compatible optional topics, not every mutually exclusive outcome in one
save. The existing ten-journey suite additionally verifies private, admitted,
late-confession, concealed, cooperative, maximum-evidence, confrontational and
other finale routes.

Additional full-history scenarios verify all three school stances, planned talk
and unresolved space, proposal versus purchase, the factual no-school fallback,
withdrawn versus unwithdrawn rumor, and a combined seven-character route:

- Anna/Thomas: actual Day 2/3 conversations unlock their finale; school stance
  changes Thomas immediately and Anna later, with one-time completion preserved.
- Miller: the Day 1 challenge or withdrawal changes Day 5 dialogue; it never
  reveals Thomas's private counseling or erases the player's speculation.
- Mara: Day 1 purchased book is remembered on Day 4; her own bakery plan survives
  alongside Iris's exhibition and the couple's school outcome.
- Leo/Iris: timeline evidence retains uncertainty about what Iris knew; an agreed
  private conversation and artist-controlled exhibition can coexist.
- Eleanor: recorded dates and missing evidence remain distinct; her later gap
  annotation does not prove anyone's intent or manuscript authorship.

## Reusable diagnostics

Run `npm run test:narrative`. The harness is
`tests/helpers/narrative-harness.ts`, with regression tests for the diagnostics
themselves. It uses the production `FiveDayStory`, dialogue engine and save
decoder, not a separate story simulator.

- Structural validation detects missing destinations and duplicate IDs.
- Bounded runtime exploration includes completion/pending ledgers in its state
  key and excludes growing history, exposing blocked prerequisites and dead ends.
- Strongly connected runtime components detect closed multi-scene loops; a loop
  with an exit is not reported as a progression trap. No-progress loops have
  explicit witnesses.
- A fixed-point prerequisite analysis finds facts whose earliest feasible
  authored producer is on a later day. Unknown exploration/service producers are
  external concerns, not fabricated evidence. This optimistic analysis ignores
  exclusivity and same-day ordering; it is not a complete playthrough proof.
- Fixtures prove the diagnostics fail on broken targets, duplicate options,
  blocked endings and loops. A cutoff is explicitly `truncated`; unwitnessed
  scenes in a truncated run are not called unreachable or impossible endings.
- Runtime inventory covers all fifteen playable graphs, including both Day 3
  evening branches. The 200-state-per-graph sample finds a terminal and no dead
  ends or closed/no-progress loops in every graph. All samples truncate, so the
  report does not claim exhaustive graph or ending reachability.
- Production scenario checks reject repeated state signatures, duplicate flag
  mutations and replay of completed school/rumor topics. Save readback must not
  rewrite storage. Legacy tests strip only optional completion/pending ledgers
  from authentic gameplay saves; no narrative flags are synthesized in those routes.

## Verification

Final local results:

| Check                         | Executed result                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm ci --no-audit --no-fund` | Passed, 141 packages installed; Node 22.12.0 warned about a transitive ESLint package requiring 22.13+            |
| `npm run check`               | Passed on supported Node **22.23.4**: Prettier, ESLint, TypeScript, **275 files / 2,893 tests**, production build |
| `npm run test:narrative`      | Passed: **4 files / 42 tests**, including the six requested playthrough archetypes                                |
| Added regression tests        | **23 passed**: 16 production scenario/consequence tests and 7 diagnostic tests                                    |
| Existing regression tests     | **2,870 passed**; two exact-copy expectations corrected with the verified purchase/floor facts                    |
| `git diff --check`            | Passed                                                                                                            |

The build retains the existing Phaser bundle-size advisory. Local success is not
a claim of successful GitHub Actions; remote checks are reported by the Draft PR.
Quality-gate log: `/private/tmp/last-chapter-integrity-check.log`.

The existing `test:browser:v5` runner passed on local Vite with Node 22.12.0:
all five days completed, five completed timeline entries survived a reload,
saved finale remained unchanged, and runtime error list was empty. Its browser
route uses the production adapter for the long traversal and real UI for opening,
first conversation and restored finale. It does not establish pointer-only
coverage of every new dialogue response. The in-app browser connection was
unavailable; the repository's existing Chrome runner was used instead. Evidence:
`/private/tmp/last-chapter-integrity-browser/results.json` and screenshots beside it.

## Remaining concerns and next substantial batch

- Combine PR #35's UI/speech lineage with PR #33/#36 and this stacked branch in a
  reviewed integration branch, then run the full mobile and browser matrix there.
  This batch does not certify unintegrated UI changes.
- Preserve the two early legacy routes until a versioned content migration can
  retire them without invalidating saved positions. They are not required scenes.
- The canonical avoidance path no longer invents a purchase; retained legacy
  branches can still describe the older purchased-chairs history.
- Graph sampling and representative playthroughs do not prove every optional
  combination or interpret contradictory client-edited flag sets as true history.
- Independent Ukrainian editorial review, read-aloud character review and measured
  episode duration remain release work. No claim of a finished 40-minute episode.

Recommended next batch: one combined narrative/UI release-candidate integration,
with rendered character consequences and player-speech checks across desktop and
mobile, plus editorial review of the complete compatible five-day route.

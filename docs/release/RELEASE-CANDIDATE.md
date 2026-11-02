# Release candidate verification

Starting remote: `57b0192d6a4727d7bfde85b3ab4b71abe06e668a`.
Stack: PR #9 → #10 → #12, unchanged. Isolated worktree; the original checkout's
untracked files are untouched. Earlier narrative V2 work is retained.

## Actual remaining inventory

- Focus: latest upstream already fixes programmatic conversation focus and nested
  closed details. A second direct summary with an explicit tabindex still bypasses
  the visibility test. Cover native DOM behavior as well as selector-aware mocks.
- Narrative: two manuscript edge descriptions disagree; early admitted letter
  breaches can bypass the late-breach paper-study boundary. A ledger reply asks
  a question without showing an answer and treats Eleanor's record as Iris's property.
- Mobile: add 320×568, 360×780 and 375×812 to the existing responsive suite;
  verify scene/dock dimensions through changing replies, not only on opening.
- Playthroughs: extend the existing shared journey fixture beyond its five letter
  variants, with cooperative/confrontational/minimal/maximal evidence and optional
  scenes; keep save restoration and noncontradictory endings checked.
- Release: execute required quality commands, browser suites, Frank and finale
  matrix on the integrated head. Record evidence and explicit readiness.

## A — Accessibility

Only the first direct summary of a collapsed details group is reachable. The
conversation section retains programmatic focus at tabindex -1 and remains out
of sequential keyboard navigation. A native DOM fixture in mobile Browser QA
checks selector matching, section focus, hidden sections, expanded/nested details
and restoration to a visible fallback.

Validation: Node 22.12.0, npm ci; baseline npm run check passed (247 files / 2317
cases). Package A check passed (247 / 2318); real Chrome mobile QA at 390×844
passed with no browser errors. Existing bounded owned-process teardown was used
when Chrome did not close gracefully after successful assertions.

## B — Narrative and evidence continuity

The earlier full five-day production pass and its character map remain the
baseline editorial review; this pass rechecks their transitions and the optional
finale investigations rather than duplicating those scenes. Revisited letter
custody, source 17/7, paper ownership, character knowledge, optional hub returns,
three reading programs and school outcomes. Existing graph/ending tests cover
all authored stories; new regressions cover the defects below.

- An admitted day-four breach or pressure now blocks both paper-study entry
  routes. Concealed breaches do not magically become Iris's knowledge. An old
  save already inside an authorized comparison can still finish it.
- Paper examination and case closure now agree on one straight cut and one
  irregular edge. The distinction never becomes proof of an author's identity.
- Iris gives an actual observation about the recipient and does not claim
  ownership of Eleanor's journal. The return choice records that answer.
- Removed an invented yesterday statement by Miller and a promise assigning
  chairs to Thomas without asking him. Replaced abstract comparisons with
  concrete actions and bookshop humor; private notes do not erase earlier harm.

Ten existing dialogue nodes revised, no node/option IDs removed and no save
schema change. Package B npm run check passed: 248 files / 2327 cases. Nine new
save/knowledge/permission regressions. The lifecycle check now validates earlier
Iris boundary flags against their actual day-four granting choices as well as
final-day choices.

## C — Small screens and Frank

The existing fixed dialogue layout is retained: no new CSS override was needed.
The responsive runner now checks 320×568, 360×780, 375×667, 375×812, 390×844,
430×932, 768×1024, 1440×900 and 844×390. It compares canvas and character-dock
bounds through four short/long reply transitions at each size, checks 44px
choices and reachable scrolling, and checks both empty and populated rumor tabs.
All nine viewport cases and the full story checkpoint loop passed.

A real small-screen feeding failure exposed an interaction placement defect:
the player stood in Frank's route while dialogue prevented moving away. Bowl and
tree approach points now leave his path clear. Deterministic simulation checks
both destinations from all five ambient places and from the other care locations.
Frank's seven actions are preserved in two four-choice menus; bowl/tree shortcuts
remain direct. Native touch/browser checks passed at 320×568 and 390×844, plus
1440×900: pet, feed, play, observation submenu, tree climb, duplicate-care guard,
reload and new-game reset. The off-camera phone hotspots are approached through
normal movement; the separate reading-chair regression remains on desktop.

## D — Complete journeys and clean restart

The shared deterministic/browser fixture now contains ten actual five-day paths:
mutual, private rumor, early admission, late confession, concealed breach,
cooperative, maximum evidence, confrontational, minimal evidence, optional scenes
completed. Minimal evidence also skips optional conversations. Every deterministic
choice restores a save; each browser path reloads at critical decisions and after
a real ending-screen restart. A reply must preserve the actual canvas bounds.

All 20 touch runs passed (ten paths × 360×780 and 390×844): 2688 choices,
112 reloads, zero console/runtime errors. Completed-topic returns, mutually
exclusive facts, correct season summaries, five completed days and a clean day-one
restart are asserted. The existing twelve-outcome finale matrix also passed.
CI splits the ten scenarios into bounded core/investigation/daily groups at both
widths; its regression checks prove the union executes every scenario exactly
once per width. No scenario or assertion is disabled to obtain a passing result.

## E — Final integration and acceptance

Integrated the existing quiet-manuscript journal and recovery regressions from
`audit/quiet-manuscript-journal-20261102` at `c941c86`; this is attribution to
existing work, not a duplicate implementation. Observations, inferences and
custody now appear only after their discoveries; authorship stays uncertain.

The recovery browser test waits for the stale-tap guard and proves an actual
persisted greeting. Its future-save path exposed sidecar data loss: an older
client could read and overwrite newer notes/conversations even while protecting
the main chapter. Those sessions now start in memory and avoid writes until the
chapter is writable. Frank uses the same rule for restoration, care and teardown.
Valid v1 saves retain their behavior; no schema migration is needed.

Final local verification: npm ci and npm run check passed, 251 files / 2354 cases;
37 additional deterministic cases against the starting head, including imported
regressions. Required standard, v5 and mobile browser commands, Frank, the
12-outcome finale matrix, performance and save recovery passed. Twenty touch
journeys passed; the nine-viewport mobile suite was repeated after journal/panel
integration. [QA summary and limits](QA-RESULTS.json). Exact published SHA and CI
URLs are recorded in PR #12 after those workflows complete.

The 853-node graph and previous complete five-day/character editorial baseline
were rechecked. This incremental pass rewrote ten prose scenes and changed the
assembled gathering's paper-access condition. No authored nodes were removed or
added. No CSS patch stack or parallel test framework was introduced.

No critical/high blockers were found by these checks. Eleven existing moderate
dev dependency advisories and the large Phaser bundle warning remain. Physical
phones, an independent blind Ukrainian reader session and measured episode
runtime are not claimed. RC acceptance does not authorize merge or deployment.

## F — GitHub CI evidence and exhaustive choice-paging audit (2026-11-02)

The published `e2430b2f83a29cfff307a4c17e8323415c21255d` baseline has
[CI run 41497275031](https://github.com/vlovers/last-chapter/actions/runs/41497275031)
completed successfully: **14/14 jobs**, including quality, mobile, Frank,
save-recovery, finale, performance and all six narrative-route shards.
[Browser QA run 41497275169](https://github.com/vlovers/last-chapter/actions/runs/41497275169)
also completed successfully. These are SHA-specific GitHub results, not
a claim that subsequent commits have passed.

Two additional regression suites now exercise the actual `FiveDayStory` UI,
rather than only validating authored graph metadata:

- `tests/finale-gathering-paged-choices.test.ts` checks each conditional
  finale-gathering reply under its required flags, full four-button pagination,
  no duplicated/omitted choices, no save writes while changing pages, and
  selection + reload with preserved granted flags.
- `tests/five-day-all-scene-mobile-choices.test.ts` enumerates every authored
  node in all 15 playable stages, including distinct required-flag variants.
  It restores each state from a real encoded save, checks all visible pages
  against the authored available options, enforces at most four buttons and
  ensures paging does not change the saved chapter.

The first new CI run exposed a test-only TypeScript mismatch between readonly
grants and Vitest's mutable `arrayContaining` argument. Fixed in
`bb2089a`; no game behavior or save format changed. The formatting
normalizer subsequently adjusted the new test's layout in `9ab51ab`.
**Acceptance of these new tests remains contingent on CI and Browser QA for
the exact final head.** The PR stays Draft; no merge/deployment is authorized.

## G — Day-four optional-evidence and topic-order audit (2026-11-03)

A valid Day 3 completion can carry no `saw_envelope`. Previously, Iris's
Day 4 welcome and exit narrated an envelope that the player had not found,
while two letter questions remained selectable without that evidence. The
no-envelope route now stays with her drawings; the original letter narration
and all three letter questions are available only after the discovery.

Two other conversation-order defects were addressed. An Iris letter follow-up
returns to the hub instead of replaying a completed boundaries conversation.
Leo's optional train anecdote now has its own response and returns to the hub,
not to the Mara topic gated behind the ticket conversation.

The Day 4 Iris and Leo regression suites now cover both evidence states, save
restoration without the letter, completed-topic returns, and the train-to-ticket
sequence. No existing scene IDs or save schema changed. One train follow-up
scene and a conditional return choice were added. **CI and Browser QA must
pass for the final head before this package is accepted.** PR #12 remains Draft;
no merge or deployment is authorized.

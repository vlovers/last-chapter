# PR #12 stacked-base reconciliation — 2026-10-30

## Scope and immutable inputs

- Feature head before reconciliation: `56259301ec864d3ce0bfc336b399f977835d045b`.
- PR #12 base (PR #10 head): `63392efc8bb633c40871bbaf83144fe19b65687d`.
- Common ancestor: `ddde56571c753086ee5bde010a0900d72c310375`.
- The base had 10 commits beyond the common ancestor; the feature had 1,065.
- This is a **feature-branch ancestry reconciliation**, not a merge of either PR into `main`.

## Conflict decisions

Compared the common ancestor, current base and current feature for the base-only changes.

- The eight modified `docs/design/` files and the added `docs/narrative/CHARACTER-VOICE-BIBLE.md` are **byte-identical** between the current feature and base. They require no replay.
- The seven character-content files (`anna.ts`, `day-four-iris.ts`, `day-four-leo.ts`, `eleanor.ts`, `mara.ts`, `nora.ts`, `thomas.ts`) were edited on both branches. Preserve the feature versions: they contain the expanded playable character arcs, subsequent consent/rumor callbacks and dialogue rewrites. In particular, the base's shorter Leo scene is superseded by the feature's day-four ticket and letter-consequence arcs.
- `tests/letter-continuity.test.ts` differs in one expectation: the base allows either wording for Iris's rebuke; the feature checks the specific Ukrainian text currently authored in its scene. Preserve the feature test and its matching scene.
- No character-content file is replaced by its older base copy. The feature tree remains intact; only this reconciliation record is added.

## Regression gate

Before reconciliation, GitHub Actions run `41023779076` passed `quality` and all five Browser QA jobs (standard, mobile, five-day, Frank and finale). That result applies to the **pre-reconciliation** feature head only.

After this ancestry reconciliation, verify the new merge commit independently: format, lint, typecheck, unit tests, production build, dependency audit and all Browser QA jobs. Keep PR #12 draft until the resulting checks finish.

## Dependency

PR #12 remains stacked on PR #10, which remains stacked on PR #9. Do not merge PR #12 to `main` out of order. This ancestry merge does not alter the target branch or any parallel contributor's commits.

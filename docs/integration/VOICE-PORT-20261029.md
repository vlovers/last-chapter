# Character voice port — 2026-10-29

## Source and destination
- Source: PR #30, `integration/narrative-voice-reconciliation-20261029`.
- Destination: `feat/narrative-production-v1-20261025`.
- Ported dialogue lines: Anna 5, Iris 7, Eleanor 4, Thomas 7 (23 total).
- Imported `docs/narrative/CHARACTER-VOICE-BIBLE.md`.
- Updated the Iris letter-continuity assertion to match the revised spoken wording while retaining the consent-breach flag checks.

## Editorial exception
The sixth proposed Anna edit (node `classroom`) was **not** imported. The destination already has a more specific exchange about Julian and Emma arguing over a protagonist, including a player follow-up. Replacing it with the older generic classroom observation would remove established specificity.

## Integration safety
Do not merge PR #30 wholesale into the production branch. The source and destination have diverged significantly, and the destination has expanded dialogue graphs. Only the reviewed line-level changes above were applied. No story nodes, flags, option identifiers, or route transitions were intentionally changed.

## Validation
- Before this port, CI run #40895700326 passed quality and all four browser QA suites.
- The first post-port run #40897826346 exposed one outdated string assertion in `tests/letter-continuity.test.ts` (1280/1281 tests passed).
- The assertion was corrected in commit `11e62317a14d21b0d8342737814552b4b77af05c`.
- Revalidation: https://github.com/vlovers/last-chapter/actions/runs/40898109134 (check live conclusion before closing the source PR).

## Completion criteria
Confirm quality, standard, five-day, mobile, and Frank browser jobs are all successful. Then close PR #30 without merging to avoid replaying older content.

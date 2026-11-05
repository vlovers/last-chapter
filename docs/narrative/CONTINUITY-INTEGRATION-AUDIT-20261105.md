# Narrative continuity integration audit — 2026-11-05

## Scope and safety

This branch is based on `feat/narrative-player-voice-depth-20261105` (PR #33), **not** on the user's unfinished local merge of PR #33 and PR #35. Do not merge it directly into `main`; reconcile overlapping edits with the integration branch first. Browser QA and the full local check have not been executed for this audit branch. GitHub CI and Browser QA were queued at the last inspection.

## Confirmed source-level findings and fixes

| Area                              | Invariant                                                                                                        | Change                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Eleanor's tea option              | Apostrophe in `доп'ємо` must not terminate a TypeScript string                                                   | Use a double-quoted literal                                           |
| First-day Miller dialogue         | Apostrophe in `дріб'язку` must not terminate a TypeScript string                                                 | Use a template literal                                                |
| Mara's day-four gift, no purchase | A legacy save without `sold_station`, `sold_roads`, or `sold_letters` must not imply a purchased or wrapped book | Neutral no-purchase default                                           |
| Mara's purchased book             | Each of the three sale flags maps to its own specific gift; the book has not yet been given to Leo               | Clarified purchased variants                                          |
| Anna's response to Thomas         | Owning a missed promise differs from buying six replacement chairs                                               | Preserve separate conditional responses and align the opening wording |
| Day-three Thomas                  | He missed the _same day's_ school reading, not a future reading                                                  | Explicit `сьогоднішнім читанням`                                      |

## Added integration regression coverage

- Missing-sale gift text and available options, including encode/decode round-trip.
- The station, roads, and letters purchase paths, retaining the corresponding `sold_*` flag.
- No `mara_gift_encouraged` flag for merely opening and leaving the gift topic.
- Letter-privacy legacy fallback without inventing a purchase.
- The day-one door-joke wedge callback on day four, and its absence for the buns-thanks path.
- Anna's two Thomas-outcome responses and three player stances.
- Thomas's three follow-up responses, including save/restore and topic completion.
- Thomas follow-up remains gated until Anna's conversation is completed.
- Day-three reading chronology.

## Integration checklist

1. Finish the existing local merge safely and inspect the staged diff; do not stage `.idea/` or `*.conflict-backup`.
2. Compare PR #36 against the integrated working tree **before** cherry-picking. The two syntax fixes and some content corrections may already have been made locally.
3. Run `npm run check`; capture exact test names and failures rather than weakening assertions.
4. Run Browser QA on mobile and desktop, especially dialogue option selection, speaker attribution, and save/restore.
5. Verify no duplicated flags or topic completion on repeated visits.
6. Only after checks pass, merge the integration changes to their intended production branch.

## Remaining risks

- PR #35's dialogue UI and PR #33's narrative content have not been tested together in this branch.
- The last reported combined merge had 17 failing tests; this audit PR does not claim to resolve all of them.
- `textWhen` uses the most specific matching variant by default, while `afterwordWhen` appends independent callbacks. New flags can change the chosen text without changing the dialogue node; validate cross-character callbacks with restored saves.
- The `save.ts` decoder validates stage and node but cannot prove the historical story path actually occurred. Flag provenance must be protected by gameplay transitions and regression tests.

## Follow-up: day-one/day-two copy continuity

- Day-two Anna now says `У нас завтра читання`, preserving the established chronology and the expected lowercase substring.
- Mara's `thank` branch explicitly mentions `із корицею`, while her `joke` branch keeps the wedge promise. The callbacks remain mutually exclusive.
- Three additional integration tests cover those distinct branches and their flags.
- This remains a source-level fix only; full test and Browser QA results are not yet verified.

## GitHub Actions audit — 2026-11-05 03:00 Europe/Kyiv

Checked exact PR heads against Actions:

| PR  | Head SHA                                   | CI      | Browser QA |
| --- | ------------------------------------------ | ------- | ---------- |
| #33 | `062bcf9c4d5525531d0e53e1ae1c7de4bdde77e6` | Failure | Failure    |
| #35 | `131b6add0884746ce6f21f089efdf7a36b375a92` | Queued  | Failure    |
| #36 | `2f4f8666cf7a46dba7912607e9dbdd15e97713ed` | Queued  | Queued     |

PR #33's quality job `126962096608` failed at `prettier --check .`, **before** running TypeScript, unit tests or build. The exact parse failures were `src/content/eleanor.ts:35` (unescaped apostrophe in `доп'ємо`) and `src/content/first-day.ts:27` (unescaped apostrophe in `дріб'язку`). Both source-level parse errors were already corrected on PR #36. A failed PR #33 CI run is therefore not evidence that the tests on PR #36 failed; conversely, queued PR #36 jobs are not evidence of success.

For PR #33, all thirteen Browser QA matrix jobs inside its CI workflow were marked failed; their root causes have not yet been inspected and must not be attributed to the syntax errors without logs. PR #35's browser failure is also unresolved. Do not merge until the current head's CI and Browser QA are verified, and the local combined PR #33/#35 integration's seventeen reported failures are rechecked.

### Immediate next verification

1. Inspect PR #36's own quality job when it starts. If it fails on formatting, fix the exact lines; if tests fail, use actual log assertions and source option IDs.
2. Check the separate Browser QA workflow logs rather than inferring a cause from the matrix failure count.
3. Reconcile all fixes with the user's unfinished local integration branch without overwriting or staging that working tree.

## 05:55 Kyiv — save ledger hardening and CI evidence

- PR #36 head before this batch: `d3739274fe521aca269bd3fc960421b34dbea313`.
- GitHub Actions run `41958891329`: all 14 Browser QA matrix jobs passed, including `save-recovery`, mobile, five-day and finale; `quality` failed at `Format`, so lint, TypeScript, Vitest, build and audit did **not** execute.
- Standalone Browser QA run `41958891322` succeeded. This does not prove that PR #36 passes the complete CI gate.
- Fixed `validCompletionKey`: reopening flags must be an ordered subsequence of `option.reopensWhen`, matching the serializer's `.filter(...)` order. The prior index expression could accept an out-of-order subsequence.
- Added tests for forged reopening flags and for round-tripping the actual ledger produced by gameplay.
- Follow-up priority: run Prettier on the eight previously reported files and verify full quality gate. GitHub contents API does not provide a Prettier execution environment, so formatting has not been certified locally.

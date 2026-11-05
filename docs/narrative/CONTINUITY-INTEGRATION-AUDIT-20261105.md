# Narrative continuity integration audit — 2026-11-05

## Scope and safety

This branch is based on `feat/narrative-player-voice-depth-20261105` (PR #33), **not** on the user's unfinished local merge of PR #33 and PR #35. Do not merge it directly into `main`; reconcile overlapping edits with the integration branch first. Browser QA and the full local check have not been executed for this audit branch. GitHub CI and Browser QA were queued at the last inspection.

## Confirmed source-level findings and fixes

| Area | Invariant | Change |
| --- | --- | --- |
| Eleanor's tea option | Apostrophe in `доп'ємо` must not terminate a TypeScript string | Use a double-quoted literal |
| First-day Miller dialogue | Apostrophe in `дріб'язку` must not terminate a TypeScript string | Use a template literal |
| Mara's day-four gift, no purchase | A legacy save without `sold_station`, `sold_roads`, or `sold_letters` must not imply a purchased or wrapped book | Neutral no-purchase default |
| Mara's purchased book | Each of the three sale flags maps to its own specific gift; the book has not yet been given to Leo | Clarified purchased variants |
| Anna's response to Thomas | Owning a missed promise differs from buying six replacement chairs | Preserve separate conditional responses and align the opening wording |
| Day-three Thomas | He missed the *same day's* school reading, not a future reading | Explicit `сьогоднішнім читанням` |

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

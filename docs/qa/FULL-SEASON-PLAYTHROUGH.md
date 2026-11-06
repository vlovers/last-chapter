# Full-season save/resume smoke test

`tests/full-season-playthrough.test.ts` now exercises two deterministic routes through every chapter stage from Day 1 to the season finale.

- Finds a reachable terminal node in each dialogue using the **actual accumulated flags**, rather than inventing prerequisites.
- Tests two option priorities (normal and reversed) to expose different short routes.
- Applies the real chapter transition functions and verifies stage order.
- Serializes and restores state before and after each transition.
- Checks all five days are marked completed at the end.

**Limits:** This is not exhaustive narrative coverage. A shortest-path traversal may skip optional conversations, and both routes can share most choices. Browser rendering, animation, art, keyboard access, actual `localStorage` behavior and long-form playtime still need independent checks.

**Run:** `npm run check` (includes the test suite), or `npm test -- tests/full-season-playthrough.test.ts`.

CI must be observed before marking this test passing. No production pixel-art assets are introduced by this change.

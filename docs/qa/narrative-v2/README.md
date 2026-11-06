# Narrative V2 — local browser evidence

Verified with repository Playwright runners and installed headless Chrome on
macOS, Node 22.12.0, 2026-11-02 (Europe/Kyiv). The game was served by Vite from the
isolated narrative worktree after reconciliation onto `a598dd9`.

| Evidence           | Runner                                     | Coverage                                                               |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------- |
| `standard.json`    | `npm run test:browser`                     | Canonical game, movement, interaction, save isolation                  |
| `five-day.json`    | `npm run test:browser:v5`                  | Stage order, catalogue, notebook, loading and final summary            |
| `mobile.json`      | `npm run test:browser:mobile`              | Responsive touch layouts, panels, narrow screens                       |
| `frank.json`       | `node scripts/qa-frank-overhaul.mjs`       | Attention, food, play, cat tree, reading chair and persistence         |
| `finale.json`      | `node scripts/qa-finale-matrix.mjs`        | 12 outcome combinations, desktop/mobile reload, cross-hub continuation |
| `performance.json` | `node scripts/qa-bookshop-performance.mjs` | 390×844, CPU 1× and 4×, camera movement and object reuse               |

All ten narrative touch journeys passed: five routes at 360×780 and 390×844.
`journeys.json` records each stage, choice count, reload count and empty error
list. `narration-scroll.json` records the additional complete mutual route with
visual/accessibility text comparison and long-text scrolling. The three PNGs
show the public reading, its continued reactions and the school conversation. CI runs the same script and uploads its screenshots
and JSON as `narrative-v2-mobile-journeys`.

These are automated desktop-browser emulations. They do not establish physical
phone performance, independent Ukrainian-reader acceptance or episode duration.
The in-app browser native bridge was unavailable, so the existing QA CLI was
used. Some successful local browser fixtures needed their bounded owned-process
shutdown fallback after the assertions and result writing had completed; no
assertion was suppressed.

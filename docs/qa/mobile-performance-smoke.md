# Mobile bookshop performance smoke

This check exercises the actual Phaser bookshop at a **390 × 844** viewport in
headless Chromium. It is a regression smoke, **not** a physical-device FPS benchmark.

## Automated coverage

The `performance` job in `.github/workflows/ci.yml` runs
`node scripts/qa-bookshop-performance.mjs` after starting Vite. It samples
the running scene once per second for ten seconds, first at normal CPU speed,
then with Chrome DevTools **4× CPU throttling**.

The smoke rejects browser page errors, failed scenes, non-finite or zero FPS,
empty scenes, and changing scene-object counts during idle animation. The
last check detects accidental object creation in the ambient animation loop.

The job deliberately does **not** enforce a fixed minimum FPS: shared CI
runners and simulated throttling cannot establish real mobile performance.
Each run uploads `mobile-performance-browser-qa/performance.json` with
all samples, minimum, median and maximum FPS, object counts, and reduced
effects state. Compare trends across runs before investigating a regression.

## Initial CI observation

On 2026-10-31 (Kyiv time), the first performance job completed successfully
in [Actions #41142450489](https://github.com/vlovers/last-chapter/actions/runs/41142450489).

| CPU simulation | Minimum FPS | Median FPS | Maximum FPS | Scene objects |
| -------------- | ----------: | ---------: | ----------: | ------------: |
| Normal         |       29.65 |      33.90 |       49.31 |            31 |
| 4× throttled   |       26.67 |      30.73 |       39.14 |            31 |

These numbers describe **one headless CI run only**. The test does not measure
battery usage, thermals, input latency, memory growth across long sessions,
or performance on an actual phone. Those remain manual release checks.

## Hotspot rendering regression (2026-10-31)

The Phaser scene calls `Interactions.update()` every frame. The hotspot layer now
avoids redundant DOM class changes, repeated hint text assignments, and Phaser
outline geometry redraws when the highlighted world-space target has not
changed. Screen-space hit areas still update when the camera moves, and moving
visitors or dialogue transitions invalidate the outline cache.

`tests/phaser-hotspot-idle-performance.test.js` covers 120 idle frames,
camera movement, moving visitor targets, and entering/leaving dialogue. These
are **operation-count regression tests**, not FPS measurements; the existing
Chromium smoke and a real-device playtest are still required to evaluate
perceived performance and input responsiveness.

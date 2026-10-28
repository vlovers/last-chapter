# Testing

`npm run check` runs Prettier, ESLint, TypeScript, Vitest and the Vite production build.
The narrative suite covers deterministic knowledge, trust, dialogue, five-day scenarios,
book recommendations, endings and save migrations. It must continue to pass when changing
the independent Phaser slice.

## Complete five-day UI routes

With Vite running and the optional Playwright tooling configured below,
`npm run test:browser:v5` plays four fresh contexts from Day 1 to season completion:

- A: three catalog orders, book club, character conversations, mutual letter conversation and final reading; normal animation.
- B: quiet evening, physical manuscript inspection, comparison with Iris's postcard, privacy agreement and returning the page.
- C: alternative book choices, the window interpretation, limited inquiry and archiving the page.
- D: a 390×844 phone, ten full reloads across conversations, day checkpoints and manuscript custody; suspended optional Mara conversation resumed on Day 4; both clues examined.

Every narrative change is a real button click. The runner reads saves and Phaser
guest visibility to assert results; it never injects a chapter or calls the story
transition API. `qa-story-ui.mjs` navigates the actual pagination and finale groups.
Each route checks its composed ending, three receipts, restart isolation and
browser errors, and writes screenshots, a final save and a Playwright trace.
`results.json` records partial failures rather than marking unexecuted routes passed.
`QA_ROUTES=A` selects only Route A for a production-preview smoke; omitting it
always runs all four routes. The runner also works against `vite preview`.

`node scripts/qa-production-recovery.mjs` separately tests deliberately missing,
corrupt and blocked storage, orphan optional-session cleanup and keyboard focus.
Only this fault-injection runner damages storage; it does not count as a gameplay route.

CI stores each runner's output separately and uploads browser evidence for seven
days, including on failure. See the [production QA record](qa/production-20261028/README.md)
for the actual verification and remaining playtest limits.

`tests/phaser-slice.test.js` tests every Mara branch, state isolation/immutability,
interaction proximity and arrival gates, nonoverlapping hit areas, movement boundaries,
substepped collision and sliding, safe navigation segments, reachable approach points,
manifest/provenance validation, generated frame bounds, failed sprite allocation,
portrait fallback metadata and unsupported audio. Runtime JavaScript is linted and tested;
`npm run typecheck` covers the existing TypeScript code, not the public JS modules.

## Optional browser smoke tests

The repository does not add a browser automation library to game dependencies. Install
Playwright in a temporary directory and use installed Google Chrome, or configure another
available Chromium channel. With Vite running:

```sh
npm install --prefix /tmp/last-chapter-browser --no-save playwright@1.58.2
PLAYWRIGHT_MODULE=/tmp/last-chapter-browser/node_modules/playwright/index.mjs npm run test:browser
```

`BASE_URL` defaults to `http://127.0.0.1:5173`; set it to `http://127.0.0.1:4173` for
`vite preview`. `QA_OUTPUT` selects the artifact directory (default
`/private/tmp/last-chapter-qa` on the development Mac). `BROWSER_CHANNEL` defaults to
`chrome`. Browser installation/system prerequisites may be needed on other machines.

`scripts/qa-phaser.mjs` uses actual keyboard, pointer and semantic UI interactions.
Read-only scene snapshots verify collision, animation/state and audio settings. It checks
four objects, both gift endings, confidentiality response, conversation resume, rapid-key
guard, desktop/tablet layout, reduced motion, silent/portrait fallbacks, initialization
failure and production save isolation. It writes screenshots and a JSON result file.
A passing browser smoke is not a full accessibility audit or an audio listening review.
The runner owns its Chrome server and allows five seconds for graceful shutdown,
then terminates only that fixture if the installed browser stalls during cleanup.

See [V1 QA record](qa/PHASER-VERTICAL-SLICE-V1.md) for the checks actually executed.

## Gameplay polish V1

`npm run test:browser:polish` runs the canonical five-day UI at desktop, compact
desktop, tablet and mobile sizes. It verifies optional completion across reload,
Frank's real movement and petting, pause behavior, no document scrolling, canvas
alignment and all 19 story stages. See [the QA record](qa/polish-v1/README.md).
Unit regressions cover nested completion, legacy saves, suspended letter returns,
conditional reopening and ten minutes of collision-checked cat movement.

## Mobile bookshop overhaul

`npm run test:browser:mobile` checks all five requested screen sizes plus phone
landscape, touch and keyboard movement, viewport stability under all overlays,
search, journal privacy, focus restoration, live orientation changes and the
five-day story with three saved catalog purchases.
`node scripts/qa-frank-overhaul.mjs` exercises the cat and reading-chair UI.
`node scripts/qa-bookshop-performance.mjs` samples scene FPS and object counts at
normal speed and 4× CPU throttling. These runners use the same optional Playwright
setup and environment variables as the browser smoke tests. See the
[implementation, screenshots and limitations](qa/mobile-overhaul/README.md).

## Stabilization and integration readiness

`npm run test:browser:stabilization` covers first-use guidance, all fifteen real
customer/book pairs, reload and receipt idempotence, actual journal provenance,
120 overlay cycles with listener/object counts, long-text scrolling, rotation,
reduced motion and a larger compatible save. Cat waits observe simulated time
with a separate wall watchdog; cleanup tests prove assertions retain a failing
exit code even when the browser transport never closes.

See the [executed test/UX report](qa/stabilization/README.md) and
[narrative integration plan](integration/NARRATIVE-READINESS.md). Future content
proposals are not counted as implemented scenes.

# Testing

`npm run check` runs Prettier, ESLint, TypeScript, Vitest and the Vite production build.
The narrative suite covers deterministic knowledge, trust, dialogue, five-day scenarios,
book recommendations, endings and save migrations. It must continue to pass when changing
the independent Phaser slice.

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

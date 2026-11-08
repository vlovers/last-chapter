# Testing

`npm run check` runs Prettier, ESLint, TypeScript, Vitest and the Vite production build.
The narrative suite covers deterministic knowledge, trust, dialogue, five-day scenarios,
book recommendations, endings and save migrations. It must continue to pass when changing
the independent Phaser slice.

`npm run test:narrative` runs the deterministic consequence matrix, graph diagnostics,
existing ten five-day journeys and ending-dimension regressions. The reusable harness
restores production saves after every choice, exercises legacy saves without completion
ledgers, verifies every paginated screen has at most four choices, and distinguishes
bounded exploration from proven dead ends and closed loops. See the
[executed audit, coverage matrix and limits](narrative/FIVE-DAY-CONSEQUENCE-INTEGRITY-20261105.md).

The narrative command also includes the release save-route matrix (80 deterministic
current/legacy routes), seven complete consequence journeys, and rejected-save
preservation tests. See the [combined integration audit and QA matrix](integration/RELEASE-READINESS-20261105.md).
`test:browser:save-recovery` verifies seven scenarios: missing/corrupt/future
chapters, blocked storage, and transient read denial for notes, an active optional
conversation and a completed optional conversation. It also checks the exact
downloaded archive, small-phone controls, retry behavior and retained progress.

`tests/phaser-slice.test.js` tests every Mara branch, state isolation/immutability,
interaction proximity and arrival gates, nonoverlapping hit areas, movement boundaries,
substepped collision and sliding, safe navigation segments, reachable approach points,
manifest/provenance validation, generated frame bounds, failed sprite allocation,
portrait fallback metadata and unsupported audio. Runtime JavaScript is linted and tested;
`npm run typecheck` covers the existing TypeScript code, not the public JS modules.

## Optional browser smoke tests

`npm run test:browser:ux` checks the production UI at 320×568, 360×780, 375×667,
375×812, 390×844, 430×932, 768×1024, 1440×900 and 844×390. It covers transient
spoken player turns before NPC replies, action labels, rapid Enter/touch guards,
reload without replay, long Ukrainian prose, offscreen Frank navigation, local
cover loading, search/filtering, notebook knowledge boundaries and notes. It can
run against Vite preview by setting `BASE_URL`; screenshots and JSON go to
`QA_OUTPUT`. See [the UX/UI record](qa/ux-ui-production/README.md).

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

## Living Story continuation and responsive regression

The existing `ux-ui` browser CI matrix entry runs `npm run test:browser:ux` and then `node scripts/qa-living-story.mjs` against the same Vite server and pinned Chromium. This deliberately reuses the existing job and artifact upload instead of spawning an extra matrix job or workflow. The second script performs a **normal Playwright click** on `#story-continue`, checks its center against `document.elementFromPoint` (no `force: true`), and verifies desktop, narrow mobile, tablet and landscape layouts, dialogue paging, save/reload, staged character motion and weather. Screenshots and JSON evidence go to `QA_OUTPUT` and are uploaded as `ux-ui-browser-qa` even if a test fails. A green check must be confirmed for the exact commit SHA; historical screenshots do not constitute current release acceptance. If the combined job approaches its 20-minute limit, optimize the fixture or split the invocation within existing jobs rather than adding another CI shard.

# Phaser vertical slice V1 — review and QA record

Date: 2026-10-24. Branch: `chore/engineering-bootstrap`.
Related art work: [#4](https://github.com/vlovers/last-chapter/issues/4).
The existing draft PR [#5](https://github.com/vlovers/last-chapter/pull/5) was inspected.
This work is a local, isolated technical slice; it does not close production-art work.

## Scope and acceptance

- Original 640×360 bookshop with varied shelves, counter props, rainy window,
  reading corner, floor/wall detail, warm light, foreground separation and foot depth.
- Animated four-direction player and Mara; arrival sequence, movement boundaries,
  solid furniture, click-to-move navigation and keyboard alternatives.
- Four contextual object inspections and one branching Ukrainian gift conversation.
  Portrait/name/mood, mouse and keyboard choices, focus trapping, close/resume and
  input repeat protection are integrated into the game.
- Gesture-gated synthesized rain, foot/book/dialogue cues, optional music, mute and
  volume; static ambient presentation under reduced motion.
- Missing portrait/audio gracefully fall back; initialization failure has a Ukrainian
  recovery message. Imported prose is validated and rendered as text.
- The existing five-day narrative, story flags, saves and tests remain isolated.

Acceptance: enter the room, watch Mara arrive, move around furniture, inspect all four
objects, approach Mara, choose either book, wrap the gift, adjust audio and return to
exploration without runtime errors. Production saves must remain byte-for-byte unchanged.

## Automated quality gate

Executed with Node 22.12.0 and npm:

| Check                  | Result                                       |
| ---------------------- | -------------------------------------------- |
| `npm run format:check` | Passed                                       |
| `npm run lint`         | Passed                                       |
| `npm run typecheck`    | Passed                                       |
| `npm test`             | Passed: 35 files, 139 tests (21 slice tests) |
| `npm run build`        | Passed: both Vite entries                    |
| `git diff --check`     | Passed                                       |

`npm run check` runs those five npm commands in order. The new tests cover all ten
complete conversation routes, both books, confidentiality/autonomy responses, immutable
state, interaction eligibility, nonoverlapping targets, boundaries, furniture collision,
sliding, collision-free paths, reachable approach points, manifest provenance and geometry,
generated sheets, directional animation/depth, reduced motion, allocation failure and
unsupported audio. Production five-day and save regressions continue to pass.

TypeScript checks production TS files; public prototype JS is linted and exercised by
unit and browser tests. No checks were relaxed. Phaser adds an expected bundle-size
warning: approximately 1.21 MB minified / 333 KB gzip, isolated from the narrative entry.

## Browser evidence

Tool: temporary Playwright 1.58.2 installation and installed headless Google Chrome
155.0.8059.85. The in-app browser bridge was unavailable, so standalone Chrome was used.

Both final suites passed all five scenario groups: Vite at
`http://127.0.0.1:5173` and the production build at
`http://127.0.0.1:4174`. Each run completed both gift endings, all four objects and
the failure scenarios. Artifacts are in `/private/tmp/last-chapter-qa` and
`/private/tmp/last-chapter-qa-build` respectively. Screenshots were visually inspected
for room composition, portrait/choice layout, tablet wrapping and fallback presentation.
Normal desktop/tablet play produced no prototype console or page errors; deliberately
blocked resources produced the expected fallback or recovery UI.

The suite covers real key/pointer input, four object inspections, navigation around
furniture, visible walking frames, held Enter protection, focus/choice navigation,
conversation resume, both book endings, completion parcel, audio controls and unchanged
production saves. Tablet uses a 768×1024 touch-capable viewport with reduced motion;
desktop uses 1440×1000. Fallback checks abort the portrait request, remove Web Audio
support and abort the entry scene module in separate contexts.

Artifacts are written outside the repository under `QA_OUTPUT`:

- `bookshop-desktop.png`: full shop after arrival.
- `mara-dialogue.png`: integrated portrait and choices.
- `bookshop-tablet.png`: wrapped text and responsive controls.
- `portrait-fallback.png`: playable consent-boundary response with missing portrait/audio.
- `results.json`: browser version, base URL and per-scenario results.

The existing narrative page's missing favicon is excluded by its exact URL from console
error checks. Prototype errors are not excluded. See [test instructions](../TESTING.md)
for reproduction against Vite or `vite preview`.

## File inventory

- `phaser-prototype/index.html`, `main.js`, `style.css`: game shell, local engine entry,
  responsive dialogue/settings and contextual controls.
- `public/phaser-prototype/scene.js`, `config.js`, `environment.js`, `assets.js`,
  `characters.js`, `world.js`, `interactions.js`, `dialogue-content.js`,
  `dialogue-state.js`, `dialogue-ui.js`, `state.js`, `atmosphere.js`, `audio.js`:
  separated runtime modules and deterministic helpers.
- `tests/phaser-slice.test.js`, `scripts/qa-phaser.mjs`: logic regressions and browser QA.
- `package.json`, `package-lock.json`: pinned Phaser engine and browser-test command.
- `eslint.config.js`: Node globals for the optional QA script; existing rules retained.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`,
  `docs/ROADMAP.md`, `docs/art/PHASER-VERTICAL-SLICE.md`, and this report:
  current implementation, controls, provenance, limitations and review evidence.

No production `src/` file, existing story fixture, legacy art asset or save format changed.

## Risks and next review

This is one temporary-state encounter, not a full episode or a production state bridge.
Ukrainian editorial review, portrait expressions and dedicated pixel-art polish remain.
Audio node/control behavior is tested; subjective listening and mix quality are unverified.
Other browser engines, actual tablet hardware and a full screen-reader audit are unverified.
Remote CI is not inferred from local checks; these commits have not been merged or deployed.

Next priorities: (1) human Ukrainian narrative and art review; (2) improved expressions,
sprites and audio mixing; (3) broader hardware/accessibility QA before proposing an
explicitly approved production narrative bridge.

# Finale browser matrix — 30 October 2026

The new `scripts/qa-finale-matrix.mjs` runs twelve combinations of the case closure, Saturday plans, and cinema archive through the actual Vite-served dialogue modules. Each choice is checked for availability and save/restore integrity. The matrix verifies mutually exclusive flags, the three independent closing afterwords, and their epilogue callbacks without inventing manuscript authorship or consent.

Two opposite outcomes are then replayed through the actual Phaser dialogue UI on desktop (1280×900) and mobile (390×844). The runner pages through visible choices (maximum four at once), closes the gathering, reloads, advances to the season ending, and checks the saved callbacks. It saves two screenshots and JSON evidence; CI uploads the evidence as `finale-matrix-browser-qa`.

Run with Vite on port 5173 and Playwright installed: `npm run dev -- --host 127.0.0.1` then `node scripts/qa-finale-matrix.mjs`. CI invokes the runner in its `Browser QA / finale` matrix job. This is an automated regression check, not a substitute for manual reading, accessibility, or localization review.

## Compact optional conversations — 2 November 2026

Two optional finale scenes previously exposed nine authored choices at once:
`after-case-tea` and `bookshop-tomorrow`. They now start with four choices:
three small, contextual groups and one direct quiet/defer action. Each group
contains two or three original activities plus a return action, so no ordinary
conversation node has more than four simultaneously compatible options.
The large `gathering` catalogue remains separately paginated by the UI.

The original activity IDs, destination scenes, consequence flags and season
epilogues are unchanged. Group returns use `suspend: true` and
`repeatability: 'repeatable'`: backing out does not silently complete the
parent conversation or erase the player's choices. The sealed-letter scene
still authors five conditional alternatives, but its consent and breach
conditions prevent more than four from being visible together.

Regression coverage includes `tests/finale-compact-hub-navigation.test.ts`,
the original tea/tomorrow branch and save tests, and the Phaser choice flow.
Run `npm run check` and `npm run test:browser:v5` after installing
dependencies; review the phone dialogue layout at 390 × 844 as well as the
desktop layout. These commands are verification instructions, not a claim
that the current commit passed CI.

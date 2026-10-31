# Finale browser matrix — 30 October 2026

The new `scripts/qa-finale-matrix.mjs` runs twelve combinations of the case closure, Saturday plans, and cinema archive through the actual Vite-served dialogue modules. Each choice is checked for availability and save/restore integrity. The matrix verifies mutually exclusive flags, the three independent closing afterwords, and their epilogue callbacks without inventing manuscript authorship or consent.

Two opposite outcomes are then replayed through the actual Phaser dialogue UI on desktop (1280×900) and mobile (390×844). The runner pages through visible choices (maximum four at once), closes the gathering, reloads, advances to the season ending, and checks the saved callbacks. It saves two screenshots and JSON evidence; CI uploads the evidence as `finale-matrix-browser-qa`.

Run with Vite on port 5173 and Playwright installed: `npm run dev -- --host 127.0.0.1` then `node scripts/qa-finale-matrix.mjs`. CI invokes the runner in its `Browser QA / finale` matrix job. This is an automated regression check, not a substitute for manual reading, accessibility, or localization review.

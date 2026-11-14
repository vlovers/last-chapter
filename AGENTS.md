# AI Agent Working Agreement

## Purpose

Last Chapter is a Ukrainian-language pixel-art browser game about running a small-town bookshop. The five-day Living Story is integrated into `main`; v0.2 release acceptance remains open in issue #42. Quality of dialogue, believable people and coherent story matter more than feature count. Playtime has not been measured.

## Code ownership and architecture

- `src/game/`: pure deterministic narrative simulation and state transitions; never import DOM or persistence.
- `src/content/`: authored scenes, character and book data; mark unfinished prose as fixtures.
- `src/phaser/`: browser adapters, panels, conversation controllers and save recovery.
- `phaser-prototype/main.js`: canonical `/` entry; `/phaser-prototype/` remains the isolated encounter.
- `public/phaser-prototype/`: shared Phaser runtime; `phaser-prototype/style.css`: active styling.
- `src/main.ts`, `src/styles/`: retained earlier DOM spike, outside the current Vite entries.
- `public/art/`, `public/assets/`: artwork with documented rights and provenance.
- `tests/`: regression fixtures for knowledge, trust, event order and branching.
- `docs/`: current design, decisions, development and roadmap.

## Commands

Use Node 22.13+ within Node 22 (see `.nvmrc`), or Node 24, and npm. `npm ci`, `npm run dev`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check`. Browser runners and prerequisites are listed in `docs/TESTING.md`. Do not claim success if verification was not run.

## Narrative invariants

1. Rumor, observation and confirmed truth are distinct.
2. NPC dialogue reflects only what the NPC can plausibly know.
3. Player choices must not retroactively rewrite objective facts.
4. Confidentiality, consent, character autonomy and realistic consequences guide sensitive stories.
5. Avoid padding dialogue merely to hit the target runtime.
6. A choice's consequences require narrative review and deterministic tests.
7. **Ukrainian-only game**: all player-facing text must be authored in natural Ukrainian (uk-UA). English is allowed in internal code/docs only. Follow `docs/LOCALIZATION.md`.

## Security and collaboration

Never add credentials, unlicensed artwork, private personal details or real-world allegations. Validate all imported prose at trust boundaries; render dynamic text safely. Inspect current repo and open PRs before modifying shared files; use separate worktrees when an existing checkout contains unfinished work. Each PR includes task or issue, scope, acceptance criteria, tests, risks, and doc updates. Do not modify unrelated repositories. Preserve historical narrative, QA evidence and branches with unique unmerged work. Do not merge, force-push, deploy, publish, delete or change security settings without human approval. Approval already given for a specific task applies within that scope; branch protections and required reviews still apply. Never weaken failed checks to pass CI.

## Definition of Done

Coherent reviewed behavior, tests covering important paths, local quality gate run, docs reflecting actual state, risks explained, PR ready for human review. Mark unverified items explicitly.

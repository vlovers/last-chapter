# AI Agent Working Agreement

## Purpose
Last Chapter is an early-stage cozy pixel-art browser game about running a small-town bookshop, speaking with customers and making consequential choices about sensitive information. Quality of dialogue, believable people and coherent story matter more than feature count. The ~40-minute episode is **not yet implemented**.

## Code ownership and architecture
- `src/game/`: pure deterministic narrative simulation and state transitions; never import DOM or persistence.
- `src/content/`: authored scenes, character and book data; mark unfinished prose as fixtures.
- `src/styles/`: visual styling; pixel assets must have documented rights and provenance.
- `src/main.ts`: disposable browser interaction spike.
- `tests/`: regression fixtures for knowledge, trust, event order and branching.
- `docs/`: current design, decisions, development and roadmap.

## Commands
Use Node 22 and npm. `npm install` (temporary until lockfile), `npm run dev`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check`. Do not claim success if verification was not run. Next mandatory tooling task: generate and commit a compatible lockfile, then switch installs to `npm ci`.

## Narrative invariants
1. Rumor, observation and confirmed truth are distinct.
2. NPC dialogue reflects only what the NPC can plausibly know.
3. Player choices must not retroactively rewrite objective facts.
4. Confidentiality, consent, character autonomy and realistic consequences guide sensitive stories.
5. Avoid padding dialogue merely to hit the target runtime.
6. A choice's consequences require narrative review and deterministic tests.
7. EN/UK language support is planned, but not implemented; no fake translation claims.

## Security and collaboration
Never add credentials, unlicensed artwork, private personal details or real-world allegations. Validate all imported prose at trust boundaries; render dynamic text safely. Inspect current repo and open PRs before modifying shared files; use separate branches/worktrees for parallel agents. Each PR includes issue, scope, acceptance criteria, tests, risks, and doc updates. Do not modify unrelated repositories. Do not merge, force-push, deploy, publish, delete or change security settings without human approval. Never weaken failed checks to pass CI.

## Definition of Done
Coherent reviewed behavior, tests covering important paths, local quality gate run, docs reflecting actual state, risks explained, PR ready for human review. Mark unverified items explicitly.

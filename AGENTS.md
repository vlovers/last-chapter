# AI Agent Working Agreement

## Purpose

Last Chapter is an early-stage cozy pixel-art browser game about running a small-town bookshop, speaking with customers and making consequential choices about sensitive information. Quality of dialogue, believable people and coherent story matter more than feature count. The five-day Living Story implementation is integrated in `main` through PR #41. A public v0.2 release and its actual playtime are **not verified**; see issue #42.

## Code ownership and architecture

- `src/game/`: pure deterministic narrative simulation and state transitions; never import DOM or persistence.
- `src/content/`: authored scenes, character and book data; mark unfinished prose as fixtures.
- `src/styles/`: visual styling; pixel assets must have documented rights and provenance.
- `src/phaser/`: current Phaser runtime, UI, journal, save integration and staged character actions; preserve browser/mobile behavior and deterministic state.
- `tests/`: regression fixtures for knowledge, trust, event order and branching.
- `docs/`: current design, decisions, development and roadmap.

## Commands

Use the Node version pinned in `.nvmrc` and npm. `npm ci`, `npm run dev`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check`. Do not claim success if verification was not run.

## Narrative invariants

1. Rumor, observation and confirmed truth are distinct.
2. NPC dialogue reflects only what the NPC can plausibly know.
3. Player choices must not retroactively rewrite objective facts.
4. Confidentiality, consent, character autonomy and realistic consequences guide sensitive stories.
5. Avoid padding dialogue merely to hit the target runtime.
6. A choice's consequences require narrative review and deterministic tests.
7. **Ukrainian-only game**: all player-facing text must be authored in natural Ukrainian (uk-UA). English is allowed in internal code/docs only. Follow `docs/LOCALIZATION.md`.

## Security and collaboration

Never add credentials, unlicensed artwork, private personal details or real-world allegations. Validate all imported prose at trust boundaries; render dynamic text safely. Inspect current repo and open PRs before modifying shared files; use separate branches/worktrees for parallel agents. Each PR includes issue, scope, acceptance criteria, tests, risks, and doc updates. Do not modify unrelated repositories. Do not merge, force-push, deploy, publish, delete or change security settings without human approval. Never weaken failed checks to pass CI.

## Review and release evidence

Use [independent review policy](docs/engineering/REVIEW_POLICY.md) for base-to-head SHA reviews and [release checklist](docs/engineering/RELEASE_CHECKLIST.md) for the current v0.2 acceptance gates. PR #41's passing PR-head CI does not prove the latest `main` or a release tag passed. Track physical-device QA, Ukrainian editorial acceptance, playtime and license checks in [issue #42](https://github.com/vlovers/last-chapter/issues/42). Do not publish without explicit approval.

## Definition of Done

Coherent reviewed behavior, tests covering important paths, local quality gate run, docs reflecting actual state, risks explained, PR ready for human review. Mark unverified items explicitly.

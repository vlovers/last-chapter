# Claude Code guidance — Last Chapter

Follow [AGENTS.md](AGENTS.md) as the canonical working agreement. Read the [README](README.md), current architecture/security documentation and relevant issue before changing code.

## Current project scope

The canonical Phaser game includes the five-day Living Story integrated through PR #41. Implementation is **not** the same as public v0.2 release acceptance. Verify the active branch and check [release issue #42](https://github.com/vlovers/last-chapter/issues/42) before making readiness claims.

## Delivery workflow

1. Inspect the latest `main`, overlapping pull requests, open issues and actual GitHub Actions results.
2. Plan one cohesive, independently reviewable change. Preserve unique scenes, provenance and QA artifacts from older branches.
3. Implement with deterministic narrative tests and affected browser/mobile/save checks. Run the documented quality gate where execution is available.
4. Report the exact commit SHA, tests actually run, failed or skipped checks and remaining acceptance risks. Never infer success from missing status contexts.
5. Obtain independent review and maintainer approval before merge, tagging or deployment.

For concurrent agents, follow the [multi-agent workflow](docs/engineering/MULTI_AGENT_WORKFLOW.md) and [review policy](docs/engineering/REVIEW_POLICY.md). Keep separate worktrees; avoid unnecessary commits, CI reruns, redundant PRs and destructive cleanup.

Do not override the security, data-handling, merge, release or deployment restrictions in [AGENTS.md](AGENTS.md). The game must preserve natural Ukrainian player-facing text, character-knowledge boundaries, save safety, keyboard access and mobile usability.

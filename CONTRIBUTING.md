# Contributing

Target `main` through a scoped feature, fix or maintenance branch. Use the existing task or issue; create a new issue only when requested or needed to track separate work. Work lifecycle: **Scope → implementation → tests → PR → CI → review → authorized merge → closure**.

Prefer substantial reviewable scopes, not dozens of trivial PRs. Coordinate simultaneous agents through issues and separate worktrees; check current branches before touching shared files. Include acceptance criteria, actual command results, UI screenshots where useful, story continuity changes and risks in PR descriptions. Run `npm run check`. Do not merge solely because CI passes.

Use Node 22.13+ within Node 22, or Node 24, and `npm ci`. Run focused existing tests while editing, then the full quality gate and relevant browser suites described in [Testing](docs/TESTING.md). Keep the lockfile consistent; avoid unrelated dependency upgrades.

Preserve Ukrainian story content, node/choice IDs, save migrations and licensed artwork. Historical QA reports describe their recorded commits, not current release approval. Keep [release acceptance #42](https://github.com/vlovers/last-chapter/issues/42) open until its device, editorial, accessibility, licensing and release gates have evidence.

# Contributing

Target `main` through short-lived `feat/<issue>-<scope>` or `fix/<issue>-<scope>` branches. Work lifecycle: **Issue → scope → implementation → tests → PR → CI → review → human-approved merge → closure**.

Prefer substantial reviewable scopes, not dozens of trivial PRs. Coordinate simultaneous agents through issues and separate worktrees; check current branches before touching shared files. Include acceptance criteria, actual command results, UI screenshots where useful, story continuity changes and risks in PR descriptions. Run `npm run check`. Do not merge solely because CI passes.

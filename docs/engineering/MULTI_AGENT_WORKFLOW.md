# Parallel-agent delivery and integration

This guide applies to current `main` and its Phaser five-day Living Story. Follow [AGENTS.md](../../AGENTS.md), [review policy](REVIEW_POLICY.md) and [release acceptance checklist](RELEASE_CHECKLIST.md). An old branch or PR is **not** evidence that its code shipped.

## Before starting

1. Read the issue, latest `main` SHA, open PRs and overlapping branch changes. Confirm which code is actually present in the target branch.
2. Assign one integrator for shared runtime, save schema, flag registry, journal, endings and character knowledge. Divide work by coherent scene/route or isolated subsystem, not by tiny commits.
3. Record each contributor's target base SHA, owned files/scenes, dependencies, expected outcomes and test plan. Use separate branches/worktrees; never reset, clean or force-push another agent's work.

## Delivery contract

- A batch must be playable or independently testable: authored Ukrainian dialogue, meaningful choices, flags, downstream consequences and matching regression coverage.
- Respect four-choice maximum, stable dialogue layout, responsive safe areas, staged character/Frank actions and deterministic time/weather and saves.
- Distinguish observed facts from theories, enforce character knowledge, consent and confidentiality, and avoid repeated completed dialogue.
- Before integration, compare against **current** `main`; cherry-pick or reimplement only unique, reviewed changes. Preserve old branches and QA artifacts until equivalence is demonstrated.
- Run `npm run check` and affected browser/narrative suites on the final candidate. Report exact SHA, successful/failed/cancelled/not-run results and environment. A PR-head green run is not proof of a later release head.

## Independent review and release

Reviewers inspect the real base-to-head diff, trace affected story routes and save compatibility, and record findings and evidence. An AI summary cannot authorize a merge. Keep review decisions on the PR and release evidence in [issue #42](https://github.com/vlovers/last-chapter/issues/42). Never merge, tag, deploy or delete work without the required human approval.

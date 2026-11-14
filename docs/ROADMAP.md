# Roadmap

## Implemented in main

- Five-day canonical Phaser game, 19 chapter/checkpoint states, branching Ukrainian conversations and composable endings.
- Three catalog orders across five original books, optional Mara conversations, journal and evidence provenance.
- Responsive paginated dialogue, keyboard/touch controls, deterministic time/weather, staged character actions and Frank interactions.
- Versioned saves, legacy migrations, restart/replay, completion ledgers and rejected-save recovery.
- Deterministic narrative/save regressions and desktop/mobile browser QA.

Living Story was integrated through [PR #41](https://github.com/vlovers/last-chapter/pull/41), commit `46bfb96`. Its historical PR-head CI passed 15/15 jobs. Later commits require their own checks; this is not a public release.

## Current milestone: v0.2 release acceptance

[Issue #42](https://github.com/vlovers/last-chapter/issues/42) is the active release checklist:

- Verify CI on the exact release/tag commit.
- Record physical iPhone/Safari and Android/Chrome playthroughs, desktop Safari/Firefox, touch, safe areas and landscape.
- Review keyboard navigation, screen-reader behavior, 200% zoom and reduced motion.
- Obtain independent Ukrainian editorial/continuity review and measured first-run/replay durations.
- Verify old, corrupt, missing, blocked and future-version saves, restart and Frank sidecars.
- Review distribution licenses/attribution; align package version, changelog and deployment instructions before release approval.

The package is still `0.1.0`. No deployment is configured. The existing large Phaser bundle advisory remains. Automated viewport tests do not establish physical-device or full accessibility acceptance.

## Open PRs — triage snapshot, 2026-11-14

| PR                                                     | Classification       | Required next step                                                                                                                                               |
| ------------------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#45](https://github.com/vlovers/last-chapter/pull/45) | Needs changes        | Preserve unique UI/environment/viewport work; latest CI failed and browser run was cancelled. Update its CSS-only description and verify mobile/visual behavior. |
| [#44](https://github.com/vlovers/last-chapter/pull/44) | Needs changes        | Preserve unique Oliver runtime/UI/tests; repair latest CI and complete browser/editorial acceptance.                                                             |
| [#43](https://github.com/vlovers/last-chapter/pull/43) | Needs changes        | Reconcile overlapping agent-doc edits after maintenance; repair formatting/CI and review unique governance tooling and historical QA.                            |
| [#28](https://github.com/vlovers/last-chapter/pull/28) | Historical reference | Preserve production QA artifacts and unique recovery/navigation assertions; do not delete its stacked base.                                                      |
| [#27](https://github.com/vlovers/last-chapter/pull/27) | Historical reference | Preserve security, PR-template and governance differences until reconciled with #43.                                                                             |
| [#21](https://github.com/vlovers/last-chapter/pull/21) | Historical reference | Retain unique authored packs and orchestration proposal; its non-main base is not canonical gameplay.                                                            |
| [#20](https://github.com/vlovers/last-chapter/pull/20) | Historical reference | Opening prose differs from #44; preserve until editorial equivalence is accepted.                                                                                |

PR [#29](https://github.com/vlovers/last-chapter/pull/29) was closed as superseded after reviewing all 15 residual changed files: its voice bible is identical, progression logic and regression coverage are present, and older dialogue/browser integration changes have independent replacements in main. Its branch is retained as historical reference.

None of the remaining heads is verified ready to merge. An empty commit-status list or absence of workflow runs is not passing CI.

## Planned after acceptance

- Reconcile historical story/design documents and unique open-PR material against the current canon.
- Expand the five-book catalog and recommendation follow-ups; 15–20 books remain a design target.
- Use editorial playtests to prioritize narrative depth, investigations and pacing.
- Extend shop routines, events and puzzles where they support the story.
- Revisit asset/animation/audio production, performance and accessibility based on device evidence.
- Evaluate iOS/Android packaging after mobile browser acceptance.

The original three-day/40-minute proposal and later 4–5-hour main-path / 7–9-hour optional-path targets are historical or aspirational. No duration is claimed as measured.

## Reference documents

[Story Bible](story/01-STORY-BIBLE.md), [architecture](ARCHITECTURE.md), [testing](TESTING.md) and [historical release evidence](release/RELEASE-CANDIDATE.md). Dated QA and migration documents retain the facts and limitations of their original commits; use #42 for current release acceptance.

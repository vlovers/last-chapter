# Roadmap

## Implemented in main

- Oliver’s optional Day 2 book conversation, with same-page resume and saved completion.
- Editorial reading surfaces and navigation, cached autumn decorations and landscape framing.
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

The candidate is `0.2.0-rc.1`; it is not a public v0.2 release. No deployment is configured. The existing large Phaser bundle advisory remains. Automated viewport tests do not establish physical-device or full accessibility acceptance.

## Consolidation and remaining source work

- #44/#20: optional Oliver dialogue and controller recovered; the original #20 story data is identical in the candidate. The integration uses the existing accessible reading panel rather than the offscreen standalone panel.
- #45: editorial colors/surfaces, cached autumn decoration, landscape framing and QA diagnostics integrated. Experimental resizing, permanent rain and synthetic pagination clicks are replaced by the stable runtime layout and real interaction checks.
- #43: release checklist, staging-interruption QA and historical production artifacts recovered. Unique governance validators, policy and multi-agent instructions remain historical proposals; they are not release blockers.
- #21 retains authored packs/orchestration that differ from the current canon; #27 retains security/governance differences; #28 retains historical navigation/recovery code and assertions. Preserve these branches until separately reconciled.

Physical-device, independent editorial, accessibility, measured playtime and owner rights decisions remain in #42. Chromium, Firefox and WebKit engine smoke does not imply physical iPhone/Safari acceptance.

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

# Roadmap — Narrative First

> Historical product decision (2026-10-24): prioritize a complete five-day narrative before
> expanding shop mechanics. The Living Story implementation has since been integrated
> through [PR #41](https://github.com/vlovers/last-chapter/pull/41); this roadmap
> distinguishes integrated implementation from **unverified release acceptance**.
> Do not interpret completed implementation as approval to publish.

## Phase 1 — Complete playable narrative (IMPLEMENTED; EDITORIAL ACCEPTANCE OPEN)

**Exit criterion:** a player can start Day 1, complete all five days, see a coherent
ending and replay materially different choices using a deliberately plain,
accessible interface. All player-facing copy is Ukrainian.

- [x] Browser-first TypeScript/Vite prototype; deterministic dialogue and state rules.
- [x] Initial book recommendations, first-day encounters, evening letter and versioned local save prototype.
- [x] First-pass five-day Story Bible, eight-character Bible, dialogue examples, state and experience principles (docs/story).
- [ ] Reconcile old narrative documents with the five-day canon; complete Mystery & Puzzle Bible.
- [x] Write and integrate full Day 1: substantial optional conversations, ethical choices, feedback and continuity. *(integrated implementation; release review remains open)*
- [x] Write and integrate Day 2: Iris returns, Anna/Thomas rumor arc and distinct conversational routes. *(integrated implementation; release review remains open)*
- [x] Write and integrate Day 3: book club, evidence chronology, counselor confidentiality. *(integrated implementation; release review remains open)*
- [x] Write and integrate Day 4: trust, letter-delivery decisions and relationship boundaries. *(integrated implementation; release review remains open)*
- [x] Write and integrate Day 5: community reading, personal resolutions and composable epilogues. *(integrated implementation; release review remains open)*
- [ ] Expand to 15–20 original fictional books with meaningful discussion and recommendation follow-ups.
- [x] Implement topic hub, natural exits, dialogue history, journal, evidence provenance, separate trust/boundary signals. *(integrated implementation; release review remains open)*
- [ ] Implement ending composition, versioned save migrations, restart/replay, skip/read-history and autosave.
- [x] Unit and scenario tests for every five-day path, unreachable scenes, continuity and no spoiler leaks. *(integrated implementation; release review remains open)*
- [ ] Ukrainian editorial pass; timed playtests targeting 4–5 hours main path, 7–9 hours with optional conversations (targets, not measured results).

**Phase 1 deliberately excludes:** production sprites, animated scenes, elaborate UI, shopping minigames, new neighborhoods, mobile store packaging, AI-generated live dialogue.

## Phase 2 — Living bookshop gameplay

**Entry:** Phase 1 narrative is playable end to end and core plot no longer depends on UI prototypes.

- [ ] Catalog and shelf navigation; meaningful book matching and order fulfillment.
- [ ] Visitor schedules, daily routines, book club preparation, events and light investigations.
- [ ] 2–3 fair puzzles with clues, hints and no irreversible softlocks.
- [ ] Balance pacing so activities support rather than interrupt deep conversations.
- [ ] Test touch controls and accessibility in a functional, unstyled web build.

## Phase 3 — Visual production and release

**Entry:** gameplay and narrative loops have passed playtests.

- [ ] Original pixel-art location, portraits, expressions, lighting, weather and animation (direction documented in `docs/art/PIXEL-ART-DIRECTION.md`; no production sprites yet).
- [ ] Music, ambience, sound controls and reduced-motion support.
- [ ] Final responsive UX and Cyrillic typography; keyboard/touch/screen reader review.
- [ ] Browser regression/performance tests, licenses and provenance.
- [ ] Web release; evaluate Capacitor iOS/Android packaging after mobile browser testing.

## Engineering quality gates (continuous, not a separate art phase)

- [x] Committed lockfile, `npm ci`, initial format/lint/typecheck/tests/build/security audit verification.
- [ ] Confirm CI on each new PR commit.
- [ ] Preserve existing files when committing to GitHub; use current branch head and base tree.
- [x] Merge Living Story implementation via PR #41 after its 15/15 PR-head CI passed (commit `46bfb96`).
- [ ] Verify the exact release/tag commit and obtain independent release acceptance in [#42](https://github.com/vlovers/last-chapter/issues/42).

## Current honest status (2026-11-08)

The canonical Phaser game in `main` contains the integrated five-day Living Story, staged character actions, responsive dialogue, save recovery, journal, Frank interactions and multiple endings. [PR #41](https://github.com/vlovers/last-chapter/pull/41) was squash-merged as [`46bfb96`](https://github.com/vlovers/last-chapter/commit/46bfb96da0fe11189d6736dd45703d5b301c5924); its [CI #2547](https://github.com/vlovers/last-chapter/actions/runs/42440820434) passed 15/15 jobs on the **PR head**, not necessarily on the latest `main` or a release tag.

**Current priority: [v0.2 release acceptance #42](https://github.com/vlovers/last-chapter/issues/42), not re-implementing the five days.** Physical iPhone/Android and Safari/Firefox checks, independent Ukrainian editorial review, accessibility, measured runtime, licensing/provenance, version alignment and deployment verification are outstanding. `package.json` still says `0.1.0`; no public v0.2 release is confirmed. The 4–5-hour main-path and 7–9-hour optional-path figures above are aspirational targets, **not measured durations**.

The older PR #5 draft-only instruction and the original V1 prototype notes below are historical. Remaining old PRs require file-level reconciliation before merge/closure; do not delete unique branches or QA evidence.

## Isolated bookshop slice V1 (2026-10-24)

A playable Phaser encounter now demonstrates a 640×360 original room, four-direction
characters, furniture collision and navigation, four contextual object inspections,
Mara's arrival and branching book-gift request, reduced motion, and gesture-gated audio.
This completes a separate technical vertical slice, not production narrative integration
or the runtime targets above. See [V1 guide](art/PHASER-VERTICAL-SLICE.md).

Next: Ukrainian narrative/art review; stronger sprite expressions and audio mix; broader
hardware/accessibility verification before considering an approved state bridge.

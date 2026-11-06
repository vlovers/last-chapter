# Roadmap — Narrative First

> Product decision (2026-10-24): finish a complete five-day **text-first playable game** before expanding interactive shop mechanics; produce final art, animation and audio only after the game systems are proven. Do not merge the draft PR without owner approval.

## Phase 1 — Complete playable narrative (CURRENT PRIORITY)

**Exit criterion:** a player can start Day 1, complete all five days, see a coherent ending and replay materially different choices using a deliberately plain, accessible interface. All player-facing copy is Ukrainian.

- [x] Browser-first TypeScript/Vite prototype; deterministic dialogue and state rules.
- [x] Initial book recommendations, first-day encounters, evening letter and versioned local save prototype.
- [x] First-pass five-day Story Bible, eight-character Bible, dialogue examples, state and experience principles (docs/story).
- [ ] Reconcile old narrative documents with the five-day canon; complete Mystery & Puzzle Bible.
- [ ] Write and integrate full Day 1: substantial optional conversations, ethical choices, feedback and continuity.
- [ ] Write and integrate Day 2: Iris returns, Anna/Thomas rumor arc and distinct conversational routes.
- [ ] Write and integrate Day 3: book club, evidence chronology, counselor confidentiality.
- [ ] Write and integrate Day 4: trust, letter-delivery decisions and relationship boundaries.
- [ ] Write and integrate Day 5: community reading, personal resolutions and composable epilogues.
- [ ] Expand to 15–20 original fictional books with meaningful discussion and recommendation follow-ups.
- [ ] Implement topic hub, natural exits, dialogue history, journal, evidence provenance, separate trust/boundary signals.
- [ ] Implement ending composition, versioned save migrations, restart/replay, skip/read-history and autosave.
- [ ] Unit and scenario tests for every five-day path, unreachable scenes, continuity and no spoiler leaks.
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
- [ ] Keep work in draft PR #5 until explicitly approved for merge.

## Current honest status

The browser now contains a **first-pass playable path through Days 1–5**, including branching conversations, a book club, letter/rumor choices and composable epilogues. This is a **short narrative prototype**, not the targeted 4–5-hour finished game. Significant dialogue expansion, continuity review, scenario coverage, playtesting and production art remain. CI has not been confirmed green for the latest branch HEAD.

## Isolated bookshop slice V1 (2026-10-24)

A playable Phaser encounter now demonstrates a 640×360 original room, four-direction
characters, furniture collision and navigation, four contextual object inspections,
Mara's arrival and branching book-gift request, reduced motion, and gesture-gated audio.
This completes a separate technical vertical slice, not production narrative integration
or the runtime targets above. See [V1 guide](art/PHASER-VERTICAL-SLICE.md).

Next: Ukrainian narrative/art review; stronger sprite expressions and audio mix; broader
hardware/accessibility verification before considering an approved state bridge.

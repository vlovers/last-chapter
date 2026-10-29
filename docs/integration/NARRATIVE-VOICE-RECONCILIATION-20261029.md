# Narrative voice reconciliation — 2026-10-29

## Branch safety

This integration branch starts at narrative-production commit `c0a0103032330028cb521ce5182eee49fbb88eba`. The existing PR #12 and its head/base branches are unchanged.

PR #12 targets `feat/dialogue-engine-mara-frank-20261025`. GitHub reports `mergeable=false` / `dirty`. The branches have diverged: narrative-production is 669 commits ahead and 10 commits behind the voice branch (relative to their merge base). **Do not use a forced update, ours/theirs blanket merge, or a synthetic merge commit that silently discards either side.**

## Ten commits to reconcile from voice branch

1. `04e20a65`: introduce the character voice bible.
2. `74525afa`: Iris dialogue.
3. `ca6fdb43`: Leo dialogue.
4. `7b55ae0a`: Eleanor dialogue.
5. `298b39b3`: Nora dialogue.
6. `a50bf990`: Thomas dialogue.
7. `6b557076`: Anna dialogue.
8. `506accae`: Mara dialogue.
9. `acb94fb3`: Iris consent test wording.
10. `63392efc`: documentation formatting.

## Conflict review surface

Dialogue files: `src/content/anna.ts`, `day-four-iris.ts`, `day-four-leo.ts`, `eleanor.ts`, `mara.ts`, `nora.ts`, `thomas.ts`.

Test file: `tests/letter-continuity.test.ts`.

Documentation: `docs/design/CANON-AUDIT-CHARACTER-LOCK-v0.1.md`, `ELEANOR-NORA-TRUST-MEMORY-ARCS-v0.1.md`, `ENSEMBLE-PAYOFFS-CONTINUITY-v0.1.md`, `IRIS-LEO-MARA-CHARACTER-ARCS-v0.1.md`, `LETTER-ETHICS-CONTINUITY-v0.1.md`, `MARA-OPTIONAL-MEMORY-CONTINUITY-v0.1.md`, `NARRATIVE-ENSEMBLE-BIBLE-v0.1.md`, `RUMOR-REPAIR-FOUR-VOICES-v0.1.md`, and new `docs/narrative/CHARACTER-VOICE-BIBLE.md`.

## Acceptance criteria

- Retain all new narrative-production routes and flags (Iris manuscript custody and permission, private ledger, letter breach, after-case tea).
- Reapply voice improvements only where they do not replace new dialogue variants or break narrative conditions.
- Preserve private information boundaries: no automatic disclosure of Eleanor's ledger, no examination after Iris refuses or after a disclosed letter breach, and no public report when Iris permits only a private examination.
- Ensure no broken dialogue destinations or >4 authored choices per node.
- Run formatting, type checking, full Vitest suite, build, and browser QA.
- Recheck GitHub branch heads immediately before integrating. Only then open a new integration PR or update PR #12 after conflict-free verification.

## Current status

**Inventory complete; reconciliation not yet performed.** This document is an integration checklist, not a claim that conflicts are resolved.

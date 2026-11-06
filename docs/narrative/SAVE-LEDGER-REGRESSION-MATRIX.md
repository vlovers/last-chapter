# Save ledger regression matrix

This note describes the save-compatibility hardening prepared on PR #36. It is not a claim that the tests or the full CI pipeline have passed.

## Runtime invariants

- A completion key refers to an authored, non-repeatable, non-suspended choice in the active stage's dialogue graph.
- Reopening facts in a completion key are an ordered subset of the choice's `reopensWhen` list and must be present in the saved monotonic world facts.
- A pending key belongs to the originating dialogue node and cannot also be completed.
- Every ledger key is canonical JSON emitted by the engine; alternate whitespace or escape spellings cannot silently bypass completed-topic matching.
- A save's stage and current dialogue node must resolve in the authored graph, with the historical Day 3 compatibility fallback preserved.
- History-only saves continue to load without inventing completion ledgers; the runtime reconstructs progress when needed.
- Save encoding must produce payloads accepted by the decoder, without silently dropping active progress.

## Regression coverage

The `tests/save-ledger-integrity.test.ts` suite contains 28 scenarios covering valid authored completion keys, in-flight topics, repeatable/suspended options, malformed and noncanonical ledger keys, duplicate and inconsistent pending/completed entries, invalid flags and stage/node/version fields, legacy history-only saves, and repeated serialization of real dialogue-engine progress.

These tests are additive to the existing narrative and save-recovery suites. They do not replace full five-day browser QA.

## Integration boundaries

- PR #33 contributes authored narrative content and reachability audit changes.
- PR #36 builds on PR #33 and adds continuity, save, and integration regressions.
- PR #35 changes Phaser/UI code and the browser QA workflow, with no overlapping changed filenames against PR #33 or PR #36 at the time of this audit.
- No overlapping filenames does **not** prove behavioral compatibility. Verify choice visibility, text variants, journal state, in-flight save recovery, and Day 5 completion after integrating UI and narrative changes.

## Release gate

1. Run `npm ci` and `npm run format` on the integration branch, then review the resulting formatting-only diff.
2. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
3. Run browser QA, including mobile, save recovery, and the five-day/finale journeys.
4. Resolve integration conflicts against the selected PR heads without touching the user's unfinished local merge.
5. Publish one consolidated branch update after verification; avoid repeated CI reruns and empty commits.

At the time of writing, the published PR #36 quality job fails at Prettier on nine pre-existing changed files, before lint, typecheck, unit tests, or build. This is a known blocker, not a test pass.

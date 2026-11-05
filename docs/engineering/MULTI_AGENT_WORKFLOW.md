# Multi-agent narrative and code delivery — Last Chapter

This working agreement governs concurrent AI-assisted development of Last Chapter. Read the actual target branch and its `AGENTS.md` if present, the story canon, architecture and localization specifications before editing. The main branch may lag active narrative and gameplay branches; **never assume a feature exists in main based on a Draft PR, a design note or an agent claim**.

## Deliver cohesive story and playable outcomes

A batch should deliver a complete, playable narrative or engineering slice with its scene/dialogue content, player choices, state consequences, deterministic tests, UI/browser evidence and documentation. Prefer a logically complete multi-scene package over dozens of tiny PRs. Do not inflate dialogue or add unrelated scenes to manufacture batch size.

Each batch must identify the parent GitHub Issue, owner, target branch and base SHA, intended days/scenes/characters, canon dependencies, owned data/code paths, explicit acceptance criteria, test/QA plan, independent reviewer, and merge/release boundary.

## Collaborative roles

| Role | Responsible for |
| --- | --- |
| Narrative lead | Maintain canon and story dependency map; approve character voice, motivations, knowledge state and continuity findings |
| Implementer | Own a dedicated branch/worktree; produce a full scene/code/tests/docs batch |
| Integrator | Own shared scene registry, story flags, save-schema and event/branch wiring; sequence dependent PRs |
| Independent reviewer | Evaluate the actual diff and run through choice/consequence/continuity paths, not just prose excerpts |
| QA agent | Reproduce deterministic story-state tests and browser playthrough on exact head SHA |
| Maintainer | Decide acceptance, merge, deployment, release and any exceptional rights/privacy questions |

The author must not act as independent reviewer for their own batch. AI review is advisory and cannot substitute for required GitHub approval.

## Ownership map and dependency order

- **Canon and character voices:** assign one story lead for shared facts, timelines, secrets, character knowledge and relationships. Parallel writers can own *non-overlapping* scenes only after shared canon is frozen for the batch.
- **Story data** (`src/content/`): each writer owns named days/scenes/character arcs. Avoid parallel edits of the same scene registry, localization keys or canonical dialogue file.
- **Narrative state** (`src/game/`): a single integrator owns shared flags, state machine, event ordering, saves and migration compatibility. Writers specify desired effects in a contract before implementation.
- **UI and accessibility** (`src/styles/`, browser components): coordinate choice presentation, dialogue pacing, keyboard/mobile behavior and text overflow with the state integrator.
- **Tests** (`tests/`, browser QA): regression coverage may be developed in parallel after stable interfaces; one test owner coordinates shared fixtures and snapshots.
- **Media/licensing:** do not import unlicensed art, audio or copied narrative; track source/provenance and distribution rights.

Actual path layouts vary by branch. Inspect the checkout first; this map documents responsibilities, not a claim that every path exists on `main`.

### Execution sequence

1. Inventory open PRs and branch lineage; record where the currently playable game lives. Do not start new versions of an already-active arc.
2. Produce a batch story contract: who knows what, what each choice changes, when those effects appear, and what is irreversible. Explicitly separate rumor, observation and confirmed fact.
3. Plan a dependency graph. Serialize canon, shared state/save schema and scene registry edits; parallelize independent character-scene writing and UI/test tasks **only after contracts exist**.
4. Reserve a branch/worktree and scene/path scope in the parent Issue. Claims are advisory, not enforced file locks.
5. Implement complete scenes with **player lines as well as NPC lines**, distinctive character voices, believable emotional progression, meaningful agency and consequences; avoid generic repetitive dialogue.
6. Verify deterministic tests for knowledge boundaries, trust/flags, branch ordering, saves/loads and unreachable/contradictory options. Use actual scripts from the target branch: commonly Node.js 22 and `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check`, plus browser QA when available.
7. Independent reviewer checks changed canon/state and the **real base-to-head diff**, then a manual playthrough of the affected days and branches. Fix findings inside the PR; re-review material changes.
8. Integrate dependent PRs in order; preserve other agents' work, rerun tests after rebase/merge, and keep authoring states distinct from accepted/published content.
9. Handoff exact head SHA, test results, browser evidence, scene/choice map, unresolved plot contradictions, asset provenance and next owner. No merge/deploy without maintainer authorization.

## Required narrative invariants

- Player-facing prose is natural **Ukrainian (uk-UA)**; do not substitute machine-translated placeholder dialogue.
- NPCs know only information plausibly disclosed to them. Rumor, observation and confirmed truth are distinct; choices cannot retroactively change objective facts.
- Consequences must be reflected in later dialogue, flags, relationships and endings—not merely in a selection toast.
- Respect consent, privacy, plausible autonomy and nuanced characterization; do not introduce protected third-party fictional dialogue.
- Storyline changes require dedicated deterministic regressions and browser playthroughs as applicable, including save/reload when the persistence contract changes.
- Do not claim an unmerged story pack, an unfinished 40-minute episode or a mocked playthrough is production-complete.

## Tracking and recovery

Use a parent Issue as the shared evidence ledger:

| Batch / arc | Owner | Base + PR | Depends on | Reserved scenes/contracts | Status | Head SHA | Review and QA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Day 1–2 character reactions (example) | Writer A | PR #... | shared knowledge flags | Anna scenes | in review | exact SHA | story reviewer, browser link |
| Finale outcome integration (example) | Integrator B | PR #... | Day 1–5 branches | ending flags/save | blocked | — | prerequisite |

Statuses: planned, claimed, in progress, blocked, in review, changes requested, verified, accepted, integrated and released. A green CI run does not prove a narrative is fun, coherent or finished.

On conflicting edits, **stop** and preserve both branches. The integrator resolves flag/save/registry collisions before new writing proceeds. After interrupted runs, inspect actual worktree status, head SHA, PR state and test artifacts before resuming; do not blindly replay writes. A changed head needs fresh evidence and re-review where material. Do not force-push another agent's branch.

## PR handoff contract

```markdown
Parent Issue / batch:
Owner, narrative reviewer, integrator:
Target branch, base/head SHA, PR link:
Scenes / characters / choices changed:
Canon and character knowledge constraints:
Flags, trust, save schema and endings affected:
Player-response coverage and consequence map:
Actual commands, results, CI and browser/playthrough evidence:
Regression cases + paths not tested:
Localization and asset provenance:
Independent review findings and remaining blockers:
Next owner / maintainer approval needed:
```

This document defines coordination and acceptance evidence, not automated agent scheduling or release authority.

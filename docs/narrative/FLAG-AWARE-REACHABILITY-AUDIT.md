# Flag-aware narrative reachability: implementation contract

## Problem

`validateDialogue` currently checks graph reachability while ignoring `requires`, `unless` and `grants`. This is useful as a structural check, but it cannot prove that a scene is playable.

## Rules

- Preserve the existing `validateDialogue(story)` API and its structural diagnostics.
- Add a separate, opt-in analyzer; do not change save serialization, dialogue IDs, or the runtime choice rules.
- Traverse states `(nodeId, setOfFlags)`, beginning at `story.start` and the caller-supplied initial facts.
- An option is enabled only when every `requires` flag is present and no `unless` flag is present. Apply `grants` when entering its destination.
- Track **reachable nodes**, **reachable edges** and **unreachable edges** separately. A node reached by one path does not imply that all its choices are possible.
- Support facts from other stories via a caller-supplied initial flag set. Never label an externally gated branch impossible solely because the local story cannot grant its prerequisites.
- Cap explored states, return a `truncated` indicator and never claim completeness after hitting the cap. Keep the analysis deterministic.
- Treat `repeatability`, `suspend`, `reopensWhen` and completed-option ledgers as a separate second-stage analysis: the initial pass is a _flag-feasibility_ check, not a proof of complete runtime playability.
- Report contradictory `requires`/`unless` options as definite errors; report ungranted prerequisites as _potentially external_ rather than definite unreachable branches.

## Required tests

1. `start -> A` grants `seen`; `A -> B` requires `seen`: B is reachable.
2. `start -> B` requires `seen`, no local grant: B is unavailable with empty initial flags but available with `['seen']`.
3. An option requiring and excluding the same flag is impossible.
4. Two branches grant different flags; a later option requiring both must be reachable only if a route can accumulate both.
5. A loop that revisits the same node with additional facts must be explored; a loop with identical facts must terminate.
6. Distinct options pointing to the same node are reported as distinct edges.
7. State cap produces `truncated: true` and suppresses claims of complete coverage.
8. Existing `validateDialogue` diagnostics remain unchanged.

## Narrative acceptance routes

- Anna -> Thomas: distinguish an apology from an attempt to repair the relationship by buying chairs; neither should force reconciliation.
- Iris -> Leo -> Mara: no disclosure of the private letter merely from seeing the envelope; respectful and pressuring choices must lead to different callbacks.
- Eleanor -> final gathering: booking and closure records are facts; whether Leo received a call remains unknown.
- Mara day four: Station, Roads and Letters book choices must retain distinct dialogue on return visits.

## Completion gate

Run `npm run check` and the browser QA suites relevant to the changed routes. Record commands and their real exit status in the PR. Do not mark the narrative audit complete from structural validation alone.

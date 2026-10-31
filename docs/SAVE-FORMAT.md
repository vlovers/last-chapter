# Local save format — v1

The short browser prototype can persist the current narrative scene and accumulated flags in browser `localStorage`, using the namespaced key `last-chapter:save:v1`. The serialization module is pure and has no browser dependency.

This is a **temporary prototype save**, not a production-ready secure save system. It is client-controlled and must not be treated as trusted evidence of narrative truth. `decodeSave` checks version, basic shape, size and scene existence. It does **not** verify whether a scene was reached by a valid series of choices, nor reconstruct all past state from an event log. Do not use it for multiplayer, commerce or anti-cheat.

A later production save should include a deterministic event history, migration tests, story content version and recovery UX for incompatible saves. No account or cloud storage is needed for this game.

## Gameplay polish V1 completion ledger

The existing v1 key and version remain valid. Saves may additionally contain
`completed: string[]` and `pending: { hub: string; key: string }[]`. Each key is a
JSON tuple of the source node, choice ID and the active `reopensWhen` facts.
Selecting a choice starts a pending route. Returning to that source node or
reaching a terminal completes it. Completed choices disappear; `repeatability:
'repeatable'` opts reusable actions out. A `suspend` return cancels the pending
route without completing it, preserving deferred letter decisions.

Old saves without a ledger reconstruct completion lazily from their existing
choice history. No flags, inventory, decisions, day checkpoints or save keys are
reset. Each stage has its own graph and ledger; day transitions retain the
existing story facts. Bounds and basic structure are checked at the save boundary.
As before, this is client-controlled progress, not a tamper-proof event log.

A save with a completion ledger must include both `completed` and `pending`.
The decoder rejects an orphan `pending` array, empty completion or pending
keys, and repeated `(hub, key)` pending pairs instead of silently dropping or
replaying ambiguous topic progress. Distinct pending topics in the same hub
remain valid. Legacy saves with neither ledger field are still supported.
Save/load regression tests cover all 20 chapter stages, including the optional
quiet evening and completed checkpoints.

Ledger entries are validated before a story graph is opened: completion keys
must be nonempty strings of at most 1,000 characters, pending hubs must be
nonempty strings of at most 120 characters, and pending keys have the same
1,000-character limit. Duplicate completion entries and malformed pending
records are rejected. At most 8,192 completed entries and 1,024 pending
entries can be restored; larger saves are treated as invalid. These limits
prevent corrupted browser storage from being mistaken for playable progress.

The four optional Mara sessions keep their existing storage keys. Their ledgers
track completed return loops; only an actual exit finishes the topic. Explicit
“later” choices now suspend at the current node. Completed sessions are removed
from the available topic selector. Legacy sessions with `finished: true` remain
finished: the old format did not record which exit was chosen, so recovering an
old interruption cannot be inferred reliably. Starting a new season explicitly
resets optional sessions as well as the main story. Ordinary reloads do neither.

Frank's position and ambient timer are deliberately transient. Reloading restores
narrative progress and starts him at his valid favorite location. His `met_frank`
fact remains persistent. Existing `clue_bookmark` discoveries remain readable;
new bookmarks come from exploring the window display, independently of the cat.

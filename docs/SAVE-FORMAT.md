# Local save format — v1

The short browser prototype can persist the current narrative scene and accumulated flags in browser `localStorage`, using the namespaced key `last-chapter:save:v1`. The serialization module is pure and has no browser dependency.

This is a **temporary prototype save**, not a production-ready secure save system. It is client-controlled and must not be treated as trusted evidence of narrative truth. `decodeSave` checks version, basic shape, size and scene existence. It does **not** verify whether a scene was reached by a valid series of choices, nor reconstruct all past state from an event log. Do not use it for multiplayer, commerce or anti-cheat.

A later production save should include a deterministic event history, migration tests, story content version and recovery UX for incompatible saves. No account or cloud storage is needed for this game.

## Five-day production pass

The v1 format and all existing dialogue node/option IDs remain compatible.
Fresh games now save their opening state immediately, anchoring optional notes
and Mara sessions before the first choice. If the narrative save is missing or
invalid, orphan recommendations, optional conversations and notes start fresh;
a valid narrative save retains them. Explicit restart clears them as well.

Finale categories and choice pages are presentation state. `FiveDayStory.open()`
returns the complete canonical choices; `present()` applies the grouped and paged
UI. Navigation does not grant flags, complete topics or write the narrative save.
Reloading inside a conversation restores the authored node and completion ledger;
reopening the gathering starts from its category overview.

Manuscript observations, interpretations, privacy agreements and final custody
use separate flags. A returned page and an archived page are mutually exclusive
outcomes on reachable paths. Journal copy distinguishes physical observations
from Iris's testimony and the player's window interpretation.

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

# Local save format — v1

The short browser prototype can persist the current narrative scene and accumulated flags in browser `localStorage`, using the namespaced key `last-chapter:save:v1`. The serialization module is pure and has no browser dependency.

This is a **temporary prototype save**, not a production-ready secure save system. It is client-controlled and must not be treated as trusted evidence of narrative truth. `decodeSave` checks version, basic shape, size and scene existence. It does **not** verify whether a scene was reached by a valid series of choices, nor reconstruct all past state from an event log. Do not use it for multiplayer, commerce or anti-cheat.

A later production save should include a deterministic event history, migration tests, story content version and recovery UX for incompatible saves. No account or cloud storage is needed for this game.

# Day 4 save integrity — regression fix

Earlier prototype compatibility code attempted to guess which Day 4 encounters a player had completed by checking optional Iris, Mara, and Leo dialogue flags. This is not reliable: a player can finish a conversation without selecting a flag-granting choice. The heuristic could silently rewind a genuinely completed chapter, breaking save round-trips and the full-season playthrough test.

The decoder now **preserves the saved Day 4 completion checkpoint** without inferring scene provenance. Old ambiguous prototype checkpoints remain completed rather than being automatically replayed. A future explicit versioned migration may be introduced only if a trustworthy stage marker is available.

Regression tests cover completed Day 4 with Iris-only, Mara, Leo, and no optional flags. The full-season save-and-resume test remains the end-to-end guardrail.

CI failure observed on commit `e700137`: formatting and typechecking succeeded, tests failed, build skipped. This fix addresses a likely cause; re-run CI to verify.

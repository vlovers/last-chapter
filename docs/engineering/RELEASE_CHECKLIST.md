# Release checklist — Last Chapter

This is an evidence checklist, not automatic release approval. Do not confuse code in a feature branch, a Draft PR, a merged implementation, an accepted playable build and a published game.

- [ ] Confirm the exact target branch, release candidate head SHA and complete dependent narrative/engineering PR ancestry.
- [ ] Reconcile the **richer** agent/gameplay policy on the active implementation branch; never replace it with a shorter governance template.
- [ ] Verify that shipped scenes, characters, day progression and endings are present in the candidate checkout, not merely described in Draft PRs.
- [ ] Run supported formatting, lint, typecheck, tests and build on the candidate SHA. Report failures and unavailable commands explicitly; the early bootstrap main may not contain a complete playable game.
- [ ] Run targeted deterministic tests for knowledge, trust, player choices, save/load, migrations and narrative branch order.
- [ ] Complete an independent manual browser playthrough across affected day paths; capture actual browser/build/environment evidence.
- [ ] Review natural UKR player text, accessibility, responsive layout, dialogue flow, choice counts and broken/stale options.
- [ ] Review third-party images, music, fonts and assets for licensed use, distribution permissions and credits.
- [ ] Confirm no secrets/private data/unsafe imported text and record outstanding security findings and rollback plan.
- [ ] Obtain an independent reviewer of the real final diff and a separate maintainer decision for merge/deploy.
- [ ] Verify the real deployed origin only **after** authorized deployment; record tested build SHA and the exact result.

Unrun checks must remain "NOT RUN"; passing tests do not certify narrative or production quality. See [independent review policy](REVIEW_POLICY.md) and [multi-agent workflow](MULTI_AGENT_WORKFLOW.md).

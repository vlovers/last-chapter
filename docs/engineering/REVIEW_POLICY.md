# Independent review policy — Last Chapter

Every submitted batch requires a reviewer other than its author to inspect the **actual base-to-head diff**, not only the agent's summary. AI reviewers may report useful findings but do not grant authorized GitHub approval. Reviews are pinned to the head SHA and must be refreshed after material revisions.

## Review coverage

- **Narrative continuity:** check rumor versus observation versus confirmed truth; character knowledge, consent, autonomy and motivations must remain plausible.
- **Player agency:** trace the selected option to immediate flags, future dialogue, day transitions, trust effects and endings. Do not accept cosmetic-only consequences as substantive decisions.
- **Save compatibility:** cover start, continue, reload, event ordering, old saves and interruption recovery when affected.
- **Language and accessibility:** check natural Ukrainian player-facing prose, keyboard focus, small screens, text overflow, dialogue pacing and reduced motion when relevant.
- **Security and media:** reject unsafe HTML/prose injection, personal data leakage, unlicensed assets or unattributed third-party media.
- **Tests:** require deterministic regressions for changed flags and branches, and a relevant manual playthrough or an explicit "NOT RUN" with the corresponding blocker.

Record reviewer identity, source branch/base/head SHA, scene IDs, affected days, tested choice paths, findings with severity, concrete reproduction and disposition. Block acceptance on unresolved correctness, safety and high-risk narrative contradictions. CI green is necessary where required but is not sufficient to prove story quality.

The integrator owns reconciling conflicting author branches; never discard another author's work without an explicit decision. Only a maintainer can authorize merge, deployment or publication. This policy supplements [the multi-agent workflow](MULTI_AGENT_WORKFLOW.md).

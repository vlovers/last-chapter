# Independent review policy — Last Chapter

A submitted PR must be reviewed against its **actual base-to-head diff**, not an agent summary. Review findings are bound to the reviewed head SHA and must be revisited after material changes. An AI review can surface findings but is not a substitute for authorized human approval. Follow [AGENTS.md](../../AGENTS.md) and track v0.2 release acceptance in [issue #42](https://github.com/vlovers/last-chapter/issues/42).

## Required review dimensions

- **Narrative continuity:** separate rumor, direct observation and confirmed fact; enforce character knowledge, consent, privacy, autonomy and consequences.
- **Player agency:** trace options through flags, topic completion, later scenes, trust changes, five-day transitions and endings; reject misleading cosmetic-only outcomes.
- **Persistence:** check reload, corrupt/missing and old saves, protected future saves, storage denial, journal and Frank sidecars when affected.
- **Interaction:** verify mobile safe areas, fixed dialogue layout, at most four visible responses, `#story-continue`, keyboard focus, readable Ukrainian copy and reduced motion.
- **Assets and security:** reject unlicensed media, leaked secrets, unsafe imported prose/HTML and unreviewed tracking or hosted services.
- **Verification:** require deterministic regression tests and relevant browser/playthrough evidence. Distinguish passed, failed, cancelled and **NOT RUN** checks on the exact SHA.

Record reviewer, base/head SHA, affected scene IDs and days, routes tested, environment, findings with severity, reproduction, owner and disposition. Block merge/release for unresolved correctness, security and serious continuity defects. Preserve unique work in concurrent branches and avoid wholesale merging stale PRs. Only an authorized maintainer decides whether to merge, tag or deploy.

# Narrative direction

**Premise:** Bellwick is a small town. You open a bookshop where neighbors ask for reading recommendations, conversation and sometimes discretion. Rumors about relationships, secrets, family histories and affections spread along the town's social ties. Player decisions can help others, strain trust or produce misunderstood consequences.

**Pillars**

1. People before puzzles; important visitors have agency, recognizable voice and goals beyond their purchase.
2. Listening is optional but valuable; topics may be gated by past interactions and willingness to share.
3. Separate objective reality, observations, rumors, beliefs, speaker credibility and provenance.
4. Books are integral to conversations and choices, not decorative multiple-choice questions.
5. There is no universally rewarded practice of revealing someone's private information.
6. Stories intersect: the consequences of one disclosure affect later scenes.
7. At new-game initialization, authored facts/variants may vary, but not retroactively to make a player guess correct.

**Implemented:** the canonical game in `main` spans five days, with eight principal encounters, optional conversations, book recommendations, letter/rumor investigations and composable endings. The catalog currently contains five original books. See the [five-day Story Bible](story/01-STORY-BIBLE.md), authored `src/content/` scenes and [roadmap](ROADMAP.md).

**Acceptance still open:** independent Ukrainian editorial and continuity review, measured first-playthrough/replay duration and release playtests in [#42](https://github.com/vlovers/last-chapter/issues/42). The original three-day/40-minute proposal and the later 4–5-hour/7–9-hour design targets are historical or aspirational, not measured runtime. Expanding to 15–20 books and adding investigations remain future work.

The Oliver conversation in PR #44 and narrative packs in PR #21 are unmerged proposals. Historical bibles and QA documents are retained as authored references; they do not establish that every proposed character, scene or mechanic is in the current game.

**Writing gates:** Story Bible (chronology + true facts) → Character Bible (motives, voices, what each knows) → Dialogue Bible (optional questions, branches, prose) → Puzzle Design (clues and fair solutions) → Consequence Matrix → editorial/playtest review → implementation.

**Content safety and quality:** Treat infidelity and parentage secrets as serious sensitive plot matters, not automatic gossip rewards. A player should never be forced to violate trust to win.

## Player-facing language

Ukrainian only (`uk-UA`). Author dialogues, book descriptions, clues and menus in Ukrainian from the start; English notes here are internal working material. See [Localization policy](LOCALIZATION.md).

# Last Chapter — five-day narrative orchestration and content audit V1

**Status:** editorial integration plan, not runtime implementation. **Basis:** eight authored customer orders, five conflict scenes, six ordinary-life scenes, five deep dialogues (Nora, Thomas, Mara, Iris, Eleanor), six Oliver/Sophie scenes, mystery clue graph. **Language of game:** Ukrainian; this coordination document uses English for engineering handoff.

## Executive decision

The existing authored packs are **not** a linear checklist. If the player must see all 30 authored units (8 orders + 5 conflicts + 6 ordinary scenes + 5 deep dialogues + 6 Oliver/Sophie scenes), the five-day game becomes overlong and emotionally exhausting. The game must schedule a small core, offer optional moments, and preserve long-form scenes for players who seek them out.

The total is **30 content units**, not 30 independent mandatory quests. Several scenes intentionally share a setup or prop. Deduplicate them before integration.

## Five-day beat sheet

| Day                      | Required store rhythm                                                                | Main mystery beat                                                                                                          | Optional social content                                                          | Evening mood                                            |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1 — Arrival              | Miller order; Mara order; establish shelf, cash desk, Frank and book recommendations | Found pages / first unresolved question from existing canon; do not invent a forced reveal                                 | Sophie flowers, short Frank interaction                                          | Quiet discovery, no accusation                          |
| 2 — Routine with a crack | Anna's class book order; light stock/order follow-up                                 | Rumor about Thomas and archive; player can distinguish testimony from guess                                                | Mara lemonade, Thomas chair, Oliver unread-book game                             | Warmth survives gossip                                  |
| 3 — Competing versions   | Thomas order; Nora order                                                             | Nora–Eleanor disagreement about archive dates; optional document verification                                              | Anna bookmarks; Nora's bad novel -> deep Nora; deep Thomas; Sophie card game     | Player may choose books over investigation              |
| 4 — Personal boundaries  | Iris order; Leo order                                                                | Optional Mara–Leo conflict and Iris–Miller art conflict; physical letter privacy remains separate                          | Iris's painting -> deep Iris; Mara's cake -> deep Mara; Oliver board-game banter | Tension with ordinary life still present                |
| 5 — Reading evening      | Eleanor order; book club / reading event payoff                                      | Public decision: disclose verified facts, make accusation, or keep private details private; preserve existing ending flags | Eleanor shelf -> deep Eleanor; Sophie return-to-town; Oliver normal-day visit    | Community continues, no forced universal reconciliation |

### Mandatory narrative budget

- Day 1: 2 orders, 1 discovery, 1 compact closing beat.
- Day 2: 1 order, 1 rumor or alternative lead, 1 closing beat.
- Day 3: 2 orders, 1 evidence-verification opportunity, 1 closing beat.
- Day 4: 2 orders, 1 conflict **selected or naturally encountered** (not both automatically), 1 closing beat.
- Day 5: 1 order, 1 reading evening, 1 outcome, 1 epilogue.

Every required scene must have a short path; no long dialogue required to finish a day. Do not treat these counts as a claim about current runtime content.

## Optional encounter scheduler

**Target per day:** at most 2–3 **surfaced** optional invitations (a visitor appears, a conversation prompt appears, or a small event is signaled). A player may intentionally seek additional conversations through an existing interaction UI if available; do not auto-chain them.

**At most one extended dialogue invitation per day.** Suggested first-playthrough distribution:

- Day 1: none. Let the player learn store interactions.
- Day 2: Oliver or Sophie; a light, short social beat.
- Day 3: Nora **or** Thomas, based on whom the player engages.
- Day 4: Mara **or** Iris, based on prior interactions.
- Day 5: Eleanor, optional; no pressure before finale.

This is a **soft invitation cap**, not a hard content lock. If the player actively selects another character, allow it if that character is present and continuity is valid.

### Choice-driven availability

- Nora long scene requires her ordinary bad-romance beat or a compatible direct interaction. Do not replay its opening twice.
- Thomas long scene should replace, not duplicate, the optional personal tangent in his restoration order.
- Mara long scene must not trigger during the Mara–Leo confrontation; it may occur later if her presence and mood allow.
- Iris long scene should be before Iris–Miller conflict, or use a post-conflict alternate opening. Preserve letter privacy flag.
- Eleanor long scene must happen **before** the reading event; otherwise skip.
- Oliver and Sophie remain clue-free and should not become mandatory witnesses.
- Frank's ambient moments should never block an order or a mystery transition.

## Overlap and continuity audit

| Overlap                                                            | Risk                                                    | Editorial resolution                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Nora ordinary scene «Поганий роман» and deep Nora opening          | Identical memory-loss count / same paperback joke       | Use ordinary scene as entry node; deep scene starts at the branch choice, not from the beginning              |
| Thomas chair + shelf repair + restoration order                    | Three repairs in adjacent days; repetitive metaphor     | Keep Day 2 chair comic; Day 3 order functional; deep dialogue optional with a distinct emotional turn         |
| Mara seaside wish in Day 1 order, Day 2 lemonade, Day 4 deep scene | Repeated “I want to escape” exposition                  | Day 1 hint only; Day 2 carefree walk; Day 4 new specifics about responsibility and daily work                 |
| Iris three/four windows in order, conflict and deep scene          | Drawing becomes an implausible universal mystery object | Keep art as everyday expression; vary prop or location; NEVER make windows an evidence clue                   |
| Eleanor shelf in ordinary scene, order and deep scene              | Three versions of same small change                     | Treat shelf change as one evolving mini-arc: Day 5 order -> optional conversation -> cosmetic shelf state     |
| Miller envelope rumor and Anna/Thomas archive-chair rumor          | Two hearsay threads conflated into certainty            | Separate notebook categories, timestamp each heard statement, require direct inspection for document evidence |
| Oliver's invented book title                                       | Could create duplicate/nonexistent catalog ID           | Resolve to real catalog item or make it a fictional cover-only joke; do not persist nonexistent SKU           |
| Sophie flowers and Frank                                           | Possible pet-toxic décor                                | Use cat-safe verified non-toxic flowers or inaccessible props; no plant asset requirement                     |
| Deep dialogue estimated 10–15 minutes                              | Branches may actually be far shorter                    | Do not promise duration; measure word count and real playtest time before marketing                           |
| All optional conversations at once                                 | Visual clutter, pacing collapse                         | Schedule prompts based on visitor presence and cooldown; preserve ability to decline                          |

## Estimated playtime — planning assumptions, not tested results

**Short required route:** 8 orders × 2–4 min = 16–32 min; 5 primary mystery beats × 4–8 min = 20–40 min; daily setup, browsing, walking, reading and closing × 10–20 min = 50–100 min; finale and epilogue = 15–30 min. **Subtotal: ~1h40m–3h20m**. This is a _rough design estimate_, not a measurement of the current build.

**Long optional route:** 5 deep dialogues × 8–15 min = 40–75 min if all accessed; 11 shorter ordinary/cozy scenes × 2–7 min = 22–77 min; conflicts and deeper order questions can add ~20–50 min. **Potential additional 1h20m–3h20m**, highly dependent on reading speed and selection.

**Critical finding:** these authored texts alone **do not demonstrate** the originally intended 4–5h main route or 7–9h completionist route. Achieving those targets requires meaningful store gameplay, exploration, branching consequences, day transitions, and more _interactive_ content, not artificially long dialogue. Avoid padding text to reach a duration number.

## State and save design (proposal only)

Minimal new scene state:

- scene_id, availability predicate, visited, finished, last_entered_day
- optional branch_local_state (do not serialize temporary banter unless needed)
- character_presence and trust conditions should use existing canonical flags
- journal entries require explicit observation / testimony / document type, source, day, and question actually asked

Never:

- award hidden morality scores for “kind” replies;
- repair privacy breaches by completing a purchase;
- make optional social scenes prerequisites for evidence;
- overwrite current ending or relationship flags;
- infer a suspect from a drawing or rumor.

## Suggested scene identifiers

**Orders:** order_miller_day1, order_mara_day1, order_anna_day2, order_thomas_day3, order_nora_day3, order_iris_day4, order_leo_day4, order_eleanor_day5.

**Conflicts:** conflict_anna_miller_day2, conflict_nora_eleanor_day3, conflict_mara_leo_day4, conflict_iris_miller_day4, conflict_public_reading_day5.

**Ordinary:** ordinary_mara_day2, ordinary_thomas_day2, ordinary_anna_day3, ordinary_nora_day3, ordinary_iris_day4, ordinary_eleanor_day5.

**Deep:** deep_nora_day3, deep_thomas_day3, deep_mara_day4, deep_iris_day4, deep_eleanor_day5.

**Cozy:** cozy_sophie_flowers_day1, cozy_oliver_unread_day2, cozy_sophie_game_day3, cozy_oliver_game_day4, cozy_sophie_stay_day5, cozy_oliver_good_day5.

IDs are **proposed**, not verified against current code.

## Narrative QA matrix

1. **Minimal path:** all five days complete without deep dialogue; every required clue has an alternate accessible route.
2. **Social-first path:** player avoids mystery questions when allowed, talks to Oliver/Sophie, still reaches a coherent finale without fabricated evidence.
3. **Investigative path:** player asks every available question; hears conflicting testimony; journal never upgrades a rumor into proof.
4. **Hostile path:** player accuses Thomas, antagonizes Eleanor and breaches Iris's privacy; dialogue tone changes without soft-locking progression.
5. **Quiet path:** player leaves most conversations early; no relationship punishment or mandatory apology.
6. **Reload path:** orders, selected books, journal sources and completed scene IDs persist; no duplicated clues or rewards.
7. **Out-of-order path:** optional visits occur only when characters are present; no reference to future purchases or events.
8. **Mobile path:** text scrolls inside stable UI; choices do not resize Phaser canvas; no interaction requires animation.
9. **Catalog path:** all recommendations map to actual catalog IDs, or remain non-purchasable authored placeholders.
10. **Cat path:** Frank can be elsewhere; no scene fails if he is not at the counter.

## Publication readiness

- **Authored narrative packs:** substantial but not canon-validated end to end.
- **Day-by-day pacing:** proposed here; not implemented.
- **Choice persistence / save migrations:** not verified.
- **Catalog mapping:** unresolved.
- **Playtime:** estimated, not measured.
- **Runtime tests and UI:** not run by this document author.
- **Release readiness:** NOT READY until integration, branch review, full route playtesting, continuity QA, and mobile QA pass.

## Next implementation handoff

1. Audit current scene registry, character bible, catalog IDs, save schema and canonical five-day timeline.
2. Merge overlapping dialogue openings and remove redundant exposition before wiring.
3. Implement optional scene scheduler using existing presence/time conditions; keep one primary mystery beat per day.
4. Integrate orders and journal evidence types without breaking current progression.
5. Add smoke tests for all ten QA paths above; measure actual reading and interaction times.
6. Only after verified playtests, rebalance scenes to target 4–5h main / 7–9h long-route experience.

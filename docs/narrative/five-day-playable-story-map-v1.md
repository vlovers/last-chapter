# Last Chapter — five-day story integration map

**Status:** narrative design, not runtime implementation. **Date:** 2026-10-26. **Game language:** Ukrainian.

## Integration boundary

Codex PR #23 implements three customer orders (Miller, Mara, Anna), stable dialogue overlays, journal/catalog and Frank interactions. This narrative branch is documentation-only. Do not merge its scene identifiers into the game without comparing the live content schema, the actual five-day graph and save flags. PR #23 targets feat/gameplay-visual-polish-v1 rather than main.

## Five-day progression

| Day | Main investigation (must remain independently accessible)                                                  | Orders                               | Optional character scenes                                          | End-of-day condition                                                       |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1   | Introduce missing-page question; observe sealed letter without mandatory opening                           | Miller, Mara (implemented in PR #23) | Frank routine; Sophie flowers if approved                          | Player knows what was actually seen, not who is guilty                     |
| 2   | Anna's account about Thomas carrying chairs; Miller can distort it into a rumor                            | Anna (implemented in PR #23)         | Nora long conversation; Oliver unread-book game if approved        | Testimony and rumor are separate                                           |
| 3   | Compare dated archive inventory and public event notice as two inspectable objects                         | Thomas, Nora (drafts only)           | Thomas deep talk; Sophie game, Oliver tournament if approved       | Discrepancy becomes verified ONLY after both originals inspected           |
| 4   | Ask about Leo's map; handle consequences of Iris letter privacy                                            | Iris, Leo (drafts only)              | Mara and Iris long talks; ordinary shop life                       | Accusation changes relationships, not evidence                             |
| 5   | Prepare statement; public accusation, uncertain disclosure, private verification, or admission of past lie | Eleanor (draft only)                 | Eleanor talk before public decision; Sophie/Oliver everyday scenes | Finale uses actual evidence, privacy, rumor history and encountered people |

**Scheduling caveat:** this is a proposed placement, not a claim all scenes have canonical dates. Check each dialogue's authored day window and existing game chapter timeline before implementation.

## Scene visibility rules

- Essential evidence is obtainable through direct environment interactions even when all optional orders are skipped.
- An order may open a long conversation but never require it to finish the purchase.
- A long conversation can be postponed or exited without a hidden penalty.
- Only one deep talk is offered prominently at a time; the shop must still feel inhabited by ordinary customers.
- No character delivers a clue unless their actual question/branch was selected.
- A rumor cannot become a verified observation through repetition.
- A disliked recommendation does not permanently block day completion.
- If player breached Iris's privacy, use guarded lines; buying a book cannot purchase forgiveness.
- If Eleanor was publicly accused earlier, her Day 5 conversation needs a distinct opening.
- Oliver and Sophie are proposed residents, not approved canon. Their six scenes never give clues.

## Day 1 vertical slice — playable sequencing specification

1. **Opening:** the shop wakes up; Frank may be greeted, fed or ignored. No compulsory pet minigame.
2. **Miller's order:** player chooses a book directly or asks optional questions. Envelope recollection is testimony, not identification.
3. **Mara's order:** player can recommend without learning about Leo's railway-map interests. The two orders should work in either visit order if engine scheduling allows.
4. **Letter discovery:** player can inspect the outside of a sealed letter or leave it. If the current canon permits opening it, opening is an explicit privacy choice; never auto-open on discovery.
5. **Quiet shop beat:** ambient customer activity and Frank resting; Sophie may visit only after canon approval.
6. **Closing ledger:** record orders actually completed, observations actually made, rumors actually repeated, and privacy action actually chosen.
7. **Reload:** order receipts and privacy choice persist; no duplicate rewards or duplicate dialogue unlocks.

### Ukrainian transition copy (new optional lines)

**Opening:** «Френк сидів біля дверей із таким виглядом, ніби магазин відкривався виключно для нього».

**After Miller:** «На прилавку залишилися чек, олівець і чужа історія, у якій бракувало половини подробиць».

**Quiet beat:** «За вікном хтось поспішав на автобус. У магазині було чути лише шелест сторінок і тихе котяче бурчання».

**Unopened letter:** «Лист так і лежав на місці».

**Closing:** «Дверний дзвіночок стих. У Беллвіку ще горіло світло, але на сьогодні магазин уже розповів достатньо».

## Timing and feasibility

Do not label this a shipped 4–5-hour game. The three orders in PR #23 are playable, while five further orders, deep talks, conflict scenes and everyday scenes are drafts. Design target for short visits: 2–4 minutes/order; deep talks: 8–15 minutes **only after enough dialogue is authored and measured**. The actual campaign length must be established by word-count per reachable route plus timed playtests of bookshop mechanics. Optional scene minutes cannot be summed as though every branch is heard in one playthrough.

## Integration sequence

1. Resolve PR #23 Browser QA failure and verify its parent branch before merging.
2. Inventory existing content IDs, catalog book IDs, chapter gates and save fields.
3. Create a mapping table from each narrative document's proposed scene IDs to actual engine IDs.
4. Integrate Thomas and Nora orders first, with alternate essential evidence route and save/reload tests.
5. Add Day 3 two-document comparison and explicit VERIFIED gating.
6. Integrate Iris and Leo orders with privacy guards and relationship reactions.
7. Integrate Eleanor order and finale variant selection; test mutually exclusive endings.
8. Add long talks, then ordinary-life scenes; only then decide whether Oliver and Sophie enter canon.
9. Conduct full five-day playthrough with all optional scenes skipped, and a separate maximal-content run.
10. Record measured reading/playtime, cut repetition, and tune day density.

## Acceptance tests

- Player skipping all optional personal questions still finishes all five days.
- A letter left unopened never yields knowledge of its contents.
- Anna's chairs testimony never grants archive-entry proof.
- Nora's date memory never marks discrepancy verified without inspecting both documents.
- Rumor amplification changes later dialogue but never marks Thomas guilty.
- A rejected book can be followed by another recommendation.
- A saved completed order cannot pay out twice.
- Finale cannot quote unseen testimony or use unknown NPC knowledge.
- Repeated dialogue openings never resize the Phaser world.
- No optional cozy visit becomes a mandatory investigation gate.

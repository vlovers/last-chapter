# Last Chapter — Exact narrative hooks: current playable content

**Read-only audit of `feat/mobile-bookshop-overhaul`, 2026-10-26.** Not an implementation or test run. Supersedes assumptions in `runtime-integration-audit-20261026.md` where concrete content was previously uninspected.

## Important discovery: the letter already exists in gameplay

`src/content/evening.ts` contains a real first-evening dialogue:

- `box` is the exploration hub;
- `letter` option grants **`saw_envelope`**;
- `letter-open` grants **`opened_private_letter`**;
- `deduction` offers `keep-safe` granting **`letter_secured`** and `keep-and-ask` granting **`letter_secured`, `ask_eleanor_next_day`**;
- `receipt`, `book`, `repair-ledger` and Eleanor's notes are also authored.

**Consequence:** Do not create a second letter object or introduce a parallel `sealed_letter_found` flag without mapping it to `saw_envelope`. Opening and discovery are already distinct; preserve existing option/node IDs to protect saves.

## Day 4: Iris's consent is already nuanced

`src/content/day-four-iris.ts` has a `letter` topic requiring `saw_envelope`, with these actual outcomes:

| Existing option  | Flag(s)                        | Meaning                                                              |
| ---------------- | ------------------------------ | -------------------------------------------------------------------- |
| `respect`        | `iris_letter_choice_respected` | Player promises to leave letter sealed; only available if not opened |
| `respect-opened` | `iris_letter_choice_respected` | Player respects Iris's future decision despite earlier opening       |
| `admit-opened`   | `iris_letter_breach_admitted`  | Player explicitly admits opening without permission                  |
| `offer`          | `iris_letter_delivery_offered` | **Offer only**, not consent                                          |
| `pressure`       | `iris_letter_pressured_day4`   | Player pressures Iris                                                |
| `letter-back`    | suspend/repeatable             | Defers the discussion                                                |

**Critical:** Iris replies to the offer: “Можливо, колись я попрошу тебе. Але не сьогодні.” There is **no delivery consent in this inspected scene**. Do not map `iris_letter_delivery_offered` to `iris_private_delivery_consent`, and do not invent a successful Leo delivery.

**Correction to earlier canonical-letter draft:** its Day 4 delivery route is a **proposed extension**, not an already-supported outcome. The canonical current branch emphasizes Iris choosing her own next conversation.

## Day 5 already has a large callback hub

`src/content/day-five.ts` has 1,253 lines in inspected branch, with `morning → gathering` and an unconditional `close → end` option. The gathering already includes:

- Anna book-club topic with **`anna_chose_maps`** and **`anna_chose_mystery`** branches, plus `final_anna_club_heard`.
- `letter` topic gated by `saw_envelope`; flags such as `final_mutual_conversation`, `final_accepted_consequences`, `final_letter_kept_private`.
- Rumor topic, Iris art topic, Frank evening, Mara/Leo/Thomas/Nora/Eleanor callbacks, and shared-table discussion.
- `final_repaired_rumor`, `final_respected_privacy`, `final_iris_exhibition` drive some conditional narration.

**Consequence:** Do not add a second Day 5 reading or duplicate Anna's callback. The new Anna scene should be a **rewrite/expansion of existing `anna` / `anna-maps` / `anna-mystery`** while preserving node IDs where saves may point to them. If a new option is added to the gathering, it must not hide `close`.

## Actual catalog title mappings

| ID          | Exact current title       |
| ----------- | ------------------------- |
| `orchard`   | «Опівнічний сад»          |
| `witnesses` | «Ніхто не знає кінцівки»  |
| `station`   | «Скляна станція»          |
| `roads`     | «Мапи незавершених доріг» |
| `letters`   | «Листи до незнайомця»     |

Anna can receive `roads` or `witnesses` through the existing receipt flags. A third `orchard` Anna branch in `anna-bookclub-day5-v1.md` is **non-playable** until a new explicit sale route exists. A no-order fallback remains necessary.

## Specific implementation strategy (minimal risk)

**A. Tests first:** pin the existing evening flags, Iris's offer-not-consent rule, Anna's two existing choices, and `day5-reading` closure. Test save roundtrip with a live `letter` node and `gathering` node.

**B. Enrich existing content, not parallel scenes:** add short record comparison to existing `evening` box/receipt/repair-ledger dialogue or a context-sensitive counter action; add Elena/Eleanor testimony in existing Day 3 `eleanor` content. Preserve all existing IDs.

**C. Gossip:** inspect existing `src/content/first-day.ts`, `src/content/thomas.ts`, `src/content/nora.ts`, and Day 5 `rumor` before choosing flags. Never overwrite already-earned gossip flags or invent client disclosure.

**D. Iris:** add an explicit opt-in event **only if** author wants player-mediated letter delivery. Otherwise maintain current “Iris decides privately” path; no delivery event required to complete season.

**E. Finale:** expand existing `gathering` topics, keep `close → end` and privacy flags, and verify all optional routes return to gathering.

## QA assertions to automate when coding

1. `saw_envelope` is granted by inspection; `opened_private_letter` is granted only by explicit opening.
2. `iris_letter_delivery_offered` does **not** imply `iris_private_delivery_consent`.
3. `iris_letter_choice_respected` can coexist with `opened_private_letter`; it does not undo breach.
4. Day 5 `letter` option hidden without `saw_envelope`.
5. `anna_chose_maps` reveals maps callback; `anna_chose_mystery` reveals mystery callback.
6. No `anna_chose_orchard` branch without a real corresponding order.
7. The `close` option remains available from `gathering` and `finishSeason` reaches `season-complete`.
8. Existing v1 saves pointing to `evening/letter`, `day4-iris/letter` and `day5-reading/gathering` still decode.
9. No duplicate letter, no duplicate Day 5 event, no double-awarded receipt.
10. User can finish the season without opening letter or completing optional callbacks.

## Source references (repository-relative)

- `src/content/evening.ts`
- `src/content/day-four-iris.ts`
- `src/content/day-five.ts`
- `src/content/books.ts`
- `src/game/chapter.ts`
- `src/game/save.ts`

**No claims of merged PR, green CI, or playable new scenes.** This document is the engineering handoff for the next code batch.

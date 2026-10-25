# LAST CHAPTER — Narrative Bible V1 (working canon)

Status: **production draft**, not approved canon. Language: Ukrainian for all player-facing dialogue. Scope: five days, no changes to existing 19-stage runtime or save keys. Related: #11.

## Core dramatic question
**Чи маємо ми право розповідати чужу історію, навіть якщо віримо, що робимо це заради добра?**

The bookshop is a place where stories are traded, not extracted. The sealed letter is a narrative device, not permission to expose someone's secrets. No ending rewards violating consent.

## Ensemble and relationship web
| Character | Surface request | Internal contradiction | Relates to | Day 1 seed | Day 5 transformation |
|---|---|---|---|---|---|
| Mrs Miller | Help arrange an old shelf | Protects memories by editing them | Thomas, Nora | A catalog number is crossed out | Can acknowledge uncertainty publicly |
| Mara | Recommend a story about difficult love | Romanticizes devotion yet recognizes coercion | Leo, Iris | Questions whether redemption excuses harm | Can name a boundary without shame |
| Leo | Choose a gift | Uses generosity to avoid a difficult apology | Mara, Anna | Won't write a dedication | Offers truth without demanding absolution |
| Nora | Verify a dedication | Wants a conclusive answer from incomplete evidence | Mrs Miller, Danylo | Notes an unusual date | Learns to leave a question open |
| Anna | Return a borrowed book | Helps everyone but struggles to ask for help | Leo, Oksana | Hasn't finished her own reading | Makes a request without apologizing |
| Thomas | Find an old letter | Mistakes remorse for restitution | Mrs Miller, Sofia | Recognizes handwriting but refuses to speculate | Accepts the recipient's choice |
| Iris | Find a book for a new start | Performs a different self for every room | Mara, Sofia | Changes her account of why she came | Shares one honest uncertainty |
| Oksana (proposed) | Sell inherited books | Needs money but fears losing family history | Anna, Mrs Miller | A torn ownership label | Can preserve one memory while selling objects |
| Danylo (proposed) | Identify an edition | Treats people as puzzles to solve | Nora, Leo | Spots a mismatched print year | Asks before investigating |
| Sofia (proposed) | Leave a wrapped book | Protects others through silence | Thomas, Iris | A book is left without a name | Chooses whether to speak, not forced |

**Continuity warning:** existing canonical Day 3 uses Eleanor, who is NOT replaced by these proposed additions. Before introducing Oksana/Danylo/Sofia into the runtime, review Eleanor's arc and reconcile the cast. Ten rows above are a proposed ensemble, not a claim that all ten are already implemented.

## Five-day narrative spine
**Day 1 — The book with no owner.** Miller's shelf, Mara's debate, evening catalog discrepancy. The player learns observation vs inference. Emotional payoff: listening is an action.
**Day 2 — Different editions of the truth.** Iris, Anna, Leo; contradictions are human, not automatically lies. Payoff: kindness can become avoidance.
**Day 3 — The price of knowing.** Eleanor, Thomas, Nora, book club; consent and provenance matter. Payoff: some questions do not belong to the player.
**Day 4 — What the letter cannot say.** Iris/Mara/Leo decisions; context overturns premature assumptions. Payoff: regret does not entitle anyone to forgiveness.
**Day 5 — The last reading.** Player's care for people and evidence shapes the epilogue. No good/evil meter or forced disclosure.

## Day 1 — detailed scene treatment (target 30–45 minutes after writing and playtesting)
### Opening: 0–5 min
- Rain on the windows; warm desk lamp. Frank sleeps beside the returns tray.
- Player checks the counter, shelves and register; optional observations reveal an overwritten catalog number.
- Opening line (narrator): «Дощ стирав назви вулиць із шибок. Усередині книгарні слова ще трималися на місці».
- Optional Frank interaction: «Френк розплющив одне око. Здається, він уже вирішив, чи варто вам довіряти».

### Mrs Miller: 5–15 min
**External task:** sort a returned volume. **Internal stakes:** ownership of memory.
- «Ви колись помічали, що люди пам’ятають не подію, а те, як її потім переказували?»
- Choices: (a) ask what she personally witnessed, (b) ask whose account is missing, (c) return to the catalog task.
- Her answer to (a): «Я бачила, як книгу поставили на полицю. Хто написав присвяту — не бачила. Це різні речі».
- Her answer to (b): «Ті, кого тут немає, не можуть виправити нашу версію. Тому я обережна».
- **State proposal:** `miller_observation_distinguished`, `miller_missing_voice_asked`. Neither implies guilt or secret knowledge.

### Mara: 15–30 min
**External task:** recommend a novel about devotion and difficult choices. **Internal stakes:** intensity versus safety.
- «Мене дратує, коли персонажа називають чудовиськом, а потім роблять вигляд, що один красивий вчинок усе виправив».
- Player may disagree respectfully: «Людина може змінитися. Але той, кому завдали болю, не зобов’язаний чекати».
- Mara: «Ось. Мабуть, саме про це я й хотіла поговорити, а не про те, хто з героїв красивіший».
- A fast route reaches a meaningful conclusion in a few exchanges; an optional deep route explores loyalty, accountability, fictional romance and real boundaries without diagnosing the player.
- **State proposal:** `mara_boundary_named`, `mara_redemption_discussed`. No affinity penalties for respectful disagreement.
- Existing PR #10 book-club conversation must be reused/reconciled, not duplicated.

### Evening: 30–45 min
- Frank noses a loose catalog card from the returns tray; the inked date differs from the register.
- Evidence board displays **observation:** two dates differ. **Interpretation:** someone changed the record. **Unverified:** who and why.
- Player can store the card, leave it untouched, or ask Miller tomorrow. All routes continue; privacy boundaries remain intact.
- Closing line: «Книгарня зачинилася. Запитання — ні».
- Hook: the old dedication refers to a book that the catalog claims never arrived.

## Dialogue authoring rules
1. Every line must reveal character, move a choice or change interpretation; no word-count padding.
2. Every important claim has a source: witnessed, heard, inferred, unknown.
3. Deep/fast routes must be equally respected; no punishment for choosing shorter conversations.
4. No irreversible public disclosure of a private letter without explicit recipient consent.
5. Preserve the canonical cast, progression and `last-chapter:save:v1` until an implementation PR adds migrations and tests.
6. Book discussions may reference titles and characters, but must not reproduce copyrighted dialogue.
7. All player-facing prose must be edited for idiomatic Ukrainian before shipping.

## Implementation checklist
- [ ] Audit current first-day, Mara and evening dialogue graphs against this treatment.
- [ ] Write 3 deep scenes with real branching and 1 short route per scene.
- [ ] Integrate existing Frank evidence board rather than creating duplicate flags.
- [ ] Add deterministic state and save/load tests for optional conversations.
- [ ] Run formatting, lint, typecheck, tests, build and browser QA.
- [ ] Human editorial and touch/accessibility review.

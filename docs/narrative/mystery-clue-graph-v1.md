# The Bellwick case: clue graph, false leads, and customer-order integration

Narrative design for the existing five-day mystery. This is an additive story specification, not a claim that these scenes are implemented. Keep it separate from Codex's visual, mobile, and customer-order engine changes.

## Central question

The mystery is not simply «Who stole a page?» It is: **who had the right to decide which version of Bellwick's past was made public?** The missing manuscript page, the sealed letter, and the old archive entry touch different people. They are connected through the town's habit of repeating stories, not through an invented grand conspiracy.

A good ending may leave a person's private history private while establishing a public fact about a document. A bad ending may expose the correct fact through a cruel accusation. Do not reward public humiliation just because a guess was accurate.

## Evidence classes

- OBSERVATION: the player saw or inspected an object.
- TESTIMONY: a character reports what they remember.
- DOCUMENT: a dated or signed record, verified by inspecting it.
- INFERENCE: a theory constructed from other entries.
- RUMOR: an unverified claim circulating publicly.

The notebook must not collapse these categories into one «discovered» state.

## The five-day discovery rhythm

### Day 1 — Ordinary life, first contradictions

Miller asks for a detective and mentions someone carrying an old envelope. She cannot identify the person.

Mara chooses a book for Leo and casually mentions his interest in railway maps.

The player discovers the sealed letter but must not be forced to open it. The player can learn that a letter exists without learning its contents.

**Dramatic purpose:** The shop is a place where small observations become big stories. The player decides whether to encourage that habit.

**False lead:** A railway map in the same period as the envelope. Correlation is not access to the archive.

### Day 2 — The town talks

Anna wants a book that will make her students argue. She recalls Thomas moving chairs beside the archive. She did not see him enter.

Miller repeats a stronger version: «Томас був в архіві». If the player corrects her, she may argue: «Ну то яка різниця?». If the player agrees, the rumor spreads.

**Dramatic purpose:** Show exactly how testimony is distorted. The player can be complicit without having chosen an overtly villainous option.

**Optional follow-up:** Ask Anna whether she saw a key. «Ні. Я бачила стільці. Ви питаєте про інше».

### Day 3 — The paper trail

Thomas confirms carrying chairs but denies entering. His denial is testimony, not proof.

Nora remembers an archive inventory date that conflicts with the public event notice. She offers a method to verify it rather than a suspect.

**Playable investigative action:** Compare two documents. Record their dates and descriptions separately. Only after both are inspected may the notebook mark a discrepancy as VERIFIED.

**False lead:** The discrepancy could be a clerical error, a delayed registration, or an intentional edit. Do not select a culprit automatically.

**Quiet beat:** Nora buys a novel unrelated to history. She is a person, not a walking clue dispenser.

### Day 4 — The cost of questions

Iris shops for a book to accompany a drawing. If the player violated her letter privacy, she responds with distance. Buying her a book does not repair the breach.

Leo remembers borrowing a route map but cannot remember the exact date. The player may compare his account with Mara's, but this is not a confession.

**Branching confrontation:** Player can ask for a second source, press Leo publicly, or leave the issue private. Public pressure changes how Leo and Mara behave, regardless of whether the player is correct.

**Quiet beat:** Frank sleeps in the cat tree while Mara brings pastries. Allow at least one warm interaction that carries no clue or moral choice.

### Day 5 — A decision, not an exposition dump

Eleanor considers stocking unfamiliar authors. If previously accused, she may refuse to discuss archive access.

The player can:

1. Publicly accuse someone based on incomplete evidence.
2. Read a fragment aloud while admitting uncertainty.
3. Keep the fragment private and pursue verification.
4. Admit a previous lie without expecting instant forgiveness.

The ending must acknowledge the difference between **truth**, **privacy**, and **reputation**. Avoid a single «good ending» score.

## Contradiction matrix

| Claim                                  | Source | What is established                 | What is not established            | How to verify                        |
| -------------------------------------- | ------ | ----------------------------------- | ---------------------------------- | ------------------------------------ |
| Someone carried an old envelope        | Miller | Miller says she saw an envelope     | Identity, contents, destination    | Another witness or physical envelope |
| Thomas was near the archive            | Anna   | Anna reports seeing him move chairs | That he entered or had a key       | Access log and Thomas's account      |
| Thomas did not enter                   | Thomas | Thomas denies entry                 | That the denial is true            | Access log or direct evidence        |
| Leo borrowed a route map               | Leo    | Leo reports borrowing it            | Date or connection to missing page | Loan register                        |
| Leo liked old maps                     | Mara   | Mara recalls his interest           | That he took a document            | No direct inference; seek records    |
| Inventory date differs from event date | Nora   | Nora recalls a discrepancy          | Error versus manipulation          | Inspect both original documents      |
| Iris saw a damaged envelope            | Iris   | Iris remembers a damaged corner     | Who damaged it                     | Physical inspection if available     |

## Branching scenes to implement later

### Scene A — Miller repeats Anna's story (Day 2)

Міллер: «Кажуть, Томас крутився біля архіву. Звідти й зникли папери, хіба ні?»

Player choices:

- «Анна бачила стільці, не ключі». Miller: «Ви завжди так псуєте хороші історії?» [rumor challenged]
- «Може, Томас щось приховує». Miller: «От бачите! Я теж так думаю». [rumor amplified]
- «Спитайте в нього самі». Miller: «А потім він розповість усьому місту, що я пліткарка». [confrontation deferred]

None of these choices proves guilt.

### Scene B — Nora refuses to name a suspect (Day 3)

Нора: «На афіші одна дата, у каталозі інша. Це все, що я можу сказати, поки не побачу оригінал».

Player choices:

- «Покажіть, де перевірити». Nora offers the archive location. [verification lead]
- «То хто підробив запис?» Nora: «Ви вже назвали це підробкою. Я — ні». [trust reduced]
- «Залишмо це до завтра». Nora: «Папери нікуди не підуть. Люди — можуть». [lead deferred]

### Scene C — Iris rejects transactional forgiveness (Day 4)

If letter privacy was breached:

Айріс: «Книжка гарна. Я її куплю. Але ми з вами не закінчили розмову про лист».

Player choices:

- «Я знаю. І не прошу забути». Iris nods, keeps distance. [acknowledgment]
- «Я ж допоміг вам із подарунком». Iris: «Подарунок — не вибачення». [pressure]
- «Не говоритимемо про це зараз». Iris: «Добре. Не зараз». [deferred]

If privacy was respected, use an unrelated warm scene about her drawings. Do not insert accusatory dialogue into that route.

## Narrative state mapping (proposed, not existing flags)

Use stable IDs only after checking the current engine and Codex's new order schema:

- clue_miller_envelope_testimony
- clue_anna_chairs_testimony
- clue_thomas_denial_testimony
- clue_nora_date_memory
- clue_archive_inventory_inspected
- clue_event_notice_inspected
- clue_date_discrepancy_verified
- rumor_thomas_amplified
- iris_breach_acknowledged

Derived rule: verified discrepancy requires BOTH document-inspected flags, never just Nora's memory. Keep it separate from any accusation.

## Implementation safeguards

1. Never require optional customer-order dialogue to finish the main story.
2. No mandatory cat interaction for investigation.
3. An order can be completed even if the customer refuses a personal question.
4. A rumor may change a relationship without changing the underlying evidence.
5. On reload, each clue and consequence must be stable and idempotent.
6. If the player skips an optional order, the mystery must still have an alternate way to reach its essential evidence.
7. Make the short path viable on mobile; long character discussions remain optional.
8. Keep cozy non-investigative scenes throughout all five days.
9. The mystery may remain partly unresolved; do not imply a canonical culprit unless the existing story actually establishes one.
10. Tests should assert both what an option grants AND what it must not grant (for example, Anna's observation must not grant archive entry proof).

## Narrative QA scenarios

- Player spreads every rumor but later apologizes: consequences remain visible.
- Player investigates thoroughly but keeps Iris's letter private: evidence still discoverable.
- Player skips all optional customer orders: main story remains completable.
- Player trusts Thomas and never confronts Leo: no fabricated proof appears.
- Player accuses Eleanor publicly: subsequent social scenes acknowledge it.
- Player chooses books that customers dislike: orders still finish; reactions differ.
- Player reloads after hearing Nora's testimony but before examining records: discrepancy remains unverified.
- Player completes every order: final scene stays playable and avoids mutually contradictory reactions.

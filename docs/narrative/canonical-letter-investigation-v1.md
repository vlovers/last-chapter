# Last Chapter — «Лист, який не дійшов»: playable investigation scenes

**Status:** canonical-aligned narrative draft; not integrated into game. **Language:** Ukrainian. **Days:** 1–5. **Source of truth:** docs/story/07-FIVE-DAY-DRAMATIC-MAP.md; reconcile Story Bible and runtime flags before implementation.

## Rules

- The sealed letter is not the same thing as a missing manuscript page. There is no established theft, archive intruder or culprit.
- The old reservation card and closing log are physical objects; character recollections are testimony.
- The player can discover why the book was displaced without opening or reading Iris's letter.
- No one reads, delivers or publicly quotes the letter without the appropriate player action and Iris's permission where required.
- No single “correct” romantic resolution. Leo and Iris decide for themselves.
- Every required object has a retryable inspection path; no optional customer order blocks investigation.
- The shop remains open, with orders, visitors and Frank's ordinary routines between investigation beats.

## Day 1 — «Закладка»

**Trigger:** player inspects an old reserved book while sorting shelves. **Required:** book and reservation card visible regardless of orders.

_Між сторінками лежить пожовкла картка. У графі «Забрати до» стоїть дата. Під карткою — конверт. Край паперу трохи зім’ятий._

**Гравець (внутрішня репліка):** «Книжку відклали для когось. Але так і не забрали?»

**Елеонора** (if present): «Колись ми все записували на картках. Половину тих карток я досі не можу змусити себе викинути».

**Гравець:**

- «Можна подивитися запис?» → **Елеонора:** «Звісно. Тільки не переплутай дату замовлення з датою, до якої мали забрати».
- «Хто замовляв книжку?» → **Елеонора:** «На картці має бути ім’я. Якщо почерк ще можна розібрати».
- «Залишу її на місці». → Exit; object remains inspectable later.

_When the player notices the envelope:_

**Гравець:** «Тут ще лист».

Choice:

1. «Подивитися тільки на конверт». → Inspect visible exterior only; contents stay unknown.
2. «Не чіпати лист». → Leave sealed; contents stay unknown.
3. «Відкрити лист». → Explicit privacy-breach decision; **do not author or show letter text until its canon is confirmed**.
4. «Запитати Елеонору». → **Елеонора:** «Не пам’ятаю, щоб хтось просив мене передати листа. Але й не хочу вдавати, що пам’ятаю все».

_The envelope can be returned to the book after inspection. It must not disappear if player chose to leave it sealed._

**Journal entries:**

- Observation: «У відкладеній книжці лежить запечатаний лист».
- Document: «На картці резервування зазначено дату [actual value from runtime]».
- **Not established:** whether Leo received the letter; what Iris wrote; why the book remained.

## Day 2 — «Чужа версія»

**Trigger:** player encounters a town resident who recalls Iris's departure; this is accessible via an ordinary shop visit, not optional order questions.

**Міллер:** «Колись усі говорили, що Лео навіть не відповів Айріс. Уявляєте? Вона поїхала, а він мовчав».

**Гравець:**

- «Звідки ви знаєте, що він отримав листа?» → **Міллер:** «А хіба я казала, що бачила, як він його отримав?».
- «Ви це бачили?» → **Міллер:** «Ні. Але тоді про це говорили всі».
- «Не хочу обговорювати їхнє минуле». → **Міллер:** «Добре. Поговорімо про книжку. Хоча там люди теж багато приховують».

**Journal:** rumor: «У Беллвіку вважають, що Лео проігнорував Айріс». This is not delivery proof.

_Iris visits the shop for her own artwork or family errands; her scene is not triggered solely as an investigative response._

**Айріс:** «Тут досі той самий запах паперу. Я думала, що вже забула».

**Гравець:**

- «Ти давно не була тут?» → **Айріс:** «Давно. Але я повернулася не лише через спогади».
- «Можна запитати про старе резервування?» → **Айріс:** «Можна запитати. Я не обіцяю відповісти».
- «Показати нові книжки?» → **Айріс:** «Оце значно простіше».

If player opened the letter, Iris must not magically know; disclosure requires a later explicit choice or a witnessed action.

## Day 3 — «Після дощу»

**Trigger:** player accesses old closing log and reservation card. Both inspectable without asking Nora about her clients.

_У старому журналі зафіксовано протікання. Кілька книжок перенесли з полиці, яка намокла. Поруч — позначка про тимчасове зберігання._

**Гравець:** «Отже, книжку могли прибрати не через замовлення».

**Елеонора:** «Того дня ми носили книжки цілими стосами. Я тоді більше думала про воду, ніж про картки».

**Гравець:**

- «Ти пам’ятаєш саме цю книжку?» → **Елеонора:** «Ні. Не хочу вигадувати. Але пам’ятаю ту полицю».
- «Хтось навмисне сховав її?» → **Елеонора:** «Я не бачила, щоб хтось ховав. Якщо хочеш перевірити, почни із записів».
- «Можна зіставити дати?» → Open document comparison UI or a text fallback.

**Comparison outcomes:**

- Card only → record date, no cause established.
- Log only → leak and movement established, no link to this reservation.
- Card + log + relevant shelf/location match → **plausible explanation** for undelivered book, not certainty of letter delivery/non-delivery.
- Eleanor testimony adds context, never substitutes for missing documents.

**Гравець:** «Книжка могла опинитися не там, де її шукали. А лист залишитися всередині».

**Елеонора:** «Могла. Мені шкода, якщо так сталося. Але я не скажу, що точно знаю».

**Journal:** document observations, then an explicitly labeled inference.

## Day 4 — «Не за нас»

**Trigger:** player has seen exterior of letter or reservation record; talk to Leo via ordinary shop visit. Never require opening contents.

**Лео:** «Ти хотів про щось запитати?»

**Гравець:**

- «Ти пам’ятаєш книжку, яку для тебе відкладали?» → **Лео:** «Пам’ятаю, що мав забрати одну. А потім усе якось закрутилося».
- «Ти знав про лист?» → **Лео:** «Ні. Принаймні тоді — ні». [testimony only]
- «Не зараз. Порадь мені щось почитати». → **Лео:** «Це питання значно складніше, ніж здається».

If Iris has not consented to contact:
**Гравець:** «Я не хочу передавати нічого без її згоди».
**Лео:** «Тоді не передавай».

If Iris has consented to private delivery:
**Гравець:** «Айріс дозволила передати тобі лист. Хочеш узяти його?»
**Лео:**

- «Так. Але я прочитаю його наодинці». → delivery possible if letter is still held and hasn't been delivered.
- «Мені потрібен час». → delivery deferred, letter remains accessible.
- «Ні. Не сьогодні». → respect refusal; do not set delivered.

**Iris consent conversation (independent of Leo):**

**Айріс:** «Цей лист був моїм. Тоді. А зараз я ще маю вирішити, що з ним робити».

**Гравець:**

- «Можу повернути його тобі». → **Айріс:** «Так. Я сама вирішу, чи комусь його показувати».
- «Хочеш, щоб я передав його Лео?» → **Айріс:** «Дай мені подумати». Later explicit YES/NO required; do not infer consent from silence.
- «Можемо залишити його закритим». → **Айріс:** «Можемо».

If letter opened and player admits it:
**Гравець:** «Я відкрив твій лист без дозволу».
**Айріс:** «Я б хотіла почути це до того, як ти почав ставити мені запитання».

- «Я розумію». → **Айріс:** «Не знаю, чи розумієш. Але тепер я принаймні знаю».
- «Я хотів допомогти». → **Айріс:** «Можливо. Але це був мій лист».
- «Не прошу пробачити». → **Айріс:** «Добре. Бо я ще не вирішила».

No apology auto-grants consent. Iris can still choose return-only.

## Day 5 — «Читання»

**Trigger:** public book reading. The core event always happens even if player skipped all optional deep talks.

**Елеонора:** «Сьогодні тут читають книжки. Якщо хтось захоче розповісти свою історію — нехай сам вирішує».

**Міллер:** «А про старе резервування ми дізнаємося?»

**Гравець:**

1. «Я можу розповісти про картку й журнал». → Share only inspected public facts. If comparison incomplete, acknowledge uncertainty.
2. «Лист — приватний. Не читатиму його». → Privacy-first ending. If player opened it, wording must acknowledge they already did.
3. «Айріс хоче сказати кілька слів». → **Only** if Iris expressly opted into public speech. Otherwise choice absent.
4. «Я хочу виправити те, що раніше повторив». → Available only if player amplified a specific rumor.

**Міллер:** «Тобто красивої відповіді не буде?»
**Мара:** «Буде пиріг. Це вже непоганий вечір».
**Томас:** «І стільці не скриплять».
**Елеонора:** «Тоді починаймо».

**Outcome:** the story can clarify the book's movement without resolving Iris and Leo's feelings. No forced couple reunion, villain reveal or speech about what everyone learned.

## Proposed integration gates — resolve against real schema first

- reservation_card_inspected
- sealed_letter_found
- sealed_letter_opened
- closing_log_inspected
- leak_shelf_match_inspected
- eleanor_leak_testimony_heard
- book_displacement_inference
- iris_private_delivery_consent
- iris_public_speech_consent
- leo_letter_unaware_testimony
- letter_returned_to_iris
- letter_delivered_to_leo
- iris_privacy_breach_admitted

**Mutual exclusions:** letter returned to Iris vs delivered to Leo unless she later explicitly hands it over in a separate real event. Delivery only with consent and Leo's acceptance. Public speech consent is independent of private delivery consent.

**Privacy invariant:** sealed_letter_opened=false → no text contents shown, ever.

## Playtest matrix

1. No optional orders → card/log/letter accessible, finale reachable.
2. Never open letter → no letter contents shown, still possible to establish book movement.
3. Open letter → admit breach → Iris remains guarded; no automatic consent.
4. Iris declines delivery → Leo does not receive letter.
5. Iris consents, Leo declines → no delivery flag.
6. Return letter to Iris → player cannot also deliver same object.
7. Inspect log without card → no unsupported claim that specific book moved.
8. Inspect card and log but not shelf match → explanation remains tentative.
9. Skip Iris deep dialogue → consent choice remains available via a short standalone scene.
10. Save/reload after delivery → no second letter or duplicated reaction.
11. Public speech without Iris consent → choice never appears.
12. Reading evening without any public mystery statement → event still completes.

## Editorial TODO before runtime

- Verify reservation dates, book title, location and exact letter ownership in Story Bible and live game.
- Confirm whether Iris herself knows the letter was never delivered.
- Ensure player does not automatically narrate undisclosed letter contents.
- Match all state keys to actual save schema and event system.
- Rework prior archive/manuscript alternate drafts only after explicit approval; do not merge them as canon.

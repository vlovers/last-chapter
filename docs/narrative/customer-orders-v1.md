# Customer orders — narrative pack V1

Ukrainian in-game dialogue. Independent design file: Codex can implement UI without conflicts.

## Design rules

Each order has a short path and an optional deeper conversation. There is no single morally correct book. Clues must be recorded as testimony, not verified evidence. Preserve existing save flags and catalog IDs; resolve book IDs against catalog when integrating.

## 1. Пані Міллер — «Щось, де ніхто не бреше» (Day 1)

Міллер ставить мокру парасолю просто біля каси.

— Мені детектив. Тільки не той, де всі виявляються родичами одне одному. І без оповідачів, які брешуть читачеві.

— А якщо бреше свідок?

— Тоді треба ставити кращі запитання.

Optional questions:

- «Вам подобається розгадувати злочин чи розбиратися в людях?» — «Розгадувати. Люди самі не знають, чого хочуть».
- «Коли ви востаннє помилилися у здогадах?» — «Позавчора. Думала, листоноша приніс рахунок. А то була листівка. Бачите, визнаю помилки».
- «Може, хочете історію без усіх відповідей?» — «У житті мені й так ніхто нічого не пояснює».

Recommendations:
- «Опівнічний сад»: «Візьму. Але якщо винен садівник — поверну».
- «Ніхто не знає кінцівки»: «Назва мені вже не подобається. Дайте першу сторінку».
- «Листи до незнайомця»: «Листи? Я й свої не люблю перечитувати».

Optional clue: Miller saw someone near the shop holding an old envelope. When asked about their coat, she cannot recall its color. Notebook: «Міллер бачила конверт; особу не встановлено». This is NOT proof of identity.

Outcome: if player challenges her sharply, she is offended, not magically reformed. She still visits the shop.

## 2. Мара — «Подарунок, який не схожий на вибачення» (Day 1)

Мара приносить пакет із теплими булочками.

— Знайдіть щось про потяги. Для Лео.
— Він любить потяги?
— Він любить розклади. А я люблю, коли люди хоч іноді запізнюються на власні плани.

Optional questions:

- «Це подарунок чи спосіб почати розмову?» — «Невже книжка не може бути просто книжкою? ...Добре. Може, і те, і те».
- «Що він перечитував би?» — «Щось із мапою на форзаці. Він любить знати дорогу наперед».
- «А яку книжку ви обрали б собі?» — «Ту, де жінка зачиняє пекарню і їде до моря. І ніхто не називає це кризою».

Recommendations:
- «Скляна станція»: «Якщо він почне перевіряти, чи існує така станція, я вас звинувачу».
- «Мапи незавершених доріг»: «Оцю. Тільки без записки “ти зрозумієш”».
- «Листи до незнайомця»: «Ні. Якщо захочу щось сказати, скажу сама. Ну... спробую».

Optional clue: Leo looked for old railway maps, according to Mara. Notebook: «Мара каже, що Лео цікавиться старими мапами». Not evidence of involvement with the letter.

Outcome: Mara reacts negatively if the player treats her only as Leo's girlfriend. She retains agency.

## 3. Анна — «Книжка, яку можна не любити» (Day 2)

Анна приносить аркуш із дванадцятьма почерками.

— Четверо хочуть детектив, троє — пригоди, двоє написали «щоб без кохання», а один — «щоб учителька не питала, що хотів сказати автор».
— А ви?
— Я хочу, щоб хоч хтось її дочитав.

Optional questions:

- «Що робити, якщо половині не сподобається?» — «Тоді буде про що говорити. Тільки хай спершу дочитають».
- «Дати їм обрати між двома?» — «Я вже дала між п'ятьма. У нас тепер політична криза».
- «Чому ви так переживаєте?» — «Є діти, які цілий день мовчать. А про книжку раптом сперечаються».

Recommendations:
- «Ніхто не знає кінцівки»: debate about unreliable narration; check suitability for students.
- «Мапи незавершених доріг»: pupils draw alternative routes.
- «Опівнічний сад»: children debate which details are evidence and which are guesses.

Optional clue: Anna saw Thomas carrying chairs near the archive; she does not know whether he went inside. Notebook: «Анна бачила Томаса біля архіву; мета візиту невідома».

Outcome: Day 5 book club reflects the chosen book. Children may disagree; no unanimous gratitude.

## Integration contract

Stable IDs: order_miller_day1, order_mara_day1, order_anna_day2.

Order state: available / questioning / recommended / completed.

Persist selected catalog book ID, questions actually asked, facts actually heard, customer reaction, and completion day. Avoid duplicated rewards or discoveries on reload.

Do not silently overwrite existing story flags. Map each new state change explicitly and add save migration tests.

For mobile: short route must be completable in 2–3 taps after opening the order; deeper questions optional. Long responses should be paginated, not squeezed into tiny text.

## Acceptance criteria

- Three fully playable orders, each with distinct reactions to at least three book choices.
- Optional evidence only appears in notebook if its question was actually asked.
- All clues labeled testimony vs verified fact.
- No one objectively correct book.
- Choices persist across reloads.
- Existing five-day progression remains intact.

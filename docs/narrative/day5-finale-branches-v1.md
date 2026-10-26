# Bellwick — Day 5 finale: four playable narrative routes

**Status:** authored Ukrainian dialogue design, NOT integrated into runtime. **Dependency:** existing canon's five-day ending must be checked before implementation. This pack supplies *variants* of a final reading evening, not a declaration of a new culprit or a replacement for current ending. **Do not invent an identified thief.**

## Shared setup: «Вечір, коли всі прийшли не лише по книжки»

_У книгарні пахне чаєм і свіжим пирогом. Френк розлігся на підвіконні так, ніби саме він запросив усіх. Хтось сперечається, чи треба залишати вікно прочиненим. Біля каси лежить рукописний аркуш._

**Мара:** «Якщо хтось проллє чай на книжку, наступного разу принесу пиріг без начинки».

**Міллер:** «Це погроза?»

**Мара:** «Попередження».

_Елеонора перевіряє, чи всі стільці стоять рівно. Томас мовчки підкручує один із них._

**Елеонора:** «Ми домовлялися про читання. А не про суд».

**Нора:** «Тоді не будемо вдавати, що знаємо більше, ніж знаємо».

Player's short response:
- «Я скажу тільки те, що можу підтвердити».
- «Я хочу назвати того, кого підозрюю».
- «Я не хочу читати чужий лист».
- «Спершу маю дещо виправити».

Choices route into the four variants below, subject to evidence/privacy state. The player may also leave without making a public statement; the book evening continues.

## Route 1 — «Те, що можна перевірити» (public factual account)

**Availability:** always, even if player did not inspect both records. If records unverified, use the shorter uncertainty line.

**Гравець:** «Ми знайшли сторінку, про яку давно ніхто не говорив. Але деякі речі про неї я досі не знаю».

If both original records inspected:
**Гравець:** «В описі архіву й на афіші читання різні дати. Я бачив обидва документи. Чому вони різні — поки невідомо».
**Нора:** «Саме це ми й перевірили. Не більше».

Otherwise:
**Гравець:** «Є спогад про дві різні дати. Я не перевірив обидва документи, тому не можу сказати, чи це помилка».
**Нора:** «Дякую, що не назвав спогад доказом».

**Міллер:** «Тобто винного нам сьогодні не покажуть?»

**Томас:** «А хтось обіцяв?»

**Елеонора:** «У нас узагалі-то ще є книжки».

**Гравець:**
- «Можемо продовжити перевірку завтра». → **Нора:** «Я залишу список того, що варто знайти».
- «Цього вечора досить». → **Мара:** «Тоді хтось нарешті спробує пиріг?».
- «Мені шкода, що я не знаю більше». → **Елеонора:** «Це не найгірше, що можна сказати вголос».

**Outcome:** public uncertainty preserved; no suspect automatically cleared or convicted. People return to bookshop conversation.

## Route 2 — «Ім'я, яке запам'ятають» (public accusation)

**Availability:** player selects an actual previously mentioned suspect. Never default to Thomas, Leo or Eleanor. If the runtime has no suspect-selection UI, show a neutral follow-up choice with only encountered names.

**Гравець:** «Я підозрюю [ІМ'Я]. Це моя версія, не доказ».

**Міллер:** «Нарешті!»

**Нора:** «Почекайте. Версія — це не вирок».

If target is Thomas:
**Томас:** «Тоді я піду. Мені вже вистачило розмов, у яких я не беру участі».

If target is Leo:
**Лео:** «Я прийшов сюди за книжкою. Не думав, що мене викличуть до дошки».
**Мара:** «Не говори за нього. Нехай сам відповість, якщо захоче».

If target is Eleanor:
**Елеонора:** «Я не зобов'язана стояти тут і слухати, як ви здогадуєтеся про моє життя».

If another target exists in actual canon, write a distinct reaction before implementation; do not insert a generic response that assumes guilt.

**Гравець:**
- «Я мав сказати це приватно». → **Нора:** «Тепер це вже почули всі».
- «Я не відмовляюся від своєї версії». → **Міллер:** «Завтра про це говоритиме все місто».
- «Я помилився, назвавши це вголос». → **Мара:** «Тоді скажи це так само голосно».

**Outcome:** accusation is public and cannot be erased by an immediate apology. No objective guilt flag is set. Follow-up must depend on target and prior relationship state.

## Route 3 — «Не кожна сторінка для всіх» (privacy-first)

**Availability:** always. If sealed letter was opened, do not imply it was left untouched.

**Гравець:** «У нас є історія, яка стосується справжніх людей. Я не читатиму її вголос без їхньої згоди».

**Міллер:** «То ми дарма прийшли?»

**Мара:** «Я принесла пиріг. Особисто я ні».

**Елеонора:** «Можемо просто читати книжки. Це теж подія».

If letter unopened:
**Нора:** «Ми можемо перевірити дати, не читаючи чужих слів».
If letter opened:
**Нора:** «Те, що ти вже прочитав, не означає, що всі мають це почути».

**Гравець:**
- «Повернімося до читання». → **Елеонора:** «Нарешті хтось згадав, навіщо тут стільці».
- «Я продовжу пошук приватно». → **Нора:** «Тоді домовимося, які документи можна перевіряти».
- «Якщо власник захоче, він розповість сам». → **Мара:** «І матиме право не розповідати».

**Outcome:** public reading evening remains cozy; investigation can remain unresolved. Privacy is not a universal virtue score; someone may be disappointed.

## Route 4 — «Мені треба виправити одне речення» (public retraction)

**Availability:** player explicitly amplified Thomas rumor on Day 2. This can precede Route 1 or 3, but cannot erase Route 2's public accusation if it already occurred. The retraction is not itself the mystery ending.

**Гравець:** «Я сказав, що Томас, можливо, щось приховує. Я не мав для цього підстав».

**Міллер:** «Ти тоді погодився зі мною».

**Гравець:** «Так. І тепер хочу сказати це при всіх».

If Thomas present:
**Томас:** «Я почув. Дякую. Не знаю, що ще відповісти».
If Thomas absent:
**Анна:** «Я передам, якщо він захоче про це говорити». Do not set Thomas-heard flag until a real relay occurs.

**Анна:** «Я бачила його зі стільцями. Це все, що я казала».

**Гравець:**
- «Я хочу, щоб це запам'ятали». → **Міллер:** «Побачимо, що саме люди запам'ятають».
- «Я не прошу вибачити мене зараз». → **Мара:** «Тоді не вимагай відповіді».
- «Можемо повернутися до книжок». → **Елеонора:** «Так. Але не робімо вигляд, що розмови не було».

**Outcome:** player publicly corrects their own speech. Thomas remains entitled to distance. This can be followed by factual account or privacy-first ending.

## Epilogue cards — modular, never imply unseen events

Select **one** core finale card plus zero or more *actually earned* social cards. These are short in-game Ukrainian texts, not narrated moral conclusions.

### Core card: records verified, no accusation
«Наступного ранку Нора принесла два аркуші з датами. Вони лежали поруч на столі, і ніхто не називав їх відповіддю».

### Core card: records unverified
«У списку справ залишилися дві дати й порожнє місце для відповіді. Книгарня відчинилася вчасно».

### Core card: public accusation
«У Беллвіку переказували вечір по-різному. Але ім'я, назване вголос, усі запам'ятали однаково».

### Core card: privacy-first
«Лист залишився не для чужих очей. На наступному читанні сперечалися про зовсім іншу книжку».

### Social card: Thomas guarded after apology
«Томас полагодив дверну ручку й пішов до того, як закипів чай. Уперше за кілька днів він хоча б зайшов».

### Social card: Anna order completed
«На касі лежала листівка від книжкового клубу. На ній був кіт у короні».

### Social card: Iris privacy breached
«Айріс забрала свій малюнок зі стіни. Вона сказала, що повернеться, коли вирішить, де йому місце».

### Social card: Frank ambient
«Френк заснув на складеному пакеті. Ніхто не наважився його забрати».

## Decision precedence and impossible states

1. Do not expose letter contents unless the player actually opened it; even then never quote unknown canonical contents from this design pack.
2. Date discrepancy is VERIFIED only when both original records were inspected; Nora's memory is not sufficient.
3. Public accusation selects a target **explicitly**; no default suspect.
4. Retraction route only if player previously amplified the Thomas rumor.
5. A player may retract the rumor and still choose privacy-first or factual account; these are separate axes.
6. If player already made a public accusation earlier, do not let an epilogue imply no public accusation ever happened.
7. Do not award a social card based on an unvisited optional scene.
8. No finale text implies guilt, innocence, ownership of the manuscript or a solved mystery without canon-supported proof.
9. The ending must remain reachable when every optional order and deep talk was skipped.
10. Scene must degrade gracefully if some named NPCs are absent: substitute only lines whose speakers are actually present; do not spawn absent people.

## Narrative QA routes

- All optional orders skipped, records unverified → factual uncertainty or privacy-first finale works.
- Both records inspected, no letter opened → discrepancy acknowledged, contents still unknown.
- Thomas rumor amplified then retracted → apology precedes chosen finale; distance persists.
- Thomas rumor challenged → retraction option absent; no false admission.
- Publicly accuse Leo → Mara responds; no fabricated confession.
- Publicly accuse Eleanor → she refuses to stand trial; next visit remains guarded.
- Letter opened, privacy-first finale → admits player knows contents, still withholds public reading.
- Reload before ending → same available choices; ending cannot fire twice.
- No physical NPC model for Miller → text fallback, no softlock.

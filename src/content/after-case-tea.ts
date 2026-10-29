import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** A quiet, optional conversation after the evidence has been sorted. */
export const afterCaseTeaOption: DialogueOption = {
  id: 'after-case-tea',
  label: 'Допомогти прибрати стіл після розмови про рукопис',
  next: 'after-case-tea',
  requires: ['final_case_closure_complete'],
  unless: ['final_after_case_tea_done'],
};

export const afterCaseTeaNodes: readonly DialogueNode[] = [
  {
    id: 'after-case-tea',
    speaker: 'Мара',
    text: 'Мара збирає порожні чашки. «Ми так довго шукали останню сторінку, що Френк встиг заснути на першій». Кіт розплющує одне око. «Не дивися так. Тобі хоча б не довелося слухати Норині теорії».',
    textWhen: [
      {
        requires: ['final_miller_ledger_rumor_seeded'],
        text: 'Мара складає чашки на тацю. «Міллер уже пішла, а її слова ще ходять між столами». Нора дивиться на свої нотатки. «Завтра я не хочу додавати до них жодного нового здогаду». Френк вмощується на чистому рушнику, ніби суперечка його не стосується.',
      },
      {
        requires: ['final_ledger_record_private'],
        text: 'Мара збирає чашки, поки Елеонора ховає журнал під прилавок. «Не все, що знайшли, треба сьогодні обговорювати», — каже вона. Нора мовчки прибирає олівець. Френк засинає на рушнику.',
      },
    ],
    options: [
      { id: 'after-tea-nora', label: 'Допомогти Норі скласти нотатки', next: 'after-case-nora' },
      {
        id: 'after-tea-mara',
        label: 'Запитати Мару про завтрашній ранок',
        next: 'after-case-mara',
      },
      {
        id: 'after-tea-frank',
        label: 'Забрати у Френка рушник і запропонувати йому коробку',
        next: 'after-case-frank',
      },
      { id: 'after-tea-anna-new', label: 'Попросити Анну допомогти з дитячими книжками', next: 'after-case-anna-new' },
      { id: 'after-tea-leo-new', label: 'Запитати Лео, чи не запізнився його останній потяг', next: 'after-case-leo-new' },
      { id: 'after-tea-eleanor-new', label: 'Поговорити з Елеонорою про звичайний робочий день', next: 'after-case-eleanor-new' },
      { id: 'after-tea-miller-new', label: 'Запропонувати пані Міллер допомогу з чашками', next: 'after-case-miller-new' },
      { id: 'after-tea-iris-new', label: 'Запитати Айріс, чи хоче вона залишитися на чай', next: 'after-case-iris-new' },
      { id: 'after-tea-quiet', label: 'Мовчки вимити чашки', next: 'after-case-quiet' },
    ],
  },
  {
    id: 'after-case-nora',
    speaker: 'Нора',
    text: '«Я хотіла написати: “Таємницю розкрито”», — Нора закреслює заголовок. «Але ми з’ясували, де сушили папір, а не хто написав історію. Спробую жити з менш гучною назвою». Вона підсуває тобі дві картки: одну для фактів, іншу — для припущень.',
    options: [
      {
        id: 'after-nora-facts',
        label: 'Розкласти записи Нори на дві купки: бачили й припускаємо',
        next: 'after-case-finish',
        grants: ['final_after_case_notes_separated'],
      },
      {
        id: 'after-nora-close',
        label: 'Залишити картки Норі',
        next: 'after-case-finish',
        grants: ['final_after_case_nora_owns_notes'],
      },
    ],
  },
  {
    id: 'after-case-mara',
    speaker: 'Мара',
    text: '«Завтра я спершу поснідаю, а тоді, може, зайду по книжку. Не по відповідь на загадку — по книжку». Вона ставить чисту чашку догори дном. «Дивно, що доводиться це уточнювати».',
    options: [
      {
        id: 'after-mara-invite',
        label: 'Відкласти для Мари роман без загадкового фіналу',
        next: 'after-case-finish',
        grants: ['final_after_case_mara_book_reserved'],
      },
      {
        id: 'after-mara-space',
        label: 'Залишити Марі право самій вирішити, як провести ранок',
        next: 'after-case-finish',
        grants: ['final_after_case_mara_space'],
      },
    ],
  },
  {
    id: 'after-case-quiet',
    speaker: 'Оповідач',
    text: 'Тепла вода пахне лимоном. За спиною Нора сперечається з Марою про обкладинку, Елеонора рахує решту в касі. Ніхто не просить тебе пояснити ще одну чужу таємницю. Френк нарешті вмощується на сухому рушнику.',
    options: [
      {
        id: 'after-quiet-finish',
        label: 'Повернутися до гостей',
        next: 'after-case-finish',
        grants: ['final_after_case_quiet_shared'],
      },
    ],
  },
  {
    id: 'after-case-frank',
    speaker: 'Оповідач',
    text: 'Френк ображено спостерігає, як ти піднімаєш рушник. Поруч стоїть порожня коробка з-під книжок. Кіт обнюхує її, залазить усередину, а потім негайно вистрибує: дно шелестить надто голосно. «Він у нас вибагливий критик», — каже Мара.',
    options: [
      {
        id: 'after-frank-box',
        label: 'Підстелити в коробку старий папір',
        next: 'after-case-frank-box',
      },
      {
        id: 'after-frank-lap',
        label: 'Посадити Френка собі на коліна',
        next: 'after-case-frank-lap',
      },
    ],
  },
  {
    id: 'after-case-frank-box',
    speaker: 'Мара',
    text: 'Френк обережно повертається в коробку, вкладається на папір і починає муркотіти. «Ось і все, — каже Мара. — Ми витратили п’ять днів на загадкові сторінки, а йому потрібен був один чистий аркуш». Нора нарешті сміється.',
    options: [
      {
        id: 'after-frank-box-finish',
        label: 'Залишити Френка спати й прибрати чашки',
        next: 'after-case-finish',
        grants: ['final_after_case_frank_box'],
      },
    ],
  },
  {
    id: 'after-case-frank-lap',
    speaker: 'Оповідач',
    text: 'Френк вмощується на колінах, чіпляється лапою за рукав і засинає саме тоді, коли ти збираєшся підвестися. Елеонора дивиться на гору чашок. «Зрозуміло. Тепер у нас на одного працівника менше».',
    options: [
      {
        id: 'after-frank-lap-finish',
        label: 'Попросити Мару допомогти з чашками',
        next: 'after-case-finish',
        grants: ['final_after_case_frank_lap'],
      },
    ],
  },
  {
    id: 'after-case-finish',
    speaker: 'Елеонора',
    text: '«Завтра відчиняємося о дев’ятій», — каже Елеонора й забирає рушник з-під Френка. «І якщо хтось знову прийде шукати сенсацію, спершу нехай купить хоч одну книжку». Френк ображено нявкає: рушник був чудовий.',
    options: [
      {
        id: 'after-tea-return',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_after_case_tea_done'],
      },
    ],
  },
  {
    id: 'after-case-anna-new',
    speaker: 'Оповідач',
    text: 'Анна стоїть біля столу з дитячими книжками. «Завтра в школі читання, — каже вона. — І я дуже сподіваюся, що ніхто не попросить мене пояснити, як працює дракон із фотосинтезом».',
    options: [
      { id: 'after-anna-story-new', label: '«Дай дітям самим вигадати пояснення»', next: 'after-case-anna-story-new' },
      { id: 'after-anna-books-new', label: '«Відкладемо для класу короткі оповідання»', next: 'after-case-anna-books-new' },
      { id: 'after-anna-rest-new', label: '«Може, спершу тобі варто виспатися?»', next: 'after-case-anna-rest-new' },
    ],
  },
  {
    id: 'after-case-anna-story-new',
    speaker: 'Оповідач',
    text: '«Це небезпечно», — усміхається Анна. «Минулого разу вони придумали шість нових предметів у шкільному розкладі. Але, мабуть, ти маєш рацію. Нехай дракон сам розбереться зі своїм сонцем».',
    options: [{ id: 'after-anna-story-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_anna_imagination_supported'] }],
  },
  {
    id: 'after-case-anna-books-new',
    speaker: 'Оповідач',
    text: 'Анна вибирає три збірки й записує назви. «Одну прочитаємо вголос. Другу — по ролях. А третю дам тому, хто завжди каже, що ненавидить читати. Він найкраще сперечається з авторами».',
    options: [{ id: 'after-anna-books-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_anna_class_books_reserved'] }],
  },
  {
    id: 'after-case-anna-rest-new',
    speaker: 'Оповідач',
    text: 'Анна дивиться на годинник і здивовано зітхає. «Я навіть не помітила, що вже так пізно». Вона складає книжки в торбу. «Добре. Завтра діти отримають учительку, яка пам’ятає власне ім’я».',
    options: [{ id: 'after-anna-rest-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_anna_rest_encouraged'] }],
  },
  {
    id: 'after-case-leo-new',
    speaker: 'Оповідач',
    text: 'Лео дивиться на годинник, а потім ховає його в кишеню. «Сьогодні я вже не на зміні. Мені навіть дозволено не знати, котра година». Мара голосно сміється: «Запишіть дату. Це історичний момент».',
    options: [
      { id: 'after-leo-music-new', label: '«А музиканти ще грають на станції?»', next: 'after-case-leo-music-new' },
      { id: 'after-leo-walk-new', label: '«Проведи Мару додому, надворі дощ»', next: 'after-case-leo-walk-new' },
      { id: 'after-leo-schedule-new', label: '«Спробуй завтра хоч раз не дивитися на розклад»', next: 'after-case-leo-schedule-new' },
    ],
  },
  {
    id: 'after-case-leo-music-new',
    speaker: 'Оповідач',
    text: '«Іноді. Я попросив їх попереджати, якщо буде концерт». Лео дивиться на Мару. «Щоб ніхто випадково не пропустив». Вона киває: «І щоб я встигла спекти щось до чаю».',
    options: [{ id: 'after-leo-music-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_leo_station_concert_planned'] }],
  },
  {
    id: 'after-case-leo-walk-new',
    speaker: 'Оповідач',
    text: '«Я й сама дорогу знаю», — каже Мара, але вже бере пальто. Лео відчиняє двері й питає, чи є в неї парасоля. «Ні. Тому не йди занадто швидко». Вони виходять, сперечаючись про найкоротший маршрут.',
    options: [{ id: 'after-leo-walk-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_leo_mara_walk'] }],
  },
  {
    id: 'after-case-leo-schedule-new',
    speaker: 'Оповідач',
    text: 'Лео зображає жах. «Це жорстоко». Мара кладе йому в кишеню паперову серветку з намальованим сонцем. «Ось твій новий розклад. Одна справа на завтра — поснідати».',
    options: [{ id: 'after-leo-schedule-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_leo_day_off_suggested'] }],
  },
  {
    id: 'after-case-eleanor-new',
    speaker: 'Оповідач',
    text: 'Елеонора перегортає чистий блокнот замовлень. «Я сьогодні згадала, як колись сама відчиняла цю книгарню. Найважчим було не знайти загублену книжку. Найважчим було не купити ще десять».',
    options: [
      { id: 'after-eleanor-stock-new', label: '«Давайте завтра перевіримо замовлення»', next: 'after-case-eleanor-stock-new' },
      { id: 'after-eleanor-story-new', label: '«Розкажіть про найбезглуздіше замовлення»', next: 'after-case-eleanor-story-new' },
      { id: 'after-eleanor-change-new', label: '«Ви не проти, якщо завтра переставимо стелаж?»', next: 'after-case-eleanor-change-new' },
    ],
  },
  {
    id: 'after-case-eleanor-stock-new',
    speaker: 'Оповідач',
    text: 'Елеонора бере олівець. «Ось це я розумію — план». Вона записує три імена покупців, а тоді додає: «І не забудь про нову серію для дітей. Анна вже двічі питала».',
    options: [{ id: 'after-eleanor-stock-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_eleanor_orders_planned'] }],
  },
  {
    id: 'after-case-eleanor-story-new',
    speaker: 'Оповідач',
    text: '«Одного разу чоловік попросив книжку, яку читала його дружина. Не пам’ятав ні автора, ні назви. Лише те, що на обкладинці було море». Елеонора сміється. «Знайшли. Через три місяці. Там були гори».',
    options: [{ id: 'after-eleanor-story-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_eleanor_order_story_heard'] }],
  },
  {
    id: 'after-case-eleanor-change-new',
    speaker: 'Оповідач',
    text: 'Елеонора дивиться на стелаж так довго, що ти вже шкодуєш про запитання. «Не проти. Але спочатку покажи, куди саме». Вона усміхається. «Старі звички не зникають за один вечір».',
    options: [{ id: 'after-eleanor-change-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_eleanor_shelf_change_discussed'] }],
  },
  {
    id: 'after-case-miller-new',
    speaker: 'Оповідач',
    text: 'Міллер збирає блюдця з виглядом людини, яка прийшла керувати операцією. «Тут три різні сервізи. Хто так накриває стіл?» Мара піднімає руку: «Той, у кого не вистачає однакових чашок».',
    options: [
      { id: 'after-miller-apology-new', label: '«Дякую, що сьогодні стрималися від нових чуток»', next: 'after-case-miller-apology-new' },
      { id: 'after-miller-cups-new', label: '«Допоможіть розібрати сервізи за кольорами»', next: 'after-case-miller-cups-new' },
      { id: 'after-miller-cake-new', label: '«Заберіть останній шматок пирога»', next: 'after-case-miller-cake-new' },
    ],
  },
  {
    id: 'after-case-miller-apology-new',
    speaker: 'Оповідач',
    text: 'Міллер відкладає блюдце. «Я намагалася». Потім додає: «І не все, що я думаю, варто говорити вголос». Нора киває, не піднімаючи очей від чашки. Розмова на цьому закінчується — і це влаштовує всіх.',
    options: [{ id: 'after-miller-apology-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_miller_restraint_acknowledged'] }],
  },
  {
    id: 'after-case-miller-cups-new',
    speaker: 'Оповідач',
    text: 'Міллер береться за справу з несподіваним ентузіазмом. Через хвилину всі чашки стоять ідеальними рядами. «Ось тепер можна працювати», — каже вона. Мара шепоче: «Треба було попросити її ще годину тому».',
    options: [{ id: 'after-miller-cups-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_miller_cups_sorted'] }],
  },
  {
    id: 'after-case-miller-cake-new',
    speaker: 'Оповідач',
    text: '«Ні, ні, я не можу». Міллер уже загортає пиріг у серветку. «Хіба що для сусідки». Мара дивиться на неї з підозрою: «Для якої?» — «Для дуже близької».',
    options: [{ id: 'after-miller-cake-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_miller_cake_taken'] }],
  },
  {
    id: 'after-case-iris-new',
    speaker: 'Оповідач',
    text: 'Айріс стоїть біля книжкової полиці, не торкаючись жодної обкладинки. «Я вже втомилася від розмов про минуле», — каже вона. «Можна просто поговорити про погану погоду?»',
    options: [
      { id: 'after-iris-weather-new', label: '«Так. Завтра обіцяють дощ»', next: 'after-case-iris-weather-new' },
      { id: 'after-iris-book-new', label: '«Я можу порадити щось зовсім не детективне»', next: 'after-case-iris-book-new' },
      { id: 'after-iris-silence-new', label: '«Можемо просто помовчати»', next: 'after-case-iris-silence-new' },
    ],
  },
  {
    id: 'after-case-iris-weather-new',
    speaker: 'Оповідач',
    text: '«Чудово», — відповідає Айріс. «Тоді в мене буде причина не виходити з дому». Вона всміхається куточком рота. «Або вийти й купити книжку. Ще не вирішила».',
    options: [{ id: 'after-iris-weather-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_iris_weather_talk'] }],
  },
  {
    id: 'after-case-iris-book-new',
    speaker: 'Оповідач',
    text: 'Ти показуєш роман про маленьке приморське містечко. Айріс читає анотацію. «Тут ніхто не шукає старих листів?» — «Тільки загубленого собаку». — «Тоді беру».',
    options: [{ id: 'after-iris-book-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_iris_light_book_chosen'] }],
  },
  {
    id: 'after-case-iris-silence-new',
    speaker: 'Оповідач',
    text: 'Ви стоїте біля вікна, поки Мара й Нора сперечаються про останню чашку. Айріс нарешті сідає. За кілька хвилин вона сама питає, чи можна взяти книжку додому.',
    options: [{ id: 'after-iris-silence-finish-new', label: 'Допомогти прибрати останні чашки', next: 'after-case-finish', grants: ['final_after_iris_silence_shared'] }],
  },

];

import type { DialogueStory } from '../game/dialogue';

/** Фінальний день першого сезону. Рішення людей важливіші за чужу цікавість. */
export const finalReading: DialogueStory = {
  start: 'morning',
  nodes: [
    {
      id: 'morning',
      speaker: 'Оповідач',
      text: 'П’ятий день починається запахом кориці. Мара приносить випічку, Анна — закладки, пані Міллер — власноруч написані запрошення. На дверях книгарні з’являється напис: «Вечір історій. Кожен може просто слухати».',
      options: [{ id: 'open', label: 'Відчинити двері для гостей', next: 'gathering' }],
    },
    {
      id: 'gathering',
      speaker: 'Елеонора',
      text: '«Колись я боялася, що книгарня назавжди залишиться порожньою. А сьогодні тут знову сперечаються, яку книжку читати наступною». Вона усміхається, помітивши Міллер із трьома закладками.',
      textWhen: [
        {
          requires: ['final_repaired_rumor', 'final_iris_exhibition'],
          text: 'Пані Міллер зупиняється біля малюнків Айріс і каже гостям, що помилилася, коли переповідала чужі здогади як факти. Айріс не мусить нічого пояснювати: поруч із картинами є тільки назви, які вона обрала сама. Елеонора бачить, як у книгарні вчаться одночасно визнавати помилки й поважати чужі межі.',
        },
        {
          requires: ['final_respected_privacy', 'final_supported_iris'],
          text: 'Пані Міллер помічає малюнки Айріс, але цього разу не запитує, кого на них зображено. Айріс залишає гостям право дивитися, а собі — право мовчати. Елеонора розуміє: книгарня стала місцем, де близькість не вимагає пояснень.',
        },
        {
          requires: ['final_repaired_rumor'],
          text: '«Пані Міллер сьогодні сама розповіла, як помилилася, — каже Елеонора. — Мені здається, це сміливіше за будь-яку правильну відповідь». Біля столу з книжками вже сперечаються не про людей, а про їхні історії.',
        },
        {
          requires: ['final_respected_privacy'],
          text: 'Елеонора помічає, як пані Міллер зупиняється на півслові й натомість запитує гостя, яку книжку він хоче прочитати. «Мабуть, ми нарешті навчилися залишати людям їхні власні історії», — усміхається вона.',
        },
        {
          requires: ['final_iris_exhibition'],
          text: 'На стіні з’явилися малюнки Айріс. Елеонора читає підпис: «Вікна Беллвіка» — і не шукає пояснення, кому належить кожне вікно. «Колись я боялася порожніх полиць, — каже вона. — А тепер тут стільки різних голосів».',
        },
        {
          requires: ['final_anna_club_heard'],
          text: 'Анна розкладає на столі дитячі закладки. Елеонора бере одну з написом «Тут можна передумати» й тихо сміється: «Схоже, діти краще за нас знають, для чого існують книжки». Гості збираються навколо столу.',
        },
      ],
      options: [
        {
          id: 'final-v3-mara-option',
          label: '«Як минув ранок, який ти хотіла залишити собі?»',
          next: 'final-v3-mara',
          requires: ['mara_own_morning_heard'],
          unless: ['final_v3_mara_heard'],
        },
        {
          id: 'final-v3-leo-option',
          label: '«Чи вдалося поговорити без готового плану?»',
          next: 'final-v3-leo',
          requires: ['leo_honesty_discussed'],
          unless: ['final_v3_leo_heard'],
        },
        {
          id: 'final-v3-iris-option',
          label: '«Чи показала ти малюнки без пояснень?»',
          next: 'final-v3-iris',
          requires: ['iris_art_boundaries_discussed'],
          unless: ['final_v3_iris_heard'],
        },
        {
          id: 'final-v3-anna-option',
          label: '«Як діти сприйняли питання без відповіді?»',
          next: 'final-v3-anna',
          requires: ['anna_uncertainty_discussed'],
          unless: ['final_v3_anna_heard'],
        },
        {
          id: 'final-v3-thomas-option',
          label: '«Чи вдалося побути поруч без інструментів?»',
          next: 'final-v3-thomas',
          requires: ['thomas_listening_discussed'],
          unless: ['final_v3_thomas_heard'],
        },
        {
          id: 'final-v3-nora-option',
          label: '«Що ти вирішила залишити в архіві?»',
          next: 'final-v3-nora',
          requires: ['nora_archive_ethics_discussed'],
          unless: ['final_v3_nora_heard'],
        },
        {
          id: 'final-v3-eleanor-option',
          label: '«Ти звикла до нового місця столу?»',
          next: 'final-v3-eleanor',
          requires: ['eleanor_change_discussed'],
          unless: ['final_v3_eleanor_heard'],
        },
        {
          id: 'anna',
          label: 'Послухати Анну про шкільний книжковий клуб',
          next: 'anna',
          unless: ['final_anna_club_heard'],
        },
        {
          id: 'rumor',
          label: 'Запропонувати поговорити про силу чуток',
          next: 'rumor',
          unless: ['final_respected_privacy', 'final_repaired_rumor'],
        },
        {
          id: 'iris',
          label: 'Запитати Айріс про її малюнки',
          next: 'iris',
          unless: ['final_supported_iris', 'final_iris_exhibition'],
        },
        {
          id: 'letter',
          label: 'Повернутися до питання старого листа',
          next: 'letter',
          requires: ['saw_envelope'],
          unless: [
            'final_mutual_conversation',
            'final_accepted_consequences',
            'final_letter_kept_private',
          ],
        },
        {
          id: 'mara-callback',
          label: 'Згадати розмову з Марою',
          next: 'mara-callback',
          requires: ['mara_day_four_reflected'],
          unless: ['final_mara_heard'],
        },
        {
          id: 'eleanor-memory',
          label: 'Подякувати Елеонорі за історію книгарні',
          next: 'eleanor-memory',
          requires: ['eleanor_shared_shop_memory'],
          unless: ['final_eleanor_heard'],
        },
        {
          id: 'leo-memory',
          label: 'Поговорити з Лео про життя без розкладу',
          next: 'leo-memory',
          requires: ['leo_shared_future_plan'],
          unless: ['final_leo_heard'],
        },
        {
          id: 'miller-memory',
          label: 'Поговорити з пані Міллер про припущення',
          next: 'miller-memory',
          requires: ['miller_observation_distinguished'],
          unless: ['final_miller_heard'],
        },
        {
          id: 'leo-reflection-callback',
          label: 'Запитати Лео, чи навчився він залишати людям вибір',
          next: 'leo-reflection-callback',
          requires: ['leo_reflected_on_uncertainty'],
          unless: ['final_leo_reflection_heard'],
        },
        {
          id: 'iris-reflection-callback',
          label: 'Побачити, що Айріс вирішила показати на виставці',
          next: 'iris-reflection-callback',
          requires: ['iris_reflected_on_identity'],
          unless: ['final_iris_reflection_heard'],
        },
        {
          id: 'anna-reflection-callback',
          label: 'Дізнатися, як змінилися уроки Анни',
          next: 'anna-reflection-callback',
          requires: ['anna_reflected_on_care'],
          unless: ['final_anna_reflection_heard'],
        },
        {
          id: 'thomas-reflection-callback',
          label: 'Запитати Томаса, як минула відверта розмова',
          next: 'thomas-reflection-callback',
          requires: ['thomas_reflected_on_responsibility'],
          unless: ['final_thomas_reflection_heard'],
        },
        {
          id: 'nora-reflection-callback',
          label: 'Поговорити з Норою про межі архіву',
          next: 'nora-reflection-callback',
          requires: ['nora_reflected_on_uncertainty'],
          unless: ['final_nora_reflection_heard'],
        },
        {
          id: 'eleanor-reflection-callback',
          label: 'Дізнатися, що Елеонора вирішила змінити в книгарні',
          next: 'eleanor-reflection-callback',
          requires: ['eleanor_reflected_on_legacy'],
          unless: ['final_eleanor_reflection_heard'],
        },
        {
          id: 'frank-evening',
          label: 'Побути з Френком біля вікна',
          next: 'frank-evening',
          unless: ['final_frank_evening_heard'],
        },
        {
          id: 'bookseller-reflection',
          label: 'Записати, чого навчила книгарня за ці п’ять днів',
          next: 'bookseller-reflection',
          unless: ['final_bookseller_reflection_heard'],
        },
        {
          id: 'day-four-iris-callback',
          label: 'Поговорити з Айріс про право обирати, де бути вдома',
          next: 'day-four-iris-callback',
          requires: ['iris_day_four_boundary_heard'],
          unless: ['final_day_four_iris_heard'],
        },
        {
          id: 'day-four-mara-callback',
          label: 'Запитати Мару про її власні плани',
          next: 'day-four-mara-callback',
          requires: ['mara_day_four_own_story_heard'],
          unless: ['final_day_four_mara_heard'],
        },
        {
          id: 'day-four-leo-callback',
          label: 'Повернутися до розмови з Лео про минуле',
          next: 'day-four-leo-callback',
          requires: ['leo_day_four_future_heard'],
          unless: ['final_day_four_leo_heard'],
        },
        {
          id: 'shared-table',
          label: 'Запросити гостей поговорити про те, кому належать історії',
          next: 'shared-table',
          unless: ['final_shared_table_heard'],
        },
        { id: 'close', label: 'Завершити вечір спільним читанням', next: 'end' },
      ],
    },
    {
      id: 'shared-table',
      speaker: 'Анна',
      text: 'Анна кладе на стіл книжку без обкладинки. «Мої учні сперечалися, чи можна розповідати історію друга, якщо вона здається повчальною. Один сказав: якщо історія правдива, значить, можна. Інша відповіла: правда не робить її твоєю». Мара відсуває чашку. «А якщо мовчання теж когось ранить?»',
      options: [
        {
          id: 'shared-table-consent',
          label: '«Спершу запитати людину, чи хоче вона цієї розмови»',
          next: 'shared-table-answer',
          grants: ['final_shared_table_consent'],
        },
        {
          id: 'shared-table-accountability',
          label: '«Визнати власну помилку, не розкриваючи чужої таємниці»',
          next: 'shared-table-answer',
          grants: ['final_shared_table_accountability'],
        },
        {
          id: 'shared-table-uncertainty',
          label: '«Іноді чесно сказати, що ми знаємо не все»',
          next: 'shared-table-answer',
          grants: ['final_shared_table_uncertainty'],
        },
      ],
    },
    {
      id: 'shared-table-answer',
      speaker: 'Нора',
      text: '«Я працюю з архівами, але жоден документ не дає мені права вирішувати за живу людину», — каже Нора. Елеонора підсуває до столу ще один стілець. Ніхто не оголошує переможця суперечки.',
      textWhen: [
        {
          requires: ['final_shared_table_consent'],
          text: '«Запитання — не формальність», — каже Айріс. «Людина може відповісти “ні”, навіть якщо нам здається, що розмова допоможе». Лео киває, не намагаючись говорити замість неї. Мара додає: «І “не зараз” теж відповідь».',
        },
        {
          requires: ['final_shared_table_accountability'],
          text: 'Пані Міллер повільно закриває книжку. «Я можу сказати, що помилилася, не називаючи тих, про кого пліткувала». Томас відповідає: «Вибачення не стирає наслідків. Але принаймні не створює нових».',
        },
        {
          requires: ['final_shared_table_uncertainty'],
          text: '«В архіві завжди лишаються прогалини», — каже Нора. Анна усміхається: «Тоді я навчу дітей не заповнювати їх чужими здогадами». Елеонора ставить порожню чашку на стіл: «Можна залишити місце для того, чого ще не знаємо».',
        },
      ],
      options: [
        {
          id: 'shared-table-return',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_shared_table_heard'],
        },
      ],
    },
    {
      id: 'mara-callback',
      speaker: 'Мара',
      text: 'Я тепер думаю, що щасливий фінал — це можливість обирати самій, навіть якщо читач сподівався на інше.',
      options: [
        {
          id: 'mara-callback-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_mara_heard'],
        },
      ],
    },
    {
      id: 'eleanor-memory',
      speaker: 'Елеонора',
      text: 'Я боялася, що тут залишаться самі полиці. А сьогодні бачу людей, які можуть просто побути поруч. Значить, книгарня знову жива.',
      options: [
        {
          id: 'eleanor-memory-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_eleanor_heard'],
        },
      ],
    },
    {
      id: 'leo-memory',
      speaker: 'Лео',
      text: 'Пам’ятаєш, я хотів побачити зимове море? Квитків ще не купив. Але вперше це не здається поразкою. Можна мріяти й не поспішати.',
      options: [
        {
          id: 'leo-memory-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_leo_heard'],
        },
      ],
    },
    {
      id: 'miller-memory',
      speaker: 'Пані Міллер',
      text: 'Я все життя читала детективи, а найважчою загадкою виявилося навчитися не робити висновків про сусідів завчасно.',
      options: [
        {
          id: 'miller-memory-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_miller_heard'],
        },
      ],
    },
    {
      id: 'anna',
      speaker: 'Анна',
      text: '«Учні вигадали назву для нашої полиці: “Історії, які не поспішають”. І попросили залишити місце для книжок, які їм не сподобалися. Кажуть, про них теж цікаво сперечатися».',
      options: [
        {
          id: 'anna-maps',
          label: '«Мапи справді допомогли їм шукати власні дороги»',
          next: 'anna-maps',
          requires: ['anna_chose_maps'],
        },
        {
          id: 'anna-mystery',
          label: '«Детектив навчив їх перевіряти здогади»',
          next: 'anna-mystery',
          requires: ['anna_chose_mystery'],
        },
        {
          id: 'anna-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_club_heard'],
        },
      ],
    },
    {
      id: 'anna-maps',
      speaker: 'Анна',
      text: '«Так! Один учень намалював маршрут до бібліотеки, а поруч підписав: “Тут можна передумати”. Мені здається, він зрозумів книжку краще за мене».',
      options: [
        {
          id: 'maps-back',
          label: 'Посміхнутися й повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_club_heard'],
        },
      ],
    },
    {
      id: 'anna-mystery',
      speaker: 'Анна',
      text: '«Вони навіть склали правила: не називати людину винною, доки не вислухали її. Пані Міллер запропонувала додати це до правил клубу».',
      options: [
        {
          id: 'mystery-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_club_heard'],
        },
      ],
    },
    {
      id: 'rumor',
      speaker: 'Пані Міллер',
      text: '«Я довго вважала, що добре знаю всіх у Беллвіку. Але історія Томаса й Анни нагадала мені: здогад — це не доказ, а чужий біль — не розвага». Нора тихо киває, нічого не розкриваючи.',
      options: [
        {
          id: 'rumor-respect',
          label: '«Нехай люди самі розповідають те, чим хочуть поділитися»',
          next: 'gathering',
          grants: ['final_respected_privacy'],
        },
        {
          id: 'rumor-apology',
          label: '«Можемо навчитися визнавати помилки»',
          next: 'gathering',
          grants: ['final_repaired_rumor'],
        },
      ],
    },
    {
      id: 'iris',
      speaker: 'Айріс',
      text: '«Я намалювала ці вікна для виставки, але тепер думаю: може, це просто подарунок книгарні. Мені подобається, що світло видно з вулиці, навіть якщо ніхто не знає, хто всередині».',
      options: [
        {
          id: 'iris-exhibit',
          label: '«Влаштуймо маленьку виставку»',
          next: 'exhibit',
          requires: ['iris_offered_exhibition'],
        },
        {
          id: 'iris-choice',
          label: '«Ти можеш вирішити, де будуть твої роботи»',
          next: 'gathering',
          grants: ['final_supported_iris'],
        },
      ],
    },
    {
      id: 'exhibit',
      speaker: 'Айріс',
      text: '«Тоді підпишемо їх просто: “Вікна Беллвіка”. Без пояснень про минуле. Нехай кожен побачить щось своє».',
      options: [
        {
          id: 'exhibit-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_iris_exhibition'],
        },
      ],
    },
    {
      id: 'letter',
      speaker: 'Оповідач',
      text: 'Конверт досі запечатаний. Сім років він пролежав між сторінками, але ніхто не має права перетворювати його на публічне видовище. Айріс і Лео стоять біля вікна, Мара розмовляє з Анною.',
      textWhen: [
        {
          requires: ['leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'],
          text: '«Мара сказала, що їй важливо мати право на власне “ні”. Я зізнався, як боюся помилитися. Ми не домовилися про ідеальне майбутнє — лише про те, що питатимемо одне одного, замість вгадувати».',
        },
        {
          requires: ['mara_day_four_named_own_needs', 'leo_day_four_chose_honesty'],
          text: '«Ми з Лео поговорили без готових обіцянок. Я сказала, чого потребую, а він — чого боїться. Це не вирішило всього, але вперше ніхто з нас не мусив вдавати, що вже знає відповідь».',
        },
        {
          requires: ['iris_letter_breach_admitted'],
          text: 'Конверт із порушеною печаткою лежить на прилавку. Айріс уже знає, що ви відкрили його без дозволу; вона не зобов’язана ні пробачати, ні пояснювати своє рішення. Айріс і Лео стоять біля вікна, Мара розмовляє з Анною.',
        },
        {
          requires: ['opened_private_letter'],
          text: 'На конверті помітна порушена печатка. Ви знаєте, що прочитали чужі слова без дозволу, але не маєте права перетворювати їх на публічне видовище. Айріс і Лео стоять біля вікна, Мара розмовляє з Анною.',
        },
      ],
      options: [
        {
          id: 'mutual',
          label: 'Запропонувати приватну розмову, якщо обоє згодні',
          next: 'mutual',
          requires: ['iris_letter_choice_respected', 'leo_open_to_conversation'],
        },
        {
          id: 'repair-trust',
          label: 'Визнати порушення довіри й залишити рішення Айріс',
          next: 'repair-trust',
          requires: ['iris_letter_breach_admitted'],
        },
        { id: 'wait', label: 'Залишити конверт Айріс і не квапити нікого', next: 'wait' },
        { id: 'letter-back', label: 'Повернутися до гостей', next: 'gathering' },
      ],
    },
    {
      id: 'mutual',
      speaker: 'Оповідач',
      text: 'Айріс і Лео виходять у тихий внутрішній дворик. Мара знає, що вони вирішили поговорити, і не просить переказувати їй чужі слова. Коли вони повертаються, ніхто не ставить запитань. Деякі розмови важливі саме тому, що залишаються приватними.',
      options: [
        {
          id: 'mutual-back',
          label: 'Дати їм простір і повернутися до гостей',
          next: 'gathering',
          grants: ['final_mutual_conversation'],
        },
      ],
    },
    {
      id: 'repair-trust',
      speaker: 'Айріс',
      text: 'Ти визнав помилку. Це важливо. Але я не обіцяю, що тепер довірятиму тобі так само. Мені потрібен час, і я сама вирішу, що буде з листом.',
      options: [
        {
          id: 'repair-trust-back',
          label: '«Я розумію. Не вимагатиму відповіді»',
          next: 'gathering',
          grants: ['final_accepted_consequences'],
        },
      ],
    },
    {
      id: 'wait',
      speaker: 'Айріс',
      text: '«Дякую. Можливо, я прочитаю його вголос Лео колись. А можливо, залишу собі. Тепер я знаю, що можу вирішувати без поспіху».',
      options: [
        {
          id: 'wait-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_letter_kept_private'],
        },
      ],
    },
    {
      id: 'leo-reflection-callback',
      speaker: 'Лео',
      text: '«Розклад не відповідає на всі питання. Але сьогодні я хоча б не боюся запитати».',
      textWhen: [
        {
          requires: ['leo_chose_listening'],
          text: '«Я нарешті запитав, що потрібно іншій людині, а не склав за неї план. Відповідь була несподівана: просто послухати». Лео ніяково усміхається.',
        },
        {
          requires: ['leo_accepted_silence'],
          text: '«Учора ми мовчали поруч майже годину. І вперше я не сприйняв це як запізнення, яке треба надолужити». Лео дивиться на вікно.',
        },
      ],
      options: [
        {
          id: 'leo-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_leo_reflection_heard'],
        },
      ],
    },
    {
      id: 'iris-reflection-callback',
      speaker: 'Айріс',
      text: '«Я принесла нові малюнки. Не для того, щоб пояснити минуле, а щоб показати, ким стала».',
      textWhen: [
        {
          requires: ['iris_chose_open_art'],
          text: '«Я залишила на виставці незакінчений малюнок. Не тому, що забула його домалювати, а тому, що не кожна історія мусить мати пояснення».',
        },
        {
          requires: ['iris_chose_private_art'],
          text: '«Мої малюнки сьогодні тут, а моя біографія — ні. Дивно приємно, коли люди питають про колір, а не про причини від’їзду».',
        },
      ],
      options: [
        {
          id: 'iris-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_iris_reflection_heard'],
        },
      ],
    },
    {
      id: 'anna-reflection-callback',
      speaker: 'Анна',
      text: '«Сьогодні книжки для клубу розклали без мене. Виявляється, іншим теж можна довіряти».',
      textWhen: [
        {
          requires: ['anna_will_apologize_to_student'],
          text: '«Я вибачилася перед ученицею. Вона сказала, що їй досі не подобається фінал. І це була наша перша по-справжньому чесна розмова про книжку».',
        },
        {
          requires: ['anna_will_invite_disagreement'],
          text: '«Сьогодні діти сперечалися зі мною про героїню. Я не стала шукати правильну відповідь. Натомість попросила їх пояснити власну».',
        },
      ],
      options: [
        {
          id: 'anna-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_anna_reflection_heard'],
        },
      ],
    },
    {
      id: 'thomas-reflection-callback',
      speaker: 'Томас',
      text: '«Я запитав, чи потрібна допомога, замість того щоб одразу щось лагодити. Це виявилося складніше».',
      textWhen: [
        {
          requires: ['thomas_will_ask_before_helping'],
          text: '«Я запитав Анну, чого вона хоче. Вона попросила мене просто посидіти поруч. Я вперше нічого не лагодив — і не відчув, що підвів її».',
        },
        {
          requires: ['thomas_admitted_fear_of_rejection'],
          text: '«Я сказав Анні, що іноді боюся стати непотрібним. Вона не пообіцяла, що все буде легко. Але ми нарешті говорили не про зламані речі».',
        },
      ],
      options: [
        {
          id: 'thomas-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_thomas_reflection_heard'],
        },
      ],
    },
    {
      id: 'nora-reflection-callback',
      speaker: 'Нора',
      text: '«Не все, що лишилося без відповіді, є таємницею, яку треба розкрити».',
      textWhen: [
        {
          requires: ['nora_will_preserve_uncertainty'],
          text: '«В архіві тепер три свідчення замість однієї красивої версії. Люди сперечаються, зате ніхто не видає здогад за факт».',
        },
        {
          requires: ['nora_will_seek_consent'],
          text: '«Я запитала, чи можна виставити старі записи. Дехто відмовив. І знаєш, після цього архів не став біднішим — він став чеснішим».',
        },
      ],
      options: [
        {
          id: 'nora-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_nora_reflection_heard'],
        },
      ],
    },
    {
      id: 'eleanor-reflection-callback',
      speaker: 'Елеонора',
      text: '«Полицю переставили без мене. І знаєш, світ не завалився. Навіть стало затишніше».',
      textWhen: [
        {
          requires: ['eleanor_will_keep_shared_memory'],
          text: '«Ми зробили одну полицю пам’яті. На ній стоять книжки, яких я ніколи не читала. Мені подобається, що вона вже не тільки моя».',
        },
        {
          requires: ['eleanor_will_allow_change'],
          text: '«Я допомогла переставити улюблений куточок. Тепер там сидять люди, які не знали мене молодою. Мабуть, це і є майбутнє книгарні».',
        },
      ],
      options: [
        {
          id: 'eleanor-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_eleanor_reflection_heard'],
        },
      ],
    },
    {
      id: 'frank-evening',
      speaker: 'Оповідач',
      text: 'Френк, маленький сірий девон-рекс, сидить на підвіконні й стежить за краплями. Він не знає, чому люди сперечаються про листи, прощення та правду. Зате знає, що сьогодні всі говорять тихіше, коли хтось інший шукає слова.',
      options: [
        {
          id: 'frank-sit',
          label: 'Сісти поруч і нічого не пояснювати',
          next: 'frank-silence',
        },
        {
          id: 'frank-pet',
          label: 'Почухати Френка за вухом',
          next: 'frank-trust',
        },
      ],
    },
    {
      id: 'frank-silence',
      speaker: 'Оповідач',
      text: 'Френк вмощується ближче. За вікном дощ, у кімнаті голоси. Уперше за день тобі не потрібно добирати правильну відповідь. Достатньо бути тут.',
      options: [
        {
          id: 'frank-silence-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_frank_evening_heard', 'bookseller_chose_silence'],
        },
      ],
    },
    {
      id: 'frank-trust',
      speaker: 'Оповідач',
      text: 'Кіт мружиться й довірливо підставляє голову. Йому не потрібні обіцянки назавжди — лише тепла долоня зараз. Ти згадуєш, скільки разів за ці дні люди просили саме цього: не рішення, а присутності.',
      options: [
        {
          id: 'frank-trust-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_frank_evening_heard', 'bookseller_chose_presence'],
        },
      ],
    },
    {
      id: 'bookseller-reflection',
      speaker: 'Оповідач',
      text: 'У старому зошиті для замовлень залишилася чиста сторінка. П’ять днів тому ти записував сюди назви книжок. Тепер хочеться записати питання, на яке немає готової відповіді.',
      options: [
        {
          id: 'bookseller-truth',
          label: '«Як говорити правду, не забираючи чужого права мовчати?»',
          next: 'bookseller-truth',
        },
        {
          id: 'bookseller-care',
          label: '«Як бути поруч і не вирішувати за інших?»',
          next: 'bookseller-care',
        },
        {
          id: 'bookseller-change',
          label: '«Як зберегти важливе, не боячись змін?»',
          next: 'bookseller-change',
        },
      ],
    },
    {
      id: 'bookseller-truth',
      speaker: 'Оповідач',
      text: 'Ти пишеш: «Не кожна історія, яку я можу розповісти, належить мені». Поруч залишаєш порожній рядок — для відповіді, яку поки не знаєш.',
      options: [
        {
          id: 'bookseller-truth-back',
          label: 'Закрити зошит',
          next: 'gathering',
          grants: ['final_bookseller_reflection_heard', 'bookseller_values_consent'],
        },
      ],
    },
    {
      id: 'bookseller-care',
      speaker: 'Оповідач',
      text: 'Ти пишеш: «Турбота починається із запитання, а не з готового плану». Це не обіцянка ніколи не помилятися. Лише нагадування слухати, перш ніж допомагати.',
      options: [
        {
          id: 'bookseller-care-back',
          label: 'Закрити зошит',
          next: 'gathering',
          grants: ['final_bookseller_reflection_heard', 'bookseller_values_agency'],
        },
      ],
    },
    {
      id: 'bookseller-change',
      speaker: 'Оповідач',
      text: 'Ти пишеш: «Місце залишається живим, доки в ньому є місце для нових людей». І раптом розумієш, що це стосується не тільки книгарні.',
      options: [
        {
          id: 'bookseller-change-back',
          label: 'Закрити зошит',
          next: 'gathering',
          grants: ['final_bookseller_reflection_heard', 'bookseller_values_change'],
        },
      ],
    },
    {
      id: 'day-four-iris-callback',
      speaker: 'Айріс',
      text: '«Я залишила чисту сторінку в альбомі. Не знаю, де намалюю наступне вікно, але більше не соромлюся цього».',
      textWhen: [
        {
          requires: ['iris_day_four_respected_freedom'],
          text: '«Я подала заявку на виставку в іншому місті. Можливо, поїду. І цього разу не називатиму від’їзд втечею».',
        },
        {
          requires: ['iris_day_four_supported_belonging'],
          text: '«Я залишила тут свої малюнки, а собі — право передумати. Виявляється, належати до місця не означає належати йому».',
        },
      ],
      options: [
        {
          id: 'day-four-iris-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_day_four_iris_heard'],
        },
      ],
    },
    {
      id: 'day-four-mara-callback',
      speaker: 'Мара',
      text: '«Сьогодні я вперше прийшла не тому, що мене попросили. Просто хотіла бути тут».',
      textWhen: [
        {
          requires: ['mara_day_four_named_own_needs', 'leo_day_four_chose_honesty'],
          text: '«Ми з Лео поговорили без готових обіцянок. Я сказала, чого потребую, а він — чого боїться. Це не вирішило всього, але вперше ніхто з нас не мусив вдавати, що вже знає відповідь».',
        },
        {
          requires: ['mara_day_four_chose_own_time'],
          text: '«Завтра пекарня працюватиме без мене. Я взяла вихідний і купила книжку для себе. Можеш уявити?»',
        },
        {
          requires: ['mara_day_four_named_own_needs'],
          text: '«Я сказала Лео, що мені потрібна не обіцянка ідеального майбутнього, а чесна розмова зараз. Він вислухав. Це вже багато».',
        },
      ],
      options: [
        {
          id: 'day-four-mara-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_day_four_mara_heard'],
        },
      ],
    },
    {
      id: 'day-four-leo-callback',
      speaker: 'Лео',
      text: '«Я більше не хочу перетворювати кожен спогад на виправдання. Минуле було справжнім. І сьогоднішній день теж».',
      textWhen: [
        {
          requires: ['leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'],
          text: '«Мара сказала, що їй важливо мати право на власне “ні”. Я зізнався, як боюся помилитися. Ми не домовилися про ідеальне майбутнє — лише про те, що питатимемо одне одного, замість вгадувати».',
        },
        {
          requires: ['leo_day_four_chose_honesty'],
          text: '«Ми з Марою поговорили. Я сказав, що іноді боюся власних спогадів. Вона не вимагала звіту. Ми просто залишилися поруч».',
        },
        {
          requires: ['leo_day_four_respected_privacy'],
          text: '«Я залишив старий квиток у книжці. Не як таємницю і не як обіцянку повернутися. Просто як частину свого життя».',
        },
      ],
      options: [
        {
          id: 'day-four-leo-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_day_four_leo_heard'],
        },
      ],
    },
    {
      id: 'final-v3-mara',
      speaker: 'Мара',
      text: '«Я сказала, що не беру додаткового замовлення. Потім пів години думала, чи не образила когось. Але книжку все-таки відкрила. І це був мій ранок».',
      textWhen: [
        { requires: ['mara_discussed_forgiveness'], text: '«Я залишила ранок собі. І згадала: пробачення не означає, що я мушу віддавати комусь увесь свій час».', },
        { requires: ['mara_discussed_change'], text: '«Я взяла вільний ранок і не стала доводити, що змінилася назавжди. Іноді досить одного маленького рішення».', },
      ],
      options: [
        {
          id: 'final-v3-mara-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_mara_heard'],
        },
      ],
    },
    {
      id: 'final-v3-leo',
      speaker: 'Лео',
      text: '«Я сказав Марі, що іноді гублюся в словах. Вона не стала виправляти мою розгубленість. Ми просто домовилися не вгадувати думки одне одного».',
      options: [
        {
          id: 'final-v3-leo-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_leo_heard'],
        },
      ],
    },
    {
      id: 'final-v3-iris',
      speaker: 'Айріс',
      text: '«Так. Один відвідувач питав, чий це будинок. Я відповіла: не знаю. Він довго дивився на світло у вікні. І цього виявилося досить».',
      options: [
        {
          id: 'final-v3-iris-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_iris_heard'],
        },
      ],
    },
    {
      id: 'final-v3-anna',
      speaker: 'Анна',
      text: '«Спочатку обурилися. Потім принесли три різні книжки й почали сперечатися. Я не підсумувала за них. Здається, це був найкращий урок за місяць».',
      options: [
        {
          id: 'final-v3-anna-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_anna_heard'],
        },
      ],
    },
    {
      id: 'final-v3-thomas',
      speaker: 'Томас',
      text: '«Я запитав Анну, чи потрібна допомога. Вона сказала: посиди зі мною. Я сидів. Незвично важка робота. Але вперше за довгий час не поспішав її закінчити».',
      options: [
        {
          id: 'final-v3-thomas-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_thomas_heard'],
        },
      ],
    },
    {
      id: 'final-v3-nora',
      speaker: 'Нора',
      text: '«Три різні свідчення й чесну примітку, що ми не знаємо всього. Приватний лист не став експонатом. Архів від цього не збіднів».',
      options: [
        {
          id: 'final-v3-nora-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_nora_heard'],
        },
      ],
    },
    {
      id: 'final-v3-eleanor',
      speaker: 'Елеонора',
      text: '«Ні. Щоразу хочу пересунути його назад. Але сьогодні побачила, як біля вікна читає дитина. Мабуть, не кожна добра зміна має бути моєю ідеєю».',
      options: [
        {
          id: 'final-v3-eleanor-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_eleanor_heard'],
        },
      ],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Мара гасить свічку на столі, Елеонора зачиняє стару касу, а Анна залишає записку з датою наступної зустрічі. За вікном дощ перетворює ліхтарі на золоті плями. Книгарня знову має майбутнє — не тому, що всі історії завершилися однаково, а тому, що для нових залишилося місце.',
      textWhen: [
        {
          requires: ['final_mutual_conversation'],
          text: 'Мара гасить свічку, а Айріс і Лео повертаються з подвір’я. Ніхто не питає, про що вони говорили: довіра не потребує публічного звіту. Елеонора зачиняє касу, Анна залишає дату наступної зустрічі. У книгарні є майбутнє, бо люди самі вирішують, які історії розповідати.',
        },
        {
          requires: ['final_accepted_consequences'],
          text: 'Айріс іде додому з листом, не обіцяючи пробачення. Ви не намагаєтеся наздогнати її з поясненнями. Мара гасить свічку, Елеонора зачиняє касу. Книгарня залишиться відкритою завтра, але деякі стосунки відновлюються довше, ніж за п’ять днів.',
        },
        {
          requires: ['final_letter_kept_private'],
          text: 'Айріс забирає лист, не розгортаючи його при гостях. Лео не просить пояснень. Мара гасить свічку, Елеонора зачиняє касу, а Анна залишає дату наступної зустрічі. Історія книгарні триває: не кожна таємниця має стати відомою, щоб люди змогли рухатися далі.',
        },
        {
          requires: ['bookseller_values_consent', 'bookseller_chose_silence'],
          text: 'Після читання ти повертаєшся до зошита й дописуєш одне речення: «Мовчання теж може бути відповіддю». Френк спить на підвіконні, а за дверима стихають голоси. Ти не дізнався всіх чужих таємниць — і вперше не відчуваєш, що чогось бракує.',
        },
        {
          requires: ['bookseller_values_agency', 'bookseller_chose_presence'],
          text: 'Френк обережно торкається лапою твоєї долоні. Ти згадуєш, скільки разів хотів виправити чуже життя одним влучним рішенням. Тепер знаєш: іноді найкраща допомога — залишитися поруч і запитати, чого людина потребує. Завтра книгарня відчиниться знову.',
        },
        {
          requires: ['bookseller_values_change'],
          text: 'У зошиті лишається запис: «Не можна берегти місце, забороняючи йому змінюватися». Елеонора переставляє стілець для нового гостя, Анна забирає книжки до школи. Френк позіхає на підвіконні. Книгарня залишається собою саме тому, що в ній з’являється щось нове.',
        },
        {
          requires: ['final_repaired_rumor', 'final_iris_exhibition'],
          text: 'Пані Міллер першою вибачається за чутки, які розносила. Айріс тим часом поправляє табличку біля своїх малюнків: на ній лише назва виставки, без чужих пояснень. Елеонора гасить світло. У Беллвіку ще будуть помилки, але тепер є люди, готові їх визнавати.',
        },
        {
          requires: ['final_respected_privacy', 'final_supported_iris'],
          text: 'Пані Міллер стримує запитання, яке колись неодмінно поставила б уголос. Айріс забирає малюнки додому, і ніхто не називає це відмовою від друзів. Елеонора зачиняє касу. Книгарня стала місцем, де можна бути разом, не віддаючи іншим право вирішувати за себе.',
        },
      ],
      options: [],
    },
  ],
};

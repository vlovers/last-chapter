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
      options: [
        { id: 'anna', label: 'Послухати Анну про шкільний книжковий клуб', next: 'anna' },
        { id: 'rumor', label: 'Запропонувати поговорити про силу чуток', next: 'rumor' },
        { id: 'iris', label: 'Запитати Айріс про її малюнки', next: 'iris' },
        {
          id: 'letter',
          label: 'Повернутися до питання старого листа',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        {
          id: 'mara-callback',
          label: 'Згадати розмову з Марою',
          next: 'mara-callback',
          requires: ['mara_day_four_reflected'],
        },
        {
          id: 'eleanor-memory',
          label: 'Подякувати Елеонорі за історію книгарні',
          next: 'eleanor-memory',
          requires: ['eleanor_shared_shop_memory'],
        },
        {
          id: 'leo-memory',
          label: 'Поговорити з Лео про життя без розкладу',
          next: 'leo-memory',
          requires: ['leo_shared_future_plan'],
        },
        {
          id: 'miller-memory',
          label: 'Поговорити з пані Міллер про припущення',
          next: 'miller-memory',
          requires: ['miller_observation_distinguished'],
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
        { id: 'close', label: 'Завершити вечір спільним читанням', next: 'end' },
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
        { id: 'anna-back', label: 'Повернутися до гостей', next: 'gathering' },
      ],
    },
    {
      id: 'anna-maps',
      speaker: 'Анна',
      text: '«Так! Один учень намалював маршрут до бібліотеки, а поруч підписав: “Тут можна передумати”. Мені здається, він зрозумів книжку краще за мене».',
      options: [
        { id: 'maps-back', label: 'Посміхнутися й повернутися до гостей', next: 'gathering' },
      ],
    },
    {
      id: 'anna-mystery',
      speaker: 'Анна',
      text: '«Вони навіть склали правила: не називати людину винною, доки не вислухали її. Пані Міллер запропонувала додати це до правил клубу».',
      options: [{ id: 'mystery-back', label: 'Повернутися до гостей', next: 'gathering' }],
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
      id: 'end',
      speaker: 'Оповідач',
      text: 'Мара гасить свічку на столі, Елеонора зачиняє стару касу, а Анна залишає записку з датою наступної зустрічі. За вікном дощ перетворює ліхтарі на золоті плями. Книгарня знову має майбутнє — не тому, що всі історії завершилися однаково, а тому, що для нових залишилося місце.',
      options: [],
    },
  ],
};

import type { DialogueStory } from '../game/dialogue';

/** День другий: Анна — вчителька, а не лише об'єкт чужих чуток. */
export const annaVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Після обіду до книгарні заходить жінка з полотняною торбою, повною зошитів. Вона обережно струшує дощ із парасольки й усміхається, побачивши дитячі книжки.',
      options: [{ id: 'hello', label: 'Привітатися', next: 'hello' }],
    },
    {
      id: 'hello',
      speaker: 'Анна',
      text: '«Я Анна Гейл, викладаю в місцевій школі. У нас завтра читання, а бібліотечні примірники вирішили одночасно зникнути. Діти, звісно, називають це змовою».',
      textWhen: [
        {
          requires: ['anna_rumor_pressed', 'anna_rumor_boundary'],
          text: 'Анна поправляє ремінь торби. «Ти вже чув, що я не хочу говорити про Томаса, але все одно повернувся до цього». Вона кладе список на прилавок. «Давай сьогодні хоча б книжки виберемо без допиту».',
        },
        {
          requires: ['anna_rumor_pressed'],
          text: 'Анна зупиняється біля полиці й не дивиться на тебе. «Про Томаса я більше не говоритиму. Мені потрібні книжки для класу. Якщо допоможеш їх знайти — добре».',
        },
        {
          requires: ['anna_heard_rumor_admission'],
          text: 'Анна дістає список із кишені. «Після вчорашніх розмов я б воліла сьогодні просто вибрати книжки. Діти хоча б сперечаються про вигаданих героїв».',
        },
        {
          requires: ['anna_book_disagreement_discussed'],
          text: 'Анна дістає з торби два зошити. «Емма вже написала свою кінцівку, а Джуліан намалював карту острова. Тепер вони сперечаються, де поставити маяк». Вона усміхається. «Що покажеш їм наступним?».',
        },
        {
          requires: ['anna_listened_to'],
          text: 'Анна поправляє ремінь важкої торби. «Дякую, що вислухав. Але якщо я ще хвилину говоритиму про дорослі проблеми, діти завтра залишаться без книжок». Вона дивиться на полиці.',
        },
      ],
      options: [
        {
          id: 'anna-reading-help',
          label: '«Давай підберемо книжки для завтрашнього читання»',
          next: 'books',
        },
        {
          id: 'anna-reading-children',
          label: '«А що діти самі хочуть читати?»',
          next: 'school',
        },
        {
          id: 'anna-v3-conversation',
          label: '«А що ти кажеш, коли діти питають щось, чого сама не знаєш?»',
          next: 'anna-v3-conversation',
          requires: ['anna_book_disagreement_discussed'],
          unless: ['anna_uncertainty_discussed'],
        },
        {
          id: 'anna-reflection',
          label: '«А якщо дитина взагалі відмовиться читати вголос?»',
          next: 'anna-reflection',
          requires: ['anna_book_disagreement_discussed'],
          unless: ['anna_reflected_on_care'],
        },
        {
          id: 'anna-book-disagreement',
          label: '«Ти згадала дитячу змову. А вони хоч між собою домовляються, що читати?»',
          next: 'anna-book-disagreement',
          unless: ['anna_book_disagreement_discussed'],
        },
        { id: 'school', label: '«Що люблять читати ваші учні?»', next: 'school' },
        { id: 'anna-school-funny', label: '«А який найдивніший відгук на книжку ти отримувала?»', next: 'anna-school-funny' }
        { id: 'teacher', label: '«Вам подобається викладати?»', next: 'teacher' },
        { id: 'town', label: '«Як вам живеться в Беллвіку?»', next: 'town' },
        {
          id: 'rumor',
          label: '«Дехто розповідає про вашого чоловіка…»',
          next: 'rumor',
          requires: ['rumor_heard'],
        },
        { id: 'books', label: '«Пошукаємо книжки для читання»', next: 'books' },
      ],
    },
    {
      id: 'anna-book-disagreement',
      speaker: 'Анна',
      text: '«У мене в класі двоє таких. Емма вважає, що герой мав утекти з острова, а Джуліан — що залишитися. Минулого тижня вони навіть пересунули парти. Я хотіла помирити їх, а потім зрозуміла: вони вперше прочитали одну книжку так уважно».',
      options: [
        {
          id: 'anna-disagreement-debate',
          label: '«Можеш дати їм по три хвилини на захист своїх героїв»',
          next: 'anna-book-disagreement-result',
          grants: ['anna_classroom_debate_encouraged'],
        },
        {
          id: 'anna-disagreement-quiet',
          label: '«А якщо попросити їх переписати фінал кожного по-своєму?»',
          next: 'anna-book-disagreement-result',
          grants: ['anna_classroom_alternate_endings'],
        },
      ],
    },
    {
      id: 'anna-book-disagreement-result',
      speaker: 'Анна',
      text: '«Головне, щоб вони не почали кидатися книжками. Паперові обкладинки цього не заслужили».',
      textWhen: [
        {
          requires: ['anna_classroom_debate_encouraged'],
          text: '«Тоді влаштую дебати. Джуліан отримає три хвилини, Емма — три. І ніхто не муситиме вдавати, що передумав. Мені самій іноді не вистачає такого правила».',
        },
        {
          requires: ['anna_classroom_alternate_endings'],
          text: '«О, це їм сподобається. Емма намалює корабель, Джуліан побудує новий маяк. А я нарешті дізнаюся, що вони люблять у цій історії, замість вирішувати, хто правий».',
        },
      ],
      options: [
        {
          id: 'anna-disagreement-back',
          label: 'Повернутися до вибору книжок',
          next: 'books',
          grants: ['anna_book_disagreement_discussed'],
        },
      ],
    },
    {
      id: 'school',
      speaker: 'Анна',
      text: '«Один хлопчик любить історії про мандрівки, але не терпить щасливих кінцівок. Інша дівчинка читає тільки книжки, де герої мають домашніх тварин. Я навчилася не називати це поганим смаком».',
      options: [
        { id: 'school-question', label: '«А як ви знаходите спільну книжку?»', next: 'classroom' },
        { id: 'school-back', label: '«Про що ще поговоримо?»', next: 'hello' },
      ],
    },
    {
      id: 'classroom',
      speaker: 'Анна',
      text: '«Минулого разу Джуліан заявив, що головний герой — боягуз. Емма обурилася й принесла цитати на трьох сторінках». Анна сміється. «Я тільки встигала стежити, щоб вони не перекинули стіл».',
      options: [
        {
          id: 'classroom-back',
          label: '«І хто переміг у суперечці — Емма чи Джуліан?»',
          next: 'books',
        },
      ],
    },
    {
      id: 'teacher',
      speaker: 'Анна',
      text: '«Так. Хоча сьогодні я витратила сорок хвилин, пояснюючи, чому клей не є повноцінним обідом». Вона сміється. «Але бувають дні, коли дитина вперше читає вголос без страху. Заради цього варто прокидатися».',
      options: [
        {
          id: 'teacher-rest',
          label: '«У тебе хоч один вільний вечір цього тижня буде?»',
          next: 'rest',
        },
        { id: 'teacher-back', label: '«Повернімося до книжок»', next: 'books' },
      ],
    },
    {
      id: 'rest',
      speaker: 'Анна',
      text: '«Останнім часом нечасто. Томас теж багато працює. Ми іноді вечеряємо в різний час і залишаємо одне одному записки на холодильнику. Дурниці, але я сумую за справжніми розмовами».',
      options: [
        {
          id: 'rest-listen',
          label: '«Звучить самотньо»',
          next: 'listened',
          grants: ['anna_listened_to'],
        },
        { id: 'rest-respect', label: '«Не хочу втручатися»', next: 'respect' },
      ],
    },
    {
      id: 'town',
      speaker: 'Анна',
      text: '«Тут усе поруч: школа, пекарня, книгарня. Іноді навіть чужі висновки — надто поруч. Я люблю це місто, але хотіла б, щоб люди частіше запитували, перш ніж вирішувати за інших».',
      options: [
        {
          id: 'town-back',
          label: '«У Беллвіку новини й справді розходяться швидше за пошту»',
          next: 'books',
        },
        { id: 'town-books', label: '«Підберемо книжку для класу»', next: 'books' },
      ],
    },
    {
      id: 'rumor',
      speaker: 'Анна',
      text: '«Про Томаса?» Вона міцніше стискає ручку торби. «Я не хочу дізнаватися про свій шлюб від людей, які бачили когось здалеку. Якщо щось треба обговорити, ми поговоримо самі».',
      options: [
        {
          id: 'rumor-own-amplification',
          label: '«Я сам підтримав ці здогади. Не мав права»',
          next: 'rumor-own-amplification',
          requires: ['rumor_amplified'],
          grants: ['anna_heard_rumor_admission'],
        },
        {
          id: 'rumor-apologize',
          label: '«Вибачте. Не слід було переказувати»',
          next: 'respect',
          grants: ['anna_rumor_boundary'],
        },
        {
          id: 'rumor-push',
          label: '«Але ж ви маєте знати!»',
          next: 'push',
          grants: ['anna_rumor_pressed'],
        },
      ],
    },
    {
      id: 'rumor-own-amplification',
      speaker: 'Анна',
      text: '«Дякую, що не приховали цього. Але я тепер маю розбиратися не лише з Томасом, а й з тим, що говорять інші». Вона поправляє ремінець торби. «Мені потрібен час. І книжки для дітей — вони не зачекають, поки дорослі порозумнішають».',
      options: [
        {
          id: 'rumor-own-amplification-books',
          label: '«Звісно. Погляньмо на книжки»',
          next: 'books',
        },
      ],
    },
    {
      id: 'push',
      speaker: 'Анна',
      text: '«Я почула вас. Будь ласка, не продовжуйте». Її голос спокійний, але розмова вже не така тепла.',
      options: [{ id: 'push-end', label: 'Не затримувати Анну', next: 'end' }],
    },
    {
      id: 'listened',
      speaker: 'Анна',
      text: '«Трохи. Але я не хочу, щоб хтось робив із цього висновки про Томаса. Просто нам обом важко знайти час». Вона відкладає зошити. «Дякую, що вислухали».',
      options: [
        { id: 'listened-back', label: '«Можемо поговорити про щось інше»', next: 'hello' },
        { id: 'listened-books', label: '«Давайте знайдемо книжку»', next: 'books' },
      ],
    },
    {
      id: 'respect',
      speaker: 'Анна',
      text: '«Дякую. Іноді люди так хочуть допомогти, що забувають спитати, чи потрібна допомога». Вона дивиться на полицю біля вікна.',
      options: [{ id: 'respect-books', label: '«Покажу вам книжки»', next: 'books' }],
    },
    {
      id: 'books',
      speaker: 'Анна',
      text: '«Потрібна історія, після якої діти захочуть сперечатися — доброзичливо, звісно. Може, щось про карти й незнайомі дороги? Не обов’язково з єдиною правильною відповіддю».',
      options: [
        {
          id: 'maps',
          label: 'Порадити «Мапи незавершених доріг»',
          next: 'purchase',
          grants: ['anna_chose_maps'],
        },
        {
          id: 'mystery',
          label: 'Порадити «Ніхто не знає кінцівки»',
          next: 'purchase',
          grants: ['anna_chose_mystery'],
        },
        { id: 'browse', label: '«Можете спокійно переглянути полиці»', next: 'end' },
      ],
    },
    {
      id: 'purchase',
      speaker: 'Анна',
      text: '«Візьму. Може, спершу прочитаю сама, щоб бути готовою до їхніх запитань. Хоча вони однаково запитають те, чого я не передбачила».',
      options: [{ id: 'purchase-end', label: 'Загорнути книжку', next: 'end' }],
    },
    {
      id: 'anna-school-funny',
      speaker: 'Анна',
      text: '«Один хлопчик написав: “Книжка хороша, але дракон мало працює”. Я запитала, що це означає. Він сказав, що дракон весь час сидить на скарбі, а міг би допомагати на фермі». Анна сміється. «Тепер у нас на дошці висить розклад драконячих змін».',
      options: [
        { id: 'anna-school-funny-work', label: '«А скільки дракон заробляє?»', next: 'anna-school-funny-work' },
        { id: 'anna-school-funny-back', label: '«Звучить як хороший книжковий клуб»', next: 'hello', grants: ['anna_classroom_joke_heard'] },
      ],
    },
    {
      id: 'anna-school-funny-work',
      speaker: 'Анна',
      text: '«Два відра яблук на тиждень. Але Макс вимагає доплату за нічні зміни». Анна хитає головою. «Завтра розбиратимемося з профспілкою драконів. Я до цього не готувалася в університеті».',
      options: [{ id: 'anna-school-funny-work-back', label: '«Бажаю успіху на переговорах»', next: 'hello', grants: ['anna_classroom_joke_heard'] }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Анна виходить у дощ із книжкою або з новими ідеями для уроку. За вікном школярі перестрибують калюжі, сперечаючись про щось дуже важливе.',
      options: [],
    },
    {
      id: 'anna-reflection',
      speaker: 'Анна',
      text: '«Я вчу дітей ставити запитання. А сама іноді боюся попросити про допомогу».',
      options: [
        {
          id: 'anna-reflect-question',
          label: '«Що тебе найбільше виснажило цього тижня?»',
          next: 'anna-reflection-deep',
        },
        {
          id: 'anna-reflect-return',
          label: '«Дякую, що поділився цим»',
          next: 'anna-reflection-end',
        },
      ],
    },
    {
      id: 'anna-reflection-deep',
      speaker: 'Анна',
      text: '«Не хочу, щоб учні читали книжку лише заради правильної відповіді».',
      options: [
        {
          id: 'anna-reflect-continue',
          label: '«І що ти хочеш змінити?»',
          next: 'anna-reflection-classroom',
        },
        {
          id: 'anna-reflect-listen',
          label: '«Можна просто побути з цим»',
          next: 'anna-reflection-classroom',
        },
      ],
    },
    {
      id: 'anna-reflection-classroom',
      speaker: 'Анна',
      text: '«Учениця написала, що їй не сподобався фінал книжки. Я поставила схвальний знак, але вона переписала відповідь. Вирішила, що я чекала від неї іншого. Мені стало соромно».',
      options: [
        {
          id: 'anna-classroom-apologize',
          label: '«Поговори з нею про це»',
          next: 'anna-reflection-apology',
          grants: ['anna_will_apologize_to_student'],
        },
        {
          id: 'anna-classroom-discuss',
          label: '«Запропонуй класу посперечатися»',
          next: 'anna-reflection-discussion',
          grants: ['anna_will_invite_disagreement'],
        },
      ],
    },
    {
      id: 'anna-reflection-apology',
      speaker: 'Анна',
      text: '«Я скажу їй, що навіть учителі помиляються. Вона не мусить погоджуватися зі мною, щоб я поважала її думку».',
      options: [{ id: 'anna-apology-back', label: 'Послухати далі', next: 'anna-reflection-end' }],
    },
    {
      id: 'anna-reflection-discussion',
      speaker: 'Анна',
      text: '«Можемо почати з питання, чому героїня вчинила так, а не інакше. І я першою визнаю, що сама не впевнена у відповіді».',
      options: [
        { id: 'anna-discussion-back', label: 'Послухати далі', next: 'anna-reflection-end' },
      ],
    },
    {
      id: 'anna-reflection-end',
      speaker: 'Анна',
      text: '«Турбота — не іспит. Можна втомитися й усе одно залишитися доброю людиною».',
      textWhen: [
        {
          requires: ['anna_will_apologize_to_student'],
          text: '«Мабуть, перше, чого я маю навчити дітей, — дорослі теж можуть вибачатися. Особливо коли ненароком змушують мовчати».',
        },
        {
          requires: ['anna_will_invite_disagreement'],
          text: '«На наступному занятті я попрошу дітей заперечити мені. І не поспішатиму вирішувати, хто з нас правий».',
        },
      ],
      options: [
        {
          id: 'anna-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'hello',
          grants: ['anna_reflected_on_care'],
        },
      ],
    },
    {
      id: 'anna-v3-conversation',
      speaker: 'Анна',
      text: '«Учениця запитала, чи можна бути доброю людиною й не пробачити. Я не знайшла готової відповіді. Мене налякало не питання, а власна тиша».',
      options: [
        { id: 'anna-v3-ask', label: '«Що ти сказала?»', next: 'anna-v3-conversation-question' },
        {
          id: 'anna-v3-short',
          label: '«Можемо не продовжувати»',
          next: 'anna-v3-conversation-end',
        },
      ],
    },
    {
      id: 'anna-v3-conversation-question',
      speaker: 'Анна',
      text: '«Що повернемося до цього завтра. Але весь вечір думала, чи не підвела її. Дорослі звикли вдавати, що все знають».',
      options: [
        {
          id: 'anna-v3-challenge',
          label: '«А якщо невпевненість теж навчає?»',
          next: 'anna-v3-conversation-counter',
        },
        {
          id: 'anna-v3-listen',
          label: '«Залишимо питання відкритим»',
          next: 'anna-v3-conversation-end',
        },
      ],
    },
    {
      id: 'anna-v3-conversation-counter',
      speaker: 'Анна',
      text: '«Дитина прийшла по опору. Я боюся підмінити її власною розгубленістю. Та й удавати впевненість — теж нечесно».',
      options: [
        {
          id: 'anna-v3-follow',
          label: '«І що ти хочеш зробити?»',
          next: 'anna-v3-conversation-choice',
        },
        {
          id: 'anna-v3-pause',
          label: '«Не обов’язково вирішувати сьогодні»',
          next: 'anna-v3-conversation-end',
        },
      ],
    },
    {
      id: 'anna-v3-conversation-choice',
      speaker: 'Анна',
      text: '«Спробую сказати їм, що ми можемо шукати відповідь разом. І незгода не означає неповагу».',
      options: [
        { id: 'anna-v3-accept', label: '«Це твій вибір»', next: 'anna-v3-conversation-end' },
      ],
    },
    {
      id: 'anna-v3-conversation-end',
      speaker: 'Анна',
      text: '«Я запишу це для уроку, але не як готову відповідь. Може, дітям буде корисно побачити, що вчителька теж іноді шукає слова».',
      options: [
        {
          id: 'anna-v3-return',
          label: 'Повернутися до інших тем',
          next: 'hello',
          grants: ['anna_uncertainty_discussed'],
        },
      ],
    },
  ],
};

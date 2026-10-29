import type { DialogueStory } from '../game/dialogue';

/** Thomas's counseling is private. The player can challenge gossip without learning confidential details. */
export const thomasVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Після обіду світло над прилавком миготить. За кілька хвилин приходить Томас із ящиком інструментів. Він витирає черевики об килимок, хоча надворі вже сухо.',
      options: [{ id: 'greet', label: 'Привітатися й показати лампу', next: 'greet' }],
    },
    {
      id: 'greet',
      speaker: 'Томас',
      text: '«Томас Гейл. Якщо лампа тріщить, не треба її вмовляти. Вона від цього не стає чемнішою». Він ставить ящик на підлогу. «Можна глянути?»',
      textWhen: [
        {
          requires: ['thomas_listening_discussed'],
          text: 'Томас ставить ящик із інструментами біля дверей. «Анна сказала, що я вчора вперше дослухав її до кінця». Він криво усміхається. «Не знаю, чи це комплімент, але лампа тепер працює».',
        },
        {
          requires: ['thomas_reflected_on_responsibility'],
          text: 'Томас обережно кладе на стіл запасну лампочку. «Я приніс її безкоштовно. Ні, це не вибачення замість розмови». Він зітхає. «Хоча було б значно простіше».',
        },
      ],
      options: [
        {
          id: 'thomas-lamp-first',
          label: '«Так, ось вимикач. Вона блимає від учора»',
          next: 'repair',
        },
        {
          id: 'thomas-lamp-joke',
          label: '«А якщо чемно попросити — точно не допоможе?»',
          next: 'repair',
        },
        {
          id: 'thomas-v3-conversation',
          label: '«А з людьми в тебе так само добре виходить, як із лампами?»',
          next: 'thomas-v3-conversation',
          unless: ['thomas_listening_discussed'],
        },
        {
          id: 'thomas-reflection',
          label: '«Коли треба вибачитися, теж берешся спершу за інструменти?»',
          next: 'thomas-reflection',
          unless: ['thomas_reflected_on_responsibility'],
        },
        {
          id: 'thomas-chairs',
          label: '«Ти встиг занести стільці на шкільне читання?»',
          next: 'thomas-chairs',
          unless: ['thomas_chairs_discussed'],
        },
        {
          id: 'thomas-reading-challenge',
          label: '«Ти коли-небудь сперечався з кінцівкою книжки?»',
          next: 'thomas-reading-challenge',
          unless: ['thomas_reading_challenge_discussed'],
        },
        { id: 'books', label: '«Ви любите читати?»', next: 'books' },
        { id: 'anna', label: '«Анна заходила до нас»', next: 'anna' },
        {
          id: 'rumor',
          label: '«Про вас у місті ходять чутки»',
          next: 'rumor',
          requires: ['rumor_heard'],
        },
        { id: 'finish', label: 'Подякувати за візит', next: 'end' },
      ],
    },
    {
      id: 'thomas-chairs',
      speaker: 'Томас',
      text: 'Томас завмирає з викруткою в руці. «Стільці. Я обіцяв Анні занести їх до класу. Вчора взяв термінове замовлення й навіть не подзвонив. Вона сама носила їх сходами». Він дивиться на годинник. «Я вже не виправлю вчора, але можу хоча б не робити вигляд, що нічого не сталося».',
      options: [
        {
          id: 'thomas-chairs-own',
          label: '«Скажи Анні правду й запитай, як можеш допомогти тепер»',
          next: 'thomas-chairs-result',
          grants: ['thomas_chairs_owned_mistake'],
        },
        {
          id: 'thomas-chairs-fix',
          label: '«Може, просто принести нові стільці?»',
          next: 'thomas-chairs-result',
          grants: ['thomas_chairs_avoided_conversation'],
        },
      ],
    },
    {
      id: 'thomas-chairs-result',
      speaker: 'Томас',
      text: '«Я не люблю, коли через мене хтось мусить робити зайву роботу». Він складає інструменти.',
      textWhen: [
        {
          requires: ['thomas_chairs_owned_mistake'],
          text: '«Подзвоню їй зараз. Не щоб мене похвалили за вибачення. Просто вона має знати, що я пам’ятаю свою обіцянку». Він дістає телефон і відходить до вікна.',
        },
        {
          requires: ['thomas_chairs_avoided_conversation'],
          text: '«Можу принести хоч десять нових стільців. Але це не поверне Анні вечір, який вона витратила через мене». Томас відкладає телефон. Схоже, розмова знову почекає.',
        },
      ],
      options: [
        {
          id: 'thomas-chairs-back',
          label: 'Повернутися до розмови',
          next: 'greet',
          grants: ['thomas_chairs_discussed'],
        },
      ],
    },
    {
      id: 'thomas-reading-challenge',
      speaker: 'Томас',
      text: '«Анна дала мені роман про чоловіка, який двадцять років ремонтував човен, замість вийти в море. Я дочитав і розлютився. Не на нього навіть — на автора. Навіщо писати стільки сторінок про людину, яка нічого не робить?» Він перевіряє контакт у лампі. «А потім подумав, що я сам третій місяць відкладаю одну розмову».',
      options: [
        {
          id: 'thomas-reading-defend',
          label: '«Можливо, книжка й не зобов’язана показувати героя сміливим»',
          next: 'thomas-reading-result',
          grants: ['thomas_book_ambiguity_accepted'],
        },
        {
          id: 'thomas-reading-argue',
          label: '«Я теж розлютився б. Читачеві хочеться дії»',
          next: 'thomas-reading-result',
          grants: ['thomas_book_ending_disputed'],
        },
      ],
    },
    {
      id: 'thomas-reading-result',
      speaker: 'Томас',
      text: '«Може, Анна мала рацію: книжки часом корисніші за інструкції. Хоча інструкція хоча б не закінчується на найцікавішому місці».',
      textWhen: [
        {
          requires: ['thomas_book_ambiguity_accepted'],
          text: '«Знаєш, я хотів, щоб він нарешті поплив. А може, він і не мусив. Просто я не люблю впізнавати себе в героях, які стоять на березі». Томас усміхається без особливої радості.',
        },
        {
          requires: ['thomas_book_ending_disputed'],
          text: '«От! Я дочитав двісті сторінок, щоб побачити, як він знову фарбує борт. Але тепер мені цікаво, чи Анна захищатиме таку кінцівку. Схоже, у нас буде про що посперечатися за вечерею».',
        },
      ],
      options: [
        {
          id: 'thomas-reading-back',
          label: 'Повернутися до розмови про лампу',
          next: 'greet',
          grants: ['thomas_reading_challenge_discussed'],
        },
      ],
    },
    {
      id: 'repair',
      speaker: 'Томас',
      text: '«Старий контакт. Не страшно, але краще замінити». Він дістає маленький ліхтарик. «Люблю лагодити речі. Шкода, що не все у світі має зрозумілу схему».',
      options: [
        { id: 'repair-follow', label: '«Важко, коли не знаєш причини?»', next: 'work' },
        { id: 'repair-back', label: '«Що ще?»', next: 'greet' },
      ],
    },
    {
      id: 'work',
      speaker: 'Томас',
      text: '«Так. Останнім часом замовлень то забагато, то зовсім немає. Від цього важко планувати навіть вихідні». Він ховає викрутку. «Але лампа буде працювати».',
      options: [
        {
          id: 'work-back',
          label: '«Дякую за ремонт»',
          next: 'greet',
          grants: ['thomas_shared_work_stress'],
        },
      ],
    },
    {
      id: 'books',
      speaker: 'Томас',
      text: '«Читаю інструкції. Інколи двічі». Він сміється. «Анна намагається підсунути мені роман, де люди говорять про свої почуття. Підозрюю, це натяк».',
      options: [
        { id: 'books-follow', label: '«Може, почати з короткої історії?»', next: 'recommend' },
        { id: 'books-back', label: '«Поговорімо про інше»', next: 'greet' },
      ],
    },
    {
      id: 'recommend',
      speaker: 'Томас',
      text: '«Головне, щоб там не було героя, який усе вирішує мовчанням. Я й сам іноді так роблю — не найкращий метод».',
      options: [
        {
          id: 'recommend-back',
          label: '«Вибір за вами»',
          next: 'greet',
          grants: ['thomas_considered_book'],
        },
      ],
    },
    {
      id: 'anna',
      speaker: 'Томас',
      text: '«Справді? Вона вже знайшла щось для дітей? У них завтра читання. Я пообіцяв занести додаткові стільці». Він перевіряє час. «Не забуду».',
      options: [{ id: 'anna-back', label: '«Передам вітання, якщо побачу»', next: 'greet' }],
    },
    {
      id: 'rumor',
      speaker: 'Томас',
      text: 'Він кладе викрутку. «Я чув. Мені неприємно, що люди вирішили: вони знають усе, побачивши мене на вулиці».',
      options: [
        {
          id: 'rumor-own-words',
          label: '«Я теж зробив висновок без доказів. Вибач»',
          next: 'rumor-own-words',
          requires: ['rumor_amplified'],
          unless: ['thomas_heard_rumor_apology'],
          grants: ['thomas_heard_rumor_apology'],
        },
        {
          id: 'rumor-boundary',
          label: '«Я не буду поширювати неперевірене»',
          next: 'boundary',
          grants: ['thomas_rumor_respected'],
        },
        {
          id: 'rumor-push',
          label: '«Тоді поясніть, із ким ви зустрічалися»',
          next: 'push',
          grants: ['thomas_privacy_pressed'],
        },
      ],
    },
    {
      id: 'rumor-own-words',
      speaker: 'Томас',
      text: '«Дякую, що сказали це мені, а не комусь за моєю спиною». Він обережно кладе викрутку. «Але Анна могла почути вашу першу версію. Я не можу зробити вигляд, що її не було».',
      options: [
        {
          id: 'rumor-own-words-back',
          label: '«Розумію. Більше не повторюватиму цього»',
          next: 'greet',
        },
      ],
    },
    {
      id: 'boundary',
      speaker: 'Томас',
      text: '«Дякую. Якщо я захочу щось розповісти, то спершу Анні. Це не означає, що в нас усе ідеально. Просто наші розмови належать нам».',
      options: [{ id: 'boundary-back', label: '«Повернімося до лампи»', next: 'greet' }],
    },
    {
      id: 'push',
      speaker: 'Томас',
      text: '«Це не ваша справа». Він говорить тихо, але твердо. «Я полагоджу лампу. А про решту прошу не запитувати».',
      options: [{ id: 'push-end', label: 'Завершити розмову', next: 'end' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Томас закручує кришку вимикача. Світло більше не миготить. За дверима книгарні знову чути голоси перехожих, але тепер ви знаєте, що чутки — не те саме, що факти.',
      options: [],
    },
    {
      id: 'thomas-reflection',
      speaker: 'Томас',
      text: '«Лампочку замінити просто. А от виправити те, що хтось про тебе подумав, — ні».',
      options: [
        {
          id: 'thomas-reflect-question',
          label: '«А що для тебе в цьому найважче?»',
          next: 'thomas-reflection-deep',
        },
        {
          id: 'thomas-reflect-return',
          label: '«Дякую, що поділився цим»',
          next: 'thomas-reflection-end',
        },
      ],
    },
    {
      id: 'thomas-reflection-deep',
      speaker: 'Томас',
      text: '«Якщо я зробив щось корисне, це не означає, що мені пробачили».',
      options: [
        {
          id: 'thomas-reflect-continue',
          label: '«І що ти хочеш змінити?»',
          next: 'thomas-reflection-workshop',
        },
        {
          id: 'thomas-reflect-listen',
          label: '«Можна просто побути з цим»',
          next: 'thomas-reflection-workshop',
        },
      ],
    },
    {
      id: 'thomas-reflection-workshop',
      speaker: 'Томас',
      text: '«Я полагодив удома шафу, хоча Анна просила мене просто послухати. Я думав, що зробив добру справу. А вона сказала: ти знову не почув, чого я потребую».',
      options: [
        {
          id: 'thomas-workshop-ask',
          label: '«Спробуй спочатку запитати»',
          next: 'thomas-reflection-ask',
          grants: ['thomas_will_ask_before_helping'],
        },
        {
          id: 'thomas-workshop-fear',
          label: '«Чому тобі так важливо все виправити?»',
          next: 'thomas-reflection-fear',
          grants: ['thomas_admitted_fear_of_rejection'],
        },
      ],
    },
    {
      id: 'thomas-reflection-ask',
      speaker: 'Томас',
      text: '«Можу запитати: тобі потрібна порада, допомога чи щоб я просто побув поруч? Тільки доведеться прийняти будь-яку відповідь».',
      options: [{ id: 'thomas-ask-back', label: 'Послухати далі', next: 'thomas-reflection-end' }],
    },
    {
      id: 'thomas-reflection-fear',
      speaker: 'Томас',
      text: '«Коли я корисний, мені здається, що мене не залишать. Неприємно визнавати, що іноді я допомагаю й потай чекаю за це любові».',
      options: [{ id: 'thomas-fear-back', label: 'Послухати далі', next: 'thomas-reflection-end' }],
    },
    {
      id: 'thomas-reflection-end',
      speaker: 'Томас',
      text: '«Можливо, іноді краще запитати, що потрібно іншому, ніж одразу братися ремонтувати».',
      textWhen: [
        {
          requires: ['thomas_will_ask_before_helping'],
          text: '«Завтра спитаю Анну, що їй потрібно. І прийму відповідь, навіть якщо мої інструменти цього разу не знадобляться».',
        },
        {
          requires: ['thomas_admitted_fear_of_rejection'],
          text: '«Я скажу їй, що боюся стати зайвим. Це страшніше за будь-яку поломку, але мовчання вже нічого не лагодить».',
        },
      ],
      options: [
        {
          id: 'thomas-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'greet',
          grants: ['thomas_reflected_on_responsibility'],
        },
      ],
    },
    {
      id: 'thomas-v3-conversation',
      speaker: 'Томас',
      text: '«Коли Анна мовчить, я починаю шукати, що ще полагодити вдома. Так легше, ніж спитати, що сталося».',
      options: [
        {
          id: 'thomas-v3-ask',
          label: '«Ти запитував, чого вона хоче?»',
          next: 'thomas-v3-conversation-question',
        },
        {
          id: 'thomas-v3-short',
          label: '«Можемо не продовжувати»',
          next: 'thomas-v3-conversation-end',
        },
      ],
    },
    {
      id: 'thomas-v3-conversation-question',
      speaker: 'Томас',
      text: '«Ні. Боюся почути: нічого. І тоді мені доведеться просто сидіти поруч, не будучи корисним».',
      options: [
        {
          id: 'thomas-v3-challenge',
          label: '«А хіба присутність — не дія?»',
          next: 'thomas-v3-conversation-counter',
        },
        {
          id: 'thomas-v3-listen',
          label: '«Залишимо питання відкритим»',
          next: 'thomas-v3-conversation-end',
        },
      ],
    },
    {
      id: 'thomas-v3-conversation-counter',
      speaker: 'Томас',
      text: '«Найскладніша. З інструментом я знаю, куди подіти руки. Без нього доводиться слухати».',
      options: [
        {
          id: 'thomas-v3-follow',
          label: '«І що ти хочеш зробити?»',
          next: 'thomas-v3-conversation-choice',
        },
        {
          id: 'thomas-v3-pause',
          label: '«Не обов’язково вирішувати сьогодні»',
          next: 'thomas-v3-conversation-end',
        },
      ],
    },
    {
      id: 'thomas-v3-conversation-choice',
      speaker: 'Томас',
      text: '«Спробую не виправляти її настрій. Просто запитаю, чи можна побути поряд».',
      options: [
        { id: 'thomas-v3-accept', label: '«Це твій вибір»', next: 'thomas-v3-conversation-end' },
      ],
    },
    {
      id: 'thomas-v3-conversation-end',
      speaker: 'Томас',
      text: '«Гаразд. Піду перевірю ту лампу, поки вона знову не почала сваритися зі мною». Він підхоплює ящик, але цього разу не поспішає до дверей.',
      options: [
        {
          id: 'thomas-v3-return',
          label: 'Повернутися до інших тем',
          next: 'greet',
          grants: ['thomas_listening_discussed'],
        },
      ],
    },
  ],
};

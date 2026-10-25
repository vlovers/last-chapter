import type { DialogueStory } from '../game/dialogue';

/** Thomas's counseling is private. The player can challenge gossip without learning confidential details. */
export const thomasVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Після обіду світло над прилавком миготить. За кілька хвилин приходить Томас із ящиком інструментів. Він витирає черевики об килимок, хоча надворі вже сухо.',
      options: [{        { id: 'thomas-reflection', label: 'Поговорити про те, що складно сказати вголос', next: 'thomas-reflection' },
 id: 'greet', label: 'Привітатися й показати лампу', next: 'greet' }],
    },
    {
      id: 'greet',
      speaker: 'Томас',
      text: '«Томас Гейл. Якщо лампа тріщить, не треба її вмовляти. Вона від цього не стає чемнішою». Він ставить ящик на підлогу. «Можна глянути?»',
      options: [
        { id: 'repair', label: '«Так, покажу вимикач»', next: 'repair' },
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
        { id: 'thomas-reflect-question', label: '«А що для тебе в цьому найважче?»', next: 'thomas-reflection-deep' },
        { id: 'thomas-reflect-return', label: '«Дякую, що поділився цим»', next: 'thomas-reflection-end' },
      ],
    },
    {
      id: 'thomas-reflection-deep',
      speaker: 'Томас',
      text: '«Якщо я зробив щось корисне, це не означає, що мені пробачили».',
      options: [
        { id: 'thomas-reflect-continue', label: '«І що ти хочеш змінити?»', next: 'thomas-reflection-end' },
        { id: 'thomas-reflect-listen', label: '«Можна просто побути з цим»', next: 'thomas-reflection-end' },
      ],
    },
    {
      id: 'thomas-reflection-end',
      speaker: 'Томас',
      text: '«Можливо, іноді краще запитати, що потрібно іншому, ніж одразу братися ремонтувати».',
      options: [
        { id: 'thomas-reflect-finish', label: 'Повернутися до розмови', next: 'arrival', grants: ['thomas_reflected_on_responsibility'] },
      ],
    },
  ],
};

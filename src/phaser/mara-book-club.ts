import type { ConversationTopic } from './conversation-engine';

export const maraBookClub: ConversationTopic = {
  id: 'mara.book-club.v1',
  title: 'Книжкові суперечки з Марою',
  entry: 'welcome',
  nodes: [
    {
      id: 'welcome',
      speaker: 'Мара',
      text: 'Тільки не кажи, що знову хтось назвав Тамліна однозначним лиходієм. Мене цікавить інше: чи можна любити героя й не виправдовувати його вчинки?',
      choices: [
        {
          id: 'empathy',
          label: 'Тамліна варто спробувати зрозуміти',
          next: 'tamlin',
          remember: 'mara:tamlin:empathy',
        },
        {
          id: 'critical',
          label: 'Розуміти — не означає виправдовувати',
          next: 'tamlin',
          remember: 'mara:tamlin:accountability',
        },
        {
          id: 'rhys',
          label: 'А чому Різанду пробачають більше?',
          next: 'rhys',
          remember: 'mara:rhys:double-standard',
        },
        { id: 'leave', label: 'Повернімося до роботи', next: '__exit' },
      ],
    },
    {
      variants: [
        {
          when: 'mara:tamlin:empathy',
          text: 'От і мені хочеться його зрозуміти. Чого він боїться, чому не слухає? Тільки я б не хотіла, щоб цим у клубі закінчувалася розмова. А що робити з тим, як він поводиться?',
        },
        {
          when: 'mara:tamlin:accountability',
          text: 'Згодна. Мене дратує, коли в клубі кажуть: «Він же боявся її втратити», — і на цьому все. А вона має сидіти під замком, щоб йому було спокійніше? Де ти проводиш межу?',
        },
      ],
      id: 'tamlin',
      speaker: 'Мара',
      text: 'Мені цікавіше розібратися, чому він так чинить, ніж одразу викреслити його з книжки. Але страх втратити когось не дає права замикати цю людину. Де ти проводиш межу?',
      choices: [
        {
          id: 'motives',
          label: 'Мотиви важливі, але наслідки теж',
          next: 'rhys',
          remember: 'mara:motives-and-consequences',
        },
        {
          id: 'fiction',
          label: 'У книжці мені цікаві навіть небезпечні герої',
          next: 'fiction',
          remember: 'mara:fiction-not-reality',
        },
        { id: 'exit', label: 'Мені треба обслужити клієнта', next: '__exit', suspend: true },
      ],
    },
    {
      id: 'rhys',
      speaker: 'Мара',
      text: 'У Різанда харизма працює як чудова реклама. Але подвійні стандарти не роблять усі рішення однаковими. Де для тебе межа між захистом і контролем?',
      choices: [
        {
          id: 'agency',
          label: 'Коли за іншу людину вирішують без неї',
          next: 'mara-personal',
          remember: 'mara:agency',
        },
        {
          id: 'compare',
          label: 'Порівняймо це із Зейденом',
          next: 'xaden',
          remember: 'mara:xaden-transition',
        },
        { id: 'cat', label: 'А Френк кого підтримав би?', next: 'frank' },
        { id: 'exit', label: 'Продовжимо іншим разом', next: '__exit', suspend: true },
      ],
    },
    {
      id: 'fiction',
      speaker: 'Мара',
      text: 'Так! Я теж читаю про людей, яких не запросила б на каву. Інакше половина моєї полиці спорожніла б. Просто не хочу, щоб у клубі за улюбленого лиходія вимагали виправдовуватися.',
      choices: [
        { id: 'xaden', label: 'Тоді поговорімо про Зейдена', next: 'xaden' },
        { id: 'nesta', label: 'А що думаєш про Несту?', next: 'nesta' },
        { id: 'back', label: 'Повернімося до Тамліна', next: 'tamlin' },
        { id: 'exit', label: 'На сьогодні досить', next: '__exit' },
      ],
    },
    {
      id: 'xaden',
      speaker: 'Мара',
      text: 'Зейден цікавий не тим, що в нього є секрети. Цікаво, коли мовчання захищає когось, а коли просто позбавляє близьку людину права обирати. Ти довіряла б тому, хто приховує важливе?',
      choices: [
        {
          id: 'trust',
          label: 'Довіра потребує правди',
          next: 'mara-personal',
          remember: 'mara:trust-truth',
        },
        {
          id: 'context',
          label: 'Іноді таємниця має причину',
          next: 'mara-personal',
          remember: 'mara:trust-context',
        },
        { id: 'hp', label: 'А як щодо секретів у Гаррі Поттері?', next: 'potter' },
        { id: 'exit', label: 'Поговоримо пізніше', next: '__exit', suspend: true },
      ],
    },
    {
      id: 'nesta',
      speaker: 'Мара',
      text: 'Мені подобається, що Неста огризається, а не всім усміхається. Хоч іноді хочеться сказати: «Ти злишся — добре, але до чого тут усі решта?» Тобі цікаво було б читати про неї, якби вона стала чемною з усіма?',
      choices: [
        {
          id: 'yes',
          label: 'Так, зростання не дорівнює слухняності',
          next: 'mara-personal',
          remember: 'mara:nesta-agency',
        },
        { id: 'other', label: 'Повернімося до теми складних героїв', next: 'fiction' },
        { id: 'exit', label: 'Досить суперечок на сьогодні', next: '__exit' },
      ],
    },
    {
      id: 'potter',
      speaker: 'Мара',
      text: 'Для мене історії про Гоґвортс — не тільки магія. Це відчуття, що десь існує місце, де тебе чекають. Кумедно: я працюю поруч із книгарнею, а шукаю той самий затишок у вигаданому замку.',
      choices: [
        {
          id: 'home',
          label: 'Дім — це передусім люди',
          next: 'mara-personal',
          remember: 'mara:home-people',
        },
        { id: 'frank', label: 'У нас тут є свій охоронець затишку — Френк', next: 'frank' },
        { id: 'exit', label: 'Повернімося до книжок іншим разом', next: '__exit', suspend: true },
      ],
    },
    {
      id: 'frank',
      speaker: 'Мара',
      text: 'У нього такі вуха, ніби він підслухав фінал усіх історій. Це девон-рекс? Він уже встиг поспати на моїй книжці. Чому саме на моїй?',
      choices: [
        {
          id: 'warm',
          label: 'Вона просто найтепліша',
          next: 'frank-story',
          remember: 'mara:frank:warm',
        },
        {
          id: 'judge',
          label: 'Він чудово розбирається в людях',
          next: 'frank-story',
          remember: 'mara:frank:judge',
        },
        {
          id: 'boss',
          label: 'Френк — справжній власник книгарні',
          next: 'frank-story',
          remember: 'mara:frank:boss',
        },
        { id: 'exit', label: 'Нехай поспить, я піду працювати', next: '__exit' },
      ],
    },
    {
      id: 'frank-story',
      speaker: 'Мара',
      text: 'Колись я теж знала кота, який приходив тільки тоді, коли мені було сумно. Може, то випадковість. Але я досі пам’ятаю, як він мовчки сидів поруч. Інколи це краще за поради.',
      choices: [
        {
          id: 'listen',
          label: 'Хочеш розповісти про нього?',
          next: 'mara-personal',
          remember: 'mara:frank:opened-up',
        },
        {
          id: 'respect',
          label: 'Не обов’язково розповідати, якщо не хочеш',
          next: 'mara-personal',
          remember: 'mara:boundaries',
        },
        { id: 'books', label: 'Може, оберемо Френкові книжку?', next: 'fiction' },
        { id: 'exit', label: 'Побачимося пізніше', next: '__exit', suspend: true },
      ],
    },
    {
      id: 'mara-personal',
      speaker: 'Мара',
      text: 'Колись за мене часто домовлялися: куди підемо, з ким зустрінемося. Спершу я навіть раділа, що не треба нічого планувати. А потім виявилося, що я й сама не можу сказати, чого хочу. Мабуть, тому так чіпляюся до цих сцен у романах.',
      choices: [
        {
          id: 'hear',
          label: 'Я слухаю. Можеш не поспішати',
          next: 'closing',
          remember: 'mara:personal:heard',
        },
        {
          id: 'question',
          label: 'Ти говориш про когось конкретного?',
          next: 'closing',
          remember: 'mara:personal:asked',
        },
        {
          id: 'respect',
          label: 'Не треба розповідати більше, ніж хочеш',
          next: 'closing',
          remember: 'mara:personal:respected',
        },
        {
          id: 'exit',
          label: 'Можемо повернутися до цього іншим разом',
          next: '__exit',
          suspend: true,
        },
      ],
    },
    {
      variants: [
        {
          when: 'mara:personal:asked',
          text: 'Так, про конкретну людину. Ім’я поки залишу при собі, добре? Я ще й сама в цьому розбираюся. Дякую, що вислухала. За книжкою теж треба буде повернутися — я ж так нічого й не вибрала.',
        },
      ],
      id: 'closing',
      speaker: 'Мара',
      text: 'Дякую, що вислухала. Я збиралася тільки вибрати книжку, а вже й про своє розповіла. Треба все-таки щось узяти, поки ми не почали ще одну суперечку.',
      choices: [
        { id: 'loop', label: 'А ще я хотіла запитати про Несту', next: 'nesta' },
        { id: 'loop2', label: 'Повернімося до Різанда', next: 'rhys' },
        { id: 'end', label: 'До наступної зустрічі, Маро', next: '__exit' },
      ],
    },
  ],
};

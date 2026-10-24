import type { ConversationTopic } from './conversation-engine';

export const maraBookClub: ConversationTopic = {
  id: 'mara.book-club.v1',
  title: 'Книжкові суперечки з Марою',
  entry: 'welcome',
  nodes: [
    { id: 'welcome', speaker: 'Мара', text: 'Тільки не кажи, що знову хтось назвав Тамліна однозначним лиходієм. Мене цікавить інше: чи можна любити героя й не виправдовувати його вчинки?', choices: [
      { id: 'empathy', label: 'Тамліна варто спробувати зрозуміти', next: 'tamlin', remember: 'mara:tamlin:empathy' },
      { id: 'critical', label: 'Розуміти — не означає виправдовувати', next: 'tamlin', remember: 'mara:tamlin:accountability' },
      { id: 'rhys', label: 'А чому Різанду пробачають більше?', next: 'rhys', remember: 'mara:rhys:double-standard' },
      { id: 'cat', label: 'Стривай, Френк знову вкрав закладку!', next: 'frank' },
      { id: 'leave', label: 'Повернімося до роботи', next: '__exit' },
    ] },
    { id: 'tamlin', speaker: 'Мара', text: 'Ось що мене дратує в книжкових суперечках: ми плутаємо причини з виправданнями. Людина може боятися втрати й усе одно робити боляче. А як ти це розділяєш?', choices: [
      { id: 'motives', label: 'Мотиви важливі, але наслідки теж', next: 'rhys', remember: 'mara:motives-and-consequences' },
      { id: 'fiction', label: 'У книжці мені цікаві навіть небезпечні герої', next: 'fiction', remember: 'mara:fiction-not-reality' },
      { id: 'exit', label: 'Мені треба обслужити клієнта', next: '__exit' },
    ] },
    { id: 'rhys', speaker: 'Мара', text: 'У Різанда харизма працює як чудова реклама. Але подвійні стандарти не роблять усі рішення однаковими. Де для тебе межа між захистом і контролем?', choices: [
      { id: 'agency', label: 'Коли за іншу людину вирішують без неї', next: 'mara-personal', remember: 'mara:agency' },
      { id: 'compare', label: 'Порівняймо це із Зейденом', next: 'xaden', remember: 'mara:xaden-transition' },
      { id: 'cat', label: 'А Френк кого підтримав би?', next: 'frank' },
      { id: 'exit', label: 'Продовжимо іншим разом', next: '__exit' },
    ] },
    { id: 'fiction', speaker: 'Мара', text: 'Так! Мені теж подобається читати про людей, яких я б не запросила на каву. І це не лицемірство. Література дозволяє прожити небезпечне на безпечній відстані.', choices: [
      { id: 'xaden', label: 'Тоді поговорімо про Зейдена', next: 'xaden' },
      { id: 'nesta', label: 'А що думаєш про Несту?', next: 'nesta' },
      { id: 'back', label: 'Повернімося до Тамліна', next: 'tamlin' },
      { id: 'exit', label: 'На сьогодні досить', next: '__exit' },
    ] },
    { id: 'xaden', speaker: 'Мара', text: 'Зейден цікавий не тим, що в нього є секрети. Цікаво, коли мовчання захищає когось, а коли просто позбавляє близьку людину права обирати. Ти довіряла б тому, хто приховує важливе?', choices: [
      { id: 'trust', label: 'Довіра потребує правди', next: 'mara-personal', remember: 'mara:trust-truth' },
      { id: 'context', label: 'Іноді таємниця має причину', next: 'mara-personal', remember: 'mara:trust-context' },
      { id: 'hp', label: 'А як щодо секретів у Гаррі Поттері?', next: 'potter' },
      { id: 'exit', label: 'Поговоримо пізніше', next: '__exit' },
    ] },
    { id: 'nesta', speaker: 'Мара', text: 'Неста мене захоплює саме тим, що вона не зобов’язана бути зручною. Та складне минуле не знімає відповідальності. Чи може персонаж дорослішати, не стаючи приємним для всіх?', choices: [
      { id: 'yes', label: 'Так, зростання не дорівнює слухняності', next: 'mara-personal', remember: 'mara:nesta-agency' },
      { id: 'other', label: 'Повернімося до теми складних героїв', next: 'fiction' },
      { id: 'exit', label: 'Досить суперечок на сьогодні', next: '__exit' },
    ] },
    { id: 'potter', speaker: 'Мара', text: 'Для мене історії про Гоґвортс — не тільки магія. Це відчуття, що десь існує місце, де тебе чекають. Кумедно: я працюю поруч із книгарнею, а шукаю той самий затишок у вигаданому замку.', choices: [
      { id: 'home', label: 'Дім — це передусім люди', next: 'mara-personal', remember: 'mara:home-people' },
      { id: 'frank', label: 'У нас тут є свій охоронець затишку — Френк', next: 'frank' },
      { id: 'exit', label: 'Повернімося до книжок іншим разом', next: '__exit' },
    ] },
    { id: 'frank', speaker: 'Мара', text: 'У нього такі вуха, ніби він підслухав фінал усіх історій. Це девон-рекс? А чому він обрав саме мою книжку, щоб на ній заснути?', choices: [
      { id: 'warm', label: 'Вона просто найтепліша', next: 'frank-story', remember: 'mara:frank:warm' },
      { id: 'judge', label: 'Він чудово розбирається в людях', next: 'frank-story', remember: 'mara:frank:judge' },
      { id: 'boss', label: 'Френк — справжній власник книгарні', next: 'frank-story', remember: 'mara:frank:boss' },
      { id: 'back', label: 'Повернімося до нашої суперечки', next: 'rhys' },
      { id: 'exit', label: 'Нехай поспить, я піду працювати', next: '__exit' },
    ] },
    { id: 'frank-story', speaker: 'Мара', text: 'Колись я теж знала кота, який приходив тільки тоді, коли мені було сумно. Може, то випадковість. Але я досі пам’ятаю, як він мовчки сидів поруч. Інколи це краще за поради.', choices: [
      { id: 'listen', label: 'Хочеш розповісти про нього?', next: 'mara-personal', remember: 'mara:frank:opened-up' },
      { id: 'respect', label: 'Не обов’язково розповідати, якщо не хочеш', next: 'mara-personal', remember: 'mara:boundaries' },
      { id: 'books', label: 'Може, оберемо Френкові книжку?', next: 'fiction' },
      { id: 'exit', label: 'Побачимося пізніше', next: '__exit' },
    ] },
    { id: 'mara-personal', speaker: 'Мара', text: 'Я так впевнено сперечаюся про контроль у романах, бо колись плутала його з турботою. Іноді дуже хочеться, щоб хтось усе вирішив за тебе. А потім раптом розумієш, що твого голосу більше ніхто не чує.', choices: [
      { id: 'hear', label: 'Я слухаю. Можеш не поспішати', next: 'closing', remember: 'mara:personal:heard' },
      { id: 'question', label: 'Ти говориш про когось конкретного?', next: 'closing', remember: 'mara:personal:asked' },
      { id: 'respect', label: 'Не треба розповідати більше, ніж хочеш', next: 'closing', remember: 'mara:personal:respected' },
      { id: 'exit', label: 'Можемо повернутися до цього іншим разом', next: '__exit' },
    ] },
    { id: 'closing', speaker: 'Мара', text: 'Дякую. Знаєш, я прийшла по книжку, а залишилася сперечатися про героїв і згадувати речі, про які зазвичай мовчу. Френк, здається, теж усе чув. Сподіваюся, він уміє берегти таємниці.', choices: [
      { id: 'loop', label: 'А ще я хотіла запитати про Несту', next: 'nesta' },
      { id: 'loop2', label: 'Повернімося до Різанда', next: 'rhys' },
      { id: 'end', label: 'До наступної зустрічі, Маро', next: '__exit' },
    ] },
  ],
};

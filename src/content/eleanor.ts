import type { DialogueStory } from '../game/dialogue';

/** День третій: Елеонора допомагає відновити хронологію без виправдання чужого болю. */
export const eleanorVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Елеонора приходить до книгарні з полотняною сумкою та старим ключем на синій стрічці. Вона не відразу проходить усередину: спершу торкається дверної рами, ніби перевіряє, чи та ще пам’ятає її.',
      options: [{ id: 'greet', label: 'Запросити Елеонору на чай', next: 'greet' }],
    },
    {
      id: 'greet',
      speaker: 'Елеонора',
      text: '«Чай охолов. Раніше я заварювала його о четвертій, навіть якщо ніхто не приходив». Елеонора ставить сумку під стілець і машинально вирівнює цінник на полиці. «Вибач. Обіцяла нічого не переставляти». Пауза. «Але оця книжка стоїть догори дриґом. Це вже не переставляння, це порятунок».',
      textWhen: [
        {
          requires: ['eleanor_will_allow_change'],
          text: 'Елеонора ще раз дивиться на полицю. «Я б поставила інакше. Руки так і тягнуться пересунути. Але ми щойно домовилися». Вона сідає з чашкою. «Покажете краще, що нового надійшло?»',
        },
        {
          requires: ['eleanor_reflected_on_legacy'],
          text: 'Елеонора торкається старої таблички на дверях. «Колись я щороку обіцяла її замінити. Тепер нехай вирішує новий власник». Вона усміхається. «Тільки не викидай її, добре?»',
        },
      ],
      options: [
        {
          id: 'eleanor-shelf',
          label: '«То що думаєте про теперішнє розташування полиць?»',
          next: 'shop',
        },
        {
          id: 'eleanor-tea',
          label: '«Спершу доп'ємо чай. Полиця нікуди не втече»',
          next: 'shop',
        },
        {
          id: 'eleanor-v3-conversation',
          label: '«Ви справді можете зайти сюди й нічого не переставити?»',
          next: 'eleanor-v3-conversation',
          unless: ['eleanor_change_discussed'],
        },
        {
          id: 'eleanor-reflection',
          label: '«А що було найважче залишити тут після передачі ключів?»',
          next: 'eleanor-reflection',
          unless: ['eleanor_reflected_on_legacy'],
        },
        {
          id: 'timeline',
          label: '«Зіставимо картку бронювання та журнал ремонту»',
          next: 'timeline',
          requires: ['saw_receipt', 'saw_repair_note'],
          unless: ['eleanor_timeline_checked'],
        },
        {
          id: 'eleanor-old-receipts',
          label: '«А що ви знаходили між сторінками старих книжок?»',
          next: 'eleanor-old-receipts',
        },
        { id: 'flood', label: '«Розкажіть про затоплення»', next: 'flood' },
        {
          id: 'ledger',
          label: '«Я знайшов старий журнал ремонту»',
          next: 'ledger',
          requires: ['saw_repair_note'],
        },
        {
          id: 'reservation',
          label: '«Є бронювання, яке ніхто не забрав»',
          next: 'reservation',
          requires: ['saw_receipt'],
        },
        {
          id: 'letter',
          label: '«У старій книжці лежить лист»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        { id: 'finish', label: '«Дякую, що завітали»', next: 'end' },
      ],
    },
    {
      id: 'timeline',
      speaker: 'Елеонора',
      text: 'Елеонора кладе поруч картку бронювання та журнал ремонту. Дата на картці передує затопленню. У журналі записано, коли книгарню закрили, але немає підтвердження дзвінка Лео. «Я думала, він просто не прийшов. Тепер бачу, що цього ми не знаємо».',
      options: [
        {
          id: 'timeline-check',
          label: '«Запишімо тільки те, що можемо підтвердити»',
          next: 'timeline-result',
          grants: ['eleanor_timeline_kept_uncertainty'],
        },
        {
          id: 'timeline-blame',
          label: '«Виходить, ви приховали його бронювання?»',
          next: 'timeline-result',
          grants: ['eleanor_timeline_assumed_guilt'],
        },
      ],
    },
    {
      id: 'timeline-result',
      speaker: 'Елеонора',
      text: '«Я загубила записи. За це відповідаю. Але чи отримав Лео повідомлення — ми досі не знаємо».',
      textWhen: [
        {
          requires: ['eleanor_timeline_kept_uncertainty'],
          text: 'Елеонора бере чисту картку. «Тут напишемо дати. А поруч залишимо місце для того, чого не знаємо». Вона вперше дивиться на старий журнал без спроб виправдатися.',
        },
        {
          requires: ['eleanor_timeline_assumed_guilt'],
          text: '«Я загубила записи, і мені соромно. Але не називайте це приховуванням без доказів». Елеонора забирає журнал до себе: «Спершу перевіримо, що там насправді написано».',
        },
      ],
      options: [
        {
          id: 'timeline-back',
          label: 'Повернутися до розмови',
          next: 'greet',
          grants: ['eleanor_timeline_checked'],
        },
      ],
    },
    {
      id: 'shop',
      speaker: 'Елеонора',
      text: '«До вікна тепер легше пройти. А от полицю з поезією я б посунула — добре, мовчу». Елеонора бере чашку обома руками. «У суботу тут завжди було тісно. Айріс малювала, Міллер сперечалася з детективами. Найкращі дні були не ті, коли ми найбільше продавали»',
      options: [
        { id: 'shop-follow', label: '«А які?»', next: 'belonging' },
        { id: 'shop-back', label: '«Повернімося до іншого»', next: 'greet' },
      ],
    },
    {
      id: 'belonging',
      speaker: 'Елеонора',
      text: '«Коли люди залишалися після покупки. Наче тут можна було побути собою, поки місто кудись поспішає». Вона дивиться на порожнє крісло. «Сподіваюся, ви це збережете».',
      options: [
        {
          id: 'belonging-back',
          label: '«Спробую»',
          next: 'greet',
          grants: ['eleanor_shared_shop_memory'],
        },
      ],
    },
    {
      id: 'flood',
      speaker: 'Елеонора',
      text: '«Трубу прорвало вночі. Зранку вода стояла по щиколотки. Переносила сухі книжки нагору, мокрі розкладала на рушниках. Чи працював телефон — уже не пригадаю». Елеонора дивиться на підлогу. «А потім я так і не перевірила всіх бронювань. Це вже не через воду»',
      options: [
        {
          id: 'flood-timeline',
          label: '«Чи повідомили ви людей із бронюваннями?»',
          next: 'notifications',
        },
        { id: 'flood-care', label: '«Це, мабуть, було страшно»', next: 'care' },
        { id: 'flood-back', label: '«Дякую. Можемо поговорити про інше»', next: 'greet' },
      ],
    },
    {
      id: 'ledger',
      speaker: 'Елеонора',
      text: '«Так, це я писала. Ми тоді закрилися на тиждень. Коробки я підписала всі до одної. А список, кому треба подзвонити… десь загубився. Я довго думала, що він у другій шухляді. Не був».',
      options: [
        { id: 'ledger-follow', label: '«Чи залишилися інші записи?»', next: 'notifications' },
        {
          id: 'ledger-back',
          label: '«Дякую за підтвердження»',
          next: 'greet',
          grants: ['eleanor_confirmed_closure'],
        },
      ],
    },
    {
      id: 'reservation',
      speaker: 'Елеонора',
      text: '«Лео Марш? Так, я пам’ятаю ім’я. Книжку відклали перед закриттям. Коли ми знову відчинилися, ніхто не знайшов його картку. Я не можу сказати, чи він приходив».',
      options: [
        {
          id: 'reservation-ask',
          label: '«То повідомлення могло не дійти?»',
          next: 'notifications',
        },
        {
          id: 'reservation-back',
          label: '«Це важлива деталь»',
          next: 'greet',
          grants: ['eleanor_confirmed_reservation'],
        },
      ],
    },
    {
      id: 'notifications',
      speaker: 'Елеонора',
      text: '«Може, й не дійшло. Я не знаю, чи йому дзвонили. І не знаю, чи він приходив потім. Раніше я б сказала, що пам’ятаю. Та якщо чесно — не пам’ятаю. Мені соромно, що я стільки років не перевірила».',
      options: [
        {
          id: 'notifications-note',
          label: '«Запишу тільки те, що нам відомо»',
          next: 'greet',
          grants: ['eleanor_confirmed_missing_notification'],
        },
        {
          id: 'notifications-compassion',
          label: '«Помилки можна визнавати, не вигадуючи відповідей»',
          next: 'care',
          grants: ['eleanor_confirmed_missing_notification'],
        },
      ],
    },
    {
      id: 'care',
      speaker: 'Елеонора',
      text: '«Страшно. Але книгарню відремонтували. А коробки я поставила за каталогами й роками не діставала». Елеонора відсуває чашку. «Якщо Лео чи Айріс захочуть запитати — я відповідатиму сама»',
      options: [{ id: 'care-back', label: '«Це справедливо»', next: 'greet' }],
    },
    {
      id: 'letter',
      speaker: 'Елеонора',
      text: '«Тоді це не просто стара річ. Чужі слова мають власника, навіть якщо сім років пролежали між сторінками». Вона не просить показати конверт.',
      options: [
        {
          id: 'letter-safe',
          label: '«Я збережу його, доки люди самі вирішать»',
          next: 'greet',
          grants: ['eleanor_supported_privacy'],
        },
        { id: 'letter-ask', label: '«Ви б його відкрили?»', next: 'ethics' },
      ],
    },
    {
      id: 'ethics',
      speaker: 'Елеонора',
      text: '«Колись я, мабуть, відкрила б. Хотілося б знати, що там, правда? Але це не мій лист. І цікавість — не дозвіл. Спитайте їх, якщо зможете».',
      options: [
        {
          id: 'ethics-back',
          label: '«Не поспішатиму»',
          next: 'greet',
          grants: ['eleanor_supported_privacy'],
        },
      ],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Елеонора знімає ключ із синьої стрічки й залишає на прилавку. «Від старої шафи з каталогом. Нижня шухляда заїдає — трохи підніміть її, тоді тягніть». Стрічку вона забирає із собою. «А цю мені подарували. Ще знадобиться»',
      options: [],
    },
    {
      id: 'eleanor-reflection',
      speaker: 'Елеонора',
      text: '«За ранком до відчинення. Поставиш чайник, розріжеш нову коробку — і ще ніхто не питає, чому книжка подорожчала». Елеонора усміхається. «Я досі іноді виходжу з дому надто рано. За звичкою»',
      options: [
        {
          id: 'eleanor-reflect-question',
          label: '«А за якою дрібницею тут найбільше сумуєте?»',
          next: 'eleanor-reflection-deep',
        },
        {
          id: 'eleanor-reflect-return',
          label: '«Можете й тепер зайти на ранковий чай»',
          next: 'eleanor-reflection-end',
        },
      ],
    },
    {
      id: 'eleanor-reflection-deep',
      speaker: 'Елеонора',
      text: '«За столом біля заднього вікна. Узимку там було холодно, зате можна було бачити, хто йде через сквер». Вона дивиться в той бік. «Тепер стіл стоїть інакше. Правильно, мабуть. Але я ще не звикла»',
      options: [
        {
          id: 'eleanor-reflect-continue',
          label: '«Хочете, щоб тут щось залишилося від старої книгарні?»',
          next: 'eleanor-reflection-key',
        },
        {
          id: 'eleanor-reflect-listen',
          label: '«Що найважче бачити по-іншому?»',
          next: 'eleanor-reflection-key',
        },
      ],
    },
    {
      id: 'eleanor-reflection-key',
      speaker: 'Елеонора',
      text: '«Я знаю кожну подряпину на прилавку. Боюся прийти сюди одного дня й не впізнати книгарню. А ще більше боюся, що через мій страх вона так і не стане вашою».',
      options: [
        {
          id: 'eleanor-key-memory',
          label: '«Можемо залишити одну полицю для старих фотографій і записок»',
          next: 'eleanor-reflection-memory',
          grants: ['eleanor_will_keep_shared_memory'],
        },
        {
          id: 'eleanor-key-change',
          label: '«Дозволь нам змінити навіть улюблений куточок»',
          next: 'eleanor-reflection-change',
          grants: ['eleanor_will_allow_change'],
        },
      ],
    },
    {
      id: 'eleanor-reflection-memory',
      speaker: 'Елеонора',
      text: '«Одну полицю. Якщо дам собі дві, за тиждень тут знову все стоятиме по-моєму». Вона дивиться на каталоги. «Доберу кілька фотографій. Решту поки залишу вдома»',
      options: [
        { id: 'eleanor-memory-back', label: 'Послухати далі', next: 'eleanor-reflection-end' },
      ],
    },
    {
      id: 'eleanor-reflection-change',
      speaker: 'Елеонора',
      text: '«Може, я навіть допоможу переставити її. Тільки якщо почну командувати, налийте мені чаю й скажіть сісти».',
      options: [
        { id: 'eleanor-change-back', label: 'Послухати далі', next: 'eleanor-reflection-end' },
      ],
    },
    {
      id: 'eleanor-reflection-end',
      speaker: 'Елеонора',
      text: '«Добре, спробую заходити як гостя». Елеонора піднімає чашку. «Гостям же можна сказати, що чай охолов?»',
      textWhen: [
        {
          requires: ['eleanor_will_keep_shared_memory'],
          text: '«Принесу кілька фотографій для тієї полиці. Спочатку підпишу, хто на них, бо Міллер уже раз переплутала мого брата з листоношею»',
        },
        {
          requires: ['eleanor_will_allow_change'],
          text: '«Якщо переставлятимете стіл, покличте. Я допоможу його підняти». Елеонора дивиться на чашку. «І постараюся не командувати, куди нести»',
        },
      ],
      options: [
        {
          id: 'eleanor-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'greet',
          grants: ['eleanor_reflected_on_legacy'],
        },
      ],
    },
    {
      id: 'eleanor-v3-conversation',
      speaker: 'Елеонора',
      text: '«Я роками знала, де скрипить кожна дошка. А тепер приходжу — стіл стоїть біля іншого вікна. Перша думка — повернути його назад».',
      options: [
        {
          id: 'eleanor-v3-ask',
          label: '«Що тобі заважає?»',
          next: 'eleanor-v3-conversation-question',
        },
        {
          id: 'eleanor-v3-short',
          label: '«Можемо не продовжувати»',
          next: 'eleanor-v3-conversation-end',
        },
      ],
    },
    {
      id: 'eleanor-v3-conversation-question',
      speaker: 'Елеонора',
      text: '«Те, що це вже не мій стіл. Точніше, стіл той самий. А право вирішувати — інше. До цього важче звикнути».',
      options: [
        {
          id: 'eleanor-v3-challenge',
          label: '«А якщо новий порядок не подобається?»',
          next: 'eleanor-v3-conversation-counter',
        },
        {
          id: 'eleanor-v3-listen',
          label: '«Залишимо питання відкритим»',
          next: 'eleanor-v3-conversation-end',
        },
      ],
    },
    {
      id: 'eleanor-v3-conversation-counter',
      speaker: 'Елеонора',
      text: '«Можу сказати про це. Але не наказати. Інакше передала тільки ключі, а не книгарню».',
      options: [
        {
          id: 'eleanor-v3-follow',
          label: '«І що ти хочеш зробити?»',
          next: 'eleanor-v3-conversation-choice',
        },
        {
          id: 'eleanor-v3-pause',
          label: '«Не обов’язково вирішувати сьогодні»',
          next: 'eleanor-v3-conversation-end',
        },
      ],
    },
    {
      id: 'eleanor-v3-conversation-choice',
      speaker: 'Елеонора',
      text: '«Залишу собі пам’ять про старе місце. А вам — можливість зробити нове. Обидві речі помістяться тут».',
      options: [
        { id: 'eleanor-v3-accept', label: '«Це твій вибір»', next: 'eleanor-v3-conversation-end' },
      ],
    },
    {
      id: 'eleanor-v3-conversation-end',
      speaker: 'Елеонора',
      text: '«Я досі хочу переставити той стіл. Завтра спробую спершу запитати, чи ви не проти, а вже потім шукатиму рулетку».',
      options: [
        {
          id: 'eleanor-v3-return',
          label: 'Повернутися до інших тем',
          next: 'greet',
          grants: ['eleanor_change_discussed'],
        },
      ],
    },
    {
      id: 'eleanor-old-receipts',
      speaker: 'Елеонора',
      text: '«Список покупок, квиток на концерт і листівку з моря». Елеонора усміхається. «А одного разу — записку: “Не забудь повернути ключ”. Ключа не було. Я перевірила всі шухляди».',
      options: [
        { id: 'eleanor-receipts-search', label: '«І знайшли?»', next: 'eleanor-receipts-search' },
        {
          id: 'eleanor-receipts-keep',
          label: '«Ви зберігали всі ці дрібниці?»',
          next: 'eleanor-receipts-keep',
        },
        {
          id: 'eleanor-receipts-frank',
          label: '«Френк би знайшов ключ швидше»',
          next: 'eleanor-receipts-frank',
        },
      ],
    },
    {
      id: 'eleanor-receipts-search',
      speaker: 'Елеонора',
      text: '«Ні. Зате знайшла окуляри, які шукала три місяці». Вона поправляє оправу. «Виявилося, що я мала дві пари. Тепер маю три — на випадок наступної загадки».',
      options: [
        {
          id: 'eleanor-receipts-search-back',
          label: '«У вас був дуже практичний детектив»',
          next: 'greet',
          grants: ['eleanor_lost_key_story_heard'],
        },
      ],
    },
    {
      id: 'eleanor-receipts-keep',
      speaker: 'Елеонора',
      text: '«Деякі. Квиток я поклала назад у книжку, де він лежав. Людина могла повернутися за ним». Вона знизує плечима. «А список покупок викинула. Картопля й мило не здавалися особливо таємничими».',
      options: [
        {
          id: 'eleanor-receipts-keep-back',
          label: '«Може, то був секретний рецепт»',
          next: 'greet',
          grants: ['eleanor_book_ephemera_discussed'],
        },
      ],
    },
    {
      id: 'eleanor-receipts-frank',
      speaker: 'Елеонора',
      text: 'Френк саме штовхає зі столу олівець. Елеонора дивиться, як той котиться під шафу. «Так. Він би знайшов ключ. А потім заховав би його краще за мене».',
      options: [
        {
          id: 'eleanor-receipts-frank-back',
          label: '«Справедливо. Це його метод»',
          next: 'greet',
          grants: ['eleanor_frank_detective_joke_heard'],
        },
      ],
    },
  ],
};

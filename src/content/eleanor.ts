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
      text: '«Тут пахне так само. Папір, дощ і чай, який хтось знову забув допити». Вона усміхається. «Я обіцяла не командувати. Але ту полицю я б переставила».',
      options: [
        {
          id: 'eleanor-v3-conversation',
          label: '«Кому належить книгарня після передачі ключів?»',
          next: 'eleanor-v3-conversation',
          unless: ['eleanor_change_discussed'],
        },
        {
          id: 'eleanor-reflection',
          label: '«Що для тебе означає передати книгарню?»',
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
          id: 'cabinet-question',
          label: '«Хто такий Генрі на старій фотографії?»',
          next: 'cabinet-question',
          requires: ['cabinet_photo_seen'],
          unless: ['cabinet_henry_questioned'],
        },
        { id: 'shop', label: '«Якою була книгарня раніше?»', next: 'shop' },
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
      id: 'cabinet-question',
      speaker: 'Елеонора',
      text: 'Елеонора спершу питає, чи ви знайшли синю рукавичку. Потім бачить напис на фотографії й перестає усміхатися. «Генрі Вітмор тримав кінотеатр. Якщо хтось написав, що він повернувся, значить, не хотів, щоб про це знали». Вона відсуває чашку. «А хто дав вам право ритися в тій шухляді?»',
      textWhen: [
        {
          requires: ['cabinet_photo_hidden'],
          text: '«Ти знайшов фотографію — і сховав її?» Елеонора дивиться не на вас, а на шухляду за прилавком. «Я не знаю, що сталося того вечора. Але якщо прийде власник, пояснювати будеш сам».',
        },
        {
          requires: ['cabinet_photo_copied'],
          text: '«Ти зробив копію?» Елеонора бере телефон, але не торкається екрана. «Генрі Вітмор тримав кінотеатр. Хтось подряпав обличчя на фото. А хто написав про повернення — я не знаю. Не показуй це всьому місту, доки не з’ясуєш, що воно означає».',
        },
      ],
      options: [
        {
          id: 'cabinet-question-press',
          label: '«Ви точно не знаєте, хто стоїть п’ятим?»',
          next: 'cabinet-answer',
          grants: ['cabinet_eleanor_pressed'],
        },
        {
          id: 'cabinet-question-stop',
          label: '«Гаразд. Я поки залишу фото в спокої»',
          next: 'cabinet-answer',
          grants: ['cabinet_eleanor_given_space'],
        },
      ],
    },
    {
      id: 'cabinet-answer',
      speaker: 'Елеонора',
      text: '«Пам’ятаю кінотеатр. Пам’ятаю, що він закрився. А людей на фотографії — не всіх». Вона бере свою сумку. «І так, рукавичку теж знайди».',
      textWhen: [
        {
          requires: ['cabinet_eleanor_pressed'],
          text: '«Я сказала, що не знаю». Елеонора застібає сумку. «Можеш питати ще десять разів. Від цього я не згадаю обличчя, якого на фото вже немає».',
        },
      ],
      options: [
        {
          id: 'cabinet-answer-back',
          label: 'Повернутися до розмови',
          next: 'greet',
          grants: ['cabinet_henry_questioned'],
        },
      ],
    },
    {
      id: 'shop',
      speaker: 'Елеонора',
      text: '«У суботу тут завжди було тісно. Айріс малювала біля вікна, пані Міллер сперечалася з детективами, а я робила вигляд, що не чую. Найкращі дні були не ті, коли продавалося багато книжок».',
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
      text: '«Трубу прорвало вночі. Зранку вода стояла по щиколотки. Я перенесла все, що вціліло, у коробки, а телефон мовчав — чи то від води, чи від страху в моїх руках».',
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
      text: '«Так, це мій почерк. Ми закрилися того тижня. Я позначила кожну коробку, але список людей, яким слід зателефонувати, загубився серед мокрих рахунків».',
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
      text: '«Могло. Я не маю доказу, що хтось подзвонив Лео. І не маю права казати, що він точно не приходив. Мені соромно, що я так довго не перевірила».',
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
      text: '«Дякую. Але якщо хтось через це постраждав, добрі наміри не повернуть йому тих років. Я готова поговорити, коли мене попросять. Не раніше».',
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
      text: '«Колись я б сказала: відкрийте, так швидше. Тепер знаю, що швидше — не завжди добріше. Запитайте тих, кому лист адресований і хто його написав».',
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
      text: 'Елеонора залишає ключ від старої шафи з каталогом, але забирає свою синю стрічку. «Шафу можна відчинити, коли знадобиться. А от людські історії — лише з дозволу».',
      options: [],
    },
    {
      id: 'eleanor-reflection',
      speaker: 'Елеонора',
      text: '«Я стільки років знала, де стоїть кожна книжка. А тепер вчуся не переставляти їх у чужому домі».',
      options: [
        {
          id: 'eleanor-reflect-question',
          label: '«А що для тебе в цьому найважче?»',
          next: 'eleanor-reflection-deep',
        },
        {
          id: 'eleanor-reflect-return',
          label: '«Дякую, що поділився цим»',
          next: 'eleanor-reflection-end',
        },
      ],
    },
    {
      id: 'eleanor-reflection-deep',
      speaker: 'Елеонора',
      text: '«Зберегти місце — не означає замкнути його в минулому».',
      options: [
        {
          id: 'eleanor-reflect-continue',
          label: '«І що ти хочеш змінити?»',
          next: 'eleanor-reflection-key',
        },
        {
          id: 'eleanor-reflect-listen',
          label: '«Можна просто побути з цим»',
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
          label: '«Залишимо полицю для спільної пам’яті»',
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
      text: '«Одну полицю, не весь магазин. І нехай там будуть не тільки мої книжки. Історія місця почалася раніше за мене й триватиме після».',
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
      text: '«Мабуть, передати ключі — це теж спосіб подбати про книгарню».',
      textWhen: [
        {
          requires: ['eleanor_will_keep_shared_memory'],
          text: '«Нехай у книгарні буде місце для пам’яті кожного, хто сюди приходив. Я не маю права залишити лише свою».',
        },
        {
          requires: ['eleanor_will_allow_change'],
          text: '«Я дозволю переставити полиці. Якщо книгарня має жити після мене, вона мусить змінюватися вже зараз».',
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
  ],
};

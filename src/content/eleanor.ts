import type { DialogueStory } from '../game/dialogue';

/** День третій: Елеонора допомагає відновити хронологію без виправдання чужого болю. */
export const eleanorVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Елеонора приходить до книгарні з полотняною сумкою та старим ключем на синій стрічці. Вона не відразу проходить усередину: спершу торкається дверної рами, ніби перевіряє, чи та ще пам’ятає її.',
      options: [{        { id: 'eleanor-reflection', label: 'Поговорити про те, що складно сказати вголос', next: 'eleanor-reflection' },
 id: 'greet', label: 'Запросити Елеонору на чай', next: 'greet' }],
    },
    {
      id: 'greet',
      speaker: 'Елеонора',
      text: '«Тут пахне так само. Папір, дощ і чай, який хтось знову забув допити». Вона усміхається. «Я обіцяла не командувати. Але ту полицю я б переставила».',
      options: [
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
        { id: 'eleanor-reflect-question', label: '«А що для тебе в цьому найважче?»', next: 'eleanor-reflection-deep' },
        { id: 'eleanor-reflect-return', label: '«Дякую, що поділився цим»', next: 'eleanor-reflection-end' },
      ],
    },
    {
      id: 'eleanor-reflection-deep',
      speaker: 'Елеонора',
      text: '«Зберегти місце — не означає замкнути його в минулому».',
      options: [
        { id: 'eleanor-reflect-continue', label: '«І що ти хочеш змінити?»', next: 'eleanor-reflection-end' },
        { id: 'eleanor-reflect-listen', label: '«Можна просто побути з цим»', next: 'eleanor-reflection-end' },
      ],
    },
    {
      id: 'eleanor-reflection-end',
      speaker: 'Елеонора',
      text: '«Мабуть, передати ключі — це теж спосіб подбати про книгарню».',
      options: [
        { id: 'eleanor-reflect-finish', label: 'Повернутися до розмови', next: 'arrival', grants: ['eleanor_reflected_on_legacy'] },
      ],
    },
  ],
};

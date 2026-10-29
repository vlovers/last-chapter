import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * An everyday conflict that does not turn the entire town into a mystery.
 * Anna has the earlier reservation; Miller has a real birthday to prepare.
 * The player may break a promise, but cannot pretend that nobody noticed.
 */
export const lastCopyOption: DialogueOption = {
  id: 'last-copy',
  label: 'Допомогти з останнім примірником книжки для дітей',
  next: 'last-copy',
  unless: ['final_last_copy_done'],
};

export const lastCopyNodes: readonly DialogueNode[] = [
  {
    id: 'last-copy',
    speaker: 'Елеонора',
    text: 'Елеонора тримає яскраву книжку «Місто на спині дракона». На папірці під нею два імені: Анна й пані Міллер. «Маємо один примірник, а я пообіцяла його двічі. Анна записалася першою. І перш ніж хтось запропонує розрізати книжку навпіл, — Френку, це стосується й тебе».',
    textWhen: [
      {
        requires: ['final_anna_club_heard'],
        text: 'Елеонора показує ілюстровану книжку «Місто на спині дракона». «Анна вчора замовила її для гуртка, а сьогодні я пообіцяла той самий примірник Міллер. Один дракон, дві обіцянки». Френк сідає на папірець із замовленням.',
      },
    ],
    options: [
      {
        id: 'last-copy-ask-anna',
        label: 'Спершу вислухати Анну',
        next: 'last-copy-anna',
        unless: ['final_last_copy_anna_heard'],
      },
      {
        id: 'last-copy-ask-miller',
        label: 'Запитати Міллер, навіщо їй книжка',
        next: 'last-copy-miller',
        unless: ['final_last_copy_miller_heard'],
      },
      {
        id: 'last-copy-ask-eleanor',
        label: 'З’ясувати, як переплутали замовлення',
        next: 'last-copy-eleanor',
        unless: ['final_last_copy_eleanor_heard'],
      },
      {
        id: 'last-copy-choose',
        label: 'Вирішити, що робити з примірником',
        next: 'last-copy-decision',
        requires: ['final_last_copy_anna_heard', 'final_last_copy_miller_heard'],
      },
    ],
  },
  {
    id: 'last-copy-anna',
    speaker: 'Анна',
    text: '«Я залишила замовлення вчора. Діти вже вибрали цю книжку для читання вголос». Анна проводить пальцем по намальованій лусці. «Можу знайти іншу історію, але хочу знати зараз, а не коли всі сядуть у коло».',
    options: [
      {
        id: 'last-copy-anna-when',
        label: '«Коли вам потрібна книжка?»',
        next: 'last-copy-anna-time',
      },
      {
        id: 'last-copy-anna-share',
        label: '«Ти могла б позичити її після заняття?»',
        next: 'last-copy-anna-loan',
      },
      {
        id: 'last-copy-anna-back',
        label: 'Повернутися до Елеонори',
        next: 'last-copy',
        grants: ['final_last_copy_anna_heard'],
      },
    ],
  },
  {
    id: 'last-copy-anna-time',
    speaker: 'Анна',
    text: '«Завтра о четвертій. І ні, я не збираюся читати дітям лише обкладинку». Вона дивиться на Елеонору. «Якщо доведеться міняти план, попередь до ранку. Я серджуся не на Міллер, а на сюрпризи, які маю виправляти сама».',
    options: [
      {
        id: 'last-copy-anna-time-back',
        label: 'Запам’ятати час гуртка',
        next: 'last-copy',
        grants: ['final_last_copy_anna_heard', 'final_last_copy_anna_schedule_known'],
      },
    ],
  },
  {
    id: 'last-copy-anna-loan',
    speaker: 'Анна',
    text: '«Після заняття — так, якщо книжка залишиться цілою. Але спочатку вона потрібна дітям». Анна піднімає палець. «І не кажи Міллер, що я погодилася віддати її сьогодні. Це різні речі».',
    options: [
      {
        id: 'last-copy-anna-loan-back',
        label: 'Не плутати позику з відмовою від замовлення',
        next: 'last-copy',
        grants: ['final_last_copy_anna_heard', 'final_last_copy_loan_possible'],
      },
    ],
  },
  {
    id: 'last-copy-miller',
    speaker: 'Пані Міллер',
    text: '«Моїй онуці завтра дев’ять. Вона любить драконів і вже місяць малює їм крихітні капелюхи». Міллер поправляє стрічку на пакеті. «Я не знала про Аннине замовлення. Але й не хочу прийти з порожніми руками».',
    options: [
      {
        id: 'last-copy-miller-child',
        label: '«Вона любить саме цю історію?»',
        next: 'last-copy-miller-granddaughter',
      },
      {
        id: 'last-copy-miller-alternative',
        label: '«А якщо знайдемо іншу книжку про драконів?»',
        next: 'last-copy-miller-alternative',
      },
      {
        id: 'last-copy-miller-back',
        label: 'Повернутися до Елеонори',
        next: 'last-copy',
        grants: ['final_last_copy_miller_heard'],
      },
    ],
  },
  {
    id: 'last-copy-miller-granddaughter',
    speaker: 'Пані Міллер',
    text: '«Вона бачила цю обкладинку у вітрині. Я сказала, що спробую її знайти. Не сказала, що вже купила». Міллер стискає ручки пакета. «Бачиш? Я теж іноді добираю слова обережно».',
    options: [
      {
        id: 'last-copy-miller-child-back',
        label: 'Повернутися до замовлення',
        next: 'last-copy',
        grants: ['final_last_copy_miller_heard', 'final_last_copy_gift_context_known'],
      },
    ],
  },
  {
    id: 'last-copy-miller-alternative',
    speaker: 'Пані Міллер',
    text: '«Іншу? Можна подивитися. Тільки без тієї, де дракон виявляється принцом. У неї вже є три такі». Мара, проходячи повз, фиркає: «Нарешті хтось сказав це вголос». Міллер не стримує усмішки.',
    options: [
      {
        id: 'last-copy-miller-alternative-back',
        label: 'Занотувати, яку книжку шукати',
        next: 'last-copy',
        grants: ['final_last_copy_miller_heard', 'final_last_copy_alternative_possible'],
      },
    ],
  },
  {
    id: 'last-copy-eleanor',
    speaker: 'Елеонора',
    text: '«Я переписала замовлення Анни на новий аркуш, а старий поклала під касу. Потім Міллер запитала про дракона, і я не перевірила». Елеонора знімає окуляри. «Нора каже, що нам потрібна електронна таблиця. Я кажу, що спершу мені потрібен олівець на мотузці».',
    options: [
      {
        id: 'last-copy-eleanor-frank',
        label: 'Подивитися, що Френк зробив зі старим аркушем',
        next: 'last-copy-frank',
      },
      {
        id: 'last-copy-eleanor-back',
        label: 'Повернутися до розмови',
        next: 'last-copy',
        grants: ['final_last_copy_eleanor_heard'],
      },
    ],
  },
  {
    id: 'last-copy-frank',
    speaker: 'Оповідач',
    text: 'Під касою лежить аркуш із чіткою датою замовлення Анни. Френк притис його лапою й дивиться так, ніби саме він урятував книгарню від катастрофи. Елеонора забирає папірець. «Дякую, ревізоре. Тепер відпусти мій шнурок».',
    options: [
      {
        id: 'last-copy-frank-back',
        label: 'Повернутися з датованим замовленням',
        next: 'last-copy',
        grants: ['final_last_copy_eleanor_heard', 'final_last_copy_order_confirmed'],
      },
    ],
  },
  {
    id: 'last-copy-decision',
    speaker: 'Елеонора',
    text: 'Анна чекає біля полиці. Міллер тримає подарунковий пакет. «Я помилилася, — каже Елеонора. — Але вирішувати за них обох не хочу. То як зробимо?»',
    options: [
      {
        id: 'last-copy-honor',
        label: 'Залишити замовлення Анні, допомогти Міллер вибрати інший подарунок',
        next: 'last-copy-honored',
        grants: ['final_last_copy_anna_kept'],
      },
      {
        id: 'last-copy-delay',
        label: 'Запропонувати Міллер отримати книжку після дитячого гуртка',
        next: 'last-copy-delayed',
        requires: ['final_last_copy_loan_possible'],
        grants: ['final_last_copy_delayed_gift'],
      },
      {
        id: 'last-copy-order',
        label: 'Замовити другий примірник і чесно назвати строк очікування',
        next: 'last-copy-ordered',
        grants: ['final_last_copy_second_ordered'],
      },
      {
        id: 'last-copy-break',
        label: 'Віддати книжку Міллер попри попереднє замовлення Анни',
        next: 'last-copy-broken',
        grants: ['final_last_copy_promise_broken'],
      },
    ],
  },
  {
    id: 'last-copy-honored',
    speaker: 'Пані Міллер',
    text: '«То це буде не той дракон», — Міллер зітхає, але бере книжку з великими ілюстраціями. «Гаразд. Онука все одно спершу роздивляється малюнки». Анна киває Елеонорі: «Дякую, що не змінили моє замовлення без мене». Міллер додає: «А листівку підпишете красиво?»',
    options: [
      {
        id: 'last-copy-honor-return',
        label: 'Загорнути подарунок і повернутися до гостей',
        next: 'gathering',
        grants: ['final_last_copy_done'],
      },
    ],
  },
  {
    id: 'last-copy-delayed',
    speaker: 'Пані Міллер',
    text: '«Після заняття? Вона ж розгортатиме подарунки ще зранку». Міллер замислюється. «А якщо завтра подарую їй карту з намальованим драконом, а книжку принесу пізніше?» Анна відповідає: «Після четвертої забирайте, тільки не раніше». Ніхто не називає це ідеальним планом, але всі знають, на що погодилися.',
    options: [
      {
        id: 'last-copy-delay-return',
        label: 'Записати домовленість і повернутися до гостей',
        next: 'gathering',
        grants: ['final_last_copy_done'],
      },
    ],
  },
  {
    id: 'last-copy-ordered',
    speaker: 'Елеонора',
    text: 'Елеонора телефонує постачальнику. «Другий примірник буде щонайменше за три дні». Міллер кривиться: «Це вже після дня народження». «Так», — відповідає Елеонора. «Я не обіцятиму те, чого не маю». Міллер просить показати листівки. Анна забирає свою книжку.',
    options: [
      {
        id: 'last-copy-order-return',
        label: 'Залишити Міллер номер замовлення',
        next: 'gathering',
        grants: ['final_last_copy_done'],
      },
    ],
  },
  {
    id: 'last-copy-broken',
    speaker: 'Анна',
    text: 'Міллер виходить із подарунком, не знаючи, що ти віддав її примірник замість Анниного. Анна дивиться на порожню полицю. «Ти міг сказати мені прямо. Завтра діти читатимуть іншу книжку — я знайду. Але наступного разу я не залишу замовлення без підтвердження». Елеонора мовчки прибирає другий папірець.',
    options: [
      {
        id: 'last-copy-break-return',
        label: 'Не виправдовуватися й повернутися до гостей',
        next: 'gathering',
        grants: ['final_last_copy_done'],
      },
    ],
  },
];

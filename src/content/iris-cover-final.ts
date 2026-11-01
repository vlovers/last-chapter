import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** A private, non-mystery callback to Iris's illustration work. */
export const irisCoverFinalOption: DialogueOption = {
  id: 'final-iris-cover-topic',
  label: '«Айріс, як поживає лис із човном?»',
  next: 'final-iris-cover',
  requires: ['iris_cover_day_four_followup'],
  unless: ['final_iris_cover_done'],
};

export const irisCoverFinalNodes: readonly DialogueNode[] = [
  {
    id: 'final-iris-cover',
    speaker: 'Айріс',
    text: 'Айріс тримає папку під пахвою й розглядає дитячі книжки. «Лис зі мною. Але сьогодні він працює тільки на мене». Вона прочиняє папку рівно настільки, щоб показати куточок ескізу. «Мені ще треба вирішити, що там із човном».',
    textWhen: [
      {
        requires: ['iris_cover_revisions_chosen'],
        text: '«Редакторові сподобалася веселка. Тепер просить збільшити лиса». Айріс дістає олівець із кишені. «Я вже перемалювала його двічі. Човен поки лишився всередині книжки, а договору ще немає. Тож святкуватиму, коли буде що підписувати».',
      },
      {
        requires: ['iris_cover_negotiation_chosen'],
        text: '«Редактор погодився подивитися обкладинку з човном». Айріс постукує пальцем по закритій папці. «Поки що це все. Я намалювала другий варіант, щоб було з чого вибирати. Але свій перший теж не викинула».',
      },
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Я домалювала чотири сторінки про лиса». Айріс дістає маленьку складену книжечку. «На третій він падає у воду. На четвертій сушить хвіст і вдає, що так і задумав». Вона ховає книжечку назад. «Поки не показуватиму видавцям. Хочу спершу закінчити для себе».',
      },
    ],
    options: [
      {
        id: 'final-iris-cover-ask-next',
        label: '«А над чим хочеш працювати після лиса?»',
        next: 'final-iris-cover-next',
      },
      {
        id: 'final-iris-cover-offer-shelf',
        label: '«Якщо захочеш, можемо відкласти полицю для твоїх маленьких книжок»',
        next: 'final-iris-cover-shelf',
        grants: ['final_iris_cover_portfolio_offered'],
      },
      {
        id: 'final-iris-cover-leave',
        label: '«Не відволікатиму тебе від гостей»',
        next: 'gathering',
        grants: ['final_iris_cover_done', 'final_iris_cover_space_respected'],
      },
    ],
  },
  {
    id: 'final-iris-cover-next',
    speaker: 'Айріс',
    text: '«Може, намалюю афішу для ярмарку. А може, нарешті дочитаю роман, який ношу із собою другий місяць». Айріс дістає потерту книжку. «Обкладинка жахлива. Я купила її саме через це. Тепер мушу з’ясувати, чи текст кращий».',
    options: [
      {
        id: 'final-iris-cover-next-offer',
        label: '«Місце для твоїх маленьких книжок у нас знайдеться, якщо захочеш»',
        next: 'final-iris-cover-shelf',
        grants: ['final_iris_cover_portfolio_offered'],
      },
      {
        id: 'final-iris-cover-next-back',
        label: '«Домовилися. Про роман поговоримо іншим разом»',
        next: 'gathering',
        grants: ['final_iris_cover_done', 'final_iris_cover_space_respected'],
      },
    ],
  },
  {
    id: 'final-iris-cover-shelf',
    speaker: 'Айріс',
    text: '«Дякую. Але поки нічого не виставляй». Айріс дивиться на полицю біля каси. «Я сама принесу готові сторінки, якщо вирішу». Вона бере тонкий роман у синій обкладинці. «А цю книжку відклади мені, будь ласка. За нею я точно повернуся».',
    textWhen: [
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Коли дороблю лиса, принесу один примірник. Якщо він мені ще подобатиметься». Айріс дивиться на полицю. «І без цінника, поки я не вирішу, чи хочу його продавати». Вона бере тонкий роман у синій обкладинці. «Оцей можеш відкласти для мене».',
      },
    ],
    options: [
      {
        id: 'final-iris-cover-shelf-back',
        label: '«Залишу полицю вільною, доки сама не скажеш»',
        next: 'gathering',
        grants: ['final_iris_cover_done'],
      },
    ],
  },
];

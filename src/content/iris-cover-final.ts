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
    text: 'Айріс стоїть біля столу з книжками для дітей. «Сьогодні я принесла лиса, але тільки в папці. Мені досі смішно, що всі сперечаються через човен, якого ніхто з них не бачив наживо». Вона показує ескіз на секунду й кладе назад.',
    textWhen: [
      {
        requires: ['iris_cover_revisions_chosen'],
        text: '«Редактору сподобалася веселка. Тепер він просить зробити лиса трохи більшим». Айріс сміється. «Човен залишився всередині книжки, принаймні в останньому макеті. Договір ще не підписаний, тож я поки не відкриваю шампанське».',
      },
      {
        requires: ['iris_cover_negotiation_chosen'],
        text: '«Вони погодилися подивитися версію з човном». Айріс розгортає лист, але тримає його у себе. «Там написано: “Можливо, після тестового друку”. Це не перемога і не відмова. Я вже зробила ще одну версію, щоб було що обговорювати».',
      },
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Я доробила чотири сторінки про лиса». Айріс показує маленьку складену книжечку. «На третій він таки впав у воду. На четвертій сидить на березі й сушить хвіст». Вона посміхається. «Поки що це мій найдешевший проєкт і, можливо, найулюбленіший».',
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
    text: '«Може, намалюю афішу для осіннього ярмарку. Або візьму вихідний і нарешті дочитаю книжку, яку ношу в сумці з серпня». Вона витягає потертий роман. «Не дивись на обкладинку. Вона жахлива. Саме тому я її купила».',
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
    text: '«Можливо». Айріс оглядає полицю біля каси. «Тільки не став туди мої чернетки без мене. Я хочу сама вирішити, які сторінки вже можна показувати». Вона торкається обкладинки роману. «А для початку можеш відкласти мені цю книжку. Її я точно заберу».',
    textWhen: [
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Коли дороблю лиса, принесу один примірник. Якщо він мені ще подобатиметься». Айріс дивиться на полицю. «І без цінника, поки я не вирішу, чи хочу його продавати. Але книжку для себе можеш відкласти вже зараз».',
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

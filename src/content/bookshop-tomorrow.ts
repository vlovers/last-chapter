import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * Optional closing scene after the box-17 discovery.
 * The public bookshop display contains published books only, never Iris's papers.
 */
export const bookshopTomorrowOption: DialogueOption = {
  id: 'bookshop-tomorrow',
  label: 'Допомогти підготувати книгарню до завтрашнього ранку',
  next: 'bookshop-tomorrow',
  requires: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
  unless: ['final_bookshop_tomorrow_done'],
};

export const bookshopTomorrowNodes: readonly DialogueNode[] = [
  {
    id: 'bookshop-tomorrow',
    speaker: 'Оповідач',
    text: 'Гості ще не розійшлися, але біля каси вже тихіше. Нора тримає три романи, Анна — стопку чистих карток, а Мара намагається зняти з Френка паперовий бант. Елеонора дивиться на порожню полицю біля вікна. «Завтра тут знову купуватимуть книжки, — каже вона. — Що поставимо на це місце?»',
    textWhen: [
      {
        requires: ['final_miller_ledger_rumor_seeded', 'final_miller_rumor_corrected_publicly'],
        text: 'Біля каси стихає розмова. Пані Міллер вже виправила свою вигадку, але Айріс досі стоїть окремо біля вікна. Нора тримає три романи, Анна — чисті картки, Мара знімає з Френка паперовий бант. Елеонора показує на порожню полицю: «Про рукопис сьогодні досить. А завтра сюди прийдуть люди по книжки».',
      },
      {
        requires: ['final_miller_ledger_rumor_seeded'],
        text: 'Після чутки біля каси ніяково тихо. Айріс не підходить до столу з рукописом. Нора тримає три романи, Анна — чисті картки, а Мара намагається врятувати бант від Френка. «Завтра відкриваємося як завжди, — каже Елеонора. — Давайте хоча б полицю приведемо до ладу».',
      },
    ],
    options: [
      {
        id: 'tomorrow-shelf',
        label: 'Допомогти Норі вибрати книжки для вітрини',
        next: 'bookshop-tomorrow-shelf',
      },
      {
        id: 'tomorrow-cards',
        label: 'Подивитися, що придумала Анна для читачів',
        next: 'bookshop-tomorrow-cards',
      },
      {
        id: 'tomorrow-tea',
        label: 'Залишитися з Марою біля чайника',
        next: 'bookshop-tomorrow-tea',
      },
      {
        id: 'tomorrow-later',
        label: 'Повернутися до гостей, а полицю залишити на ранок',
        next: 'gathering',
        suspend: true,
        repeatability: 'repeatable',
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-shelf',
    speaker: 'Нора',
    text: '«Тільки не робіть окрему полицю для загадкових рукописів, — бурчить Нора, витираючи пил. — У нас тут є цілком законні книжки з поганими фіналами». Вона кладе поруч два видані романи: один із загнутими сторінками, другий — новенький. «Цей я люблю. А цей ненавиджу так сильно, що хочу дати його всім».',
    options: [
      {
        id: 'tomorrow-shelf-argue',
        label: 'Запропонувати поставити дві різні кінцівки поруч',
        next: 'bookshop-tomorrow-shelf-result',
        grants: ['final_bookshop_debate_shelf'],
      },
      {
        id: 'tomorrow-shelf-surprise',
        label: 'Попросити Нору вибрати одну книжку навмання',
        next: 'bookshop-tomorrow-shelf-result',
        grants: ['final_bookshop_surprise_shelf'],
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-shelf-result',
    speaker: 'Нора',
    text: 'Нора пише на картці: «Прочитайте. А потім скажіть, де автор мав зупинитися». «От і чудово, — каже вона. — Завтра хоч буде з ким посваритися про книжки, а не про сусідів». Френк нюхає картку й іде геть, явно не погодившись.',
    textWhen: [
      {
        requires: ['final_bookshop_surprise_shelf'],
        text: 'Нора загортає одну книжку в коричневий папір. «Без назви? Серйозно? — перепитує Елеонора. — А якщо там рецепт борщу?» Нора сміється: «Тоді хоч хтось нарешті його приготує». На пакунку з’являється напис: «Довірся книгарці».',
      },
    ],
    options: [
      {
        id: 'tomorrow-shelf-finish',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_bookshop_tomorrow_done'],
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-cards',
    speaker: 'Анна',
    text: 'Анна показує стопку карток. На першій дитина намалювала дракона, який сидить на стосі книжок. На другій — кота з короною. «Я попросила написати, що вони хочуть прочитати, — пояснює Анна. — Половина написала назви, половина намалювала чудовиськ. І знаєте що? Чудовиська цікавіші».',
    options: [
      {
        id: 'tomorrow-cards-window',
        label: 'Запропонувати виставити дитячі малюнки у вікні',
        next: 'bookshop-tomorrow-cards-result',
        grants: ['final_bookshop_children_window'],
      },
      {
        id: 'tomorrow-cards-box',
        label: 'Поставити скриньку для нових читацьких побажань',
        next: 'bookshop-tomorrow-cards-result',
        grants: ['final_bookshop_wish_box'],
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-cards-result',
    speaker: 'Анна',
    text: 'Анна вирівнює дракона на склі. «У понеділок діти перевірятимуть, чи він на місці». Елеонора приносить стрічку, а Френк стає під вікном так, ніби це його особиста виставка. Анна тихо сміється: «Здається, він вимагає окрему рамку».',
    textWhen: [
      {
        requires: ['final_bookshop_wish_box'],
        text: 'Анна ставить біля каси коробку з написом «Яку книжку ви шукаєте?». Елеонора кидає туди перший папірець: «Ту, що Нора позичила мені навесні». «Це не назва!» — обурюється Нора. Анна лише додає поруч олівець.',
      },
    ],
    options: [
      {
        id: 'tomorrow-cards-finish',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_bookshop_tomorrow_done'],
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-tea',
    speaker: 'Мара',
    text: '«Я принесла шість булочок, а ви з’їли дев’ять, — каже Мара, наливаючи чай. — Лео ще три приніс із пекарні. Тільки не кажи, що це теж треба розслідувати». Вона підсуває тобі чашку. За вікном блимає ліхтар. Мара дивиться на порожню полицю: «Можна просто залишити її порожньою до завтра».',
    options: [
      {
        id: 'tomorrow-tea-rest',
        label: 'Погодитися й нарешті посидіти мовчки',
        next: 'bookshop-tomorrow-tea-result',
        grants: ['final_bookshop_quiet_cup'],
      },
      {
        id: 'tomorrow-tea-buns',
        label: 'Попросити Мару залишити рецепт булочок для Елеонори',
        next: 'bookshop-tomorrow-tea-result',
        grants: ['final_bookshop_mara_recipe'],
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-tea-result',
    speaker: 'Оповідач',
    text: 'Мара сідає навпроти й не ставить жодного запитання. Десь за стелажем Нора сміється з невдалого жарту Лео. Френк згортається на складеному шарфі. Порожня полиця лишається порожньою, і це нікого не турбує.',
    textWhen: [
      {
        requires: ['final_bookshop_mara_recipe'],
        text: 'Мара записує рецепт на звороті старого цінника. «Тільки масла не шкодуйте», — попереджає вона Елеонору. Та ховає цінник у шухляду з чеками: «А якщо я спечу краще?» Мара примружується: «Тоді влаштуємо конкурс». Френк засинає під їхню суперечку.',
      },
    ],
    options: [
      {
        id: 'tomorrow-tea-finish',
        label: 'Повернутися до вечора',
        next: 'gathering',
        grants: ['final_bookshop_tomorrow_done'],
      },
    ],
  },
];

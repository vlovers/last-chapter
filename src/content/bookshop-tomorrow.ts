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
        id: 'tomorrow-window-new',
        label: 'Вибрати оформлення вітрини на ранок',
        next: 'bookshop-tomorrow-window-new',
        unless: ['final_tomorrow_window_done'],
      },
      {
        id: 'tomorrow-miller-new',
        label: 'Допомогти Міллер із завтрашнім оголошенням',
        next: 'bookshop-tomorrow-miller-new',
        unless: ['final_tomorrow_miller_done'],
      },
      {
        id: 'tomorrow-iris-new',
        label: 'Запитати Айріс, чи потрібна їй тиша',
        next: 'bookshop-tomorrow-iris-new',
        unless: ['final_tomorrow_iris_done'],
      },
      {
        id: 'tomorrow-frank-new',
        label: 'Підготувати Френкові місце на завтра',
        next: 'bookshop-tomorrow-frank-new',
        unless: ['final_tomorrow_frank_done'],
      },
      {
        id: 'tomorrow-neighbors-new',
        label: 'Підготувати невеличку полицю для сусідів',
        next: 'bookshop-tomorrow-neighbors-new',
        unless: ['final_tomorrow_neighbors_done'],
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
  {
    id: 'bookshop-tomorrow-window-new',
    speaker: 'Оповідач',
    text: 'Елеонора тримає рамку для вітрини, а Нора — стопку звичайних виданих романів. «Хочу, щоб завтра люди спочатку побачили книжки, — каже Елеонора. — А не вчорашню суперечку».',
    options: [
      {
        id: 'tomorrow-window-letters-new',
        label: 'Виставити романи за кольорами',
        next: 'bookshop-tomorrow-window-letters-new',
      },
      {
        id: 'tomorrow-window-questions-new',
        label: 'Написати на склі запитання для читачів',
        next: 'bookshop-tomorrow-window-questions-new',
      },
      {
        id: 'tomorrow-window-quiet-new',
        label: 'Залишити вітрину простою й затишною',
        next: 'bookshop-tomorrow-window-quiet-new',
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-window-letters-new',
    speaker: 'Оповідач',
    text: 'Нора складає сині й зелені обкладинки в один ряд. «Це безглуздо, але красиво», — визнає вона. Елеонора ставить посередині маленьку лампу. Френк одразу займає місце перед найяскравішою книжкою.',
    options: [
      {
        id: 'tomorrow-window-letters-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_window_done', 'final_window_colorful_books'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-window-questions-new',
    speaker: 'Оповідач',
    text: 'На склі з’являється напис: «Яка книжка змусила вас сміятися вголос?» Мара читає його й каже: «Моя кулінарна. Там було “готувати 15 хвилин”. Брехня».',
    options: [
      {
        id: 'tomorrow-window-questions-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_window_done', 'final_window_reader_question'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-window-quiet-new',
    speaker: 'Оповідач',
    text: 'Ти ставиш у вітрину три романи, рослину й старий дерев’яний стілець. Елеонора відходить на крок: «Ось так. Нехай люди самі вирішать, яку історію взяти додому».',
    options: [
      {
        id: 'tomorrow-window-quiet-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_window_done', 'final_window_cozy_display'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-miller-new',
    speaker: 'Оповідач',
    text: 'Пані Міллер принесла аркуш із написом «НАДЗВИЧАЙНА ЗУСТРІЧ ЧИТАЧІВ». Нора забирає в неї червоний маркер. «Ми просто обговорюватимемо романи, не евакуюватимемо місто».',
    options: [
      {
        id: 'tomorrow-miller-soft-new',
        label: 'Запропонувати спокійніше оголошення',
        next: 'bookshop-tomorrow-miller-soft-new',
      },
      {
        id: 'tomorrow-miller-fun-new',
        label: 'Залишити яскравий заголовок, але додати жарт',
        next: 'bookshop-tomorrow-miller-fun-new',
      },
      {
        id: 'tomorrow-miller-privacy-new',
        label: 'Попросити не згадувати чужі таємниці',
        next: 'bookshop-tomorrow-miller-privacy-new',
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-miller-soft-new',
    speaker: 'Оповідач',
    text: 'Ти переписуєш заголовок: «Чай і розмова про книжки». Міллер незадоволено роздивляється аркуш. «Ніхто не прийде». Через хвилину додає: «Хіба що заради чаю».',
    options: [
      {
        id: 'tomorrow-miller-soft-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_miller_done', 'final_miller_notice_softened'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-miller-fun-new',
    speaker: 'Оповідач',
    text: 'Під великими літерами ти пишеш: «Надзвичайно смачне печиво. Звичайні книжкові суперечки». Міллер сміється й погоджується прибрати слово «терміново».',
    options: [
      {
        id: 'tomorrow-miller-fun-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_miller_done', 'final_miller_notice_humorous'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-miller-privacy-new',
    speaker: 'Оповідач',
    text: '«Добре, — каже Міллер. — Жодних прізвищ і натяків». Нора піднімає брову. «Навіть натяків?» — «Я ж сказала». Міллер перевертає аркуш чистим боком догори.',
    options: [
      {
        id: 'tomorrow-miller-privacy-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_miller_done', 'final_miller_notice_privacy'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-iris-new',
    speaker: 'Оповідач',
    text: 'Айріс стоїть біля вікна з чашкою, до якої майже не торкалася. «Мені не потрібні ще одні запитання про сторінки», — каже вона, перш ніж ти встигаєш заговорити. «Але я б не відмовилася від нормальної книжки».',
    options: [
      {
        id: 'tomorrow-iris-choose-new',
        label: 'Дозволити Айріс самій вибрати книжку',
        next: 'bookshop-tomorrow-iris-choose-new',
      },
      {
        id: 'tomorrow-iris-tea-new',
        label: 'Принести свіжого чаю без розпитувань',
        next: 'bookshop-tomorrow-iris-tea-new',
      },
      {
        id: 'tomorrow-iris-leave-new',
        label: 'Запропонувати їй піти раніше, якщо хочеться',
        next: 'bookshop-tomorrow-iris-leave-new',
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-iris-choose-new',
    speaker: 'Оповідач',
    text: 'Айріс довго дивиться на полиці, потім бере короткий роман про двох сестер. «Я прочитаю його вдома», — каже вона. Ти не питаєш, чому саме цей. Вона вдячно киває.',
    options: [
      {
        id: 'tomorrow-iris-choose-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_iris_done', 'final_iris_reading_choice_respected'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-iris-tea-new',
    speaker: 'Оповідач',
    text: 'Ти ставиш поруч нову чашку. Айріс мовчить хвилину, а потім питає: «А у вас завжди так шумно?» — «Лише коли всі намагаються бути тихими». Вона вперше за вечір сміється.',
    options: [
      {
        id: 'tomorrow-iris-tea-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_iris_done', 'final_iris_quiet_tea_offered'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-iris-leave-new',
    speaker: 'Оповідач',
    text: '«Дякую. Мабуть, так і зроблю». Айріс бере пальто. Біля дверей зупиняється: «Я зайду ще. Просто не завтра». Ти не просиш назвати дату.',
    options: [
      {
        id: 'tomorrow-iris-leave-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_iris_done', 'final_iris_exit_respected'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-frank-new',
    speaker: 'Оповідач',
    text: 'Френк влаштувався на стопці цінників і не збирається вставати. Мара приносить порожню коробку, Анна — маленьку подушку. «У нього кращі умови праці, ніж у мене», — каже Лео.',
    options: [
      {
        id: 'tomorrow-frank-box-new',
        label: 'Поставити коробку під сонячне вікно',
        next: 'bookshop-tomorrow-frank-box-new',
      },
      {
        id: 'tomorrow-frank-pillow-new',
        label: 'Покласти подушку за прилавком',
        next: 'bookshop-tomorrow-frank-pillow-new',
      },
      {
        id: 'tomorrow-frank-chair-new',
        label: 'Залишити йому улюблений стілець',
        next: 'bookshop-tomorrow-frank-chair-new',
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-frank-box-new',
    speaker: 'Оповідач',
    text: 'Френк залазить у коробку, перевіряє кожен кут і виходить. Потім повертається, коли всі перестають на нього дивитися. Мара шепоче: «Він не любить працювати на публіку».',
    options: [
      {
        id: 'tomorrow-frank-box-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_frank_done', 'final_frank_window_box_ready'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-frank-pillow-new',
    speaker: 'Оповідач',
    text: 'Френк двічі обходить подушку й лягає поруч, просто на підлогу. Анна ховає посмішку. «Він цінує жест», — кажеш ти. «Але має власні стандарти».',
    options: [
      {
        id: 'tomorrow-frank-pillow-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_frank_done', 'final_frank_counter_pillow_ready'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-frank-chair-new',
    speaker: 'Оповідач',
    text: 'Ти підсуваєш стілець до батареї. Френк застрибує на нього без жодних вагань. Лео дістає блокнот: «Записати це як постійне бронювання?»',
    options: [
      {
        id: 'tomorrow-frank-chair-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_frank_done', 'final_frank_chair_reserved'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-neighbors-new',
    speaker: 'Оповідач',
    text: 'Томас знаходить дерев’яну підставку, а Анна приносить чисті картки. «Можна залишати рекомендації без імені?» — питає Нора. Елеонора киває: «Головне, щоб не залишали рахунки».',
    options: [
      {
        id: 'tomorrow-neighbors-anonymous-new',
        label: 'Дозволити анонімні книжкові поради',
        next: 'bookshop-tomorrow-neighbors-anonymous-new',
      },
      {
        id: 'tomorrow-neighbors-swap-new',
        label: 'Зробити місце для обміну книжками',
        next: 'bookshop-tomorrow-neighbors-swap-new',
      },
      {
        id: 'tomorrow-neighbors-notes-new',
        label: 'Запропонувати читачам писати короткі відгуки',
        next: 'bookshop-tomorrow-neighbors-notes-new',
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-neighbors-anonymous-new',
    speaker: 'Оповідач',
    text: 'Ти ставиш коробочку з написом «Порадь книжку, навіть якщо соромишся». Анна одразу залишає першу записку: «Щось коротке й смішне». Мара додає: «І без злих кондитерів».',
    options: [
      {
        id: 'tomorrow-neighbors-anonymous-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_neighbors_done', 'final_neighbor_anonymous_recs'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-neighbors-swap-new',
    speaker: 'Оповідач',
    text: 'Томас прикручує маленьку полицю й перевіряє її рівнем. «Тепер не впадуть». Мара здалеку гукає: «Приходь потім до пекарні!» Томас робить вигляд, що не почув.',
    options: [
      {
        id: 'tomorrow-neighbors-swap-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_neighbors_done', 'final_neighbor_book_swap_ready'],
        suspend: true,
      },
    ],
  },
  {
    id: 'bookshop-tomorrow-neighbors-notes-new',
    speaker: 'Оповідач',
    text: 'На першій картці ти пишеш: «Сподобалося, але герой дратував». Нора дивиться через плече. «Чудово. Це відгук на половину моєї бібліотеки».',
    options: [
      {
        id: 'tomorrow-neighbors-notes-back-new',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_tomorrow_neighbors_done', 'final_neighbor_reader_notes_ready'],
        suspend: true,
      },
    ],
  },
];

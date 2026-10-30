import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Ordinary counter conversations during the final reading evening.
 * These are not clues in the manuscript investigation.
 */
export const counterEncountersOption: DialogueOption = {
  id: 'final-counter-encounters',
  label: 'Допомогти трьом відвідувачам біля прилавка',
  next: 'final-counter-hub',
  unless: ['final_counter_evening_done'],
};

export const counterEncountersNodes: readonly DialogueNode[] = [
  {
    id: 'final-counter-hub',
    hub: true,
    speaker: 'Оповідач',
    text: 'Поки гості сперечаються про фінали романів, біля каси утворюється маленька черга. Жінка в мокрому плащі тримає записку, Сем із пекарні розглядає кулінарну полицю, а пан Рід обережно притискає до грудей старий томик. Елеонора підсуває тобі чистий блокнот. «Ти хотів справжній книжковий вечір? Ось тобі три справжні покупці».',
    textWhen: [
      {
        requires: ['final_counter_ruth_preferences', 'final_counter_sam_dough', 'final_counter_reed_note'],
        text: 'Черга розійшлася, але на прилавку залишилися три речі: записка Рут із запитаннями для матері, Сема закладка з рецептом і картка пана Ріда без чужого імені. Френк намагається сісти на всі три одразу.',
      },
    ],
    options: [
      {
        id: 'counter-ruth',
        label: 'Допомогти Рут обрати книжку для матері',
        next: 'final-counter-ruth',
        unless: ['final_counter_ruth_done'],
      },
      {
        id: 'counter-sam',
        label: 'Запитати Сема, чому він шукає кулінарну книжку',
        next: 'final-counter-sam',
        unless: ['final_counter_sam_done'],
      },
      {
        id: 'counter-reed',
        label: 'Вислухати пана Ріда зі старим томиком',
        next: 'final-counter-reed',
        unless: ['final_counter_reed_done'],
      },
      {
        id: 'counter-close',
        label: 'Повернутися до вечора читань',
        next: 'gathering',
        grants: ['final_counter_evening_done'],
      },
    ],
  },
  {
    id: 'final-counter-ruth',
    speaker: 'Рут',
    text: '«Я після нічної зміни, тому, якщо скажу щось безглузде, списуйте на каву». Рут розгладжує папірець. «Мама любить книжки про море. Раніше читала все підряд, а тепер дрібні літери її дратують. Я хотіла зробити сюрприз, але боюся купити їй те, що вона не зможе прочитати». Вона зітхає. «І, будь ласка, не пропонуйте їй книжку про те, як чудово старіти. Вона кине її в мене».',
    options: [
      {
        id: 'ruth-ask',
        label: '«Може, спершу запитати, що їй зручно читати?»',
        next: 'final-counter-ruth-ask',
        grants: ['final_counter_ruth_preferences'],
      },
      {
        id: 'ruth-print',
        label: '«Перевіримо видання з великим шрифтом»',
        next: 'final-counter-ruth-print',
        grants: ['final_counter_ruth_large_print_checked'],
      },
      {
        id: 'ruth-short',
        label: '«Можна показати кілька коротких морських історій»',
        next: 'final-counter-ruth-short',
        grants: ['final_counter_ruth_shortlist'],
      },
    ],
  },
  {
    id: 'final-counter-ruth-ask',
    speaker: 'Рут',
    text: '«Ви щойно зіпсували мені ідеальний сюрприз», — каже Рут, але сміється. «Мама все одно здогадається. Минулого разу я подарувала їй шарф, а вона сказала, що краще б я принесла нову батарейку для ліхтарика». Рут записує три запитання: шрифт, жанр і чи хоче мама слухати історії вголос. «Завтра спитаю. Не купуватиму за неї навмання».',
    options: [
      {
        id: 'ruth-ask-back',
        label: 'Залишити Рут чисту картку для відповіді',
        next: 'final-counter-hub',
        grants: ['final_counter_ruth_done'],
      },
    ],
  },
  {
    id: 'final-counter-ruth-print',
    speaker: 'Елеонора',
    text: 'Елеонора дістає каталог. «Є позначки про великий шрифт, але я не обіцяю, що потрібне видання зараз на складі». Рут нахиляється над сторінкою. «От бачите, це вже схоже на подарунок, а не на лотерею». Ви записуєте назви двох книжок, щоб перевірити наявність наступного ранку. Замовлення поки не оформлюєте.',
    options: [
      {
        id: 'ruth-print-back',
        label: 'Віддати Рут список без обіцянки доставки',
        next: 'final-counter-hub',
        grants: ['final_counter_ruth_done'],
      },
    ],
  },
  {
    id: 'final-counter-ruth-short',
    speaker: 'Рут',
    text: 'Рут гортає збірку коротких оповідань. «Мама казала, що в морських історіях усі або знаходять скарб, або гублять капелюх. Їй подобаються ті, де гублять капелюх». Вона обирає три назви для порівняння й фотографує обкладинки, не купуючи навмання. «Покажу їй завтра. А тоді вже прийду з гаманцем і меншою кількістю кави».',
    options: [
      {
        id: 'ruth-short-back',
        label: 'Побажати Рут спокійної зміни',
        next: 'final-counter-hub',
        grants: ['final_counter_ruth_done'],
      },
    ],
  },
  {
    id: 'final-counter-sam',
    speaker: 'Сем',
    text: 'Сем із пекарні ставить на прилавок книгу про тісто. «Не кажіть Марі, що я тут». За мить сам себе виправляє: «Ні, кажіть. Я не ховаюся. Просто хочу нарешті зрозуміти, чому в мене щоразу виходить цеглина, коли я пробую її рецепт». Він показує пальцем на малюнок буханця. «Отут пишуть, що треба чекати. А я ненавиджу чекати».',
    options: [
      {
        id: 'sam-dough',
        label: '«Може, почати з книжки про основи тіста?»',
        next: 'final-counter-sam-dough',
        grants: ['final_counter_sam_dough'],
      },
      {
        id: 'sam-memoir',
        label: '«Є смішні спогади пекаря, який теж усе псував»',
        next: 'final-counter-sam-memoir',
        grants: ['final_counter_sam_memoir'],
      },
      {
        id: 'sam-ask-mara',
        label: '«А Мару ви питали, чи хоче вона вас навчати?»',
        next: 'final-counter-sam-ask',
        grants: ['final_counter_sam_asked_first'],
      },
    ],
  },
  {
    id: 'final-counter-sam-dough',
    speaker: 'Сем',
    text: '«Це ж книжка для початківців!» — обурюється Сем, але вже читає зміст. «Температура, час, вода… Невже всі ці речі важливі?» Мара проходить повз і бачить обкладинку. «Ти почав із першого розділу? Я вражена». Сем бурчить, що купить книжку собі, а не для пекарні. Мара відповідає: «Тоді не підписуй її моїм ім’ям». Обоє сміються.',
    options: [
      {
        id: 'sam-dough-back',
        label: 'Покласти книжку в окремий пакет для Сема',
        next: 'final-counter-hub',
        grants: ['final_counter_sam_done'],
      },
    ],
  },
  {
    id: 'final-counter-sam-memoir',
    speaker: 'Сем',
    text: 'Сем читає уривок про пекаря, який переплутав сіль і цукор на весіллі. «Нарешті мій рівень професійної літератури». Мара заглядає й фиркає: «Там у кінці є рецепт, але я б тобі не радила». Сем вирішує взяти книжку додому. «І не треба робити з цього навчальний курс. Я хочу хоча б раз посміятися зі своїх помилок».',
    options: [
      {
        id: 'sam-memoir-back',
        label: 'Загорнути книжку для Сема',
        next: 'final-counter-hub',
        grants: ['final_counter_sam_done'],
      },
    ],
  },
  {
    id: 'final-counter-sam-ask',
    speaker: 'Сем',
    text: '«Питав. Один раз. Коли вона несла три дека, — каже Сем. — Мабуть, момент був невдалий». Мара чує останнє речення. «Ти просив мене навчити тебе, поки я рятувала круасани від духовки». Сем киває: «Тоді спитаю в понеділок. Якщо ти захочеш». Мара не обіцяє, але радить йому спочатку прочитати сторінку про дріжджі.',
    options: [
      {
        id: 'sam-ask-back',
        label: 'Залишити книгу на полиці, доки Сем вирішує',
        next: 'final-counter-hub',
        grants: ['final_counter_sam_done'],
      },
    ],
  },
  {
    id: 'final-counter-reed',
    speaker: 'Пан Рід',
    text: 'Пан Рід показує тонку книжку з потертою обкладинкою. «Купив на ярмарку. Усередині — записка для людини, яку я не знаю. Не читав далі першого рядка». Він тримає закладку за край. «Не хочу викидати чужу річ, але й грати в детектива заради чийогось особистого листа не збираюся». Елеонора ставить поряд порожній конверт.',
    options: [
      {
        id: 'reed-envelope',
        label: 'Запропонувати закрити записку в конверті',
        next: 'final-counter-reed-envelope',
        grants: ['final_counter_reed_note'],
      },
      {
        id: 'reed-book',
        label: '«Книжку можна залишити собі, не читаючи записки»',
        next: 'final-counter-reed-book',
        grants: ['final_counter_reed_book_kept'],
      },
      {
        id: 'reed-wait',
        label: '«Можемо поки нічого з нею не робити»',
        next: 'final-counter-reed-wait',
        grants: ['final_counter_reed_deferred'],
      },
    ],
  },
  {
    id: 'final-counter-reed-envelope',
    speaker: 'Пан Рід',
    text: 'Пан Рід сам вкладає папірець у конверт і заклеює його. «Напишемо тільки: знайдено в книжці з ярмарку. Без імен». Елеонора пропонує покласти конверт у шухляду знахідок, а не виставляти на вітрину. Рід погоджується й залишає номер телефону лише для зв’язку з ним. Ніхто не фотографує записку.',
    options: [
      {
        id: 'reed-envelope-back',
        label: 'Покласти запечатаний конверт до знахідок',
        next: 'final-counter-hub',
        grants: ['final_counter_reed_done'],
      },
    ],
  },
  {
    id: 'final-counter-reed-book',
    speaker: 'Пан Рід',
    text: '«Книжка мені подобається, — каже Рід. — Там, здається, смішний детектив про зниклий велосипед». Він залишає записку на місці, не розгортаючи її, і вирішує сам зберігати книжку. «Якщо колись захочу щось із цим робити, спершу спитаю. А поки в мене є велосипед, який треба знайти на сторінці сорок».',
    options: [
      {
        id: 'reed-book-back',
        label: 'Побажати Рідові приємного читання',
        next: 'final-counter-hub',
        grants: ['final_counter_reed_done'],
      },
    ],
  },
  {
    id: 'final-counter-reed-wait',
    speaker: 'Пан Рід',
    text: 'Рід довго дивиться на конверт, тоді ховає книжку до сумки. «Знаєте, я поспішав із цим питанням. Нічого страшного не станеться, якщо я подумаю вдома». Елеонора киває: «У нас тут іноді навіть книжки стоять на полиці по десять років, перш ніж знаходять читача». «Тільки не кажіть моїй дружині, що я почув про це як про норму», — сміється Рід.',
    options: [
      {
        id: 'reed-wait-back',
        label: 'Дати Рідові час вирішити самому',
        next: 'final-counter-hub',
        grants: ['final_counter_reed_done'],
      },
    ],
  },
];
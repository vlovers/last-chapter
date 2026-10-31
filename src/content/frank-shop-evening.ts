import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Optional, ordinary cat moments during the final reading. No manuscript clues. */
export const frankShopOption: DialogueOption = {
  id: 'frank-shop-evening',
  label: 'Перевірити, як Френк переживає вечір із гостями',
  next: 'frank-shop-hub',
  unless: ['final_frank_shop_evening_done'],
};

export const frankShopNodes: readonly DialogueNode[] = [
  {
    id: 'frank-shop-hub',
    hub: true,
    speaker: 'Оповідач',
    text: 'Френк обійшов гостей, обнюхав два пакети й повернувся до прилавка. Елеонора ставить порожню коробку під вікном. «Він сьогодні перевірив більше книжок, ніж ми продали». Зі столу долинає сміх Мари, а кіт уважно дивиться на кінчик стрічки від подарунка.',
    options: [
      {
        id: 'frank-shop-bookmark',
        label: 'З’ясувати, що сталося із закладкою',
        next: 'frank-shop-bookmark-scene',
        unless: ['final_frank_shop_bookmark_done'],
      },
      {
        id: 'frank-shop-rest',
        label: 'Влаштувати Френкові тихе місце',
        next: 'frank-shop-rest-scene',
        unless: ['final_frank_shop_rest_done'],
      },
      {
        id: 'frank-shop-guests',
        label: 'Послухати, що гості говорять про кота',
        next: 'frank-shop-guests-scene',
        unless: ['final_frank_shop_guests_done'],
      },
      {
        id: 'frank-shop-leave',
        label: 'Повернутися до вечора читань',
        next: 'gathering',
        grants: ['final_frank_shop_evening_done'],
      },
    ],
  },
  {
    id: 'frank-shop-bookmark-scene',
    speaker: 'Анна',
    text: '«Мені потрібна одна закладка для дитячої книжки», — каже Анна. Френк лежить на розгорнутому атласі, притиснувши лапою картонну рибку. «Саме ця, звісно. Я зробила двадцять інших, але він вибрав ту, на якій я написала ім’я». Кіт розплющує око й повільно підтягує рибку ближче.',
    textWhen: [
      {
        requires: ['final_anna_club_heard'],
        text: 'Анна показує дитячі закладки з драконами. «Учора вони сперечалися, хто головний у книгарні. Я сказала, що Елеонора. Тепер Френк спить на єдиній закладці з моїм ім’ям. Схоже, діти мали рацію». Вона сміється й тягнеться до запасної.',
      },
    ],
    options: [
      {
        id: 'frank-shop-bookmark-spare',
        label: 'Запропонувати Анні чисту запасну закладку',
        next: 'frank-shop-bookmark-spare-result',
      },
      {
        id: 'frank-shop-bookmark-wait',
        label: 'Почекати, доки Френк сам встане',
        next: 'frank-shop-bookmark-wait-result',
      },
      {
        id: 'frank-shop-bookmark-laugh',
        label: '«Зробімо йому закладку з посадою директора»',
        next: 'frank-shop-bookmark-laugh-result',
      },
    ],
  },
  {
    id: 'frank-shop-bookmark-spare-result',
    speaker: 'Анна',
    text: 'Ти подаєш Анні чисту картку. «Дякую. Рибку нехай залишить собі до ранку», — каже вона й дістає олівець. Френк не рухається. Мара з-за столу додає: «Тільки не записуйте його до книжкового клубу. Він не дочитав жодної книжки». Анна пише ім’я й ховає нову закладку між сторінками.',
    options: [
      {
        id: 'frank-shop-bookmark-spare-back',
        label: 'Повернутися до прилавка',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_bookmark_done', 'final_frank_shop_spare_bookmark'],
      },
    ],
  },
  {
    id: 'frank-shop-bookmark-wait-result',
    speaker: 'Оповідач',
    text: 'Ви з Анною сідаєте поруч. Через хвилину Френк позіхає, переставляє лапу й знову засинає. «Це може тривати до Різдва», — шепоче Анна. Вона вирішує поки взяти іншу книжку, а закладку забрати завтра, якщо кіт дозволить. Ніхто не смикає його з теплого місця.',
    options: [
      {
        id: 'frank-shop-bookmark-wait-back',
        label: 'Залишити атлас відкритим',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_bookmark_done', 'final_frank_shop_waited_for_cat'],
      },
    ],
  },
  {
    id: 'frank-shop-bookmark-laugh-result',
    speaker: 'Анна',
    text: '«Директор із питань дрімоти», — одразу пропонує Анна. «І перевірки пакувального паперу», — додає Елеонора. Мара вже шукає клаптик картону, але Френк зіскакує з атласу саме тоді, коли ви починаєте писати. Анна забирає свою рибку. «Він почув слово “директор” і пішов на нараду».',
    options: [
      {
        id: 'frank-shop-bookmark-laugh-back',
        label: 'Покласти жартівливу картку до каси',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_bookmark_done', 'final_frank_shop_anna_laughed'],
      },
    ],
  },
  {
    id: 'frank-shop-rest-scene',
    speaker: 'Елеонора',
    text: 'Френк уже двічі міняв місце: спершу ліг на теплий рушник, потім перебрався до порожньої коробки. «Мені треба прибрати чашки, а йому, бачте, потрібен вибір», — бурчить Елеонора без злості. Вона підсуває коробку ближче до стіни. Кіт витягує лапу, перевіряючи край.',
    textWhen: [
      {
        requires: ['final_frank_rest_respected'],
        text: 'Елеонора киває на кота: «Ти вже сьогодні врятував йому сон, коли забрав список замовлень. А тепер він зайняв коробку». Френк повертається на другий бік. «Я хотіла викинути її ще вранці. Добре, що не встигла».',
      },
    ],
    options: [
      {
        id: 'frank-shop-rest-box',
        label: 'Залишити коробку біля вікна',
        next: 'frank-shop-rest-box-result',
      },
      {
        id: 'frank-shop-rest-cups',
        label: 'Прибрати чашки, не чіпаючи кота',
        next: 'frank-shop-rest-cups-result',
      },
      {
        id: 'frank-shop-rest-alone',
        label: 'Дати Френкові самому обрати місце',
        next: 'frank-shop-rest-alone-result',
      },
    ],
  },
  {
    id: 'frank-shop-rest-box-result',
    speaker: 'Елеонора',
    text: 'Ти кладеш у коробку чистий рушник. Френк обнюхує його, вилазить, обходить коробку колом і повертається назад. «Ось і вся церемонія відкриття», — каже Елеонора. Мара пропонує вирізати для коробки табличку, але кіт уже спить і не бере участі в обговоренні.',
    options: [
      {
        id: 'frank-shop-rest-box-back',
        label: 'Залишити коробку на місці',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_rest_done', 'final_frank_shop_box_offered'],
      },
    ],
  },
  {
    id: 'frank-shop-rest-cups-result',
    speaker: 'Мара',
    text: 'Ти збираєш чашки з підвіконня. Мара ловить блюдце, яке ледь не вислизнуло з рук. «Обережно, наш директор відпочиває». Френк не прокидається, але посуває хвіст так, щоб він не звисав зі столу. Елеонора забирає решту посуду й нарешті знаходить місце для чайника.',
    options: [
      {
        id: 'frank-shop-rest-cups-back',
        label: 'Повернутися до гостей',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_rest_done', 'final_frank_shop_quiet_corner'],
      },
    ],
  },
  {
    id: 'frank-shop-rest-alone-result',
    speaker: 'Оповідач',
    text: 'Ти не переставляєш нічого. Френк трохи крутиться в коробці, виходить, перевіряє стілець і врешті вкладається під прилавком. «Він обрав третій варіант», — помічає Елеонора. «Як і кожен пристойний покупець», — відповідає Нора, яка щойно відклала дві книжки й попросила показати ще одну.',
    options: [
      {
        id: 'frank-shop-rest-alone-back',
        label: 'Не турбувати Френка',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_rest_done', 'final_frank_shop_rest_left'],
      },
    ],
  },
  {
    id: 'frank-shop-guests-scene',
    speaker: 'Мара',
    text: '«Пан Рід запитав, чи Френк продається разом із книгарнею», — сміється Мара. Елеонора відразу відповідає: «Ні. І на касі він не працює». Нора показує на порожній аркуш біля дверей: «Можна хоча б написати, що кота не треба годувати чужими ласощами». Френк тим часом нюхає стрічку на пакеті.',
    textWhen: [
      {
        requires: ['final_counter_ruth_done', 'final_counter_sam_done'],
        text: 'Рут і Сем уже розійшлися з книжками та нотатками. «Обидва запитали, чи можна погладити Френка», — каже Мара. «А він обох проігнорував і пішов до коробки». Елеонора киває на порожній аркуш: «Можна написати, що кіт сам вирішує, коли він приймає гостей».',
      },
      {
        requires: ['final_counter_reed_done'],
        text: 'Пан Рід уже пішов, залишивши старий томик або конверт на власний розсуд. «Він запитав, чи Френк тут завідує знахідками», — сміється Мара. «Ні, — каже Елеонора. — Ми вже пробували довірити йому закладки».',
      },
    ],
    options: [
      {
        id: 'frank-shop-guests-sign',
        label: 'Написати коротку табличку для відвідувачів',
        next: 'frank-shop-guests-sign-result',
      },
      {
        id: 'frank-shop-guests-anna',
        label: 'Запитати Анну, чи потрібен дітям малюнок кота',
        next: 'frank-shop-guests-anna-result',
      },
      {
        id: 'frank-shop-guests-no-promise',
        label: 'Не робити з Френка частину програми',
        next: 'frank-shop-guests-no-promise-result',
      },
    ],
  },
  {
    id: 'frank-shop-guests-sign-result',
    speaker: 'Елеонора',
    text: 'Ви пишете на клаптику картону: «Френк живе тут. Не годуйте його й не будіть без потреби». Елеонора ставить картку біля каси, подалі від миски. «Нарешті оголошення, яке не треба погоджувати з міською радою». Мара сміється: «Із Френком погодити теж не вийде».',
    options: [
      {
        id: 'frank-shop-guests-sign-back',
        label: 'Поставити картку біля каси',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_guests_done', 'final_frank_shop_sign_drafted'],
      },
    ],
  },
  {
    id: 'frank-shop-guests-anna-result',
    speaker: 'Анна',
    text: '«Діти вже намалювали його королем, — каже Анна. — Можна спитати, чи хтось хоче зробити ще один малюнок. Але я не обіцяю, що всі прийдуть наступного тижня». Френк піднімає голову на звук її голосу й одразу знову вкладається. «От бачиш? Він теж не обіцяє».',
    options: [
      {
        id: 'frank-shop-guests-anna-back',
        label: 'Залишити ідею Анні',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_guests_done', 'final_frank_shop_visitor_note'],
      },
    ],
  },
  {
    id: 'frank-shop-guests-no-promise-result',
    speaker: 'Мара',
    text: '«Тобто не буде урочистого виходу кота на сцену?» — питає Мара. «А я вже уявила афішу». Елеонора знімає з прилавка мотузку, яку Френк саме намагався потягти. «Ми краще купимо нові закладки». Мара погоджується: «Добре. А афішу залишимо для книжок».',
    options: [
      {
        id: 'frank-shop-guests-no-promise-back',
        label: 'Повернутися до звичайного вечора',
        next: 'frank-shop-hub',
        grants: ['final_frank_shop_guests_done', 'final_frank_shop_no_promise'],
      },
    ],
  },
];

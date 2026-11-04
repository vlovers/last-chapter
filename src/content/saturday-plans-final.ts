import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * Two independent lives intersect at the bookshop counter. Earlier advice
 * changes the conversation, but the player cannot book Mara's oven, Leo's
 * shifts or June's time on anyone else's behalf.
 */
export const saturdayPlansOption: DialogueOption = {
  id: 'final-saturday-plans-topic',
  label: 'Поговорити з Марою й Лео про наступну суботу',
  next: 'final-saturday-plans',
  requires: ['mara_window_plan_discussed', 'leo_night_course_discussed'],
  unless: ['final_saturday_plans_done'],
};

export const saturdayPlansNodes: readonly DialogueNode[] = [
  {
    id: 'final-saturday-plans',
    speaker: 'Оповідач',
    text: 'Мара розгортає на прилавку зім’ятий рецепт, Лео кладе поряд календар змін. «Тільки не переплутай, — каже вона. — Це мої завитки, а не його розклад». «А в моєму розкладі принаймні немає маку», — відповідає Лео. Вони обоє дивляться на тебе, але нічого не просять вирішувати за них.',
    textWhen: [
      {
        requires: ['mara_window_bookshop_suggested', 'leo_night_course_application_planned'],
        text: '«Я можу спекти маленьку партію після зміни, але спершу спитаю про духовку», — каже Мара. Лео прибирає телефон: «А я вже подав заявку в Грейфорд. Поки не знаю, які вечори будуть вільні». «То не записуй себе в мої помічники», — відповідає вона. «Я навіть не встиг запропонувати!» — сміється Лео.',
      },
      {
        requires: ['mara_window_bookshop_suggested', 'leo_night_course_shift_request_planned'],
        text: 'Мара показує намальовану на чеку грушу. «Книжковий сніданок — гарна ідея. Але тільки коли знатиму, що можу взяти духовку». Лео розгортає розклад: «Джун погодилася лише на одну підміну. Другої я не обіцяв». «Чудово, — каже Мара. — У нас є дві невідомі й один дуже голодний кіт».',
      },
      {
        requires: ['mara_window_bookshop_suggested', 'leo_night_course_deferred'],
        text: '«Дві пробні булочки — це ще не ярмарок», — каже Мара й ховає пакет від Френка. Лео розповідає, як провів вихідний біля моря: «Там навіть чайки не питали про мій графік». «А ти все одно купив їм розклад?» — підколює Мара. Він знизує плечима: «Лише листівку».',
      },
      {
        requires: ['mara_window_credit_encouraged', 'leo_night_course_application_planned'],
        text: 'Мара показує маленький напис «Рецепт Мари» на фото з пекарні. «Можна було й більшими літерами». Лео кладе телефон екраном донизу: «Я надіслав заявку, але відповіді ще немає». «Тоді сьогодні відсвяткуємо два листи, — каже Мара. — Один уже надрукували, другого ще чекаємо».',
      },
      {
        requires: ['mara_window_credit_encouraged', 'leo_night_course_shift_request_planned'],
        text: '«Сем тепер читає моє ім’я на табличці щоранку», — сміється Мара. Лео показує складений графік: «А Джун читає мої прохання про підміну й каже, що я надто багато пишу». «Може, тобі теж потрібна маленька табличка?» — питає Мара. «Тільки не на моєму робочому місці», — відповідає він.',
      },
      {
        requires: ['mara_window_credit_encouraged', 'leo_night_course_deferred'],
        text: 'Мара показує фото нової таблички в пекарні: «Тепер там є моє ім’я». Лео розгортає листівку з моря. «А я цього тижня нічого не подавав і вперше виспався». «Непогана колекція досягнень», — каже Мара. Вони сперечаються, що краще поставити у рамку: табличку чи листівку.',
      },
      {
        requires: ['mara_window_private_suggested', 'leo_night_course_application_planned'],
        text: 'Мара складає рецепт удвоє. «Цю версію поки залишу вдома». Лео киває: «А я подав заявку, але поки нікому не обіцяв вільні вечори». «От і добре. Тоді в нас обох є речі, які ще не треба оголошувати всьому місту», — каже Мара й підсовує йому чай.',
      },
      {
        requires: ['mara_window_private_suggested', 'leo_night_course_shift_request_planned'],
        text: '«Нову начинку я поки не продаватиму», — каже Мара. Лео ховає графік: «І я не можу записати Джун на другу підміну без її згоди». «Ти сьогодні такий розсудливий, що мені аж ніяково», — підколює Мара. «Це тимчасово», — відповідає він.',
      },
      {
        requires: ['mara_window_private_suggested', 'leo_night_course_deferred'],
        text: 'Мара ховає рецепт у кишеню, а Лео показує їй листівку з моря. «Тобто ти залишила собі завитки, а я — вихідний», — підсумовує він. «І жоден із нас не просив дозволу в цілого Беллвіка», — сміється Мара. Френк намагається витягти стрічку з пакета.',
      },
    ],
    options: [
      {
        id: 'saturday-talk-mara',
        label: '«Маро, як ти хочеш розпорядитися рецептом?»',
        next: 'final-saturday-mara',
        unless: [
          'final_saturday_mara_credit_respected',
          'final_saturday_mara_tasting_discussed',
          'final_saturday_mara_private_respected',
        ],
      },
      {
        id: 'saturday-talk-leo',
        label: '«Лео, що з твоїм навчанням і змінами?»',
        next: 'final-saturday-leo',
        unless: [
          'final_saturday_leo_wait_respected',
          'final_saturday_leo_shifts_unconfirmed',
          'final_saturday_leo_rest_respected',
        ],
      },
      {
        id: 'saturday-talk-calendar',
        label: '«А що робитимемо з порожнім календарем книгарні?»',
        next: 'final-saturday-calendar',
        unless: ['final_saturday_calendar_offered', 'final_saturday_plans_separate'],
      },
      {
        id: 'saturday-finish',
        label: 'Повернутися до гостей, залишивши рішення їм',
        next: 'gathering',
        grants: ['final_saturday_plans_done'],
      },
    ],
  },
  {
    id: 'final-saturday-mara',
    speaker: 'Мара',
    text: '«Дякую, що питаєш мене, а не мого начальника». Мара обережно складає рецепт. «У мене ще є два варіанти начинки й жодного бажання перетворювати їх на міське голосування».',
    textWhen: [
      {
        requires: ['mara_window_bookshop_suggested'],
        text: '«Маленька дегустація можлива, — каже Мара. — Але я ще не домовилася про духовку й не знаю, чи буде час. Не пиши афішу. Спочатку я сама скажу, що готова». Лео тягнеться до пакета, і вона легенько б’є його по руці серветкою.',
      },
      {
        requires: ['mara_window_credit_encouraged'],
        text: '«Табличка вже є, — каже Мара. — Хочу лише, щоб Сем не називав мою випічку “нашою геніальною випадковістю”». Вона посміхається. «Може, наступного тижня спробую іншу начинку. Але спочатку посплю».',
      },
      {
        requires: ['mara_window_private_suggested'],
        text: '«Це мій домашній рецепт, — каже Мара. — Не хочу поки ні дегустації, ні фотографій». Вона згортає аркуш. «Можемо натомість поговорити про книжку, яку Лео ніяк не дочитає».',
      },
    ],
    options: [
      {
        id: 'saturday-mara-tasting',
        label: '«Домовимося лише після твого рішення»',
        next: 'final-saturday-mara-result',
        requires: ['mara_window_bookshop_suggested'],
        grants: ['final_saturday_mara_tasting_discussed'],
      },
      {
        id: 'saturday-mara-credit',
        label: '«Тоді не виставлятиму твій рецепт без імені»',
        next: 'final-saturday-mara-result',
        requires: ['mara_window_credit_encouraged'],
        grants: ['final_saturday_mara_credit_respected'],
      },
      {
        id: 'saturday-mara-private',
        label: '«Залишимо рецепт у твоїй кишені»',
        next: 'final-saturday-mara-result',
        requires: ['mara_window_private_suggested'],
        grants: ['final_saturday_mara_private_respected'],
      },
      {
        id: 'saturday-mara-back',
        label: '«Не буду тебе затримувати»',
        next: 'final-saturday-plans',
        suspend: true,
      },
    ],
  },
  {
    id: 'final-saturday-mara-result',
    speaker: 'Мара',
    text: 'Мара киває й прибирає рецепт. «Добре. А тепер допоможи мені врятувати від Френка цей пакет».',
    textWhen: [
      {
        requires: ['final_saturday_mara_tasting_discussed'],
        text: '«Я сама принесу пробну партію, якщо все складеться», — каже Мара. «І, будь ласка, не обіцяй гостям безкоштовний сніданок. Сем досі згадує, як ми роздали всі круасани за десять хвилин».',
      },
      {
        requires: ['final_saturday_mara_credit_respected'],
        text: '«Домовилися. Рецепт і табличка — різні речі». Мара розгладжує зім’ятий чек. «А якщо Сем ще раз назве мої завитки своїми, я попрошу його хоча б помити деко».',
      },
      {
        requires: ['final_saturday_mara_private_respected'],
        text: '«Оце й усе, що я хотіла почути», — каже Мара. Вона ховає рецепт і простягає Лео останню булочку. «Тільки цю можеш забрати. Решта — мої експерименти».',
      },
    ],
    options: [
      {
        id: 'saturday-mara-result-back',
        label: 'Повернутися до розмови біля прилавка',
        next: 'final-saturday-plans',
      },
    ],
  },
  {
    id: 'final-saturday-leo',
    speaker: 'Лео',
    text: '«Я вже записав усе, що міг. Решта залежить не лише від мене». Лео кладе календар на прилавок. «І ні, я не записуватиму Джун на чергування замість себе».',
    textWhen: [
      {
        requires: ['leo_night_course_application_planned'],
        text: '«Заявку відправив, відповіді ще немає», — каже Лео. «Якщо візьмуть, спершу поговорю з Гаррісом і Джун. А потім уже скажу Марі, чи можу допомогти в суботу».',
      },
      {
        requires: ['leo_night_course_shift_request_planned'],
        text: '«Джун погодилася на одну зміну, не на дві», — нагадує Лео. «Гарріс обіцяв переглянути графік. Тому я не знаю, чи буду вільний у суботу. Навіть якщо Мара спече сто завитків».',
      },
      {
        requires: ['leo_night_course_deferred'],
        text: '«Курс почекає до наступного набору», — каже Лео. «Це не означає, що кожен мій вихідний тепер вільний для чужих планів. Я ще хочу дочитати книжку про маяк».',
      },
    ],
    options: [
      {
        id: 'saturday-leo-application',
        label: '«Не будемо нічого планувати до відповіді»',
        next: 'final-saturday-leo-result',
        requires: ['leo_night_course_application_planned'],
        grants: ['final_saturday_leo_wait_respected'],
      },
      {
        id: 'saturday-leo-shifts',
        label: '«Джун має сама погодити свій графік»',
        next: 'final-saturday-leo-result',
        requires: ['leo_night_course_shift_request_planned'],
        grants: ['final_saturday_leo_shifts_unconfirmed'],
      },
      {
        id: 'saturday-leo-rest',
        label: '«Вихідний не означає, що ти комусь винен допомогу»',
        next: 'final-saturday-leo-result',
        requires: ['leo_night_course_deferred'],
        grants: ['final_saturday_leo_rest_respected'],
      },
      {
        id: 'saturday-leo-back',
        label: '«Зрозуміло. Повернімося до чаю»',
        next: 'final-saturday-plans',
        suspend: true,
      },
    ],
  },
  {
    id: 'final-saturday-leo-result',
    speaker: 'Лео',
    text: '«Дякую. Я скажу, коли матиму новини». Лео складає календар і допомагає Марі поставити чашки.',
    textWhen: [
      {
        requires: ['final_saturday_leo_wait_respected'],
        text: '«Якщо відповідь прийде, я спочатку поговорю з тими, кого це стосується», — каже Лео. «А поки календар може полежати без мого прізвища».',
      },
      {
        requires: ['final_saturday_leo_shifts_unconfirmed'],
        text: '«Джун буде рада, що хтось це сказав уголос», — сміється Лео. «Я покажу їй розклад у понеділок. Не раніше».',
      },
      {
        requires: ['final_saturday_leo_rest_respected'],
        text: '«Тоді в суботу я, може, нарешті дочитаю роман», — каже Лео. «А якщо Мара попросить допомогти, вона спитає мене сама».',
      },
    ],
    options: [
      {
        id: 'saturday-leo-result-back',
        label: 'Повернутися до розмови біля прилавка',
        next: 'final-saturday-plans',
      },
    ],
  },
  {
    id: 'final-saturday-calendar',
    speaker: 'Елеонора',
    text: 'Елеонора приносить чистий аркуш із заголовком «Субота». «Я не проти ранкового читання. Але без підписів за людей, яких ми не питали». Мара сміється: «Особливо без підпису за мою духовку». Лео додає: «І за Джун».',
    options: [
      {
        id: 'saturday-calendar-offer',
        label: 'Залишити чистий аркуш для добровільних пропозицій',
        next: 'final-saturday-calendar-result',
        grants: ['final_saturday_calendar_offered'],
      },
      {
        id: 'saturday-calendar-separate',
        label: 'Поки не поєднувати їхні плани з розкладом книгарні',
        next: 'final-saturday-calendar-result',
        grants: ['final_saturday_plans_separate'],
      },
      {
        id: 'saturday-calendar-back',
        label: 'Повернутися до Мари й Лео',
        next: 'final-saturday-plans',
        suspend: true,
      },
    ],
  },
  {
    id: 'final-saturday-calendar-result',
    speaker: 'Елеонора',
    text: '«Домовилися», — каже Елеонора. «А тепер сховаймо олівець від Френка».',
    textWhen: [
      {
        requires: ['final_saturday_calendar_offered'],
        text: 'Елеонора кладе чистий аркуш під касу. «Хто захоче — сам напише своє ім’я. А поки я запишу лише те, що нам точно потрібно: купити чай».',
      },
      {
        requires: ['final_saturday_plans_separate'],
        text: 'Елеонора складає аркуш удвоє. «Залишимо суботу порожньою». Мара полегшено киває, а Лео каже: «О, це мій улюблений тип розкладу».',
      },
    ],
    options: [
      {
        id: 'saturday-calendar-result-back',
        label: 'Повернутися до гостей',
        next: 'final-saturday-plans',
      },
    ],
  },
];

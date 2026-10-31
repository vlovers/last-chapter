import type { DialogueNode } from '../game/dialogue';

/**
 * Mara's small, independent bakery story. The player can offer an opinion,
 * but Mara keeps ownership of the recipe and the decision about sharing it.
 */
export const maraWindowTableNodes: readonly DialogueNode[] = [
  {
    id: 'mara-window-table',
    speaker: 'Мара',
    text: '«А ще я б поставила на той столик грушеві завитки з маком». Мара дістає з кишені складений удвоє аркуш. На ньому пляма від масла й кілька закреслених цифр. «Я вигадала їх у неділю. У понеділок принесла пробне деко, а сьогодні начальниця виставила табличку: “Фірмова новинка”. Без мого імені». Вона ховає аркуш. «Дурниця, мабуть. Але я цілий вечір підбирала начинку».',
    options: [
      {
        id: 'mara-window-credit',
        label: '«Тобі хочеться, щоб люди знали, хто їх придумав?»',
        next: 'mara-window-credit',
        grants: ['mara_window_credit_encouraged'],
      },
      {
        id: 'mara-window-bookshop',
        label: '«А якби спробувати книжковий ранок із твоєю випічкою?»',
        next: 'mara-window-bookshop',
        grants: ['mara_window_bookshop_suggested'],
      },
      {
        id: 'mara-window-private',
        label: '«Можеш поки залишити цей рецепт тільки для себе»',
        next: 'mara-window-private',
        grants: ['mara_window_private_suggested'],
      },
    ],
  },
  {
    id: 'mara-window-credit',
    speaker: 'Мара',
    text: '«Не треба портрета над касою. Мені вистачило б маленького “рецепт Мари”». Вона знизує плечима. «Начальниця платить за продукти й духовку. Я це розумію. Але коли Сем назвав завитки її винаходом, вона навіть не поправила його». Мара усміхається без особливої радості. «Я тоді так старанно мила деко, що мало не стерла з нього фарбу».',
    options: [
      {
        id: 'mara-window-credit-boss',
        label: '«А ти сказала їй, що тебе це зачепило?»',
        next: 'mara-window-boss',
      },
      {
        id: 'mara-window-credit-taste',
        label: '«Чому саме груша й мак?»',
        next: 'mara-window-taste',
      },
    ],
  },
  {
    id: 'mara-window-bookshop',
    speaker: 'Мара',
    text: '«Булочки й книжки? Це небезпечна ідея. Я прийду з двома тацями, а піду з п’ятьма романами». Мара роздивляється вікно книгарні. «Але мені подобається. Тільки я не можу просто забрати випічку з пекарні. Спершу домовлюся, чи можна зробити окрему маленьку партію після зміни». Вона нахиляється ближче. «І не називай це фестивалем. Пані Міллер запросить мера».',
    options: [
      {
        id: 'mara-window-bookshop-details',
        label: '«Можемо почати з двох чашок і кількох книжок»',
        next: 'mara-window-details',
      },
      {
        id: 'mara-window-bookshop-taste',
        label: '«Розкажи спочатку, що за завитки»',
        next: 'mara-window-taste',
      },
    ],
  },
  {
    id: 'mara-window-private',
    speaker: 'Мара',
    text: '«Лео сказав майже те саме. Потім попросив спекти ще шість, бо перші зникли, поки він шукав камеру». Мара сміється. «Я не хочу ховати рецепт у шухляді назавжди. Просто хочу сама вирішити, коли його діставати». Вона постукує пальцем по складеному аркушу. «Може, спершу спробую з яблуками. Або це вже зовсім інша булочка?»',
    options: [
      {
        id: 'mara-window-private-details',
        label: '«А що ти хочеш зробити з ним далі?»',
        next: 'mara-window-details',
      },
      {
        id: 'mara-window-private-taste',
        label: '«Груша й мак звучать краще за яблука»',
        next: 'mara-window-taste',
      },
    ],
  },
  {
    id: 'mara-window-boss',
    speaker: 'Мара',
    text: '«Ні. Вона була зайнята з постачальником, потім прийшли покупці, а потім я сама вирішила, що вже пізно». Мара дивиться на годинник. «Може, завтра спитаю про табличку. Не про справедливість у всесвіті, а буквально про картонну табличку. Її можна переписати за хвилину».',
    options: [
      {
        id: 'mara-window-boss-details',
        label: '«А якщо вона скаже ні?»',
        next: 'mara-window-details',
      },
      {
        id: 'mara-window-boss-taste',
        label: '«Тепер мені цікаво, як вони смакують»',
        next: 'mara-window-taste',
      },
    ],
  },
  {
    id: 'mara-window-taste',
    speaker: 'Мара',
    text: '«Секрет у тому, що грушу треба трохи підсушити. Інакше тісто мокре, а Сем каже, що це “соковита концепція”». Мара дістає з пакета останню булочку й розламує навпіл. «Це не та, з маком. Просто кориця. Але вона теж має право на повагу». Вона простягає половинку. «Обережно, ще тепла».',
    options: [
      {
        id: 'mara-window-taste-details',
        label: '«А що ти сама хочеш від тієї нової випічки?»',
        next: 'mara-window-details',
      },
      {
        id: 'mara-window-taste-finish',
        label: '«Ця теж чудова. Продовжуй»',
        next: 'mara-window-finish',
      },
    ],
  },
  {
    id: 'mara-window-details',
    speaker: 'Мара',
    text: '«Хочу, щоб у пекарні було щось моє. Не ціла пекарня — мені поки вистачає однієї духовки, яка гріє сильніше зліва». Вона згортає рецепт ще дрібніше. «Можливо, начальниця погодиться. Можливо, я розсерджуся й піду додому. Побачимо».',
    textWhen: [
      {
        requires: ['mara_window_credit_encouraged'],
        text: '«Якщо вона скаже ні, я хоча б знатиму, що запитала». Мара проводить пальцем по краю пакета. «Мені не потрібна промова. Хочу, щоб наступного разу Сем не казав, ніби завитки самі з’явилися в печі».',
      },
      {
        requires: ['mara_window_bookshop_suggested'],
        text: '«Я б спробувала один ранок із книжками. Без афіш на все місто». Мара дивиться на Френка, який підкрадається до стрічки на пакеті. «І без цього інспектора на кухні. Він явно працює на пані Міллер».',
      },
      {
        requires: ['mara_window_private_suggested'],
        text: '«Може, спечу маленьку партію для себе й Лео. А може, принесу тобі одну». Мара піднімає складений рецепт. «Але якщо колись попрошу надрукувати картку, пообіцяй не писати там “таємний рецепт Беллвіка”. Міллер знесе двері».',
      },
    ],
    options: [
      {
        id: 'mara-window-details-finish',
        label: '«Розкажеш, як усе минуло»',
        next: 'mara-window-finish',
      },
      {
        id: 'mara-window-details-counter',
        label: '«А що з твоїм вихідним?»',
        next: 'mara-own-counter',
        grants: ['mara_window_plan_discussed'],
      },
    ],
  },
  {
    id: 'mara-window-finish',
    speaker: 'Мара',
    text: '«Розкажу. Тільки спочатку треба пережити четвер і Сема з його трьома будильниками». Мара складає аркуш із рецептом у кишеню. «А ти поки знайди Лео книжку. Він думає, що я зайшла сюди лише за нею».',
    options: [
      {
        id: 'mara-window-finish-return',
        label: '«То як ти плануєш свій вільний ранок?»',
        next: 'mara-own-counter',
        grants: ['mara_window_plan_discussed'],
      },
    ],
  },
];

/** Optional day-five continuation inside Mara's existing conversation, not another gathering item. */
export const maraWindowFinalNodes: readonly DialogueNode[] = [
  {
    id: 'final-mara-window',
    speaker: 'Мара',
    text: '«Пам’ятаєш мої грушеві завитки? Вони ще існують. Сем учора переплутав мак із кунжутом, але я вчасно помітила». Вона дістає з кишені зім’ятий рецепт. «Поки не знаю, що з ними робити далі».',
    textWhen: [
      {
        requires: ['mara_window_credit_encouraged'],
        text: '«Я таки спитала начальницю про табличку. Вона здивувалася, а потім написала під назвою дрібними літерами: “Рецепт Мари”». Мара показує фото. «Літери можна було б зробити більшими. Але Сем тепер мусить їх читати, коли приймає замовлення».',
      },
      {
        requires: ['mara_window_bookshop_suggested'],
        text: '«Я домовилася, що можу спекти маленьку партію після зміни. Тільки не обіцяй гостям дегустацію сьогодні: я принесла дві штуки, і одну вже з’їв Лео». Мара обережно ставить на стіл паперовий пакет. «Другу я заховала від Френка».',
      },
      {
        requires: ['mara_window_private_suggested'],
        text: '«Я не віддала рецепт для нової реклами. Удома зробила варіант із яблуками — Лео з’їв обидва й заявив, що груша все-таки краща». Мара сміється. «Я ще не вирішила, чи хочу продавати цю версію. Поки вона моя».',
      },
    ],
    options: [
      {
        id: 'final-mara-window-offer',
        label: '«Як захочеш, у книгарні знайдеться місце для пробної партії»',
        next: 'final-mara-window-offer',
        grants: ['final_mara_window_tasting_offered'],
      },
      {
        id: 'final-mara-window-no-pressure',
        label: '«Можемо просто залишити це між нами»',
        next: 'final-mara-window-no-pressure',
        grants: ['final_mara_window_space_respected'],
      },
    ],
  },
  {
    id: 'final-mara-window-offer',
    speaker: 'Мара',
    text: '«Запишу. Тільки не друкуй оголошення раніше за мене». Вона малює на звороті чека маленьку грушу. «Спершу з’ясую, скільки штук зможу зробити й чи дозволять мені взяти духовку після закриття. А тоді вже влаштуємо найменшу дегустацію Беллвіка».',
    textWhen: [
      {
        requires: ['mara_window_private_suggested'],
        text: '«Може, колись». Мара усміхається, але ховає рецепт назад. «Сьогодні хочу залишити його в себе. Якщо передумаю, ти дізнаєшся першим — після Лео, бо він живе біля духовки».',
      },
    ],
    options: [
      {
        id: 'final-mara-window-offer-back',
        label: 'Повернутися до розмови про ранок',
        next: 'final-v3-mara',
        grants: ['final_mara_window_done'],
      },
    ],
  },
  {
    id: 'final-mara-window-no-pressure',
    speaker: 'Мара',
    text: '«Домовилися». Вона прибирає рецепт до кишені, а потім посуває до тебе маленьку булочку. «Але цю все одно з’їж. Вона вже тут, і я не збираюся нести її назад повз Сема». За вікном хтось стукає парасолькою об підвіконня.',
    options: [
      {
        id: 'final-mara-window-no-pressure-back',
        label: 'Повернутися до розмови про ранок',
        next: 'final-v3-mara',
        grants: ['final_mara_window_done'],
      },
    ],
  },
];

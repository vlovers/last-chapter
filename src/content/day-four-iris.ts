import type { DialogueStory } from '../game/dialogue';

/** День четвертий: право Айріс вирішувати, що станеться з її листом. */
export const irisDecision: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'На четвертий ранок дощ стихає. Айріс зупиняється біля прилавка й кладе поруч маленький альбом. «Я всю ніч малювала вікна. Дивно, як багато можна побачити, коли не намагаєшся заглянути всередину».',
      options: [{ id: 'welcome', label: 'Запропонувати чай і вислухати Айріс', next: 'welcome' }],
    },
    {
      id: 'welcome',
      speaker: 'Айріс',
      text: '«Я не хочу, щоб сім років мого життя вмістилися в один конверт. Але й робити вигляд, що його немає, більше не можу». Вона проводить пальцем по краю альбому.',
      options: [
        {
          id: 'iris-letter-feeling',
          label: '«Хочеш, я просто приберу конверт із прилавка?»',
          next: 'iris-letter-feeling',
          unless: ['iris_day_four_letter_feeling_heard'],
        },
        {
          id: 'iris-letter-ask',
          label: '«Що саме тебе лякає в цьому конверті?»',
          next: 'iris-letter-ask',
          unless: ['iris_day_four_letter_fear_heard'],
        },
        {
          id: 'letter',
          label: '«Можемо поговорити про лист»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        {
          id: 'iris-exhibition-plan',
          label: '«Якою ти хочеш зробити виставку на п’ятий день?»',
          next: 'iris-exhibition-plan',
          unless: ['iris_exhibition_plan_heard'],
        },
        { id: 'art', label: '«Розкажи про свої малюнки»', next: 'art' },
        {
          id: 'quiet-star',
          label: '«У вікні майстерні висіла паперова зірка»',
          next: 'quiet-star',
          requires: ['quiet_evening_paper_star_seen'],
          unless: ['iris_paper_star_discussed'],
        },
        {
          id: 'margin-note',
          label: '«На звороті аркуша є запис і число сімнадцять»',
          next: 'margin-note',
          requires: ['quiet_evening_margin_warning_seen'],
          unless: ['iris_margin_note_discussed'],
        },
        {
          id: 'quiet-page',
          label: '«Учора в книгарні знайшовся аркуш рукопису»',
          next: 'quiet-page',
          requires: ['quiet_evening_page_found'],
          unless: ['iris_quiet_page_discussed'],
        },
        { id: 'past', label: '«Що для тебе змінилося після повернення?»', next: 'past' },
        {
          id: 'iris-boundaries',
          label: '«Пані Міллер вже питає, коли ти розпакуєш валізу?»',
          next: 'iris-boundaries',
          unless: ['iris_day_four_boundary_heard'],
        },
        { id: 'leave', label: '«Не поспішай із рішенням»', next: 'end' },
      ],
    },
    {
      id: 'iris-letter-feeling',
      speaker: 'Айріс',
      text: '«Дякую». Вона не відсуває конверт, лише кладе долоню поруч. «Мені всі кажуть: відкрий — і стане легше. Але ж там можуть бути слова, після яких уже не повернешся до вчора».',
      options: [
        {
          id: 'iris-letter-feeling-return',
          label: '«Гаразд. А що ти малювала всю ніч?»',
          next: 'art',
          grants: ['iris_day_four_letter_feeling_heard'],
        },
      ],
    },
    {
      id: 'iris-letter-ask',
      speaker: 'Айріс',
      text: '«Що я впізнаю почерк. Або не впізнаю». Айріс дивиться на мокре скло. «І тоді доведеться вирішувати, кому про це сказати. Я ще не готова до міських порад».',
      options: [
        {
          id: 'iris-letter-ask-return',
          label: '«Якщо хтось запитає, скажу, що ми пили чай»',
          next: 'iris-boundaries',
          grants: ['iris_day_four_letter_fear_heard'],
        },
      ],
    },
    {
      id: 'iris-boundaries',
      speaker: 'Айріс',
      text: '«Пані Міллер уже тричі запитала, коли я нарешті розпакую валізу». Айріс стукає олівцем по столу. «Я ще навіть не вирішила, де купити зубну пасту».',
      options: [
        {
          id: 'iris-boundaries-stay',
          label: '«Може, вона просто скучила?»',
          next: 'iris-boundaries-choice',
          grants: ['iris_day_four_respected_freedom'],
        },
        {
          id: 'iris-boundaries-belong',
          label: '«Тебе більше дратує питання чи сама валіза?»',
          next: 'iris-boundaries-choice',
          grants: ['iris_day_four_supported_belonging'],
        },
      ],
    },
    {
      id: 'iris-boundaries-choice',
      speaker: 'Айріс',
      text: '«І те, й інше». Вона відсуває альбом. «Вибач. Ти тут ні до чого. Просто сьогодні кожен другий знає, що мені робити далі».',
      textWhen: [
        {
          requires: ['iris_day_four_respected_freedom'],
          text: '«Може, й скучила. Але це не означає, що їй можна розкладати мої речі по шафах». Айріс зітхає. «Ти теж вважаєш, що я знову втечу?»',
        },
        {
          requires: ['iris_day_four_supported_belonging'],
          text: '«Валіза хоча б мовчить». Айріс сміється, але швидко стихає. «Якщо я її розпакую, всі вирішать, що я залишаюся. А якщо ні — що збираюся втекти».',
        },
      ],
      options: [
        {
          id: 'iris-boundaries-followup-honest',
          label: '«Не знаю. Ти сама хочеш залишитися?»',
          next: 'iris-boundaries-followup',
          grants: ['iris_day_four_boundary_asked_directly'],
        },
        {
          id: 'iris-boundaries-followup-joke',
          label: '«Можеш для початку купити зубну пасту»',
          next: 'iris-boundaries-followup',
          grants: ['iris_day_four_boundary_joked'],
        },
      ],
    },
    {
      id: 'iris-boundaries-followup',
      speaker: 'Айріс',
      text: '«Оце вже схоже на план». Вона записує щось на полях альбому. «Зубна паста, кава, а потім — світові рішення. Саме в такому порядку».',
      textWhen: [
        {
          requires: ['iris_day_four_boundary_asked_directly'],
          text: '«Сьогодні — так. А за місяць не знаю». Айріс дивиться на тебе. «Тільки не розповідай пані Міллер, що я сказала слово “сьогодні”. Вона вже принесе мені ключі від запасної кімнати».',
        },
        {
          requires: ['iris_day_four_boundary_joked'],
          text: 'Айріс нарешті сміється по-справжньому. «Гаразд. Але якщо в крамниці лише м’ятна, я знову поїду». Вона ховає олівець за вухо.',
        },
      ],
      options: [
        {
          id: 'iris-boundaries-back',
          label: '«Гаразд, не затримуватиму тебе»',
          next: 'welcome',
          grants: ['iris_day_four_boundary_heard'],
        },
      ],
    },
    {
      id: 'iris-exhibition-plan',
      speaker: 'Айріс',
      text: '«Хочу повісити три малюнки до читання. Але без підписів із чужими адресами. І не хочу, щоб пані Міллер влаштувала екскурсію моїм минулим». Вона розкладає аркуші: вікно пекарні, порожній перон і світло книгарні. «Потрібно вирішити, що побачать люди, а що залишиться в альбомі».',
      options: [
        {
          id: 'iris-exhibition-open',
          label: '«Обери роботи й підписи сама; я підготую місце»',
          next: 'iris-exhibition-result',
          grants: ['iris_exhibition_artist_controls'],
        },
        {
          id: 'iris-exhibition-private',
          label: '«Можемо показати лише одну роботу — або жодної»',
          next: 'iris-exhibition-result',
          grants: ['iris_exhibition_private_choice'],
        },
      ],
    },
    {
      id: 'iris-exhibition-result',
      speaker: 'Айріс',
      text: 'Айріс довго розглядає малюнки, тоді прибирає один до папки. «Я хотіла показати все, щоб довести, що не боюся. Але це погана причина для виставки». Вона бере чисті картки для підписів.',
      textWhen: [
        {
          requires: ['iris_exhibition_artist_controls'],
          text: '«Тоді я сама напишу назви. Три малюнки — якщо завтра не передумаю. А ти допоможеш знайти місце, де їх буде добре видно». Вона вже вимірює поглядом стіну біля вікна.',
        },
        {
          requires: ['iris_exhibition_private_choice'],
          text: '«Почну з одного вікна. Інші поки залишаться в альбомі». Айріс усміхається: «Уперше це схоже на мою виставку, а не на пояснювальну записку для міста».',
        },
      ],
      options: [
        {
          id: 'iris-exhibition-result-back',
          label: 'Повернутися до розмови',
          next: 'welcome',
          grants: ['iris_exhibition_plan_heard'],
        },
      ],
    },
    {
      id: 'art',
      speaker: 'Айріс',
      text: '«Колись я малювала лише місця, з яких хотіла втекти. Тепер — місця, де можна залишитися. Ось це вікно книгарні. Бачиш, я залишила світло всередині?»',
      options: [
        {
          id: 'art-back',
          label: '«Тут завжди знайдеться місце для твоїх малюнків»',
          next: 'iris-exhibition-plan',
          grants: ['iris_offered_exhibition'],
        },
      ],
    },
    {
      id: 'quiet-star',
      speaker: 'Айріс',
      text: '«У майстерні? Там колись працював палітурник. Мама носила йому рукописи, коли боялася зіпсувати сторінки степлером». Айріс відсуває чашку. «А зірки ми вирізали разом. Тільки наші були з обгорток від цукерок».',
      options: [
        {
          id: 'quiet-star-ask',
          label: '«Може, хтось досі користується майстернею?»',
          next: 'quiet-star-memory',
          grants: ['iris_paper_star_workshop_questioned'],
        },
        {
          id: 'quiet-star-joke',
          label: '«Френк вважає, що це його нова територія»',
          next: 'quiet-star-memory',
        },
      ],
    },
    {
      id: 'quiet-star-memory',
      speaker: 'Айріс',
      text: '«Палітурник помер давно. Ключі мала його сестра, але я не бачила її років десять». Айріс усміхається, коли Френк намагається залізти в її сумку. «Я не хочу бігти туди з ліхтарем. Можемо просто запитати, чи майстерню хтось орендує».',
      options: [
        {
          id: 'quiet-star-inquire',
          label: '«Запитаю про майстерню, не згадуючи твою маму»',
          next: 'quiet-star-result',
          grants: ['iris_workshop_discreet_inquiry'],
        },
        {
          id: 'quiet-star-wait',
          label: '«Добре, не будемо поспішати»',
          next: 'quiet-star-result',
          grants: ['iris_workshop_left_uninvestigated'],
        },
      ],
    },
    {
      id: 'quiet-star-result',
      speaker: 'Айріс',
      text: '«Дякую. Якщо там справді хтось працює, я б хотіла побачити старі палітурки. Не обов’язково сьогодні». Вона забирає Френка зі своєї сумки й повертається до альбому.',
      options: [
        {
          id: 'quiet-star-back',
          label: 'Повернутися до розмови',
          next: 'welcome',
          grants: ['iris_paper_star_discussed'],
        },
      ],
    },
    {
      id: 'margin-note',
      speaker: 'Айріс',
      text: '«Сімнадцять?» Айріс забирає руку з альбому. «Мама нумерувала коробки з чернетками. Але це може бути будь-що. Де ти знайшов напис?»',
      options: [
        {
          id: 'margin-box',
          label: '«Може, йдеться про коробку з рукописами?»',
          next: 'margin-box',
          grants: ['iris_margin_box_theory'],
        },
        {
          id: 'margin-date',
          label: '«Може, це дата?»',
          next: 'margin-date',
          grants: ['iris_margin_date_theory'],
        },
      ],
    },
    {
      id: 'margin-box',
      speaker: 'Айріс',
      text: '«Колись коробки стояли в майстерні палітурника. Я пам’ятаю одну з синьою стрічкою, але не номер». Вона зітхає. «Не хочу, щоб ти через мій здогад перевернув чужу майстерню».',
      options: [
        {
          id: 'margin-box-back',
          label: '«Спершу запитаємо власника»',
          next: 'margin-note-end',
        },
      ],
    },
    {
      id: 'margin-date',
      speaker: 'Айріс',
      text: '«Сімнадцятого ми святкували день народження бабусі. А ще це може бути номер сторінки». Айріс усміхається. «Бачиш? Я вже вигадала три пояснення й жодного не довела».',
      options: [
        {
          id: 'margin-date-back',
          label: '«Занотуємо всі версії»',
          next: 'margin-note-end',
        },
      ],
    },
    {
      id: 'margin-note-end',
      speaker: 'Айріс',
      text: '«Домовилися. І поки нікому не показуй напис без мого дозволу». Френк тягнеться до олівця, і Айріс встигає його перехопити.',
      options: [
        {
          id: 'margin-note-return',
          label: 'Повернутися до розмови',
          next: 'welcome',
          grants: ['iris_margin_note_discussed'],
        },
      ],
    },
    {
      id: 'quiet-page',
      speaker: 'Айріс',
      text: 'Айріс упізнає маленькі зірочки на полях. «Мама так позначала місця, до яких хотіла повернутися. Вона завжди ставила три зірки, навіть якщо виправляла одне слово». Айріс проводить поглядом по аркушу. «А тут лише дві».',
      options: [
        {
          id: 'quiet-page-stars',
          label: '«Може, третю зірку хтось стер?»',
          next: 'quiet-page-stars',
        },
        {
          id: 'quiet-page-window',
          label: '«Чому в уривку залишили вікно відчиненим?»',
          next: 'quiet-page-window',
        },
        {
          id: 'quiet-page-privacy',
          label: '«Не будемо поки показувати аркуш іншим»',
          next: 'quiet-page-choice',
        },
      ],
    },
    {
      id: 'quiet-page-stars',
      speaker: 'Айріс',
      text: '«Або це взагалі не її рука». Вона дістає з альбому стару листівку. У кутку — три зірки, намальовані синім чорнилом. «Я зберігала це як закладку. Навіть не думала, що колись доведеться порівнювати почерк».',
      options: [
        {
          id: 'quiet-page-compare',
          label: 'Порівняти листівку й аркуш, не роблячи висновків',
          next: 'quiet-page-choice',
          grants: ['iris_quiet_page_stars_compared'],
        },
        {
          id: 'quiet-page-no-compare',
          label: '«Можеш прибрати листівку. Не обов’язково зараз»',
          next: 'quiet-page-choice',
        },
      ],
    },
    {
      id: 'quiet-page-window',
      speaker: 'Айріс',
      text: '«У дитинстві я думала, що це про втечу. Але в маминому романі вікна відчиняли, коли чекали на когось». Вона замовкає. «Хоча це не доводить, що сторінка з того роману».',
      options: [
        {
          id: 'quiet-page-note-window',
          label: 'Записати здогад про вікно, не називаючи його фактом',
          next: 'quiet-page-choice',
          grants: ['iris_quiet_page_window_theory'],
        },
        {
          id: 'quiet-page-leave-window',
          label: '«Поки залишимо це питання відкритим»',
          next: 'quiet-page-choice',
        },
      ],
    },
    {
      id: 'quiet-page-choice',
      speaker: 'Айріс',
      text: '«Я не знаю, хто приніс сторінку. І не впевнена, що хочу дізнатися сьогодні». Вона повертає аркуш. «Але якщо ти щось робитимеш із ним, скажи мені спершу».',
      options: [
        {
          id: 'quiet-page-respect',
          label: '«Залишу аркуш у себе й спершу поговорю з тобою»',
          next: 'quiet-page-result',
          grants: ['iris_quiet_page_discussed', 'iris_quiet_page_privacy_respected'],
        },
        {
          id: 'quiet-page-ask',
          label: '«Спитаю в когось про почерк, але без імен»',
          next: 'quiet-page-result',
          grants: ['iris_quiet_page_discussed', 'iris_quiet_page_identity_questioned'],
        },
      ],
    },
    {
      id: 'quiet-page-result',
      speaker: 'Айріс',
      text: '«Гаразд. Тільки не перетворюй мою маму на загадку для всього міста». Вона прибирає листівку назад до альбому.',
      textWhen: [
        {
          requires: ['iris_quiet_page_privacy_respected'],
          text: '«Дякую. Я сама ще не знаю, чи готова повертатися до її рукописів». Айріс обережно закриває альбом, але залишає руку на обкладинці.',
        },
        {
          requires: ['iris_quiet_page_identity_questioned'],
          text: '«Тільки без імен і без фотографій сторінки», — каже Айріс. «Я хочу знати, якщо хтось її впізнає. Раніше за плітки».',
        },
      ],
      options: [{ id: 'quiet-page-return', label: 'Повернутися до розмови', next: 'welcome' }],
    },
    {
      id: 'past',
      speaker: 'Айріс',
      text: '«Учора зайшла до старої квартири й пів години шукала вимикач. Його перенесли на іншу стіну». Айріс сміється. «Я навіть не знала, що мене це так розсердить».',
      options: [
        {
          id: 'past-back',
          label: '«Ти можеш обрати, що буде далі»',
          next: 'welcome',
          grants: ['iris_supported_autonomy'],
        },
      ],
    },
    {
      id: 'letter',
      speaker: 'Айріс',
      text: '«Це мої слова, але адресовані вони були Лео. Я не знаю, чи хочу, щоб він їх прочитав. І не хочу, щоб хтось вирішував замість нас».',
      options: [
        {
          id: 'respect',
          label: '«Лист залишиться запечатаним, доки ти не вирішиш»',
          next: 'respect',
          unless: ['opened_private_letter'],
          grants: ['iris_letter_choice_respected'],
        },
        {
          id: 'respect-opened',
          label: '«Ти вирішуєш, що буде з листом. Я не передаватиму його без згоди»',
          next: 'respect',
          requires: ['opened_private_letter'],
          grants: ['iris_letter_choice_respected'],
        },
        {
          id: 'admit-opened',
          label: '«Я порушив печатку без дозволу. Мені шкода»',
          next: 'breach',
          requires: ['opened_private_letter'],
          grants: ['iris_letter_breach_admitted'],
        },
        {
          id: 'offer',
          label: '«Я можу передати його лише з твоєї згоди»',
          next: 'offer',
          grants: ['iris_letter_delivery_offered'],
        },
        {
          id: 'pressure',
          label: '«Лео має прочитати його просто зараз»',
          next: 'pressure',
          grants: ['iris_letter_pressured_day4'],
        },
        {
          suspend: true,
          repeatability: 'repeatable',
          id: 'letter-back',
          label: '«Можемо повернутися до цього пізніше»',
          next: 'welcome',
        },
      ],
    },
    {
      id: 'respect',
      speaker: 'Айріс',
      text: '«Дякую. Я звикла, що люди називають поспіх сміливістю. А ти дозволив мені подумати». Вона знову відкриває альбом.',
      textWhen: [
        {
          requires: ['opened_private_letter'],
          text: '«Я сама вирішу, що буде далі», — каже Айріс і знову відкриває альбом. Ви згадуєте порушену печатку: теперішня повага не скасовує того, що вже сталося.',
        },
      ],
      options: [{ id: 'respect-back', label: 'Повернутися до розмови', next: 'welcome' }],
    },
    {
      id: 'offer',
      speaker: 'Айріс',
      text: '«Можливо, колись я попрошу тебе. Але не сьогодні. Спершу я хочу поговорити з ним сама — якщо він теж цього захоче».',
      options: [
        {
          id: 'offer-back',
          label: '«Я нічого не передаватиму без дозволу»',
          next: 'welcome',
          grants: ['iris_letter_choice_respected'],
        },
      ],
    },
    {
      id: 'breach',
      speaker: 'Айріс',
      text: 'Айріс довго мовчить. «Ти мав запитати. Я не знаю, чи готова зараз про це говорити. І не хочу, щоб вибачення вимагало від мене негайної відповіді». Вона притискає альбом до себе.',
      options: [{ id: 'breach-back', label: '«Я почув. Не квапитиму тебе»', next: 'welcome' }],
    },
    {
      id: 'pressure',
      speaker: 'Айріс',
      text: 'Вона закриває альбом. «Тоді ти не почув мене. Це не загадка, яку треба розв’язати за мене». За вікном шелестить мокре листя.',
      options: [{ id: 'pressure-back', label: '«Вибач. Це твоє рішення»', next: 'welcome' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Айріс залишає на прилавку малюнок освітленого вікна. Лист іще не отримав відповіді. Але тепер це не завдання для стороннього детектива, а розмова, яку мають право обрати самі люди.',
      options: [],
    },
  ],
};

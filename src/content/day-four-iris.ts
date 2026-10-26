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
          id: 'iris-exhibition-plan',
          label: '«Якою ти хочеш зробити виставку на п’ятий день?»',
          next: 'iris-exhibition-plan',
          unless: ['iris_exhibition_plan_heard'],
        },
        {
          id: 'missing-chapter',
          label: '«Поглянь на сторінку, яку знайшли в старій книзі»',
          next: 'missing-chapter',
          requires: ['cabinet_photo_seen'],
          unless: ['missing_chapter_discussed'],
        },
        { id: 'art', label: '«Розкажи про свої малюнки»', next: 'art' },
        {
          id: 'letter',
          label: '«Можемо поговорити про лист»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        { id: 'past', label: '«Що для тебе змінилося після повернення?»', next: 'past' },
        {
          id: 'iris-boundaries',
          label: '«Що означає повернутися, але не бути зобов’язаною залишитися?»',
          next: 'iris-boundaries',
          unless: ['iris_day_four_boundary_heard'],
        },
        { id: 'leave', label: '«Не поспішай із рішенням»', next: 'end' },
      ],
    },
    {
      id: 'iris-boundaries',
      speaker: 'Айріс',
      text: '«Усі кажуть: нарешті ти вдома. Наче це зобов’язання. А я сьогодні вперше зайшла сюди без думки, що мушу комусь довести, чому повернулася».',
      options: [
        {
          id: 'iris-boundaries-stay',
          label: '«Можна любити місто й не обіцяти залишитися назавжди»',
          next: 'iris-boundaries-choice',
          grants: ['iris_day_four_respected_freedom'],
        },
        {
          id: 'iris-boundaries-belong',
          label: '«Можна бути вдома, навіть коли ще не знаєш, де твоє місце»',
          next: 'iris-boundaries-choice',
          grants: ['iris_day_four_supported_belonging'],
        },
      ],
    },
    {
      id: 'iris-boundaries-choice',
      speaker: 'Айріс',
      text: '«Мені бракувало саме цього: розмови, після якої не потрібно одразу ухвалювати рішення». Вона відкриває альбом на чистій сторінці.',
      textWhen: [
        {
          requires: ['iris_day_four_respected_freedom'],
          text: '«Я можу поїхати ще раз. І це не зробить моє повернення неправдою. Дякую, що не називаєш свободу зрадою».',
        },
        {
          requires: ['iris_day_four_supported_belonging'],
          text: '«Мабуть, дім — це місце, де мені дозволено сумніватися. Дякую, що не вимагаєш від мене певності».',
        },
      ],
      options: [
        {
          id: 'iris-boundaries-back',
          label: 'Повернутися до розмови',
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
      id: 'missing-chapter',
      speaker: 'Айріс',
      text: 'Ви знаходите у старій книжці складений аркуш. На ньому машинописний заголовок: «Розділ, який не надрукували». Уривок починається так: «Після останнього сеансу Генрі не вимкнув світло. Він чекав на людину, яка пообіцяла більше ніколи не повертатися до Беллвіка». Айріс читає вдруге. «Це ж рядки з роману Вітмора. Тільки в моєму примірнику після сеансу одразу йде ранок».',
      textWhen: [
        {
          requires: ['cinema_poster_lead', 'cinema_club_asked_for_records'],
          text: 'Ви зіставляєте розповідь Айріс про афіші та слова Міллер про старі папери. Між сторінками книжки без обкладинки знаходиться складений машинописний аркуш: «Розділ, який не надрукували». Уривок починається так: «Після останнього сеансу Генрі не вимкнув світло. Він чекав на людину, яка пообіцяла більше ніколи не повертатися до Беллвіка». Айріс перечитує рядки: «Це з роману Вітмора. Але в моєму примірнику такого немає».',
        },
      ],
      options: [
        {
          id: 'chapter-keep',
          label: '«Сховаю сторінку, доки не дізнаюся більше»',
          next: 'missing-chapter-result',
          grants: ['missing_chapter_hidden'],
        },
        {
          id: 'chapter-copy',
          label: '«Зроблю копію й покажу оригінал Елеонорі»',
          next: 'missing-chapter-result',
          grants: ['missing_chapter_copied'],
        },
        {
          id: 'chapter-rumor',
          label: '«Скажу Міллер, що це зізнання Генрі»',
          next: 'missing-chapter-result',
          grants: ['missing_chapter_false_claim'],
        },
      ],
    },
    {
      id: 'missing-chapter-result',
      speaker: 'Айріс',
      text: '«Можливо, це чернетка. Або чужа вигадка. На аркуші немає навіть номера сторінки». Вона знову бере альбом. «Мені треба доробити три малюнки до завтра. Якщо знайдеш інші сторінки, тоді й поговоримо».',
      textWhen: [
        {
          requires: ['missing_chapter_hidden'],
          text: 'Айріс бачить, як ви складаєте аркуш. «Гаразд. Тільки не загуби його серед чеків. І не кажи потім, що нічого не знайшов».',
        },
        {
          requires: ['missing_chapter_copied'],
          text: '«Копію залиш собі. Елеонора впізнає машинку, якщо це справді її старі папери». Айріс витирає пляму фарби з пальця. «А я піду по новий папір. Цей закінчився».',
        },
        {
          requires: ['missing_chapter_false_claim'],
          text: '«Зізнання?» Айріс забирає руку від сторінки. «Ти щойно це вигадав. Я не збираюся підтверджувати твою історію, навіть якщо Міллер у неї повірить».',
        },
      ],
      options: [
        {
          id: 'missing-chapter-back',
          label: 'Повернутися до розмови',
          next: 'welcome',
          grants: ['missing_chapter_discussed'],
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
          next: 'welcome',
          grants: ['iris_offered_exhibition'],
        },
      ],
    },
    {
      id: 'past',
      speaker: 'Айріс',
      text: '«Я думала, що повернення дасть відповідь на всі запитання. Насправді воно дало мені право ставити нові. Мені не потрібно повертати минуле, щоб не боятися його».',
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

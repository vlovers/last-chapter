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
      text: '«Мене дратує, що всі зводять ці сім років до одного листа. Ніби відкриємо конверт — і все стане ясно. Не стане. Але вдавати, що його не існує, я теж уже втомилася». Вона крутить альбом за край.',
      options: [
        { id: 'art', label: '«Розкажи про свої малюнки»', next: 'art' },
        {
          id: 'letter',
          label: '«Можемо поговорити про лист»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        { id: 'past', label: '«Що для тебе змінилося після повернення?»', next: 'past' },
        { id: 'leave', label: '«Не поспішай із рішенням»', next: 'end' },
      ],
    },
    {
      id: 'art',
      speaker: 'Айріс',
      text: '«Раніше я малювала місця, звідки хотіла забратися. Тепер малюю ті, куди не проти повернутися. Оце вікно — ваше. Світло ввечері тут гарне».',
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
      text: '«Я думала, повернуся — і зрозумію, навіщо взагалі приїхала. А тепер маю ще більше запитань. Ну, принаймні я більше не мушу вдавати, що мені байдуже».',
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
      text: '«Я це писала Лео. Колись. Не знаю, чи хочу, щоб він читав. І, будь ласка, не вирішуй за мене, що з цим робити. Я сама ще не вирішила».',
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
        { id: 'letter-back', label: '«Можемо повернутися до цього пізніше»', next: 'welcome' },
      ],
    },
    {
      id: 'respect',
      speaker: 'Айріс',
      text: '«Дякую. Мені треба було трохи часу, а не ще одна людина, яка каже, що робити». Вона знову відкриває альбом.',
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
      text: '«Може, попрошу тебе передати. Але не сьогодні. Спершу сама з ним поговорю — якщо він узагалі захоче говорити».',
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
      text: 'Айріс дивиться на тебе, потім на конверт. «Треба було спитати. Я зараз не можу просто сказати, що все гаразд. І не проси мене відповісти на твоє вибачення прямо зараз». Вона притискає альбом до себе.',
      options: [{ id: 'breach-back', label: '«Я почув. Не квапитиму тебе»', next: 'welcome' }],
    },
    {
      id: 'pressure',
      speaker: 'Айріс',
      text: 'Вона закриває альбом. «Я ж сказала, що сама вирішу. Чому ти все одно наполягаєш?» Вона прибирає малюнок у сумку.',
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

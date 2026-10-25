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
        { id: 'letter-back', label: '«Можемо повернутися до цього пізніше»', next: 'welcome' },
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

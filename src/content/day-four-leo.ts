import type { DialogueStory } from '../game/dialogue';

/** День четвертий: Лео сам вирішує, чи готовий говорити про минуле. */
export const leoDecision: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Надвечір Лео з’являється на порозі з мокрим коміром і маленьким пакунком для Мари. Він зупиняється біля старого годинника. «Тут завжди час ішов трохи повільніше», — каже він.',
      options: [{ id: 'welcome', label: 'Запросити Лео до книгарні', next: 'welcome' }],
    },
    {
      id: 'welcome',
      speaker: 'Лео',
      text: '«Я останнім часом багато думаю про те, як ми пам’ятаємо людей. Інколи здається, що пам’ятаєш людину, а насправді — свою останню розмову з нею».',
      options: [
        { id: 'mara', label: '«Як ви з Марою?»', next: 'mara' },
        { id: 'trains', label: '«Досі любиш старі станції?»', next: 'trains' },
        { id: 'past', label: '«Ти хотів би поговорити з Айріс?»', next: 'past' },
        {
          id: 'evidence',
          label: '«Знайшлися записи про старе бронювання»',
          next: 'evidence',
          requires: ['eleanor_confirmed_reservation'],
        },
        {
          id: 'letter',
          label: '«Є лист, який може бути адресований тобі»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        {
          id: 'leo-future',
          label: '«Чи можна будувати майбутнє, не переписуючи минуле?»',
          next: 'leo-future',
          unless: ['leo_day_four_future_heard'],
        },
        { id: 'finish', label: 'Побажати Лео спокійного вечора', next: 'end' },
      ],
    },
    {
      id: 'leo-future',
      speaker: 'Лео',
      text: '«Я зберіг старий квиток. Не тому, що хочу повернутися до того дня. Просто боявся викинути доказ, що колись був щасливим. Мара побачила його й нічого не запитала. А я весь вечір чекав допиту».',
      options: [
        {
          id: 'leo-future-honest',
          label: '«Можеш сам розповісти Марі, якщо захочеш»',
          next: 'leo-future-choice',
          grants: ['leo_day_four_chose_honesty'],
        },
        {
          id: 'leo-future-private',
          label: '«Спогад не стає зрадою лише тому, що він особистий»',
          next: 'leo-future-choice',
          grants: ['leo_day_four_respected_privacy'],
        },
      ],
    },
    {
      id: 'leo-future-choice',
      speaker: 'Лео',
      text: '«Мені потрібен час. Не для того, щоб вигадати правильну відповідь, а щоб перестати боятися неправильної».',
      textWhen: [
        {
          requires: ['leo_day_four_chose_honesty'],
          text: '«Я хочу говорити з Марою чесно, а не так, ніби звітую за кожен день до нашої зустрічі. Мабуть, почну з того, чого боюся».',
        },
        {
          requires: ['leo_day_four_respected_privacy'],
          text: '«Можливо, минуле не треба ні ховати, ні виставляти на суд. Я можу пам’ятати його й усе одно бути тут, сьогодні».',
        },
      ],
      options: [
        {
          id: 'leo-future-back',
          label: 'Повернутися до розмови',
          next: 'welcome',
          grants: ['leo_day_four_future_heard'],
        },
      ],
    },
    {
      id: 'mara',
      speaker: 'Лео',
      text: '«Вона не дає мені забути, що життя відбувається зараз. Ми плануємо поїздку до моря, а я ще жодного разу не вибрав, на який потяг сісти». Він усміхається.',
      options: [
        {
          id: 'mara-kind',
          label: '«Важливо слухати, чого хочете ви обоє»',
          next: 'welcome',
          grants: ['leo_respected_mara_relationship'],
        },
        { id: 'mara-back', label: 'Повернутися до розмови', next: 'welcome' },
      ],
    },
    {
      id: 'trains',
      speaker: 'Лео',
      text: '«На старих вокзалах мені подобаються табло. Вони показують усі напрямки, але не обирають за тебе. Можливо, дорослішання — це купити квиток, не чекаючи ідеального розкладу».',
      options: [{ id: 'trains-back', label: '«Гарне порівняння»', next: 'welcome' }],
    },
    {
      id: 'past',
      speaker: 'Лео',
      text: '«Можливо. Але не для того, щоб повернути сім років. Я хотів би знати, чи ми обоє можемо згадувати те літо без сорому. Якщо Айріс не захоче — я зрозумію».',
      options: [
        {
          id: 'past-back',
          label: '«Це має бути рішення вас обох»',
          next: 'welcome',
          grants: ['leo_supported_mutual_consent'],
        },
      ],
    },
    {
      id: 'evidence',
      speaker: 'Лео',
      text: '«Тобто запис про бронювання був, але ніхто не може підтвердити, що мені подзвонили?» Він довго дивиться на полицю. «Це змінює те, що я думав про той день. Але не дає права вимагати від Айріс відповіді».',
      options: [
        {
          id: 'evidence-back',
          label: '«Ми знаємо лише те, що підтверджено»',
          next: 'welcome',
          grants: ['leo_understood_timeline'],
        },
      ],
    },
    {
      id: 'letter',
      speaker: 'Лео',
      text: 'Він не простягає руку до прилавка. «Якщо це лист від Айріс, я не хочу отримати його через чужу цікавість. Чи вона знає, що він знайшовся?»',
      options: [
        {
          id: 'letter-wait',
          label: '«Я не передаватиму його без згоди Айріс»',
          next: 'letter-wait',
          grants: ['leo_letter_consent_respected'],
        },
        {
          id: 'letter-ask',
          label: '«Можу запитати, чи вона хоче поговорити»',
          next: 'letter-ask',
          grants: ['leo_open_to_conversation'],
        },
        {
          id: 'letter-push',
          label: '«Тобі варто прочитати його негайно»',
          next: 'letter-push',
          grants: ['leo_letter_pressured_day4'],
        },
      ],
    },
    {
      id: 'letter-wait',
      speaker: 'Лео',
      text: '«Дякую. Мені цікаво, що там, звісно. Але цікавість не важливіша за те, що вона вирішить сама».',
      options: [{ id: 'wait-back', label: 'Повернутися до розмови', next: 'welcome' }],
    },
    {
      id: 'letter-ask',
      speaker: 'Лео',
      text: '«Скажи тільки, що я готовий вислухати. Без обіцянок і без сцени на весь Беллвік. Я теж маю поговорити з Марою — чесно, не ховаючись за минулим».',
      options: [
        { id: 'ask-back', label: '«Передам лише твою готовність говорити»', next: 'welcome' },
      ],
    },
    {
      id: 'letter-push',
      speaker: 'Лео',
      text: '«Ні. Я вже колись думав, що мовчання іншої людини дає мені право придумати за неї відповідь. Більше не хочу так робити».',
      options: [{ id: 'push-back', label: '«Ти маєш рацію»', next: 'welcome' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Лео йде до пекарні, де ще горить світло. На прилавку залишається стара картка бронювання. Тепер це не доказ чийогось байдужого серця, а частина історії, яку можна розповісти чесніше.',
      options: [],
    },
  ],
};

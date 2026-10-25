import type { DialogueStory } from '../game/dialogue';

/** Nora has her own life; professional confidentiality is never a puzzle reward. */
export const noraVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Під вечір до книгарні заходить Нора Рід. Вона складає мокру парасолю так акуратно, наче це частина важливого ритуалу. На плечі — торба з книжками, які давно пора повернути.',
      options: [
        { id: 'hello', label: 'Запропонувати чай', next: 'hello' }],
    },
    {
      id: 'hello',
      speaker: 'Нора',
      text: '«Якщо у вас є чай без поспіху, я залишуся на десять хвилин». Вона оглядає полиці. «Хочу знайти історію, де люди не зобов’язані бути сильними щосекунди».',
      options: [
        { id: 'nora-reflection', label: 'Поговорити про те, що складно сказати вголос', next: 'nora-reflection', unless: ['nora_reflected_on_uncertainty'] },
        { id: 'books', label: '«Які історії вам подобаються?»', next: 'books' },
        { id: 'work', label: '«Як вам працюється в громадському центрі?»', next: 'work' },
        { id: 'bellwick', label: '«Що вам подобається в Беллвіку?»', next: 'bellwick' },
        {
          id: 'rumor',
          label: '«Містом ходять чутки про Томаса»',
          next: 'rumor',
          requires: ['rumor_heard'],
        },
        { id: 'end', label: '«Гарного вечора»', next: 'end' },
      ],
    },
    {
      id: 'books',
      speaker: 'Нора',
      text: '«Люблю книжки, у яких тиша — не покарання. І де дружба не менш важлива за кохання. Останнім часом читаю короткими уривками між справами».',
      options: [
        { id: 'books-ask', label: '«Можливо, вам підійде збірка листів?»', next: 'letters' },
        { id: 'books-back', label: '«Подивімося інші теми»', next: 'hello' },
      ],
    },
    {
      id: 'letters',
      speaker: 'Нора',
      text: '«Листи — дивна річ. Можна сказати те, чого не наважуєшся вголос. Але адресат усе одно має право відповісти — або не відповідати».',
      options: [
        {
          id: 'letters-back',
          label: '«Залишу книжку на полиці для вас»',
          next: 'hello',
          grants: ['nora_interested_in_letters'],
        },
      ],
    },
    {
      id: 'work',
      speaker: 'Нора',
      text: '«У центрі ми проводимо зустрічі для різних людей. Найважче — пам’ятати, що кожна історія належить людині, яка її розповідає».',
      options: [
        { id: 'work-follow', label: '«Ви втомлюєтеся слухати?»', next: 'rest' },
        { id: 'work-back', label: '«Зрозуміло»', next: 'hello' },
      ],
    },
    {
      id: 'rest',
      speaker: 'Нора',
      text: '«Так. Тому вирощую трави на підвіконні. М’ята живе, базилік ображається, а розмарин удає, що йому все байдуже». Вона нарешті сміється.',
      options: [
        {
          id: 'rest-back',
          label: '«М’ята, здається, перемогла»',
          next: 'hello',
          grants: ['nora_shared_garden'],
        },
      ],
    },
    {
      id: 'bellwick',
      speaker: 'Нора',
      text: '«Тут усі вітаються, навіть коли не знають твого імені. Це може бути теплом, а може — тиском. Я люблю наше місто, але інколи хотіла б, щоб люди давали одне одному більше простору».',
      options: [
        {
          id: 'bellwick-back',
          label: '«Книгарня може бути таким місцем»',
          next: 'hello',
          grants: ['nora_hopes_for_safe_shop'],
        },
      ],
    },
    {
      id: 'rumor',
      speaker: 'Нора',
      text: 'Нора не відводить очей. «Я чула. Якщо людина приходить до громадського центру, це не робить її життя публічним. Я не коментую, хто і навіщо туди звертається».',
      options: [
        {
          id: 'rumor-respect',
          label: '«Не буду переповідати ці чутки»',
          next: 'boundary',
          grants: ['nora_confidentiality_respected'],
        },
        {
          id: 'rumor-push',
          label: '«Але ж ви можете сказати, чи це правда?»',
          next: 'refusal',
          grants: ['nora_confidentiality_pressed'],
        },
      ],
    },
    {
      id: 'boundary',
      speaker: 'Нора',
      text: '«Дякую. Людям потрібне місце, де їх не перетворюють на чиюсь загадку». Вона поправляє ремінець торби. «Поговорімо краще про книжки».',
      options: [{ id: 'boundary-back', label: '«Із задоволенням»', next: 'hello' }],
    },
    {
      id: 'refusal',
      speaker: 'Нора',
      text: '«Ні. Навіть якщо ви дуже хвилюєтеся за когось. Я не можу обговорювати чужі звернення. І не буду».',
      options: [{ id: 'refusal-end', label: 'Вибачитися й завершити розмову', next: 'end' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Нора виходить із книжкою, яку ще не вирішила купувати. Дощ майже припинився. У книгарні залишається запах м’яти та розмова, яка не стала чужою таємницею.',
      options: [],
    },
    {
      id: 'nora-reflection',
      speaker: 'Нора',
      text: '«У записах мене найбільше лякає не помилка, а порожнє місце».',
      options: [
        { id: 'nora-reflect-question', label: '«А що для тебе в цьому найважче?»', next: 'nora-reflection-deep' },
        { id: 'nora-reflect-return', label: '«Дякую, що поділився цим»', next: 'nora-reflection-end' },
      ],
    },
    {
      id: 'nora-reflection-deep',
      speaker: 'Нора',
      text: '«Я можу знайти дату. Але не можу довести, що людина тоді відчувала».',
      options: [
        { id: 'nora-reflect-continue', label: '«І що ти хочеш змінити?»', next: 'nora-reflection-end' },
        { id: 'nora-reflect-listen', label: '«Можна просто побути з цим»', next: 'nora-reflection-end' },
      ],
    },
    {
      id: 'nora-reflection-end',
      speaker: 'Нора',
      text: '«Можливо, чесна відповідь іноді звучить просто: ми поки не знаємо».',
      options: [
        { id: 'nora-reflect-finish', label: 'Повернутися до розмови', next: 'hello', grants: ['nora_reflected_on_uncertainty'] },
      ],
    },
  ],
};

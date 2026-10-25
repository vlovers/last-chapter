import type { DialogueStory } from '../game/dialogue';

/** День другий: Айріс не є загадкою, яку треба «розв'язати». */
export const irisVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Вранці до книгарні заходить жінка з тубусом для малюнків. На рукаві її пальта — краплини дощу, на пальцях — синя фарба. Вона довго дивиться на вивіску.',
      options: [{        { id: 'iris-reflection', label: 'Поговорити про те, що складно сказати вголос', next: 'iris-reflection' },
 id: 'welcome', label: '«Доброго ранку. Шукаєте щось?»', next: 'welcome' }],
    },
    {
      id: 'welcome',
      speaker: 'Айріс',
      text: '«Не знаю. Колись я тут проводила майже кожну суботу. А потім сім років не могла змусити себе зайти». Вона усміхається. «Я Айріс. Малюю книжки, які іноді ніхто не друкує».',
      options: [
        { id: 'ask-art', label: '«Розкажете про ілюстрації?»', next: 'art' },
        { id: 'ask-return', label: '«Що привело вас назад?»', next: 'return' },
        { id: 'ask-old', label: '«Ви знали колишню власницю?»', next: 'eleanor' },
        {
          id: 'ask-letter',
          label: '«Я знайшов лист із вашим ім’ям»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        { id: 'end-early', label: '«Можете просто подивитися книжки»', next: 'end' },
      ],
    },
    {
      id: 'art',
      speaker: 'Айріс',
      text: '«Найскладніше намалювати тишу. Не порожнечу — саме тишу, коли двоє людей сидять поруч і їм не потрібно нічого доводити». Вона торкається корінця книжки. «Колись я хотіла зробити цілу історію без слів».',
      options: [
        { id: 'art-more', label: '«А чому не зробили?»', next: 'art-more' },
        { id: 'art-back', label: '«Про що ще поговоримо?»', next: 'welcome' },
      ],
    },
    {
      id: 'art-more',
      speaker: 'Айріс',
      text: '«Боялася, що люди не зрозуміють. А потім зрозуміла: я сама не завжди знаю, що хочу сказати. Мабуть, це не причина мовчати вічно».',
      options: [{ id: 'art-more-back', label: '«Можемо змінити тему»', next: 'welcome' }],
    },
    {
      id: 'return',
      speaker: 'Айріс',
      text: '«Моя мама попросила намалювати афішу для осіннього читання. Я сказала, що не повернуся. А потім упіймала себе на тому, що вже купила квиток».',
      options: [
        { id: 'return-home', label: '«Вам бракувало міста?»', next: 'home' },
        {
          id: 'return-no-pressure',
          label: '«Не обов’язково розповідати більше»',
          next: 'respect',
          grants: ['iris_boundary_respected'],
        },
        { id: 'return-back', label: '«А про книжки?»', next: 'welcome' },
      ],
    },
    {
      id: 'home',
      speaker: 'Айріс',
      text: '«Запаху мокрих каштанів. Дурних оголошень на пошті. І людей, які пам’ятають тебе іншою. Останнє водночас найприємніше й найважче».',
      options: [{ id: 'home-back', label: '«Розумію»', next: 'welcome' }],
    },
    {
      id: 'eleanor',
      speaker: 'Айріс',
      text: '«Елеонора навчила мене не загинати кутики сторінок. І дозволяла годинами сидіти тут із альбомом. Коли книгарню затопило, я вже збиралася їхати. Ми так і не попрощалися як слід».',
      options: [
        { id: 'eleanor-follow', label: '«Ви пам’ятаєте день затоплення?»', next: 'flood' },
        { id: 'eleanor-back', label: '«Дякую, що розповіли»', next: 'welcome' },
      ],
    },
    {
      id: 'flood',
      speaker: 'Айріс',
      text: '«Пам’ятаю зачинені двері й записку про ремонт. Я подумала, що зможу зайти наступного дня. Але потяг був раніше. Я тоді багато чого відкладала на завтра».',
      options: [
        {
          id: 'flood-back',
          label: '«Це допомагає зрозуміти хронологію»',
          next: 'welcome',
          grants: ['iris_recalled_closure'],
        },
      ],
    },
    {
      id: 'letter',
      speaker: 'Айріс',
      text: 'Її рука завмирає на ремінці тубуса. «З моїм ім’ям? Ви впевнені?» Вона не тягнеться до конверта. «Я не знаю, чи готова зараз говорити про це».',
      options: [
        {
          id: 'letter-respect',
          label: '«Не поспішайте. Лист у безпеці»',
          next: 'respect',
          grants: ['iris_boundary_respected'],
        },
        { id: 'letter-ask', label: '«Ви хочете, щоб я його зберіг?»', next: 'keep' },
        {
          id: 'letter-pressure',
          label: '«Це важливо. Треба поговорити негайно»',
          next: 'pressure',
          grants: ['iris_felt_pressured'],
        },
      ],
    },
    {
      id: 'keep',
      speaker: 'Айріс',
      text: '«Так. Будь ласка, поки що нічого з ним не робіть. Я маю сама вирішити, що готова згадати».',
      options: [
        { id: 'keep-back', label: '«Домовилися»', next: 'end', grants: ['iris_requested_privacy'] },
      ],
    },
    {
      id: 'pressure',
      speaker: 'Айріс',
      text: '«Для вас це загадка. Для мене — сім років життя». Вона робить крок до дверей. «Я повернуся, коли зможу говорити без поспіху».',
      options: [{ id: 'pressure-end', label: 'Не затримувати її', next: 'end' }],
    },
    {
      id: 'respect',
      speaker: 'Айріс',
      text: '«Дякую». Вона повільно видихає. «Може, я ще зайду. Тут досі пахне папером так само, як раніше».',
      options: [{ id: 'respect-back', label: '«Буду радий бачити вас»', next: 'end' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Айріс залишає на прилавку маленьку закладку з намальованим вікном. На звороті — адреса майстерні. Це не обіцянка, лише можливість продовжити розмову.',
      options: [],
    },
    {
      id: 'iris-reflection',
      speaker: 'Айріс',
      text: '«Колись я малювала вікна, щоб уявляти життя по той бік скла».',
      options: [
        { id: 'iris-reflect-question', label: '«А що для тебе в цьому найважче?»', next: 'iris-reflection-deep' },
        { id: 'iris-reflect-return', label: '«Дякую, що поділився цим»', next: 'iris-reflection-end' },
      ],
    },
    {
      id: 'iris-reflection-deep',
      speaker: 'Айріс',
      text: '«Не кожне питання потребує відповіді саме зараз. І не кожна відповідь належить тому, хто питає».',
      options: [
        { id: 'iris-reflect-continue', label: '«І що ти хочеш змінити?»', next: 'iris-reflection-end' },
        { id: 'iris-reflect-listen', label: '«Можна просто побути з цим»', next: 'iris-reflection-end' },
      ],
    },
    {
      id: 'iris-reflection-end',
      speaker: 'Айріс',
      text: '«Можна повернутися до місця й не повертатися до себе колишньої».',
      options: [
        { id: 'iris-reflect-finish', label: 'Повернутися до розмови', next: 'arrival', grants: ['iris_reflected_on_identity'] },
      ],
    },
  ],
};

import type { DialogueStory } from '../game/dialogue';

/** День другий: Айріс не є загадкою, яку треба «розв'язати». */
export const irisVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Вранці до книгарні заходить жінка з тубусом для малюнків. На рукаві її пальта — краплини дощу, на пальцях — синя фарба. Вона довго дивиться на вивіску.',
      options: [{ id: 'welcome', label: '«Доброго ранку. Шукаєте щось?»', next: 'welcome' }],
    },
    {
      id: 'welcome',
      speaker: 'Айріс',
      text: '«Не знаю. Колись я тут проводила майже кожну суботу. А потім сім років не могла змусити себе зайти». Вона усміхається. «Я Айріс. Малюю книжки, які іноді ніхто не друкує».',
      textWhen: [
        {
          requires: ['iris_boundary_respected'],
          text: 'Айріс розгортає альбом, але залишає одну сторінку прикритою долонею. «Дякую, що минулого разу не розпитував про неї». Вона показує інший ескіз. «А цей можеш критикувати скільки завгодно».',
        },
        {
          requires: ['iris_reflected_on_identity'],
          text: "Айріс витягає з сумки два ескізи. «Один підписала своїм ім'ям, другий — ні. Вгадаєш, який мені більше подобається?» Вона усміхається. «Підказка: не той, за який заплатили».",
        },
      ],
      options: [
        { id: 'iris-seven-years', label: '«Сім років — чимало. Що змінилося?»', next: 'return' },
        {
          id: 'iris-unprinted',
          label: '«А покажете книжку, яку так і не надрукували?»',
          next: 'art',
        },
        {
          id: 'iris-v3-conversation',
          label: '«А що кажеш людям, які вимагають пояснити кожен малюнок?»',
          next: 'iris-v3-conversation',
          unless: ['iris_art_boundaries_discussed'],
        },
        {
          id: 'iris-reflection',
          label: '«Буває, що малюнок тобі подобається, а пояснювати його зовсім не хочеться?»',
          next: 'iris-reflection',
          unless: ['iris_reflected_on_identity'],
        },
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
        {
          id: 'iris-reflect-question',
          label: '«А що для тебе в цьому найважче?»',
          next: 'iris-reflection-deep',
        },
        {
          id: 'iris-reflect-return',
          label: '«Дякую, що поділився цим»',
          next: 'iris-reflection-end',
        },
      ],
    },
    {
      id: 'iris-reflection-deep',
      speaker: 'Айріс',
      text: '«Не кожне питання потребує відповіді саме зараз. І не кожна відповідь належить тому, хто питає».',
      options: [
        {
          id: 'iris-reflect-continue',
          label: '«І що ти хочеш змінити?»',
          next: 'iris-reflection-memory',
        },
        {
          id: 'iris-reflect-listen',
          label: '«Можна просто побути з цим»',
          next: 'iris-reflection-memory',
        },
      ],
    },
    {
      id: 'iris-reflection-memory',
      speaker: 'Айріс',
      text: '«Я знайшла ескіз із датою, яку сім років не наважувалася підписати. Боюся, що люди побачать малюнок і вирішать, ніби тепер знають усе про мій від’їзд. Наче мистецтво — це пояснювальна записка до життя».',
      options: [
        {
          id: 'iris-memory-art',
          label: '«Твоя робота не зобов’язана пояснювати тебе»',
          next: 'iris-reflection-art',
          grants: ['iris_chose_open_art'],
        },
        {
          id: 'iris-memory-private',
          label: '«Можеш показати малюнки без власної біографії»',
          next: 'iris-reflection-private',
          grants: ['iris_chose_private_art'],
        },
      ],
    },
    {
      id: 'iris-reflection-art',
      speaker: 'Айріс',
      text: '«Тоді залишу незакінчене вікно. Раніше соромилася, що не знаю, що за ним. Тепер думаю: незнання теж частина картини».',
      options: [{ id: 'iris-art-continue', label: 'Послухати далі', next: 'iris-reflection-end' }],
    },
    {
      id: 'iris-reflection-private',
      speaker: 'Айріс',
      text: '«Так. Без підпису про моє повернення дрібним шрифтом. Нехай люди говорять про кольори, а не про те, чи я вже все пробачила».',
      options: [
        { id: 'iris-private-continue', label: 'Послухати далі', next: 'iris-reflection-end' },
      ],
    },
    {
      id: 'iris-reflection-end',
      speaker: 'Айріс',
      text: '«Можна повернутися до місця й не повертатися до себе колишньої».',
      textWhen: [
        {
          requires: ['iris_chose_open_art'],
          text: '«Я залишу малюнок незавершеним. Не кожна відкрита робота — запрошення розпитувати про моє минуле».',
        },
        {
          requires: ['iris_chose_private_art'],
          text: '«Я покажу малюнки, але залишу деякі спогади при собі. Це не втеча, а межа, яку я сама обрала».',
        },
      ],
      options: [
        {
          id: 'iris-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'welcome',
          grants: ['iris_reflected_on_identity'],
        },
      ],
    },
    {
      id: 'iris-v3-conversation',
      speaker: 'Айріс',
      text: '«Я малюю вікна. Люди бачать світло й відразу питають, хто живе за склом. Але я не знаю. І не хочу вигадувати чуже життя».',
      options: [
        { id: 'iris-v3-ask', label: '«Тоді чому саме вікна?»', next: 'iris-v3-question' },
        { id: 'iris-v3-short', label: '«Можемо не говорити про це»', next: 'iris-v3-end' },
      ],
    },
    {
      id: 'iris-v3-question',
      speaker: 'Айріс',
      text: '«Бо світло справжнє. Але моє право його намалювати не дає мені права розповідати, що відчуває людина всередині».',
      options: [
        {
          id: 'iris-v3-challenge',
          label: '«А якщо глядач упізнає власний дім?»',
          next: 'iris-v3-counter',
        },
        {
          id: 'iris-v3-listen',
          label: '«Не кожна картина потребує пояснення»',
          next: 'iris-v3-end',
        },
      ],
    },
    {
      id: 'iris-v3-counter',
      speaker: 'Айріс',
      text: '«Тоді я вислухаю його. Не обов’язково знищу малюнок, але точно не назву його реакцію помилкою. Я теж хочу, щоб мене слухали».',
      options: [
        { id: 'iris-v3-follow', label: '«Що ти хочеш показати зараз?»', next: 'iris-v3-choice' },
        {
          id: 'iris-v3-pause',
          label: '«Можемо залишити це питання відкритим»',
          next: 'iris-v3-end',
        },
      ],
    },
    {
      id: 'iris-v3-choice',
      speaker: 'Айріс',
      text: '«Нову роботу. Без підпису, який пояснює моє минуле. Нехай люди сперечаються про світло, а не про те, чому я колись поїхала».',
      options: [{ id: 'iris-v3-accept', label: '«Це твоя історія»', next: 'iris-v3-end' }],
    },
    {
      id: 'iris-v3-end',
      speaker: 'Айріс',
      text: '«Дякую. Тут можна говорити про мистецтво й не перетворювати художницю на загадку».',
      options: [
        {
          id: 'iris-v3-return',
          label: 'Повернутися до інших тем',
          next: 'welcome',
          grants: ['iris_art_boundaries_discussed'],
        },
      ],
    },
  ],
};

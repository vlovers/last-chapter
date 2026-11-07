import type { DialogueStory } from '../game/dialogue';
import { irisCoverCommissionNodes, irisCoverCommissionOption } from './iris-cover-commission';

/** День другий: Айріс не є загадкою, яку треба «розв'язати». */
export const irisVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      staging: [
        { kind: 'move', actor: 'visitor', x: 240, y: 235 },
        { kind: 'face', actor: 'visitor', direction: 'left' },
      ],
      speaker: 'Оповідач',
      text: 'Айріс стоїть біля столика з тубусом для малюнків. На пальцях — синя фарба, на рукаві сохнуть краплі ранкового дощу. «Тут можна посидіти? Я намалювала вашу вивіску. Двічі. І жодного разу не вийшла літера “р”».',
      options: [
        {
          id: 'welcome',
          label: '«Доброго ранку. Шукаєте щось?»',
          next: 'welcome',
        },
      ],
    },
    {
      id: 'welcome',
      mood: 'thoughtful',
      speaker: 'Айріс',
      text: '«Сім років сюди не заходила. Я Айріс, малюю книжки». Вона дивиться на місце біля вікна. «Хотіла спершу показати вам ескіз. А тепер думаю, що треба було запитати, чи вам узагалі потрібна нова вивіска. Стару ж теж хтось любить».',
      textWhen: [
        {
          requires: ['iris_boundary_respected'],
          text: 'Айріс розгортає альбом, але залишає одну сторінку прикритою долонею. «Дякую, що не вимагав пояснень про кожен малюнок». Вона показує інший ескіз. «А цей можеш критикувати скільки завгодно».',
        },
        {
          requires: ['iris_reflected_on_identity'],
          text: "Айріс витягає з сумки два ескізи. «Один підписала своїм ім'ям, другий — ні. Вгадаєш, який мені більше подобається?» Вона усміхається. «Підказка: не той, за який заплатили».",
        },
      ],
      options: [
        {
          id: 'iris-seven-years',
          label: '«Що ти найбільше пам’ятаєш із тих субот у книгарні?»',
          next: 'return',
        },
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
        irisCoverCommissionOption,
        {
          id: 'iris-sketch-mishap',
          label: '«А був малюнок, який зовсім не вдався?»',
          next: 'iris-sketch-mishap',
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
      text: 'Айріс дістає тонкий макет. На першій сторінці — дві чашки й рука на краю столу. На другій хтось підсуває стілець. «Хотіла зробити історію без слів. Ніяк не вирішу, що залишити на третій сторінці. Порожню кухню чи ще одну чашку»',
      options: [
        { id: 'art-more', label: '«Щось завадило чи просто передумала?»', next: 'art-more' },
        { id: 'art-back', label: '«Про що ще поговоримо?»', next: 'welcome' },
      ],
    },
    {
      id: 'art-more',
      speaker: 'Айріс',
      text: '«Один видавець попросив додати сову, яка пояснюватиме, чому дівчинка мовчить. Я запитала: а якщо вона просто не хоче говорити? Він сказав, що діти такого не зрозуміють». Айріс закриває макет. «Сову я все-таки намалювала. Вона сидить у черзі до центру зайнятості».',
      options: [{ id: 'art-more-back', label: '«Можемо змінити тему»', next: 'welcome' }],
    },
    {
      id: 'return',
      speaker: 'Айріс',
      text: '«Стіл під вікном. Я малювала, а Елеонора підсовувала під лікоть старий каталог, щоб не бруднила скатертину». Айріс усміхається. «Тепер мама попросила зробити афішу для читання. Я відмовилася, а сама вже дивилася квитки до Беллвіка»',
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
      text: '«Каштанів біля пошти. Там восени слизько, я колись розбила коліно просто перед шкільним концертом». Айріс проводить пальцем по краю тубуса. «А ще тут усі пам’ятають мене з чубчиком. Не знаю, що гірше».',
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
      id: 'iris-sketch-mishap',
      speaker: 'Айріс',
      text: '«Якось намалювала для дитячої книжки лисицю. Редактор написав: “Чудовий борсук”. Я три дні доводила, що це лисиця». Айріс сміється. «На четвертий домалювала їй табличку з написом “ЛИСИЦЯ”. Редактор попросив прибрати зайвий текст».',
      options: [
        {
          id: 'iris-sketch-mishap-fix',
          label: '«То як ти вийшла з цієї ситуації?»',
          next: 'iris-sketch-mishap-fix',
        },
        {
          id: 'iris-sketch-mishap-back',
          label: '«Покажеш інший малюнок?»',
          next: 'welcome',
          grants: ['iris_fox_story_heard'],
        },
      ],
    },
    {
      id: 'iris-sketch-mishap-fix',
      speaker: 'Айріс',
      text: '«Намалювала ще одну лисицю. Вона була схожа на собаку». Айріс знизує плечима. «Книжку надрукували з першою. Тепер діти питають, чому борсук живе в лисячій норі. Мені подобається, що вони помічають».',
      options: [
        {
          id: 'iris-sketch-mishap-fix-back',
          label: '«Звучить як найкраща частина книжки»',
          next: 'welcome',
          grants: ['iris_fox_story_heard'],
        },
      ],
    },
    {
      id: 'end',
      staging: [{ kind: 'exit', actor: 'visitor' }],
      speaker: 'Оповідач',
      text: 'Айріс залишає на прилавку маленьку закладку з намальованим вікном. На звороті — адреса майстерні. Це не обіцянка, лише можливість продовжити розмову.',
      options: [],
    },
    {
      id: 'iris-reflection',
      speaker: 'Айріс',
      text: '«Учора мені написали: “Гарне вікно. Це про Лео?” А я пів дня малювала водостік». Айріс стукає пальцем по малюнку. «Он він. Найкращий водостік за всю мою кар’єру. Ніхто не помітив»',
      options: [
        {
          id: 'iris-reflect-question',
          label: '«А що ти відповіла?»',
          next: 'iris-reflection-deep',
        },
        {
          id: 'iris-reflect-return',
          label: '«Дякую, що показала»',
          next: 'iris-reflection-end',
        },
      ],
    },
    {
      id: 'iris-reflection-deep',
      speaker: 'Айріс',
      text: '«Що це будинок на сусідній вулиці. Людина образилася: чекала цікавішої відповіді». Айріс перегортає аркуш. «Є й особисті малюнки. Просто я не хочу щоразу давати до них ключі»',
      options: [
        {
          id: 'iris-reflect-continue',
          label: '«Є робота, яку ти через це не показуєш?»',
          next: 'iris-reflection-memory',
        },
        {
          id: 'iris-reflect-listen',
          label: '«Можеш показати без пояснення»',
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
      text: '«Тоді залишу вікно недомальованим». Айріс піднімає олівець і зависає над дахом. «У школі вчителька завжди домальовувала за мене. Казала, так акуратніше. Дивно, що я досі чекаю, поки хтось скаже, де провести лінію»',
      options: [{ id: 'iris-art-continue', label: 'Послухати далі', next: 'iris-reflection-end' }],
    },
    {
      id: 'iris-reflection-private',
      speaker: 'Айріс',
      text: '«Так. Підпишу назву роботи й рік». Айріс відсуває етикетку. «Якщо хтось захоче запитати, чому я повернулася, хай спитає мене. Не хочу бачити відповідь, надруковану під рамкою»',
      options: [
        { id: 'iris-private-continue', label: 'Послухати далі', next: 'iris-reflection-end' },
      ],
    },
    {
      id: 'iris-reflection-end',
      speaker: 'Айріс',
      text: '«Добре, сьогодні без біографії». Айріс ховає малюнок, але лишає розгорнутий макет дитячої книжки. «Ось тут має бути сова. Поки схожа на картоплину. Її можете критикувати скільки завгодно»',
      textWhen: [
        {
          requires: ['iris_chose_open_art'],
          text: '«Покажу вікно з недомальованим дахом. Якщо хтось спитає, скажу: закінчилася фарба. Це теж майже правда»',
        },
        {
          requires: ['iris_chose_private_art'],
          text: '«Підпишу назву вулиці й рік. Цього вистачить». Айріс обводить пальцем край аркуша. «А решту поки залишу в альбомі»',
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
    ...irisCoverCommissionNodes,
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

import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Iris has a working life outside the missing-pages investigation. */
export const irisCoverCommissionOption: DialogueOption = {
  id: 'iris-cover-commission-topic',
  label: '«Що це за обкладинка з рудим лисом?»',
  next: 'iris-cover-commission',
  unless: ['iris_cover_commission_discussed'],
};

export const irisCoverCommissionNodes: readonly DialogueNode[] = [
  {
    id: 'iris-cover-commission',
    speaker: 'Айріс',
    text: '«О, це робота, за яку мені, можливо, навіть заплатять». Айріс витягає ескіз: маленький лис сидить у човні, а над ним нависає величезний місяць. «Видавництво з Грейфорда замовило обкладинку для дитячої книжки. Учора редактор написав: лис надто сумний, місяць надто великий, а човен треба прибрати. І бажано до понеділка». Вона сміється. «Залишилося намалювати білий прямокутник».',
    options: [
      {
        id: 'iris-cover-ask-story',
        label: '«А про що сама книжка?»',
        next: 'iris-cover-story',
      },
      {
        id: 'iris-cover-ask-editor',
        label: '«Може, редактор просто не бачив готового малюнка?»',
        next: 'iris-cover-editor',
      },
      {
        id: 'iris-cover-ask-money',
        label: '«Вони хоча б добре платять?»',
        next: 'iris-cover-money',
      },
    ],
  },
  {
    id: 'iris-cover-story',
    speaker: 'Айріс',
    text: '«Про лиса, який перепливає озеро, щоб повернути загублену пісню. Наприкінці він не знаходить пісню — зате вчиться грати свою». Вона показує пальцем на човен. «У тексті цей човен з’являється шість разів. Я порахувала. А редактор каже, що човни не продаються». Вона перевертає ескіз. «Може, в нього особиста історія з човнами».',
    options: [
      {
        id: 'iris-cover-story-continue',
        label: '«То що ти збираєшся робити?»',
        next: 'iris-cover-choice',
      },
      {
        id: 'iris-cover-story-editor',
        label: '«А що саме він хоче замість човна?»',
        next: 'iris-cover-editor',
      },
    ],
  },
  {
    id: 'iris-cover-editor',
    speaker: 'Айріс',
    text: '«Він прислав приклад. Там лис усміхається всіма зубами, а позаду веселка. Гарна картинка, тільки це зовсім інша книжка». Айріс складає лист навпіл. «Я не думаю, що він поганий редактор. У них, мабуть, свої продажі й таблиці. Просто мені хотілося б, щоб хоч хтось із нас прочитав історію до кінця».',
    options: [
      {
        id: 'iris-cover-editor-continue',
        label: '«Ти можеш запропонувати інший варіант?»',
        next: 'iris-cover-choice',
      },
      {
        id: 'iris-cover-editor-money',
        label: '«А як у них із оплатою?»',
        next: 'iris-cover-money',
      },
    ],
  },
  {
    id: 'iris-cover-money',
    speaker: 'Айріс',
    text: '«Половина після затвердження ескізу, половина після друку. Це не так багато, щоб купити нове життя, але вистачило б на оренду майстерні». Вона піднімає брову. «І на новий пензель. Старий уже виглядає так, ніби ним чистили димар».',
    options: [
      {
        id: 'iris-cover-money-continue',
        label: '«І як ти хочеш відповісти?»',
        next: 'iris-cover-choice',
      },
    ],
  },
  {
    id: 'iris-cover-choice',
    speaker: 'Айріс',
    text: '«Можу перемалювати. Можу написати редактору, чому човен потрібен. А можу сказати, що ця робота не для мене». Айріс довго дивиться на лиса. «Тільки не кажи, що є одна правильна відповідь. Мені треба вирішити, за що платити — грошима чи часом».',
    options: [
      {
        id: 'iris-cover-accept',
        label: '«Спробуй їхній варіант, якщо тобі зараз потрібна оплата»',
        next: 'iris-cover-accept-result',
        grants: ['iris_cover_revisions_chosen'],
      },
      {
        id: 'iris-cover-negotiate',
        label: '«Запропонуй два ескізи й попроси редактора прочитати сцену з човном»',
        next: 'iris-cover-negotiate-result',
        grants: ['iris_cover_negotiation_chosen'],
      },
      {
        id: 'iris-cover-decline',
        label: '«Можна відмовитися і залишити цього лиса собі»',
        next: 'iris-cover-decline-result',
        grants: ['iris_cover_independent_chosen'],
      },
    ],
  },
  {
    id: 'iris-cover-accept-result',
    speaker: 'Айріс',
    text: '«Мені не подобається веселка. Але я й не зобов’язана любити кожне замовлення». Вона дістає чистий аркуш. «Зроблю варіант для них. А лиса в човні залишу в папці. Він і так уже пережив гірші пригоди».',
    options: [
      {
        id: 'iris-cover-accept-back',
        label: '«Покажеш, що вийде, коли захочеш»',
        next: 'welcome',
        grants: ['iris_cover_commission_discussed'],
      },
    ],
  },
  {
    id: 'iris-cover-negotiate-result',
    speaker: 'Айріс',
    text: '«Два ескізи за один гонорар — хитро». Вона примружується. «Ні, серйозно: напишу, що можу змінити колір і шрифт, але хочу залишити човен. Якщо їм потрібна веселка, нехай скажуть прямо. Принаймні не доведеться вгадувати».',
    options: [
      {
        id: 'iris-cover-negotiate-back',
        label: '«Цікаво, що відповість редактор»',
        next: 'welcome',
        grants: ['iris_cover_commission_discussed'],
      },
    ],
  },
  {
    id: 'iris-cover-decline-result',
    speaker: 'Айріс',
    text: '«Тоді доведеться шукати іншу роботу». Вона ховає ескіз у тубус. «Але, може, я зроблю з нього маленьку книжку без видавництва. На вісім сторінок. І обов’язково з човном. Тільки спершу треба сплатити за електрику».',
    options: [
      {
        id: 'iris-cover-decline-back',
        label: '«Заглянь, якщо знадобиться папір чи книжки»',
        next: 'welcome',
        grants: ['iris_cover_commission_discussed'],
      },
    ],
  },
];

export const irisCoverDayFourOption: DialogueOption = {
  id: 'iris-cover-day-four-topic',
  label: '«Як там обкладинка з лисом і човном?»',
  next: 'iris-cover-day-four',
  requires: ['iris_cover_commission_discussed'],
  unless: ['iris_cover_day_four_followup'],
};

export const irisCoverDayFourNodes: readonly DialogueNode[] = [
  {
    id: 'iris-cover-day-four',
    speaker: 'Айріс',
    text: '«Лис усе ще плаває. Редактор усе ще пише листи. Здається, ми обоє вперті». Айріс витягає із сумки папку, а з неї випадає квитанція за фарби. «Але хоч тепер у мене є що показати».',
    textWhen: [
      {
        requires: ['iris_cover_revisions_chosen'],
        text: '«Намалювала їхню веселку. І знаєш що? Вона навіть непогана». Айріс показує обкладинку з рудим лисом на зеленому березі. «Тільки в книжці він усе ще пливе човном. Я написала редактору, що на внутрішньому розвороті човен залишиться. Поки відповіді немає».',
      },
      {
        requires: ['iris_cover_negotiation_chosen'],
        text: '«Відправила два ескізи й уривок із човном. Редактор відповів одним реченням: “Покажу відділу продажів”». Айріс пирхає. «Уявляю, як вони збираються навколо човна з калькуляторами. Але це хоча б не відмова».',
      },
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Я відмовилася від замовлення. Редактор написав: “Шкода, але розумію”». Айріс показує три маленькі аркуші. «А це перші сторінки моєї історії про лиса. Поки що тільки олівець. І поки що без гонорару».',
      },
    ],
    options: [
      {
        id: 'iris-cover-four-ask-drawing',
        label: '«Покажеш, що змінилося в малюнку?»',
        next: 'iris-cover-day-four-drawing',
      },
      {
        id: 'iris-cover-four-ask-work',
        label: '«А як тепер із роботою та грошима?»',
        next: 'iris-cover-day-four-work',
      },
      {
        id: 'iris-cover-four-space',
        label: '«Не буду відволікати від малювання»',
        next: 'welcome',
        grants: ['iris_cover_day_four_followup', 'iris_cover_work_space_respected'],
      },
    ],
  },
  {
    id: 'iris-cover-day-four-drawing',
    speaker: 'Айріс',
    text: '«У першому ескізі лис дивився на місяць. Тепер він дивиться на берег. Наче вже вирішив, куди плисти». Вона повертає папір. «Але човен мені все одно подобається більше за веселку».',
    textWhen: [
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Тут лис уперше бере весло. А тут розуміє, що не вміє ним користуватися». Айріс сміється. «На третій сторінці він ледь не падає у воду. У дитячих книжках теж мають бути незручні моменти».',
      },
    ],
    options: [
      {
        id: 'iris-cover-four-drawing-back',
        label: '«Залишимо ескізи тут, а чай доп’ємо»',
        next: 'welcome',
        grants: ['iris_cover_day_four_followup', 'iris_cover_drawing_discussed'],
      },
    ],
  },
  {
    id: 'iris-cover-day-four-work',
    speaker: 'Айріс',
    text: '«Я рахую, скільки ще можу працювати без нових замовлень. Нудна частина творчості: рахунки не цікавляться натхненням». Вона дістає записник. «На наступний тиждень є ще один маленький проєкт. Не обіцяю, що він буде цікавий. Зате там точно немає човнів».',
    textWhen: [
      {
        requires: ['iris_cover_revisions_chosen'],
        text: '«Першу оплату дадуть лише після затвердження. Я надіслала варіант, але грошей ще немає». Айріс постукує по записнику. «Поки взяла невелике замовлення на афішу. Там замовник хоче тільки дату й адресу. Дивовижна людина».',
      },
      {
        requires: ['iris_cover_negotiation_chosen'],
        text: '«Чекаю відповіді на обидва ескізи. Якщо погодяться на човен — добре. Якщо ні, попрошу чітко назвати зміни та терміни». Вона показує календар. «А поки малюю афішу для шкільного концерту. Там теж є свій маленький драматизм: ніхто не може вибрати шрифт».',
      },
      {
        requires: ['iris_cover_independent_chosen'],
        text: '«Відмовилася від грошей, тож тепер беру дрібніші замовлення». Айріс складає квитанцію. «Учора малювала меню для кафе. Вони попросили зробити слово “чай” більшим. Це хоча б зрозуміле прохання».',
      },
    ],
    options: [
      {
        id: 'iris-cover-four-work-back',
        label: '«Можу запропонувати чай. На шрифти не впливаю»',
        next: 'welcome',
        grants: ['iris_cover_day_four_followup', 'iris_cover_work_discussed'],
      },
    ],
  },
];

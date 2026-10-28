import type { DialogueStory } from '../game/dialogue';

/** Nora has her own life; professional confidentiality is never a puzzle reward. */
export const noraVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Під вечір до книгарні заходить Нора Рід. Вона складає мокру парасолю так акуратно, наче це частина важливого ритуалу. На плечі — торба з книжками, які давно пора повернути.',
      options: [{ id: 'hello', label: 'Запропонувати чай', next: 'hello' }],
    },
    {
      id: 'hello',
      speaker: 'Нора',
      text: '«Чай є? Тоді я на десять хвилин». Нора опускає важку торбу на підлогу. «Тільки не радьте мені книжку про те, як усе встигати. У мене вже три такі недочитані».',
      options: [
        {
          id: 'nora-v3-conversation',
          label: '«А що, як хтось просить чужі записи з архіву?»',
          next: 'nora-v3-conversation',
          unless: ['nora_archive_ethics_discussed'],
        },
        {
          id: 'nora-reflection',
          label: '«Ви колись кидали книжку перед фіналом?»',
          next: 'nora-reflection',
          unless: ['nora_reflected_on_uncertainty'],
        },
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
      text: '«Читаю по п’ять сторінок у трамваї. Учора заснула над детективом і прокинулася біля ринку». Нора всміхається. «Тож бажано щось без двадцяти підозрюваних».',
      options: [
        { id: 'books-ask', label: '«Можливо, вам підійде збірка листів?»', next: 'letters' },
        { id: 'books-back', label: '«Подивімося інші теми»', next: 'hello' },
      ],
    },
    {
      id: 'letters',
      speaker: 'Нора',
      text: '«Мій дід писав листи навіть сусідові через паркан. Одного разу посварилися через яблуню й три тижні листувалися». Нора усміхається. «Зате тепер маю цілу коробку їхніх образ».',
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
      text: '«У центрі сьогодні зламався чайник. Пів дня шукали майстра, а потім з’ясували, що хтось просто витягнув вилку». Нора зітхає. «Іноді це вся наша робота за день».',
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
      text: '«У Беллвіку неможливо купити хліб, щоб ніхто не спитав, як твоя мама». Нора поправляє ремінь торби. «Іноді це мило. А іноді я просто хочу хліба».',
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
      text: '«У нас в архіві знайшли фото відкриття кінотеатру. Тільки ніхто не може згадати, якого року його зробили». Нора дістає блокнот. «Троє свідків, три різні дати».',
      options: [
        {
          id: 'nora-reflect-question',
          label: '«І ніхто не зберіг афішу?»',
          next: 'nora-reflection-deep',
        },
        {
          id: 'nora-reflect-return',
          label: '«Оце у вас детектив»',
          next: 'nora-reflection-end',
        },
      ],
    },
    {
      id: 'nora-reflection-deep',
      speaker: 'Нора',
      text: '«Афіші немає. Зате є лист, де один чоловік скаржиться на ціну квитка». Нора перегортає сторінку. «Шкода, що він не написав дату».',
      options: [
        {
          id: 'nora-reflect-continue',
          label: '«То як ти підпишеш фото?»',
          next: 'nora-reflection-record',
        },
        {
          id: 'nora-reflect-listen',
          label: '«Може, виставити всі три версії?»',
          next: 'nora-reflection-record',
        },
      ],
    },
    {
      id: 'nora-reflection-record',
      speaker: 'Нора',
      text: '«У мене є запис без дати. Троє людей пам’ятають різне. Якщо виберу найгарнішу версію, вийде не архів, а казка. Але порожнє місце всіх дратує».',
      options: [
        {
          id: 'nora-record-uncertain',
          label: '«Залиш усі свідчення з позначкою про сумнів»',
          next: 'nora-reflection-uncertain',
          grants: ['nora_will_preserve_uncertainty'],
        },
        {
          id: 'nora-record-consent',
          label: '«Запитай людей, чи хочуть вони цього запису»',
          next: 'nora-reflection-consent',
          grants: ['nora_will_seek_consent'],
        },
      ],
    },
    {
      id: 'nora-reflection-uncertain',
      speaker: 'Нора',
      text: '«Три голоси, три різні дати і чесне «не підтверджено». Можливо, негарно виглядатиме на виставці. Зате ніхто не стане декорацією для чужої впевненості».',
      options: [
        { id: 'nora-uncertain-back', label: 'Послухати далі', next: 'nora-reflection-end' },
      ],
    },
    {
      id: 'nora-reflection-consent',
      speaker: 'Нора',
      text: '«На звороті фото є три імені. Двоє людей уже померли, а третя мешкає за рогом». Нора ховає блокнот. «Перш ніж вішати це на виставці, я зайду до неї».',
      options: [{ id: 'nora-consent-back', label: 'Послухати далі', next: 'nora-reflection-end' }],
    },
    {
      id: 'nora-reflection-end',
      speaker: 'Нора',
      text: '«Я якось шукала дату старої пожежі й знайшла три різні роки. Довелося написати: не встановлено». Нора знизує плечима. «Люди були дуже незадоволені».',
      textWhen: [
        {
          requires: ['nora_will_preserve_uncertainty'],
          text: '«Я залишу в архіві всі три версії. Прогалини не роблять історію слабкою, якщо ми чесно визнаємо, де вони є».',
        },
        {
          requires: ['nora_will_seek_consent'],
          text: '«Перш ніж показувати чужі листи, я спитаю дозволу. Навіть правдива історія не стає моєю власністю».',
        },
      ],
      options: [
        {
          id: 'nora-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'hello',
          grants: ['nora_reflected_on_uncertainty'],
        },
      ],
    },
    {
      id: 'nora-v3-conversation',
      speaker: 'Нора',
      text: '«У нас троє людей пам’ятають відкриття старого кінотеатру. У кожного свій рік, і всі готові посваритися». Нора сміється. «Афішу поки не знайшли».',
      options: [
        {
          id: 'nora-v3-ask',
          label: '«Ти мусиш обрати один?»',
          next: 'nora-v3-conversation-question',
        },
        {
          id: 'nora-v3-short',
          label: '«Можемо не продовжувати»',
          next: 'nora-v3-conversation-end',
        },
      ],
    },
    {
      id: 'nora-v3-conversation-question',
      speaker: 'Нора',
      text: '«Якщо вкажу три роки, пані Міллер прийде виправляти мене червоною ручкою». Нора сміється. «А якщо виберу один навмання, це вже буде моя вигадка».',
      options: [
        {
          id: 'nora-v3-challenge',
          label: '«А якщо одна історія приватна?»',
          next: 'nora-v3-conversation-counter',
        },
        {
          id: 'nora-v3-listen',
          label: '«Залишимо питання відкритим»',
          next: 'nora-v3-conversation-end',
        },
      ],
    },
    {
      id: 'nora-v3-conversation-counter',
      speaker: 'Нора',
      text: '«У нас є приватний лист, але я не збираюся вивішувати його на стіні. Авторка ж писала не для всього Беллвіка». Нора закриває теку.',
      options: [
        {
          id: 'nora-v3-follow',
          label: '«І що ти хочеш зробити?»',
          next: 'nora-v3-conversation-choice',
        },
        {
          id: 'nora-v3-pause',
          label: '«Не обов’язково вирішувати сьогодні»',
          next: 'nora-v3-conversation-end',
        },
      ],
    },
    {
      id: 'nora-v3-conversation-choice',
      speaker: 'Нора',
      text: '«Напишу всі три роки й попрошу відвідувачів принести старі афіші». Нора посміхається. «Може, хтось нарешті розбере горище».',
      options: [
        {
          id: 'nora-v3-accept',
          label: '«А раптом хтось принесе афішу?»',
          next: 'nora-v3-conversation-end',
        },
      ],
    },
    {
      id: 'nora-v3-conversation-end',
      speaker: 'Нора',
      text: '«Так і запишу: дату ще перевіряємо, приватні листи не показуємо». Нора ховає олівець. «І нехай пані Міллер принесе свою афішу, якщо така розумна».',
      options: [
        {
          id: 'nora-v3-return',
          label: 'Повернутися до інших тем',
          next: 'hello',
          grants: ['nora_archive_ethics_discussed'],
        },
      ],
    },
  ],
};

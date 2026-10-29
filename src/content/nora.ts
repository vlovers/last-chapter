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
      textWhen: [
        {
          requires: ['nora_confidentiality_pressed', 'nora_confidentiality_respected'],
          text: 'Нора обережно ставить чашку. «Мені сподобалося, що ти спочатку не розпитував про відвідувачів центру. Шкода, що потім передумав». Вона бере книжку. «Можемо просто почитати анотації?».',
        },
        {
          requires: ['nora_confidentiality_pressed'],
          text: 'Нора ставить чашку на блюдце. «Я не розповідатиму, хто приходить у центр. Ми це вже обговорили». Вона киває на полицю. «Якщо хочеш порадити книжку, я ще маю кілька хвилин».',
        },
        {
          requires: ['nora_confidentiality_respected'],
          text: 'Нора знову береться за чашку. «Добре, що ми закінчили з чужими справами». Вона показує на книжку в тебе за плечем. «А ось ту можеш дати подивитися?».',
        },
        {
          requires: ['nora_interested_in_letters'],
          text: 'Нора повертається до полиці й бере збірку листів. «Я вже уявила, як дід сварився через яблуню. Якщо в цій книжці ще й сусіди миряться через паркан, беру». Вона сміється. «Що ще маєш?».',
        },
        {
          requires: ['nora_tea_pause_heard'],
          text: 'Нора зігріває долоні об чашку. «Чай чудовий. А от у центрі знову зник ключ від шафи». Вона примружується. «Ні, не питай. Сама не знаю, як їм це вдається».',
        },
      ],
      options: [
        {
          id: 'nora-tea',
          label: '«Чай уже заварюється. Можеш просто перепочити»',
          next: 'nora-tea',
          unless: ['nora_tea_pause_heard'],
        },
        {
          id: 'books',
          label: '«Тоді пошукаємо щось легше за поради про продуктивність»',
          next: 'books',
        },
        {
          id: 'nora-v3-conversation',
          label: '«Ти згадувала старий кінотеатр. Що там із датою відкриття?»',
          next: 'nora-v3-conversation',
          requires: ['nora_tea_pause_heard'],
          unless: ['nora_archive_ethics_discussed'],
        },
        {
          id: 'nora-reflection',
          label: '«Що нового знайшлося в архіві?»',
          next: 'nora-reflection',
          requires: ['nora_tea_pause_heard'],
          unless: ['nora_reflected_on_uncertainty'],
        },
        {
          id: 'nora-newspaper',
          label: '«Тобі траплялися смішні помилки в старих газетах?»',
          next: 'nora-newspaper',
        },
        { id: 'nora-lost-umbrella', label: '«Що у вас найчастіше гублять у центрі?»', next: 'nora-lost-umbrella' },
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
      id: 'nora-tea',
      speaker: 'Нора',
      text: '«О, це найкраща пропозиція за сьогодні». Вона сідає ближче до вікна. «У центрі сьогодні знову загубили ключ від шафи. Знайшли в самій шафі. І так щовівторка».',
      options: [
        {
          id: 'nora-tea-back',
          label: '«Залишимо шафу в спокої. Яку книжку тобі показати?»',
          next: 'hello',
          grants: ['nora_tea_pause_heard'],
        },
      ],
    },
    {
      id: 'books',
      speaker: 'Нора',
      text: '«Читаю по п’ять сторінок у трамваї. Учора заснула над детективом і прокинулася біля ринку». Нора всміхається. «Тож бажано щось без двадцяти підозрюваних».',
      options: [
        { id: 'books-ask', label: '«Можливо, вам підійде збірка листів?»', next: 'letters' },
        { id: 'books-back', label: '«А окрім книжок — як там справи в центрі?»', next: 'work' },
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
        {
          id: 'work-follow',
          label: '«А відвідувачі хоч помітили, що чайник не працював?»',
          next: 'rest',
        },
        {
          id: 'work-back',
          label: '«У вас там, бачу, майстри без роботи не залишаться»',
          next: 'bellwick',
        },
      ],
    },
    {
      id: 'rest',
      speaker: 'Нора',
      text: '«Помітили. Пані Міллер принесла свій чайник, але він теж не ввімкнувся». Нора сміється. «Пів дня всі сварилися на проводку, а ввечері знайшли вимкнений подовжувач. Мій базилік удома розумніший за нас».',
      options: [
        {
          id: 'rest-back',
          label: '«А базилік хоча б не вимикає подовжувач?»',
          next: 'hello',
          grants: ['nora_shared_garden'],
        },
      ],
    },
    {
      id: 'bellwick',
      speaker: 'Нора',
      text: '«У Беллвіку неможливо купити хліб, щоб ніхто не спитав, як твоя мама». Нора поправляє ремінь торби. «Учора продавчиня ще й запитала, чому я без парасолі. Дощу не було».',
      options: [
        {
          id: 'bellwick-back',
          label: '«Тут можна просто купити хліб і мовчати»',
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
      text: '«Дякую. Томас сьогодні й так вислухав достатньо чужих здогадів». Нора поправляє ремінець торби. «А зараз краще порадьте мені щось смішне. Детективів на сьогодні досить».',
      options: [
        {
          id: 'boundary-back',
          label: '«Краще поговорімо про книжки»',
          next: 'hello',
        },
      ],
    },
    {
      id: 'refusal',
      speaker: 'Нора',
      text: '«Ні. Я працюю в центрі, але не розповідаю, хто туди приходить». Нора складає руки. «І Томас тут нічим не відрізняється від інших».',
      options: [{ id: 'refusal-end', label: 'Вибачитися й завершити розмову', next: 'end' }],
    },
    {
      id: 'nora-newspaper',
      speaker: 'Нора',
      text: '«У випуску за сорок сьомий рік надрукували: “Міський хор шукає нових ворогів”. Мали бути “нові голоси”. На наступному тижні хтось надіслав листа, що готовий стати ворогом хору, але тільки по суботах». Нора усміхається. «Лист досі лежить в архіві».',
      options: [
        {
          id: 'nora-newspaper-letter',
          label: '«І що хор відповів?»',
          next: 'nora-newspaper-letter',
        },
        {
          id: 'nora-newspaper-back',
          label: '«Тепер я теж хочу почитати ті газети»',
          next: 'hello',
          grants: ['nora_newspaper_story_heard'],
        },
      ],
    },
    {
      id: 'nora-newspaper-letter',
      speaker: 'Нора',
      text: '«Запросили його на репетицію. Він прийшов із дружиною, і обоє залишилися співати». Нора знизує плечима. «Мені подобається, що ніхто не виправив цю помилку. Інакше ми б не дізналися про найввічливішого ворога в історії Беллвіка».',
      options: [
        {
          id: 'nora-newspaper-letter-back',
          label: '«Треба розповісти це на книжковому клубі»',
          next: 'hello',
          grants: ['nora_newspaper_story_heard'],
        },
      ],
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
      text: '«Місіс Міллер каже, що кінотеатр відкрили в червні. Елеонора пам’ятає осінь. А в старій газеті бракує саме потрібної сторінки». Нора стукає олівцем. «От як це підписати?».',
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
      text: '«Напишу під фото: “Рік відкриття не встановлено”. Пані Міллер буде незадоволена, зате зможемо додати дату, коли знайдемо афішу».',
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
      text: '«Завтра перевірю підшивку газет ще раз. Якщо афіші там немає, під фото так і напишу: “Дата невідома”». Нора прибирає олівець у сумку.',
      textWhen: [
        {
          requires: ['nora_will_preserve_uncertainty'],
          text: '«Підпишу фото так: “Рік відкриття уточнюється”. І додам три свідчення окремо». Нора сміється. «Пані Міллер вже пообіцяла принести четверте».',
        },
        {
          requires: ['nora_will_seek_consent'],
          text: '«Листи поки залишаться в теці. Спочатку подзвоню власниці й запитаю, чи вона взагалі хоче їх комусь показувати». Нора закриває блокнот.',
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
      text: '«Поставлю під фото всі три дати з іменами свідків. А поруч — коробку для старих афіш». Нора усміхається. «Може, пані Міллер нарешті розбере горище».',
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
      text: '«Запишу: дату ще перевіряємо, приватні листи не показуємо. Теку покладу за касу». Нора ховає олівець. «А пані Міллер хай принесе свою афішу. Вона вже третій день обіцяє».',
      options: [
        {
          id: 'nora-v3-return',
          label: 'Повернутися до інших тем',
          next: 'hello',
          grants: ['nora_archive_ethics_discussed'],
        },
      ],
    },
    {
      id: 'nora-lost-umbrella',
      speaker: 'Нора',
      text: '«Парасолі. І терпіння». Нора зітхає. «У нас є шафа з двадцятьма сімома парасолями. Ніхто не визнає жодної своєю. Зате кожен переконаний, що ми вкрали саме його».',
      options: [
        { id: 'nora-umbrella-label', label: '«Може, підписати кожну?»', next: 'nora-umbrella-label' },
        { id: 'nora-umbrella-exhibit', label: '«Влаштуйте виставку загублених парасоль»', next: 'nora-umbrella-exhibit' },
        { id: 'nora-umbrella-mystery', label: '«А раптом хтось спеціально їх залишає?»', next: 'nora-umbrella-mystery' },
      ],
    },
    {
      id: 'nora-umbrella-label',
      speaker: 'Нора',
      text: '«Ми спробували. Тепер маємо три парасолі з написом “Моя” і одну з написом “Не чіпати”». Вона піднімає палець. «Вгадаєш, яку взяли першою?»',
      options: [{ id: 'nora-umbrella-label-back', label: '«Звісно, “Не чіпати”»', next: 'hello', grants: ['nora_umbrella_label_story_heard'] }],
    },
    {
      id: 'nora-umbrella-exhibit',
      speaker: 'Нора',
      text: '«Томас запропонував те саме. Навіть намалював афішу: “Парасолі без господарів”». Нора сміється. «На відкриття прийшло двоє людей. Один забрав чужу парасолю».',
      options: [{ id: 'nora-umbrella-exhibit-back', label: '«Це вже перформанс»', next: 'hello', grants: ['nora_umbrella_exhibit_heard'] }],
    },
    {
      id: 'nora-umbrella-mystery',
      speaker: 'Нора',
      text: '«Якщо це змова, то дуже мокра». Нора дивиться у вікно. «Знаєш, найбільша загадка — чому всі залишають чорні парасолі, а шукають червоні».',
      options: [{ id: 'nora-umbrella-mystery-back', label: '«Не кожна загадка потребує розслідування»', next: 'hello', grants: ['nora_umbrella_mystery_joked'] }],
    },

  ],
};

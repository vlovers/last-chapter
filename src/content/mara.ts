import type { DialogueStory } from '../game/dialogue';

/** День 1, друга відвідувачка. Український сценарний фрагмент. */
export const maraVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Надворі дощ стає густішим. До книгарні заходить дівчина в борошні на рукаві й ставить на прилавок паперовий пакунок. Пахне корицею.',
      options: [{ id: 'hello', label: 'Привітатися', next: 'hello' }],
    },
    {
      id: 'hello',
      speaker: 'Мара',
      text: '«Я з пекарні навпроти. Бачила, як ви зранку воювали з дверима. Хто переміг?» Мара ставить на прилавок пакет. «Я принесла булочки. Одну вже з’їла дорогою, вибачте».',
      options: [
        { id: 'joke', label: '«Двері поки що перемагають»', next: 'gift' },
        { id: 'thank', label: '«Дякую! Це дуже мило»', next: 'gift' },
      ],
    },
    {
      id: 'gift',
      speaker: 'Мара',
      text: '«Тільки начальниці не кажіть про безкоштовні булочки. Вона вже рахує корицю по грамах». Мара поправляє рукав. «А ще мені потрібна книжка для хлопця. Він перечитує останню сторінку, навіть коли знає, чим усе закінчиться».',
      options: [
        { id: 'trains', label: '«Що він любить, окрім книжок?»', next: 'trains' },
        { id: 'meaning', label: '«Це подарунок чи натяк?»', next: 'meaning' },
        { id: 'professional', label: '«Зараз подивимося, що є на полицях»', next: 'order' },
        { id: 'talk', label: '«Маєте хвилинку просто поговорити?»', next: 'topics' },
      ],
    },
    {
      id: 'trains',
      speaker: 'Мара',
      text: 'Потяги. Розклади. Пересадки. Йому подобається вдавати, ніби надрукований розклад гарантує, що світ поводитиметься чемно. Його звати Лео.',
      options: [
        {
          id: 'to-order-trains',
          label: 'Запропонувати книжку',
          next: 'order',
          grants: ['leo_likes_trains'],
        },
      ],
    },
    {
      id: 'meaning',
      speaker: 'Мара',
      text: '«Подарунок. Хоча він точно шукатиме прихований сенс». Мара сміється. «Його звати Лео Марш. Він навіть меню читає так, ніби там може бути підказка до фіналу».',
      options: [
        {
          id: 'to-order-meaning',
          label: 'Запропонувати книжку',
          next: 'order',
          grants: ['mara_talked_about_leo'],
        },
      ],
    },
    {
      id: 'order',
      speaker: 'Оповідач',
      text: 'На полиці чекають три книжки. Одна — про старі залізничні станції. Друга — про дороги, які ми обираємо. Третя — про листи, які важко надіслати.',
      options: [
        {
          id: 'station',
          label: '«Скляна станція» — історичний роман про потяги',
          next: 'station',
          grants: ['sold_station'],
        },
        {
          id: 'roads',
          label: '«Мапи незавершених доріг» — про нові початки',
          next: 'roads',
          grants: ['sold_roads'],
        },
        {
          id: 'letters',
          label: '«Листи до незнайомця» — про щирі розмови',
          next: 'letters',
          grants: ['sold_letters'],
        },
      ],
    },
    {
      id: 'station',
      speaker: 'Мара',
      text: '«О, тут старий вокзал на обкладинці! Лео точно зависне над ним на пів години». Мара перевертає книжку. «Беру. Тільки загорніть так, щоб не підглянув назву».',
      options: [{ id: 'finish-station', label: 'Загорнути подарунок', next: 'end' }],
    },
    {
      id: 'roads',
      speaker: 'Мара',
      text: '«Можемо читати разом. Хоча Лео знову забіжить наперед і випадково розкаже фінал». Мара закочує очі. «Беру. Може, цього разу витримає».',
      options: [{ id: 'finish-roads', label: 'Загорнути подарунок', next: 'end' }],
    },
    {
      id: 'letters',
      speaker: 'Мара',
      text: '«Листи? Він вирішить, що я натякаю йому щось написати». Мара ховає усмішку. «Ну й нехай. Беру».',
      options: [{ id: 'finish-letters', label: 'Загорнути подарунок', next: 'end' }],
    },
    {
      id: 'topics',
      hub: true,
      speaker: 'Мара',
      text: '«Якщо не рахувати булочки, які треба врятувати від мого начальника, — маю. Про що хочете поговорити?»',
      options: [
        { id: 'fiction', label: 'Про книжкових героїв, яких важко любити', next: 'fiction' },
        { id: 'bakery', label: 'Про пекарню й маленькі катастрофи', next: 'bakery' },
        { id: 'town-life', label: 'Про життя, де всі всіх знають', next: 'town-life' },
        { id: 'trust', label: 'Про довіру та другі шанси', next: 'trust-question' },
        {
          id: 'mara-own-morning',
          label: '«А коли ти востаннє робила щось тільки для себе?»',
          next: 'mara-own-morning',
          unless: ['mara_own_morning_heard'],
        },
        {
          repeatability: 'repeatable',
          id: 'gift-now',
          label: '«Дякую за розмову. Повернімося до подарунка»',
          next: 'order',
        },
      ],
    },
    {
      id: 'fiction',
      speaker: 'Мара',
      text: '«Тут герой три розділи стежить за дівчиною, а авторка називає це романтикою». Мара стукає по обкладинці. «Я розумію, що він красивий, але дверний замок теж існує не просто так».',
      options: [
        {
          id: 'fiction-boundary',
          label: '«Я б такого хлопця до себе не пустила»',
          next: 'fiction-boundary',
        },
        {
          id: 'fiction-disagree',
          label: '«А мені подобаються такі поганці в книжках»',
          next: 'fiction-disagree',
        },
        { id: 'fiction-ask', label: '«А який вчинок ти б не пробачила?»', next: 'fiction-ask' },
        { id: 'fiction-back', label: '«А про що ще поговоримо?»', next: 'topics' },
      ],
    },
    {
      id: 'fiction-boundary',
      speaker: 'Мара',
      text: '«От! На сторінці 86 він вліз до неї через вікно. У книжці це романтично, а в мене вдома після такого був би виклик поліції». Мара регоче.',
      options: [
        {
          id: 'boundary-deeper',
          label: '«А в житті ти легко встановлюєш межі?»',
          next: 'boundary-deeper',
        },
        { id: 'boundary-return', label: '«Повернімося до книжок»', next: 'fiction' },
      ],
    },
    {
      id: 'fiction-disagree',
      speaker: 'Мара',
      text: '«Гаразд, він цікавий. Але після тієї пожежі міг би хоча б запитати, чи вона ціла». Мара стукає по обкладинці. «Натомість три сторінки описують його волосся!».',
      options: [
        {
          id: 'disagree-deeper',
          label: '«Може, цікаво саме спостерігати за катастрофою?»',
          next: 'fiction-ask',
        },
        { id: 'disagree-back', label: '«Ти мене переконала. Що ще?»', next: 'topics' },
      ],
    },
    {
      id: 'fiction-ask',
      speaker: 'Мара',
      text: '«Він украв її листи й назвав це турботою». Мара зводить брови. «Якби Лео поліз у мою пошту, я б спершу змінила пароль, а вже потім з ним говорила».',
      options: [
        { id: 'ask-personal', label: '«Ти зараз точно про книжки?»', next: 'personal' },
        {
          id: 'ask-respect',
          label: '«Не питатиму, якщо це особисте»',
          next: 'respect',
          grants: ['mara_boundaries_respected'],
        },
        { id: 'ask-return', label: '«А про інші теми?»', next: 'topics' },
      ],
    },
    {
      id: 'personal',
      speaker: 'Мара',
      text: '«Ні, сьогодні тільки про книжки». Мара крутить стрічку на пакеті. «Ми ж щойно познайомилися. Я навіть не знаю, як у вас тут працює каса».',
      options: [
        { id: 'personal-respect', label: '«Звісно. Не поспішай»', next: 'respect' },
        { id: 'personal-joke', label: '«Тоді хоча б скажи, що за булочки»', next: 'bakery' },
      ],
    },
    {
      id: 'respect',
      speaker: 'Мара',
      text: '«Дякую». Мара посуває пакет ближче. «То що там у вас із книжками? Бо я так і піду з булочками замість подарунка».',
      options: [
        { id: 'respect-more', label: '«Ще поговоримо?»', next: 'topics' },
        { id: 'respect-order', label: '«Виберімо книжку Лео»', next: 'order' },
      ],
    },
    {
      id: 'boundary-deeper',
      speaker: 'Мара',
      text: '«Смішно: я можу посваритися з вигаданим героєм, але начальниці не можу сказати, що не вийду в неділю». Мара знизує плечима. «Вона знову попросила мене підмінити зміну».',
      options: [
        { id: 'deeper-help', label: '«Може, почати з маленького “ні”?»', next: 'small-no' },
        {
          id: 'deeper-listen',
          label: '«Звучить виснажливо»',
          next: 'small-no',
          grants: ['mara_listened_about_work'],
        },
        { id: 'deeper-back', label: '«Можемо змінити тему»', next: 'topics' },
      ],
    },
    {
      id: 'small-no',
      speaker: 'Мара',
      text: '«Учора я сказала “ні” замовленню на сто тістечок за годину. Потім спекла дев’яносто. Мені ще є над чим працювати». Вона сміється, але втома в її очах справжня.',
      options: [
        { id: 'small-no-back', label: '«А тепер — щось приємніше?»', next: 'topics' },
        { id: 'small-no-order', label: '«Може, підберемо подарунок?»', next: 'order' },
      ],
    },
    {
      id: 'bakery',
      speaker: 'Мара',
      text: '«Сьогодні начальник шукав зниклу булочку. Перерахував усе тричі, звинуватив постачальника, а потім знайшов корицю у власній бороді. Я мовчала. Це було моє маленьке мистецтво».',
      options: [
        {
          id: 'bakery-joke',
          label: '«Тобі варто написати детектив про булочку»',
          next: 'bakery-joke',
        },
        { id: 'bakery-tired', label: '«Ти, мабуть, дуже рано встаєш»', next: 'bakery-tired' },
        { id: 'bakery-back', label: '«Про що ще поговоримо?»', next: 'topics' },
      ],
    },
    {
      id: 'bakery-joke',
      speaker: 'Мара',
      text: '«Назва вже є: “Остання крихта”. Підозрюваних четверо, але всі з маслом на руках». Вона підморгує. «Тільки не кажіть пані Міллер. Вона вимагатиме продовження».',
      options: [
        { id: 'joke-return', label: '«Які ще в тебе історії?»', next: 'topics' },
        { id: 'joke-order', label: '«Подарунок для Лео чекає»', next: 'order' },
      ],
    },
    {
      id: 'bakery-tired',
      speaker: 'Мара',
      text: '«О четвертій тридцять. Місто тоді зовсім інше. Ніхто не сперечається, чи потрібна глазур. Навіть голуби ще не прокинулись, і я на хвилину відчуваю, ніби вся вулиця моя».',
      options: [
        { id: 'tired-ask', label: '«Тобі подобається ця тиша?»', next: 'bakery-silence' },
        { id: 'tired-return', label: '«Можемо поговорити про інше»', next: 'topics' },
      ],
    },
    {
      id: 'bakery-silence',
      speaker: 'Мара',
      text: '«Ще й як. Учора я цілу годину сиділа на сходах після зміни. Лео приніс каву й не став розпитувати. Це було дуже доречно».',
      options: [
        { id: 'silence-return', label: '«Дякую, що розповіла»', next: 'topics' },
        { id: 'silence-order', label: '«Давай знайдемо книжку»', next: 'order' },
      ],
    },
    {
      id: 'town-life',
      speaker: 'Мара',
      text: '«У Беллвіку варто лише підстригти чубчик — і до обіду всі знають, що ти пережила розрив і збираєшся до Парижа. А ти просто підстригла чубчик».',
      options: [
        { id: 'town-privacy', label: '«Тебе це дратує?»', next: 'town-privacy' },
        { id: 'town-warmth', label: '«А що тут найкраще?»', next: 'town-warmth' },
        { id: 'town-return', label: '«Змінимо тему?»', next: 'topics' },
      ],
    },
    {
      id: 'town-privacy',
      speaker: 'Мара',
      text: '«Іноді. Але коли я захворіла, хтось залишив суп під дверима. Я так і не дізналася хто. Це той самий Беллвік. Тут люди можуть бути нестерпні й неймовірно добрі за один день».',
      options: [
        { id: 'privacy-return', label: '«Розумію. Про що ще?»', next: 'topics' },
        { id: 'privacy-order', label: '«Час вибрати книжку»', next: 'order' },
      ],
    },
    {
      id: 'town-warmth',
      speaker: 'Мара',
      text: '«Коли після дощу запалюють ліхтарі. І коли Елеонора робить вигляд, що не рада гостям, але ставить третю чашку ще до дзвінка». Вона дивиться на полиці. «Добре, що тут знову світиться вікно».',
      options: [
        { id: 'warmth-return', label: '«Розкажи ще щось»', next: 'topics' },
        { id: 'warmth-order', label: '«Підберемо подарунок?»', next: 'order' },
      ],
    },
    {
      id: 'trust-question',
      speaker: 'Мара',
      text: '«Учора дочитала роман, де хлопець брехав дівчині двісті сторінок, а в кінці приніс квіти — і все, весілля». Мара фиркає. «Я б ті квіти йому повернула разом із чеком».',
      options: [
        {
          id: 'trust-forgive',
          label: '«І після цього вона його пробачила?»',
          next: 'trust-forgive',
          grants: ['mara_discussed_forgiveness'],
        },
        {
          id: 'trust-change',
          label: '«Може, він справді змінився за ці двісті сторінок?»',
          next: 'trust-change',
          grants: ['mara_discussed_change'],
        },
        {
          id: 'trust-quiet',
          label: '«Годі про цього хлопця. Як справи в пекарні?»',
          next: 'trust-respect',
          grants: ['mara_boundaries_respected'],
        },
      ],
    },
    {
      id: 'trust-forgive',
      speaker: 'Мара',
      text: '«От і я про це! Він навіть не вибачився нормально. Сказав: “Ти ж знаєш, який я”». Мара закриває очі. «Якби Лео таке сказав, я б його змусила перечитати весь розділ уголос». Тепер не певна.',
      options: [
        {
          id: 'trust-forgive-deeper',
          label: '«А що тоді означає щасливий кінець?»',
          next: 'trust-ending',
        },
        { id: 'trust-forgive-back', label: '«Повернімося до книжок»', next: 'topics' },
      ],
    },
    {
      id: 'trust-change',
      speaker: 'Мара',
      text: '«Може, він і справді змінився. Але автор міг хоча б дати їй дві сторінки подумати! Вона погодилася ще до того, як він зняв пальто». Мара відсуває книжку. «Я б так швидко не вирішила».',
      options: [
        {
          id: 'trust-change-deeper',
          label: '«Значить, кожен має право на власний фінал?»',
          next: 'trust-ending',
        },
        { id: 'trust-change-back', label: '«Змінимо тему»', next: 'topics' },
      ],
    },
    {
      id: 'trust-respect',
      speaker: 'Мара',
      text: '«О, про пекарню я можу годинами». Мара зітхає. «Сем знову переплутав корицю з мускатним горіхом. Три дека довелося переробляти».',
      options: [
        { id: 'trust-respect-bakery', label: '«Домовилися. Що нового в пекарні?»', next: 'bakery' },
        { id: 'trust-respect-order', label: '«Тоді оберімо подарунок»', next: 'order' },
      ],
    },
    {
      id: 'trust-ending',
      speaker: 'Мара',
      text: '«Тепер мені хочеться знайти автора й спитати, чи він узагалі колись сварився з живою людиною. Смішно: я прийшла по подарунок, а ми вже пів години сперечаємося про вигаданого хлопця».',
      options: [
        {
          id: 'trust-ending-more',
          label: '«Хочеш поговорити ще?»',
          next: 'topics',
          grants: ['mara_autonomy_discussed'],
        },
        {
          id: 'trust-ending-order',
          label: '«Давай виберемо книжку Лео»',
          next: 'order',
          grants: ['mara_autonomy_discussed'],
        },
      ],
    },
    {
      id: 'mara-own-morning',
      speaker: 'Мара',
      text: '«Сьогодні я з’їла край булки, поки ніхто не бачив. Не смійтеся. Це був єдиний шматочок дня, який нікому не обіцяла».',
      options: [
        {
          id: 'mara-morning-question',
          label: '«А як виглядав би ранок без обіцянок?»',
          next: 'mara-own-dream',
        },
        {
          id: 'mara-morning-exit',
          label: '«Можемо повернутися до книжок»',
          next: 'mara-own-finish',
        },
      ],
    },
    {
      id: 'mara-own-dream',
      speaker: 'Мара',
      text: '«Я б поставила біля вікна маленький стіл. Дві книжки, чайник, тепле світло. Не для продажу. Щоб люди могли почитати, поки місто ще не вимагає від них нічого».',
      options: [
        {
          id: 'mara-dream-ask',
          label: '«Чому ти досі не зробила цього?»',
          next: 'mara-own-obstacle',
        },
        {
          id: 'mara-dream-doubt',
          label: '«Може, мрія не мусить ставати справою?»',
          next: 'mara-own-doubt',
        },
      ],
    },
    {
      id: 'mara-own-obstacle',
      speaker: 'Мара',
      text: '«Якщо я не вийду, доведеться дзвонити Сему. Він минулого разу спалив два дека булочок». Мара зітхає. «Але я вже три неділі поспіль працюю за нього. Мене це дістало».',
      options: [
        {
          id: 'mara-obstacle-support',
          label: '«Ти ж не можеш працювати замість Сема вічно»',
          next: 'mara-own-counter',
        },
        {
          id: 'mara-obstacle-push',
          label: '«Хай Сем хоч раз сам розбереться»',
          next: 'mara-own-counter',
        },
      ],
    },
    {
      id: 'mara-own-doubt',
      speaker: 'Мара',
      text: '«Коли уявляю цей стіл, то вперше за день не думаю, скільки всього не встигла. Не хочу перетворити навіть це на черговий обов’язок».',
      options: [
        {
          id: 'mara-doubt-continue',
          label: '«Ти можеш спробувати й передумати»',
          next: 'mara-own-counter',
        },
        {
          id: 'mara-doubt-leave',
          label: '«Нехай це поки буде тільки твоє»',
          next: 'mara-own-finish',
        },
      ],
    },
    {
      id: 'mara-own-counter',
      speaker: 'Мара',
      text: '«Сем знову просив підмінити його в неділю. Каже, що більше нікого немає». Мара зітхає. «А я вже купила книжку й домовилася з собою, що хоч раз дочитаю її до обіду».',
      options: [
        {
          id: 'mara-counter-care',
          label: '«Можна цінувати довіру й чесно назвати свої сили»',
          next: 'mara-own-choice',
        },
        {
          id: 'mara-counter-boundary',
          label: '«А хто питає, скільки сил залишилося в тебе?»',
          next: 'mara-own-choice',
        },
      ],
    },
    {
      id: 'mara-own-choice',
      speaker: 'Мара',
      text: '«Тоді почну з одного ранку. Просто скажу, що наступного четверга не беру додаткових замовлень. Якщо запитають чому — скажу, що хочу почитати».',
      options: [
        { id: 'mara-choice-try', label: '«Сем переживе один ранок»', next: 'mara-own-finish' },
        { id: 'mara-choice-wait', label: '«А яку книжку хочеш дочитати?»', next: 'mara-own-finish' },
      ],
    },
    {
      id: 'mara-own-finish',
      speaker: 'Мара',
      text: '«Якщо в четвер побачиш мене за прилавком о шостій ранку — значить, я знову не втрималася й узяла зміну». Мара зітхає. «Але спробую. І булочки тоді будуть за мій рахунок».',
      options: [
        {
          id: 'mara-own-return',
          label: '«Тепер виберімо книжку Лео»',
          next: 'order',
          grants: ['mara_own_morning_heard'],
        },
      ],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'На порозі Мара озирається: «Я рада, що книгарня знову відкрита. Тепер ця вулиця ніби нарешті видихнула». За нею лишається запах кориці й тепла.',
      options: [],
    },
  ],
};

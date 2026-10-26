import type { DialogueStory } from '../game/dialogue';

/** День другий: Анна — вчителька, а не лише об'єкт чужих чуток. */
export const annaVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Після обіду до книгарні заходить жінка з полотняною торбою, повною зошитів. Вона обережно струшує дощ із парасольки й усміхається, побачивши дитячі книжки.',
      options: [{ id: 'hello', label: 'Привітатися', next: 'hello' }],
    },
    {
      id: 'hello',
      speaker: 'Анна',
      text: '«Я Анна Гейл, викладаю в місцевій школі. У нас завтра читання, а бібліотечні примірники вирішили одночасно зникнути. Діти, звісно, називають це змовою».',
      options: [
        {
          id: 'anna-v3-conversation',
          label: '«Чи повинна вчителька завжди знати відповідь?»',
          next: 'anna-v3-conversation',
          unless: ['anna_uncertainty_discussed'],
        },
        {
          id: 'anna-reflection',
          label: '«А як навчити дітей не боятися власної думки?»',
          next: 'anna-reflection',
          unless: ['anna_reflected_on_care'],
        },
        { id: 'school', label: '«Що люблять читати ваші учні?»', next: 'school' },
        { id: 'teacher', label: '«Вам подобається викладати?»', next: 'teacher' },
        { id: 'town', label: '«Як вам живеться в Беллвіку?»', next: 'town' },
        {
          id: 'rumor',
          label: '«Дехто розповідає про вашого чоловіка…»',
          next: 'rumor',
          requires: ['rumor_heard'],
        },
        { id: 'books', label: '«Пошукаємо книжки для читання»', next: 'books' },
      ],
    },
    {
      id: 'school',
      speaker: 'Анна',
      text: '«Один хлопчик любить історії про мандрівки, але не терпить щасливих кінцівок. Інша дівчинка читає тільки книжки, де герої мають домашніх тварин. Я навчилася не називати це поганим смаком».',
      options: [
        { id: 'school-question', label: '«А як ви знаходите спільну книжку?»', next: 'classroom' },
        { id: 'school-back', label: '«Про що ще поговоримо?»', next: 'hello' },
      ],
    },
    {
      id: 'classroom',
      speaker: 'Анна',
      text: '«Запитую, що вони відчули, а не чи правильно зрозуміли. Іноді найкраща розмова починається зі слів: “Мені цей герой зовсім не подобається”».',
      options: [{ id: 'classroom-back', label: '«Це гарний підхід»', next: 'hello' }],
    },
    {
      id: 'teacher',
      speaker: 'Анна',
      text: '«Так. Хоча сьогодні я витратила сорок хвилин, пояснюючи, чому клей не є повноцінним обідом». Вона сміється. «Але бувають дні, коли дитина вперше читає вголос без страху. Заради цього варто прокидатися».',
      options: [
        { id: 'teacher-rest', label: '«А коли ви відпочиваєте?»', next: 'rest' },
        { id: 'teacher-back', label: '«Повернімося до книжок»', next: 'books' },
      ],
    },
    {
      id: 'rest',
      speaker: 'Анна',
      text: '«Останнім часом нечасто. Томас теж багато працює. Ми іноді вечеряємо в різний час і залишаємо одне одному записки на холодильнику. Дурниці, але я сумую за справжніми розмовами».',
      options: [
        {
          id: 'rest-listen',
          label: '«Звучить самотньо»',
          next: 'listened',
          grants: ['anna_listened_to'],
        },
        { id: 'rest-respect', label: '«Не хочу втручатися»', next: 'respect' },
      ],
    },
    {
      id: 'town',
      speaker: 'Анна',
      text: '«Тут усе поруч: школа, пекарня, книгарня. Іноді навіть чужі висновки — надто поруч. Я люблю це місто, але хотіла б, щоб люди частіше запитували, перш ніж вирішувати за інших».',
      options: [
        { id: 'town-back', label: '«Розумію. Що ще?»', next: 'hello' },
        { id: 'town-books', label: '«Підберемо книжку для класу»', next: 'books' },
      ],
    },
    {
      id: 'rumor',
      speaker: 'Анна',
      text: '«Про Томаса?» Вона міцніше стискає ручку торби. «Я не хочу дізнаватися про свій шлюб від людей, які бачили когось здалеку. Якщо щось треба обговорити, ми поговоримо самі».',
      options: [
        {
          id: 'rumor-apologize',
          label: '«Вибачте. Не слід було переказувати»',
          next: 'respect',
          grants: ['anna_rumor_boundary'],
        },
        {
          id: 'rumor-push',
          label: '«Але ж ви маєте знати!»',
          next: 'push',
          grants: ['anna_rumor_pressed'],
        },
      ],
    },
    {
      id: 'push',
      speaker: 'Анна',
      text: '«Я почула вас. Будь ласка, не продовжуйте». Її голос спокійний, але розмова вже не така тепла.',
      options: [{ id: 'push-end', label: 'Не затримувати Анну', next: 'end' }],
    },
    {
      id: 'listened',
      speaker: 'Анна',
      text: '«Трохи. Але я не хочу, щоб хтось робив із цього висновки про Томаса. Просто нам обом важко знайти час». Вона відкладає зошити. «Дякую, що вислухали».',
      options: [
        { id: 'listened-back', label: '«Можемо поговорити про щось інше»', next: 'hello' },
        { id: 'listened-books', label: '«Давайте знайдемо книжку»', next: 'books' },
      ],
    },
    {
      id: 'respect',
      speaker: 'Анна',
      text: '«Дякую. Іноді люди так хочуть допомогти, що забувають спитати, чи потрібна допомога». Вона дивиться на полицю біля вікна.',
      options: [{ id: 'respect-books', label: '«Покажу вам книжки»', next: 'books' }],
    },
    {
      id: 'books',
      speaker: 'Анна',
      text: '«Потрібна історія, після якої діти захочуть сперечатися — доброзичливо, звісно. Може, щось про карти й незнайомі дороги? Не обов’язково з єдиною правильною відповіддю».',
      options: [
        {
          id: 'maps',
          label: 'Порадити «Мапи незавершених доріг»',
          next: 'purchase',
          grants: ['anna_chose_maps'],
        },
        {
          id: 'mystery',
          label: 'Порадити «Ніхто не знає кінцівки»',
          next: 'purchase',
          grants: ['anna_chose_mystery'],
        },
        { id: 'browse', label: '«Можете спокійно переглянути полиці»', next: 'end' },
      ],
    },
    {
      id: 'purchase',
      speaker: 'Анна',
      text: '«Візьму. Може, спершу прочитаю сама, щоб бути готовою до їхніх запитань. Хоча вони однаково запитають те, чого я не передбачила».',
      options: [{ id: 'purchase-end', label: 'Загорнути книжку', next: 'end' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Анна виходить у дощ із книжкою або з новими ідеями для уроку. За вікном школярі перестрибують калюжі, сперечаючись про щось дуже важливе.',
      options: [],
    },
    {
      id: 'anna-reflection',
      speaker: 'Анна',
      text: '«Я вчу дітей ставити запитання. А сама іноді боюся попросити про допомогу».',
      options: [
        {
          id: 'anna-reflect-question',
          label: '«А що для тебе в цьому найважче?»',
          next: 'anna-reflection-deep',
        },
        {
          id: 'anna-reflect-return',
          label: '«Дякую, що поділився цим»',
          next: 'anna-reflection-end',
        },
      ],
    },
    {
      id: 'anna-reflection-deep',
      speaker: 'Анна',
      text: '«Не хочу, щоб учні читали книжку лише заради правильної відповіді».',
      options: [
        {
          id: 'anna-reflect-continue',
          label: '«І що ти хочеш змінити?»',
          next: 'anna-reflection-classroom',
        },
        {
          id: 'anna-reflect-listen',
          label: '«Можна просто побути з цим»',
          next: 'anna-reflection-classroom',
        },
      ],
    },
    {
      id: 'anna-reflection-classroom',
      speaker: 'Анна',
      text: '«Учениця написала, що їй не сподобався фінал книжки. Я поставила схвальний знак, але вона переписала відповідь. Вирішила, що я чекала від неї іншого. Мені стало соромно».',
      options: [
        {
          id: 'anna-classroom-apologize',
          label: '«Поговори з нею про це»',
          next: 'anna-reflection-apology',
          grants: ['anna_will_apologize_to_student'],
        },
        {
          id: 'anna-classroom-discuss',
          label: '«Запропонуй класу посперечатися»',
          next: 'anna-reflection-discussion',
          grants: ['anna_will_invite_disagreement'],
        },
      ],
    },
    {
      id: 'anna-reflection-apology',
      speaker: 'Анна',
      text: '«Я скажу їй, що навіть учителі помиляються. Вона не мусить погоджуватися зі мною, щоб я поважала її думку».',
      options: [{ id: 'anna-apology-back', label: 'Послухати далі', next: 'anna-reflection-end' }],
    },
    {
      id: 'anna-reflection-discussion',
      speaker: 'Анна',
      text: '«Можемо почати з питання, чому героїня вчинила так, а не інакше. І я першою визнаю, що сама не впевнена у відповіді».',
      options: [
        { id: 'anna-discussion-back', label: 'Послухати далі', next: 'anna-reflection-end' },
      ],
    },
    {
      id: 'anna-reflection-end',
      speaker: 'Анна',
      text: '«Турбота — не іспит. Можна втомитися й усе одно залишитися доброю людиною».',
      textWhen: [
        {
          requires: ['anna_will_apologize_to_student'],
          text: '«Мабуть, перше, чого я маю навчити дітей, — дорослі теж можуть вибачатися. Особливо коли ненароком змушують мовчати».',
        },
        {
          requires: ['anna_will_invite_disagreement'],
          text: '«На наступному занятті я попрошу дітей заперечити мені. І не поспішатиму вирішувати, хто з нас правий».',
        },
      ],
      options: [
        {
          id: 'anna-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'hello',
          grants: ['anna_reflected_on_care'],
        },
      ],
    },
    {
      id: 'anna-v3-conversation',
      speaker: 'Анна',
      text: '«Учениця запитала, чи можна бути доброю людиною й не пробачити. Я не знайшла готової відповіді. Мене налякало не питання, а власна тиша».',
      options: [
        { id: 'anna-v3-ask', label: '«Що ти сказала?»', next: 'anna-v3-conversation-question' },
        {
          id: 'anna-v3-short',
          label: '«Можемо не продовжувати»',
          next: 'anna-v3-conversation-end',
        },
      ],
    },
    {
      id: 'anna-v3-conversation-question',
      speaker: 'Анна',
      text: '«Що повернемося до цього завтра. Але весь вечір думала, чи не підвела її. Дорослі звикли вдавати, що все знають».',
      options: [
        {
          id: 'anna-v3-challenge',
          label: '«А якщо невпевненість теж навчає?»',
          next: 'anna-v3-conversation-counter',
        },
        {
          id: 'anna-v3-listen',
          label: '«Залишимо питання відкритим»',
          next: 'anna-v3-conversation-end',
        },
      ],
    },
    {
      id: 'anna-v3-conversation-counter',
      speaker: 'Анна',
      text: '«Дитина прийшла по опору. Я боюся підмінити її власною розгубленістю. Та й удавати впевненість — теж нечесно».',
      options: [
        {
          id: 'anna-v3-follow',
          label: '«І що ти хочеш зробити?»',
          next: 'anna-v3-conversation-choice',
        },
        {
          id: 'anna-v3-pause',
          label: '«Не обов’язково вирішувати сьогодні»',
          next: 'anna-v3-conversation-end',
        },
      ],
    },
    {
      id: 'anna-v3-conversation-choice',
      speaker: 'Анна',
      text: '«Спробую сказати їм, що ми можемо шукати відповідь разом. І незгода не означає неповагу».',
      options: [
        { id: 'anna-v3-accept', label: '«Це твій вибір»', next: 'anna-v3-conversation-end' },
      ],
    },
    {
      id: 'anna-v3-conversation-end',
      speaker: 'Анна',
      text: '«Дякую за розмову. Не все треба вирішувати одразу».',
      options: [
        {
          id: 'anna-v3-return',
          label: 'Повернутися до інших тем',
          next: 'hello',
          grants: ['anna_uncertainty_discussed'],
        },
      ],
    },
  ],
};

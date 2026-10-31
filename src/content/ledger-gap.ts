import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** The empty recipient field is evidence of an omission, not of a culprit. */
export const ledgerGapOption: DialogueOption = {
  id: 'ledger-gap',
  label: 'Розібратися, чому в журналі порожня графа отримувача',
  next: 'ledger-gap',
  requires: ['final_ledger_scene_complete'],
  unless: ['final_ledger_gap_done'],
};

export const ledgerGapNodes: readonly DialogueNode[] = [
  {
    id: 'ledger-gap',
    speaker: 'Елеонора',
    text: 'Елеонора розгортає старий журнал на записі про коробку сімнадцять. Навпроти дати й номера є ще одна графа — «Кому передано». Вона порожня. «Я залишила її такою сім років тому», — каже Елеонора. Нора вже підносить олівець: «Отже, хтось забрав коробку потай?» «Отже, я не записала, кому її віддала. Це різні речі».',
    textWhen: [
      {
        requires: ['final_ledger_record_private'],
        text: 'Елеонора показує тобі журнал за зачиненим прилавком. У графі «Кому передано» навпроти коробки сімнадцять нічого немає. «Ми домовилися не показувати запис Айріс без розмови», — нагадує вона. «Але порожню графу не можна заповнити здогадом».',
      },
      {
        requires: ['final_miller_ledger_rumor_seeded'],
        text: 'Нора відсуває від журналу програмку Міллер. «Після її вигаданої останньої сторінки я більше не хочу друкувати припущення». Елеонора показує порожню графу «Кому передано» біля номера сімнадцять. «Тоді почни з того, що ми не знаємо, хто забрав коробку».',
      },
    ],
    options: [
      {
        id: 'ledger-gap-check',
        label: 'Перевірити, що саме видно в журналі',
        next: 'ledger-gap-check',
        unless: ['final_ledger_gap_checked'],
      },
      {
        id: 'ledger-gap-eleanor',
        label: 'Запитати Елеонору, чому вона не дописала ім’я',
        next: 'ledger-gap-eleanor',
        unless: ['final_ledger_gap_eleanor_heard'],
      },
      {
        id: 'ledger-gap-iris',
        label: 'Дати Айріс самій подивитися на запис',
        next: 'ledger-gap-iris',
        requires: ['final_ledger_iris_told'],
        unless: ['final_case_iris_declined', 'final_ledger_gap_iris_heard'],
      },
      {
        id: 'ledger-gap-decide',
        label: 'Вирішити, що робити з порожньою графою',
        next: 'ledger-gap-decision',
        requires: ['final_ledger_gap_checked', 'final_ledger_gap_eleanor_heard'],
      },
    ],
  },
  {
    id: 'ledger-gap-check',
    speaker: 'Нора',
    text: 'Нора нахиляє лампу. «Чорнило навколо не стерте, папір не подряпаний. Хтось просто залишив місце порожнім». Елеонора пирхає: «Дякую, що не знайшла тут таємне послання». «Дай мені ще хвилину», — відповідає Нора, але відкладає лупу.',
    options: [
      {
        id: 'ledger-gap-check-thomas',
        label: '«Томас міг розписатися за коробку?»',
        next: 'ledger-gap-thomas',
      },
      {
        id: 'ledger-gap-check-back',
        label: 'Записати: отримувач не зазначений',
        next: 'ledger-gap',
        grants: ['final_ledger_gap_checked'],
      },
    ],
  },
  {
    id: 'ledger-gap-thomas',
    speaker: 'Томас',
    text: '«Я тоді тягав мокрі книжки сходами. Журнал бачив уже після того, як усе висохло». Томас дивиться на порожній рядок. «Якщо поставите тут моє ім’я, у вас буде охайна таблиця й неправильна історія». Нора зітхає: «Ти міг би хоч раз сказати щось сенсаційне?»',
    options: [
      {
        id: 'ledger-gap-thomas-back',
        label: 'Залишити графу без підпису Томаса',
        next: 'ledger-gap',
        grants: ['final_ledger_gap_checked', 'final_ledger_gap_thomas_limit'],
      },
    ],
  },
  {
    id: 'ledger-gap-eleanor',
    speaker: 'Елеонора',
    text: '«Я збиралася дописати потім. А потім була нова поставка, зламана труба, люди з мокрими книжками. За тиждень я вже не могла пригадати точно». Елеонора стискає край сторінки. «Мені соромно. Але якщо я впишу ім’я зараз, сорому стане менше лише мені».',
    options: [
      {
        id: 'ledger-gap-listen',
        label: '«Не вписуйте ім’я зараз. Ми ж не знаємо, хто забрав коробку»',
        next: 'ledger-gap',
        grants: ['final_ledger_gap_eleanor_heard', 'final_ledger_gap_eleanor_listened'],
      },
      {
        id: 'ledger-gap-press',
        label: '«Ви мали розповісти про це раніше»',
        next: 'ledger-gap',
        grants: ['final_ledger_gap_eleanor_heard', 'final_ledger_gap_eleanor_pressed'],
      },
    ],
  },
  {
    id: 'ledger-gap-iris',
    speaker: 'Айріс',
    text: 'Айріс читає графу, не торкаючись журналу. «Мені хотілося б побачити тут ім’я. Але його немає». Вона підводить очі на Елеонору. «Я можу сердитися на тебе за цей пропуск і все одно не дозволяти іншим вигадувати, хто забрав мамині сторінки». Елеонора не сперечається.',
    textWhen: [
      {
        requires: ['final_letter_breach_disclosed'],
        text: 'Айріс дивиться на журнал з іншого боку столу. «Після листа я не готова віддавати вам і цей запис». Вона бачить порожню графу. «Тут немає імені. І я не дозволяю дописувати його за мене». Елеонора мовчки закриває журнал.',
      },
    ],
    options: [
      {
        id: 'ledger-gap-iris-back',
        label: 'Запитати Айріс, чи вона взагалі бачила отримувача',
        next: 'ledger-gap',
        grants: ['final_ledger_gap_iris_heard'],
      },
    ],
  },
  {
    id: 'ledger-gap-decision',
    speaker: 'Нора',
    text: '«Можемо залишити графу порожньою, зробити окрему примітку сьогоднішньою датою або показати копію Айріс», — перелічує Нора. Вона затинається. «А ще я могла б написати про “зниклого отримувача”. Гарний заголовок. Поганий доказ». Елеонора чекає твоєї відповіді.',
    options: [
      {
        id: 'ledger-gap-keep',
        label: 'Залишити оригінал без змін і зберегти його приватно',
        next: 'ledger-gap-outcome',
        grants: ['final_ledger_gap_kept_blank'],
      },
      {
        id: 'ledger-gap-annotate',
        label: 'Додати окрему датовану примітку про невідомого отримувача',
        next: 'ledger-gap-outcome',
        grants: ['final_ledger_gap_annotated'],
      },
      {
        id: 'ledger-gap-copy',
        label: 'Запропонувати Айріс приватну копію без нових припущень',
        next: 'ledger-gap-outcome',
        requires: ['final_ledger_iris_told'],
        unless: ['final_case_iris_declined'],
        grants: ['final_ledger_gap_iris_copy'],
      },
      {
        id: 'ledger-gap-publish',
        label: 'Запропонувати Норі надрукувати неперевірену версію про отримувача',
        next: 'ledger-gap-outcome',
        grants: ['final_ledger_gap_speculation_printed'],
      },
    ],
  },
  {
    id: 'ledger-gap-outcome',
    speaker: 'Елеонора',
    text: 'Елеонора обережно закриває журнал. «Папір пережив повінь. Нехай переживе й наше бажання все пояснити». Френк стрибає на прилавок і сідає просто на чистий аркуш для нотаток.',
    textWhen: [
      {
        requires: ['final_ledger_gap_kept_blank'],
        text: 'Елеонора вкладає журнал у шухляду, не змінюючи жодного рядка. «Я ще можу поговорити з Айріс. Але не можу зробити вигляд, що сім років тому знала більше». Френк займає її стілець.',
      },
      {
        requires: ['final_ledger_gap_annotated'],
        text: 'Нора бере нову картку й ставить сьогоднішню дату: «Графа отримувача порожня. Ім’я не встановлено». Оригінальний журнал залишається недоторканим. Елеонора перечитує напис і киває.',
      },
      {
        requires: ['final_ledger_gap_iris_copy'],
        text: 'Айріс бере копію журналу, але не відкриває її при гостях. «Я вирішу, кому це показати». Нора прибирає свою ручку. Елеонора не просить подяки.',
      },
      {
        requires: ['final_ledger_gap_speculation_printed'],
        text: 'Нора забирає нотатку для завтрашньої публікації. «Я не назву імені», — обіцяє вона. Елеонора відповідає: «Ти вже назвеш людину “зниклою”, хоча не знаєш, чи вона взагалі була». Нора не віддає папір назад.',
      },
    ],
    options: [
      {
        id: 'ledger-gap-finish',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_ledger_gap_done'],
      },
    ],
  },
];

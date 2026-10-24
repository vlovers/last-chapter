import type { DialogueStory } from '../game/dialogue';

/** Перший вечір: загадку можна розв’язати, не порушуючи таємниці листування. */
export const firstEvening: DialogueStory = {
  start: 'box',
  nodes: [
    {
      id: 'box',
      speaker: 'Оповідач',
      text: 'Книгарня спорожніла. Дощ розмиває вогні за шибкою. Під прилавком стоїть коробка з написом «Бронювання. Сім років тому». Ви нарешті піднімаєте кришку.',
      options: [
        {
          id: 'receipt',
          label: 'Роздивитися картку бронювання',
          next: 'receipt',
          grants: ['saw_receipt'],
        },
        { id: 'book', label: 'Оглянути синю книжку', next: 'book', grants: ['saw_blue_book'] },
        { id: 'letter', label: 'Оглянути конверт', next: 'letter', grants: ['saw_envelope'] },
        {
          id: 'eleanor-notes',
          label: 'Прочитати записку Елеонори на коробці',
          next: 'eleanor-notes',
        },
      ],
    },
    {
      id: 'eleanor-notes',
      speaker: 'Оповідач',
      text: 'На внутрішньому боці кришки Елеонора залишила записку: «Не викидати. Книжки, які не встигли забрати до затоплення». Нижче — маленьке намальоване серце й приписка: «І не забути повернути Беатріс банку».',
      options: [
        {
          id: 'eleanor-history',
          label: 'Знайти згадку про ремонт у старому журналі',
          next: 'repair-ledger',
          grants: ['saw_repair_note'],
        },
        {
          id: 'eleanor-memory',
          label: 'Занотувати питання для Елеонори',
          next: 'eleanor-memory',
          grants: ['ask_eleanor_next_day'],
        },
        { id: 'eleanor-back', label: 'Повернутися до коробки', next: 'box' },
      ],
    },
    {
      id: 'repair-ledger',
      speaker: 'Оповідач',
      text: 'Старий журнал відкривається на сторінці з плямами. «Протікання над задньою полицею. Відвідувачів не пускати до завершення ремонту». Дата збігається з тижнем бронювання Лео. Це підтверджує закриття, але не пояснює, хто мав повідомити покупців.',
      options: [
        { id: 'repair-back', label: 'Повернутися до коробки', next: 'box' },
        {
          id: 'repair-question',
          label: 'Записати питання для Елеонори',
          next: 'eleanor-memory',
          grants: ['ask_eleanor_next_day'],
        },
      ],
    },
    {
      id: 'eleanor-memory',
      speaker: 'Оповідач',
      text: 'У нотатнику з’являється питання: «Чому бронювання Лео залишилося в коробці після ремонту?» Ви не маєте відповіді, але знаєте, кого можна запитати.',
      options: [{ id: 'eleanor-memory-back', label: 'Повернутися до коробки', next: 'box' }],
    },
    {
      id: 'receipt',
      speaker: 'Оповідач',
      text: '«Лео Марш. П’ятниця, 17:00». Підпису про отримання немає. На звороті — ледь помітна пляма від води.',
      options: [
        { id: 'receipt-back', label: 'Повернутися до коробки', next: 'box' },
        {
          id: 'receipt-conclude',
          label: 'Зробити висновок',
          next: 'deduction',
          requires: ['saw_envelope'],
        },
      ],
    },
    {
      id: 'book',
      speaker: 'Оповідач',
      text: '«Зимове вікно». Синя обкладинка, малюнок освітленого вікна й трохи зім’ятий корінець. Між сторінками лежить запечатаний конверт.',
      options: [
        { id: 'book-back', label: 'Повернутися до коробки', next: 'box' },
        { id: 'book-letter', label: 'Оглянути конверт', next: 'letter', grants: ['saw_envelope'] },
      ],
    },
    {
      id: 'letter',
      speaker: 'Оповідач',
      text: 'На конверті написано: «Лео. Від Айріс Белл». Дата збігається з карткою бронювання. Печатка ціла. Що всередині, ви не знаєте.',
      options: [
        { id: 'letter-back', label: 'Покласти лист назад', next: 'box' },
        {
          id: 'letter-open',
          label: 'Порушити печатку й прочитати лист',
          next: 'opened',
          grants: ['opened_private_letter'],
        },
        {
          id: 'letter-conclude',
          label: 'Зробити висновок',
          next: 'deduction',
          requires: ['saw_receipt'],
        },
      ],
    },
    {
      id: 'opened',
      speaker: 'Оповідач',
      text: 'Папір шарудить надто голосно. У листі Айріс просить Лео зустріти її на вокзалі перед від’їздом і зізнається, що давно хотіла сказати йому дещо важливе. Ви дізналися більше, ніж мали право.',
      options: [{ id: 'opened-conclude', label: 'Занотувати, що сталося', next: 'deduction' }],
    },
    {
      id: 'deduction',
      speaker: 'Оповідач',
      text: 'Бронювання для Лео не забрали. Лист від Айріс залишився в книжці. Це означає, що повідомлення могло не дійти до адресата. Але поки що це лише припущення.',
      options: [
        {
          id: 'keep-safe',
          label: 'Зберегти лист у безпечному місці',
          next: 'end',
          grants: ['letter_secured'],
        },
        {
          id: 'keep-and-ask',
          label: 'Зберегти лист і записати питання до Елеонори',
          next: 'end',
          grants: ['letter_secured', 'ask_eleanor_next_day'],
        },
        {
          id: 'ask-eleanor',
          label: 'Записати: завтра спитати Елеонору про закриття книгарні',
          next: 'end',
          grants: ['ask_eleanor_next_day'],
        },
      ],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'За дахами гуде останній потяг. Ви гасите лампу над прилавком. І думаєте, скільки сварок у цьому місті почалося з того, чого ніхто так і не почув.',
      options: [],
    },
  ],
};

import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** A quiet, optional conversation after the evidence has been sorted. */
export const afterCaseTeaOption: DialogueOption = {
  id: 'after-case-tea',
  label: 'Допомогти прибрати стіл після розмови про рукопис',
  next: 'after-case-tea',
  requires: ['final_case_closure_complete'],
  unless: ['final_after_case_tea_done'],
};

export const afterCaseTeaNodes: readonly DialogueNode[] = [
  {
    id: 'after-case-tea',
    speaker: 'Мара',
    text: 'Мара збирає порожні чашки. «Ми так довго шукали останню сторінку, що Френк встиг заснути на першій». Кіт розплющує одне око. «Не дивися так. Тобі хоча б не довелося слухати Норині теорії».',
    textWhen: [
      {
        requires: ['final_miller_ledger_rumor_seeded'],
        text: 'Мара складає чашки на тацю. «Міллер уже пішла, а її слова ще ходять між столами». Нора дивиться на свої нотатки. «Завтра я не хочу додавати до них жодного нового здогаду». Френк вмощується на чистому рушнику, ніби суперечка його не стосується.',
      },
      {
        requires: ['final_ledger_record_private'],
        text: 'Мара збирає чашки, поки Елеонора ховає журнал під прилавок. «Не все, що знайшли, треба сьогодні обговорювати», — каже вона. Нора мовчки прибирає олівець. Френк засинає на рушнику.',
      },
    ],
    options: [
      { id: 'after-tea-nora', label: 'Допомогти Норі скласти нотатки', next: 'after-case-nora' },
      {
        id: 'after-tea-mara',
        label: 'Запитати Мару про завтрашній ранок',
        next: 'after-case-mara',
      },
      {
        id: 'after-tea-frank',
        label: 'Забрати у Френка рушник і запропонувати йому коробку',
        next: 'after-case-frank',
      },
      { id: 'after-tea-quiet', label: 'Мовчки вимити чашки', next: 'after-case-quiet' },
    ],
  },
  {
    id: 'after-case-nora',
    speaker: 'Нора',
    text: '«Я хотіла написати: “Таємницю розкрито”», — Нора закреслює заголовок. «Але ми з’ясували, де сушили папір, а не хто написав історію. Спробую жити з менш гучною назвою». Вона підсуває тобі дві картки: одну для фактів, іншу — для припущень.',
    options: [
      {
        id: 'after-nora-facts',
        label: 'Розкласти записи Нори на дві купки: бачили й припускаємо',
        next: 'after-case-finish',
        grants: ['final_after_case_notes_separated'],
      },
      {
        id: 'after-nora-close',
        label: 'Залишити картки Норі',
        next: 'after-case-finish',
        grants: ['final_after_case_nora_owns_notes'],
      },
    ],
  },
  {
    id: 'after-case-mara',
    speaker: 'Мара',
    text: '«Завтра я спершу поснідаю, а тоді, може, зайду по книжку. Не по відповідь на загадку — по книжку». Вона ставить чисту чашку догори дном. «Дивно, що доводиться це уточнювати».',
    options: [
      {
        id: 'after-mara-invite',
        label: 'Відкласти для Мари роман без загадкового фіналу',
        next: 'after-case-finish',
        grants: ['final_after_case_mara_book_reserved'],
      },
      {
        id: 'after-mara-space',
        label: 'Залишити Марі право самій вирішити, як провести ранок',
        next: 'after-case-finish',
        grants: ['final_after_case_mara_space'],
      },
    ],
  },
  {
    id: 'after-case-quiet',
    speaker: 'Оповідач',
    text: 'Тепла вода пахне лимоном. За спиною Нора сперечається з Марою про обкладинку, Елеонора рахує решту в касі. Ніхто не просить тебе пояснити ще одну чужу таємницю. Френк нарешті вмощується на сухому рушнику.',
    options: [
      {
        id: 'after-quiet-finish',
        label: 'Повернутися до гостей',
        next: 'after-case-finish',
        grants: ['final_after_case_quiet_shared'],
      },
    ],
  },
  {
    id: 'after-case-frank',
    speaker: 'Оповідач',
    text: 'Френк ображено спостерігає, як ти піднімаєш рушник. Поруч стоїть порожня коробка з-під книжок. Кіт обнюхує її, залазить усередину, а потім негайно вистрибує: дно шелестить надто голосно. «Він у нас вибагливий критик», — каже Мара.',
    options: [
      {
        id: 'after-frank-box',
        label: 'Підстелити в коробку старий папір',
        next: 'after-case-frank-box',
      },
      {
        id: 'after-frank-lap',
        label: 'Посадити Френка собі на коліна',
        next: 'after-case-frank-lap',
      },
    ],
  },
  {
    id: 'after-case-frank-box',
    speaker: 'Мара',
    text: 'Френк обережно повертається в коробку, вкладається на папір і починає муркотіти. «Ось і все, — каже Мара. — Ми витратили п’ять днів на загадкові сторінки, а йому потрібен був один чистий аркуш». Нора нарешті сміється.',
    options: [
      {
        id: 'after-frank-box-finish',
        label: 'Залишити Френка спати й прибрати чашки',
        next: 'after-case-finish',
        grants: ['final_after_case_frank_box'],
      },
    ],
  },
  {
    id: 'after-case-frank-lap',
    speaker: 'Оповідач',
    text: 'Френк вмощується на колінах, чіпляється лапою за рукав і засинає саме тоді, коли ти збираєшся підвестися. Елеонора дивиться на гору чашок. «Зрозуміло. Тепер у нас на одного працівника менше».',
    options: [
      {
        id: 'after-frank-lap-finish',
        label: 'Попросити Мару допомогти з чашками',
        next: 'after-case-finish',
        grants: ['final_after_case_frank_lap'],
      },
    ],
  },
  {
    id: 'after-case-finish',
    speaker: 'Елеонора',
    text: '«Завтра відчиняємося о дев’ятій», — каже Елеонора й забирає рушник з-під Френка. «І якщо хтось знову прийде шукати сенсацію, спершу нехай купить хоч одну книжку». Френк ображено нявкає: рушник був чудовий.',
    options: [
      {
        id: 'after-tea-return',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_after_case_tea_done'],
      },
    ],
  },
];

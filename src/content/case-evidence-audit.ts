import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * A source-by-source check of the case. The journal proves that a numbered box
 * existed; it cannot identify the manuscript's author or the box's recipient.
 * Nothing in this scene grants access to Iris's private originals.
 */
export const caseEvidenceAuditOption: DialogueOption = {
  id: 'case-authors-crosscheck',
  label: 'Звірити цифри, спогади й джерела перед висновком',
  next: 'case-evidence-audit',
  unless: ['final_case_evidence_audit_done'],
};

export const caseEvidenceAuditNodes: readonly DialogueNode[] = [
  {
    id: 'case-evidence-audit',
    speaker: 'Нора',
    text: 'Нора розкладає на столі три чисті картки. «Я вже одного разу назвала здогад доказом. Цього разу напишімо, хто що бачив і звідки ми це знаємо». Елеонора підсуває журнал ближче до лампи, але не відкриває його для гостей.',
    textWhen: [
      {
        requires: ['final_ledger_gap_speculation_printed'],
        text: 'Нора кладе поряд із журналом чернетку завтрашньої замітки. «Я вже віддала текст про зниклого отримувача. А графа в журналі просто порожня». Елеонора відсуває чернетку від своїх паперів. «Тоді почнімо з того, що ти можеш довести».',
      },
    ],
    options: [
      {
        id: 'case-audit-box',
        label: 'Зіставити коробку №17 із цифрою на аркуші',
        next: 'case-evidence-box',
        unless: ['final_case_audit_box_checked'],
      },
      {
        id: 'case-audit-stars',
        label: 'Перевірити власні нотатки про дві й три зірки',
        next: 'case-evidence-stars',
        requires: ['iris_quiet_page_discussed', 'iris_margin_note_discussed'],
        unless: ['final_case_audit_stars_checked'],
      },
      {
        id: 'case-audit-recipient',
        label: 'Звірити порожню графу отримувача',
        next: 'case-evidence-recipient',
        requires: ['final_ledger_gap_done'],
        unless: ['final_case_audit_recipient_checked'],
      },
      {
        id: 'case-audit-decide',
        label: 'Вирішити, що робити з перевіреними записами',
        next: 'case-evidence-decision',
        requires: ['final_case_audit_box_checked'],
      },
    ],
  },
  {
    id: 'case-evidence-box',
    speaker: 'Елеонора',
    text: '«Ось запис: після повені ми сушили аркуші в коробці сімнадцять. Це справжній номер, і журнал мій». Вона торкається олівцевої цифри на знайденому аркуші. «А от чи вона позначає ту саму коробку, я не можу пригадати. Якщо зараз скажу “так”, ти запишеш це як факт». Нора не заперечує.',
    textWhen: [
      {
        requires: ['final_workshop_photo_reviewed'],
        text: 'Елеонора ставить поряд дві картки. «Коробка сімнадцять була тут, у книгарні. На світлині майстерні — сімка і подряпина від цвяха. Це два різні місця». Нора показує на число на аркуші: «І третя річ, зв’язок якої з коробкою ми ще не довели».',
      },
    ],
    options: [
      {
        id: 'case-audit-box-back',
        label: 'Записати окремо факт і можливий зв’язок',
        next: 'case-evidence-audit',
        grants: ['final_case_audit_box_checked'],
      },
    ],
  },
  {
    id: 'case-evidence-stars',
    speaker: 'Нора',
    text: 'Нора читає твій запис, не торкаючись паперів Айріс. «На знайденому аркуші дві зірки, у спогаді Айріс — три. Це розбіжність, а не підпис автора». Вона повертає блокнот. «Не будемо діставати її особисті речі, щоб перевірити красиву версію».',
    textWhen: [
      {
        requires: ['opened_private_letter'],
        text: 'Нора дивиться лише на твій блокнот. «Ти вже порушив межу з листом Айріс. Тому жодних нових прохань показати оригінали». Вона підкреслює два слова: «дві зірки». «Це твоє спостереження, а не дозвіл говорити від її імені».',
      },
      {
        requires: ['iris_letter_breach_admitted'],
        text: 'Нора читає твій запис, не відкриваючи папку Айріс. «Ти визнав, що відкрив її лист. Ця розмова не дає тобі права перевіряти мамині аркуші». Вона ставить знак питання біля двох зірок: «Авторство все одно невідоме».',
      },
    ],
    options: [
      {
        id: 'case-audit-stars-back',
        label: 'Залишити різницю в малюнках без вигаданого автора',
        next: 'case-evidence-audit',
        grants: ['final_case_audit_stars_checked'],
      },
    ],
  },
  {
    id: 'case-evidence-recipient',
    speaker: 'Елеонора',
    text: '«У журналі є дата, номер коробки й порожня графа отримувача. Я не записала ім’я. Це моя помилка». Нора повертає олівець у пальцях. «Можна шукати людину, але не можна перетворювати порожнє поле на свідчення, що хтось крав сторінки».',
    textWhen: [
      {
        requires: ['final_ledger_gap_speculation_printed'],
        text: '«Я не записала отримувача, — каже Елеонора. — Але ти вже назвала його зниклим у своїй замітці». Нора дивиться на чернетку. «Можу попросити редактора зняти заголовок. Не обіцяю, що він не встиг його побачити».',
      },
    ],
    options: [
      {
        id: 'case-audit-recipient-back',
        label: 'Позначити відсутність запису, не вигадуючи людину',
        next: 'case-evidence-audit',
        grants: ['final_case_audit_recipient_checked'],
      },
    ],
  },
  {
    id: 'case-evidence-decision',
    speaker: 'Нора',
    text: '«Отже, маємо журнал, кілька розбіжностей і купу порожніх місць». Нора знімає з ручки ковпачок. «Я можу залишити все це в закритій теці. А можу спробувати виправити те, що вже встигла сказати». За вікном Мара свариться з Лео через парасольку, яку він знову забув.',
    options: [
      {
        id: 'case-audit-private',
        label: 'Залишити джерела й невідоме в приватному описі',
        next: 'case-evidence-outcome',
        grants: ['final_case_audit_private_summary'],
      },
      {
        id: 'case-audit-correct',
        label: 'Попросити Нору відкликати неперевірену замітку',
        next: 'case-evidence-outcome',
        requires: ['final_ledger_gap_speculation_printed'],
        grants: ['final_case_audit_correction_requested'],
      },
      {
        id: 'case-audit-accuse',
        label: 'Наполягти, що цифри все одно доводять приховування',
        next: 'case-evidence-outcome',
        grants: ['final_case_audit_accusation_attempted'],
      },
    ],
  },
  {
    id: 'case-evidence-outcome',
    speaker: 'Нора',
    text: 'Нора прибирає картки в шухляду. «Нехай тут поки залишаться питання. Я вже замовила нові полиці, а не нову сенсацію». Елеонора з полегшенням підхоплює чашки.',
    textWhen: [
      {
        requires: ['final_case_audit_correction_requested'],
        text: 'Нора бере телефон. «Напишу редакторові, щоб зупинив замітку про зниклого отримувача. Чи встиг він її поставити в чергу, дізнаюся завтра». Елеонора не дякує — лише зачиняє журнал.',
      },
      {
        requires: ['final_case_audit_accusation_attempted'],
        text: '«Ти можеш так думати, — відповідає Нора, — але я не надрукую звинувачення без свідка». Елеонора забирає журнал зі столу. «І я більше не показуватиму його для таких висновків».',
      },
      {
        requires: ['final_case_audit_private_summary'],
        text: 'Нора підписує три картки: «журнал», «спогад», «гіпотеза». Вони залишаться в закритій теці. «Якщо завтра з’явиться свідок, допишемо нову картку, а не перепишемо вчорашню», — каже вона.',
      },
    ],
    options: [
      {
        id: 'case-audit-finish',
        label: 'Повернутися до розмови про уривки',
        next: 'case-closure-authors',
        grants: ['final_case_evidence_audit_done'],
      },
    ],
  },
];

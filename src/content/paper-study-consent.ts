import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Consent is renewed if Iris has already chosen custody of the manuscripts. */
export const paperStudyConsentOption: DialogueOption = {
  id: 'paper-study-permission',
  label: 'Запитати Айріс, чи можна ще раз розглянути її аркуші',
  next: 'paper-study-permission',
  requires: [
    'final_chapter_evidence_reviewed',
    'final_ledger_scene_complete',
    'final_manuscript_provenance_decided',
  ],
  unless: [
    'final_paper_study_done',
    'final_paper_study_access_declined',
    'final_case_iris_declined',
    'final_letter_breach_disclosed',
    'iris_letter_breach_admitted',
    'iris_letter_pressured_day4',
  ],
};

export const paperStudyConsentNodes: readonly DialogueNode[] = [
  {
    id: 'paper-study-permission',
    speaker: 'Айріс',
    variantSelection: 'authored',
    text: 'Айріс тримає альбом на колінах. «Ти хочеш ще раз порівняти обидва аркуші? Можна, але вони залишаються в мене. П’ять хвилин під лампою, без фотографій і без гучних оголошень». Нора прибирає зі столу чашки. «Я навіть заголовок поки не придумала».',
    textWhen: [
      {
        requires: ['final_case_iris_declined'],
        text: 'Айріс закриває альбом. «Я вже сказала, що не хочу сьогодні знову обговорювати ці папери». Мара ставить перед нею чашку чаю. «Тоді не обговорюємо. У нас ще ціла полиця книжок».',
      },
      {
        requires: ['iris_letter_breach_admitted'],
        text: 'Айріс притискає альбом до себе. «Ти вже сказав, що відкрив мій лист. Сьогодні я не показуватиму інших паперів». Нора відсуває лампу. «Тоді працюватимемо зі своїми нотатками».',
      },
      {
        requires: ['final_letter_breach_disclosed'],
        text: 'Айріс притискає альбом до себе. «Ти вже відкрив лист, який я не дозволяла читати. Сьогодні я не віддам тобі ще й рукопис». Нора відкладає лупу. «Тоді порівняння зачекає».',
      },
      {
        requires: ['iris_letter_pressured_day4'],
        text: '«Учора ти наполягав, щоб я віддала лист. Тепер просиш аркуші». Айріс закриває альбом. «На сьогодні досить». Нора прибирає лупу.',
      },
      {
        requires: ['final_ledger_record_private'],
        text: 'Айріс тримає альбом на колінах. «Аркуші можу показати на п’ять хвилин. Але без фотографій». Нора відсуває блокнот із нотатками. Елеонора не дістає приватний журнал зі шухляди: попередня домовленість залишається чинною.',
      },
    ],
    options: [
      {
        id: 'paper-permission-lend',
        label: 'Прийняти умови Айріс й оглянути аркуші при ній',
        next: 'paper-study',
        unless: [
          'final_letter_breach_disclosed',
          'final_case_iris_declined',
          'iris_letter_breach_admitted',
          'iris_letter_pressured_day4',
        ],
        grants: ['final_paper_iris_lent_originals'],
      },
      {
        id: 'paper-permission-respect',
        label: 'Не наполягати на повторному огляді',
        next: 'paper-study-no-consent',
      },
    ],
  },
  {
    id: 'paper-study-no-consent',
    speaker: 'Мара',
    variantSelection: 'authored',
    text: '«Ну й добре. Я б теж не хотіла, щоб мої чернетки передавали з рук у руки». Мара забирає лампу зі столу. «До речі, хто з вас поклав булочку просто на книжку? Френк, на тебе я дивлюся першого».',
    textWhen: [
      {
        requires: ['final_case_iris_declined'],
        text: 'Айріс залишається з альбомом біля вікна. Анна підсуває їй книжку з дитячими малюнками, не ставлячи запитань. Нора закриває блокнот: без дозволу порівняння не буде.',
      },
      {
        requires: ['iris_letter_breach_admitted'],
        text: 'Айріс залишає альбом у себе. Нора складає чисті картки, так і не розклавши аркуші. Мара підсуває чайник: «Кому ще налити?»',
      },
      {
        requires: ['final_letter_breach_disclosed'],
        text: 'Айріс відходить до вікна з альбомом. Нора не просить другого шансу. Мара прибирає лампу: «Френку, принаймні ти сьогодні нічого не читав без дозволу». Кіт зістрибує зі столу, удаючи, що його це не стосується.',
      },
      {
        requires: ['iris_letter_pressured_day4'],
        text: 'Айріс повертається до своєї книжки. Нора прибирає лампу, а Мара збирає чашки. Ніхто не просить Айріс пояснювати відмову ще раз.',
      },
    ],
    options: [
      {
        id: 'paper-permission-return',
        label: 'Повернутися до гостей без огляду',
        next: 'gathering',
        grants: ['final_paper_study_access_declined'],
      },
    ],
  },
];

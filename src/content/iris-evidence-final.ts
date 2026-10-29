import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Optional day-five investigation: a remembered detail is not permission to use the originals. */
export const irisEvidenceFinalOption: DialogueOption = {
  id: 'final-iris-evidence-topic',
  label: 'Запитати Айріс про дві зірки й число сімнадцять',
  next: 'final-iris-evidence',
  requires: ['iris_quiet_page_discussed', 'iris_margin_note_discussed'],
  unless: ['final_iris_evidence_conversation_done'],
};

export const irisEvidenceFinalNodes: readonly DialogueNode[] = [
  {
    id: 'final-iris-evidence',
    speaker: 'Айріс',
    text: 'Айріс відставляє чашку. «Ти про ті дві зірки? Мама малювала три. А число сімнадцять могло бути номером коробки, сторінки чи днем народження бабусі». Вона поглядає на гостей біля вікна. «Не хочу, щоб до кінця вечора це перетворилося на готову сенсацію».',
    textWhen: [
      {
        requires: ['iris_letter_breach_admitted'],
        text: '«Ми вже говорили про лист». Айріс не відкриває папку. «Ти зізнався, що порушив печатку, але це не означає, що я готова дати тобі ще й мамині аркуші. Якщо хочеш говорити — говорімо про те, що ти зробиш із власними нотатками».',
      },
      {
        requires: ['opened_private_letter'],
        text: 'Айріс тримає папку закритою. «Ти бачив більше, ніж я дозволяла. Зараз я не обговорюватиму з тобою нові докази». Вона поправляє підпис під малюнком. «Але ти можеш вирішити, що робити зі своїми припущеннями».',
      },
      {
        requires: ['iris_letter_pressured_day4'],
        text: '«Ти вчора наполягав, щоб я передала лист Лео. Сьогодні не хочу ще однієї розмови, у якій мої відповіді вже вирішили за мене». Айріс прибирає олівець. «Про рукопис поки досить».',
      },
      {
        requires: ['final_letter_breach_disclosed'],
        text: 'Айріс не відпускає папку з рук. «Ми вже з’ясували, що лист відкрили без мене. Тепер я сама вирішу, кому показувати аркуші». Вона киває на блокнот. «А твої здогади залишаються твоєю відповідальністю».',
      },
      {
        requires: ['final_case_iris_declined'],
        text: '«Я вже сказала, що сьогодні не досліджуватиму рукопис». Айріс ставить чашку ближче до себе. «Можемо не робити з цього ще одну сцену при гостях?»',
      },
    ],
    options: [
      {
        id: 'final-iris-evidence-ask',
        label: '«Можемо перевірити лише загальнодоступні записи, без твоїх аркушів?»',
        next: 'final-iris-evidence-source',
        unless: [
          'opened_private_letter',
          'iris_letter_breach_admitted',
          'iris_letter_pressured_day4',
          'final_letter_breach_disclosed',
          'final_case_iris_declined',
        ],
      },
      {
        id: 'final-iris-evidence-private',
        label: '«Залишу свої припущення в особистому блокноті»',
        next: 'final-iris-evidence-private',
        grants: ['final_iris_evidence_private_notes'],
      },
      {
        id: 'final-iris-evidence-rumor',
        label: '«А якщо сказати гостям, що коробку сімнадцять уже знайшли?»',
        next: 'final-iris-evidence-rumor',
        grants: ['final_iris_evidence_rumor_seeded'],
      },
      {
        id: 'final-iris-evidence-accountability',
        label: '«Я відкрив лист без дозволу. Можу виправити те, що зробив?»',
        next: 'final-iris-evidence-accountability',
        requires: ['iris_letter_breach_admitted'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-accountability',
    speaker: 'Айріс',
    text: '«Ти вже вибачався. Я почула». Айріс обережно закриває альбом. «Але мені досі неприємно, що хтось читав мої слова раніше за мене. Якщо хочеш щось виправити, не розповідай іншим, що там було».',
    options: [
      {
        id: 'final-iris-evidence-own-to-nora',
        label: 'Сказати Норі лише про порушену печатку, без змісту листа',
        next: 'final-iris-evidence-accountability-result',
        grants: ['final_iris_evidence_breach_owned_with_nora'],
      },
      {
        id: 'final-iris-evidence-stop-asking',
        label: '«Я більше не проситиму в тебе жодних паперів»',
        next: 'final-iris-evidence-accountability-result',
        grants: ['final_iris_evidence_breach_boundary_kept'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-accountability-result',
    speaker: 'Айріс',
    text: '«Гаразд». Вона повертається до гостей. Розмова не стала легшою, але принаймні цього разу ти не просив її нічого віддати.',
    textWhen: [
      {
        requires: ['final_iris_evidence_breach_owned_with_nora'],
        text: 'Нора підходить із книжкою в руках. Ти кажеш лише, що відкрив чужий лист без дозволу, і просиш не користуватися жодними твоїми нотатками з нього. Нора коротко киває. Айріс не дякує і не пробачає — вона просто повертається до гостей.',
      },
      {
        requires: ['final_iris_evidence_breach_boundary_kept'],
        text: '«Тоді на сьогодні досить», — каже Айріс. Вона поправляє картку біля малюнка. «Можеш допомогти Марі з чашками. Вона вже втретє намагається забрати їх у Френка».',
      },
    ],
    options: [
      {
        id: 'final-iris-evidence-accountability-back',
        label: 'Повернутися до вечора читання',
        next: 'gathering',
        grants: ['final_iris_evidence_conversation_done'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-source',
    speaker: 'Айріс',
    text: '«Можна спитати Нору, чи є в старому каталозі згадка про майстерню. Але мою листівку й мамині аркуші нікому не передавай». Айріс малює на серветці три крихітні зірки. «Оце я пам’ятаю точно. А от чому на знайденому аркуші дві — ні».',
    options: [
      {
        id: 'final-iris-evidence-catalog',
        label: 'Попросити Нору перевірити лише відкритий каталог',
        next: 'final-iris-evidence-result',
        grants: ['final_iris_evidence_public_catalog_requested'],
      },
      {
        id: 'final-iris-evidence-uncertain',
        label: 'Записати дві зірки як питання, а не доказ авторства',
        next: 'final-iris-evidence-result',
        grants: ['final_iris_evidence_uncertainty_recorded'],
      },
      {
        id: 'final-iris-evidence-wait',
        label: '«Не поспішаймо. Нора ще встигне перевірити це пізніше»',
        next: 'final-iris-evidence-result',
        grants: ['final_iris_evidence_check_deferred'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-private',
    speaker: 'Айріс',
    text: '«Добре». Вона бере з тарілки печиво й ламає навпіл. «Тільки не пиши там “мамина рука”. Ми ще цього не знаємо. Якщо колись знайдеться справжній опис коробок, я сама вирішу, чи хочу його побачити».',
    options: [
      {
        id: 'final-iris-evidence-private-back',
        label: 'Повернутися до вечора читання',
        next: 'gathering',
        grants: ['final_iris_evidence_conversation_done'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-rumor',
    speaker: 'Айріс',
    text: '«Ні. Не знайшли». Айріс відповідає тихо, але Нора за сусіднім столом обертається. «Ми знаємо лише, що на одному аркуші написано сімнадцять. Якщо ти зараз скажеш людям про коробку, завтра хтось уже шукатиме в мене вдома решту».',
    options: [
      {
        id: 'final-iris-evidence-rumor-own',
        label: '«Ти права. Не стану видавати припущення за факт»',
        next: 'final-iris-evidence-rumor-result',
        grants: ['final_iris_evidence_rumor_withdrawn'],
      },
      {
        id: 'final-iris-evidence-rumor-deflect',
        label: '«Але людям усе одно буде цікаво»',
        next: 'final-iris-evidence-rumor-result',
        grants: ['final_iris_evidence_rumor_defended'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-rumor-result',
    speaker: 'Айріс',
    text: '«Цікавість не робить історію правдивою». Айріс забирає папку й іде до столу з дитячими книжками. Мара підсуває їй вільний стілець. Розмова закінчилася раніше, ніж ти очікував.',
    textWhen: [
      {
        requires: ['final_iris_evidence_rumor_withdrawn'],
        text: '«Добре, що ми зупинилися до того, як хтось це повторив». Айріс кладе папку під стілець. «Але, будь ласка, не перевіряй мою довіру ще одним здогадом». Вона повертається до дитячих книжок.',
      },
      {
        requires: ['final_iris_evidence_rumor_defended'],
        text: '«Нехай цікавляться книжкою, яку ми читаємо сьогодні». Айріс забирає папку. Нора чує кінець розмови, але не втручається. Біля столу Мара звільняє для Айріс місце.',
      },
    ],
    options: [
      {
        id: 'final-iris-evidence-rumor-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_iris_evidence_conversation_done'],
      },
    ],
  },
  {
    id: 'final-iris-evidence-result',
    speaker: 'Айріс',
    text: '«Тоді поки так». Вона забирає серветку із зірками. «Якщо Нора щось знайде, хай скаже спершу мені. Не хочу дізнатися про мамину майстерню з оголошення на дверях».',
    textWhen: [
      {
        requires: ['final_iris_evidence_public_catalog_requested'],
        text: 'Нора приносить старий каталог і проводить пальцем по списку майстерень. «Адреса є. А от про коробку сімнадцять — жодного слова». Айріс заглядає через плече. «От і добре. Маємо адресу для перевірки, а не відповідь на всю історію».',
      },
      {
        requires: ['final_iris_evidence_uncertainty_recorded'],
        text: 'Ти пишеш у блокноті: «дві зірки на аркуші, три на листівці; авторство не встановлено». Айріс читає запис і киває. «Так я хоча б упізнаю власні слова, якщо колись повернемося до цієї розмови».',
      },
      {
        requires: ['final_iris_evidence_check_deferred'],
        text: '«Дякую». Айріс складає серветку й ховає в кишеню. «Нора все одно сьогодні зайнята суперечкою про фінал детективу. І, здається, програє». З-за столу долинає її обурене: «Я не програю!»',
      },
    ],
    options: [
      {
        id: 'final-iris-evidence-result-back',
        label: 'Повернутися до читання',
        next: 'gathering',
        grants: ['final_iris_evidence_conversation_done'],
      },
    ],
  },
];

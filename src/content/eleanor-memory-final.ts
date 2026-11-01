import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * The former bookseller can clarify her own memories, not grant access to Iris's papers
 * or turn an incomplete repair log into proof of a missing caller.
 */
export const eleanorMemoryFinalOption: DialogueOption = {
  id: 'final-eleanor-memory-topic',
  label: 'Поговорити з Елеонорою про старі записи й затоплення',
  next: 'final-eleanor-memory',
  requires: ['eleanor_timeline_checked'],
  unless: ['final_eleanor_memory_done'],
};

export const eleanorMemoryFinalNodes: readonly DialogueNode[] = [
  {
    id: 'final-eleanor-memory',
    speaker: 'Елеонора',
    text: 'Елеонора відкладає чашку біля каси. «Пам’ятаєш картку бронювання? Я стільки разів переповідала той день, що вже й сама плутаю, що бачила, а що почула потім». Елеонора поправляє синю стрічку на ключі. «Під час затоплення я переважно носила відра. Що хочеш уточнити?»',
    textWhen: [
      {
        requires: ['eleanor_timeline_assumed_guilt'],
        text: '«Ти вже припускав, що я навмисно сховала бронювання Лео». Елеонора дивиться прямо на тебе. «Я тоді розсердилася. І зараз не радію цьому питанню. Але якщо хочеш звірити записи — звіряймо записи, а не мої нібито наміри».',
      },
      {
        requires: ['eleanor_timeline_kept_uncertainty'],
        text: '«Я залишила ту картку: що ми знаємо, а чого не знаємо». Елеонора дістає її з кишені. «Тут чимало порожнього. Нехай так і буде, доки не знайдемо записи».',
      },
    ],
    options: [
      {
        id: 'final-eleanor-memory-dates',
        label: '«Що саме доводять дати в журналі?»',
        next: 'final-eleanor-memory-dates',
      },
      {
        id: 'final-eleanor-memory-box',
        label: '«А що було з коробками після затоплення?»',
        next: 'final-eleanor-memory-box',
      },
      {
        id: 'final-eleanor-memory-people',
        label: '«Хто ще пам’ятає той день?»',
        next: 'final-eleanor-memory-people',
      },
      {
        id: 'final-eleanor-memory-leave',
        label: '«Не будемо сьогодні знову про папери»',
        next: 'final-eleanor-memory-leave',
        grants: ['final_eleanor_memory_evening_respected'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-dates',
    speaker: 'Елеонора',
    text: '«Бронювання внесли до затоплення. А ось запис, що того дня книгарню зачинили». Елеонора кладе документи поруч. «Про дзвінок Лео тут нічого немає. Не пам’ятаю навіть, чи працював тоді телефон. Тому й не скажу, що йому телефонували — або що не телефонували».',
    options: [
      {
        id: 'final-eleanor-memory-record-gap',
        label: '«Запишімо окремо факти й те, чого не знаємо»',
        next: 'final-eleanor-memory-dates-result',
        grants: ['final_eleanor_memory_gap_recorded'],
      },
      {
        id: 'final-eleanor-memory-accuse',
        label: '«Скажу гостям, що ви приховали дзвінок»',
        next: 'final-eleanor-memory-dates-result',
        grants: ['final_eleanor_memory_public_accusation'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-dates-result',
    speaker: 'Елеонора',
    text: 'Елеонора проводить пальцем по порожньому рядку. «Більше в цьому журналі нічого немає».',
    textWhen: [
      {
        requires: ['final_eleanor_memory_gap_recorded'],
        text: '«Оце чесна картка». Елеонора пише: «Дзвінок — не підтверджено». «Якщо Лео колись захоче поговорити, покажу йому обидва записи. А поки покладу їх до теки, де вони не загубляться між рецептами Мари».',
      },
      {
        requires: ['final_eleanor_memory_public_accusation'],
        text: '«Ти можеш так сказати. Але це буде неправда: ми не знаємо, чи був дзвінок». Елеонора забирає журнал. «Я не дам тобі його для оголошення. І не проситиму Лео спростовувати те, чого він не чув». Вона повертається до гостей.',
      },
    ],
    options: [
      {
        id: 'final-eleanor-memory-dates-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_eleanor_memory_done'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-box',
    speaker: 'Елеонора',
    text: '«Мокрі книжки складали в коробки від чаю. У журналі є коробка сімнадцять». Елеонора проводить пальцем по рядку. «Але чи має вона стосунок до числа на аркуші — гадки не маю. Пам’ятаю, Нора принесла фен сушити обкладинки. Ми ним спалили подовжувач».',
    textWhen: [
      {
        requires: ['final_ledger_record_private'],
        text: '«У журналі є згадка про коробки після затоплення. Але це не привід діставати приватні записи». Елеонора відсуває теку. «Айріс вирішить сама, чи хоче бачити оригінали. А я можу розповісти, як ми сушили обкладинки між рушниками».',
      },
    ],
    options: [
      {
        id: 'final-eleanor-memory-box-private',
        label: '«Не будемо чіпати чужі оригінали»',
        next: 'final-eleanor-memory-box-result',
        grants: ['final_eleanor_memory_privacy_kept'],
      },
      {
        id: 'final-eleanor-memory-box-ask',
        label: '«Можете запитати Айріс, чи вона хоче побачити опис?»',
        next: 'final-eleanor-memory-box-result',
        grants: ['final_eleanor_memory_permission_suggested'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-box-result',
    speaker: 'Елеонора',
    text: 'Елеонора зав’язує синю стрічку на теці й ставить її під стіл.',
    textWhen: [
      {
        requires: ['final_eleanor_memory_privacy_kept'],
        text: '«Домовилися». Елеонора кладе теку до шухляди. «Зараз краще допоможи мені знайти другу тарілку. Міллер уже взяла останню й удає, що не помічає».',
      },
      {
        requires: ['final_eleanor_memory_permission_suggested'],
        text: '«Я можу запитати. Але не сьогодні при всіх». Елеонора закриває теку. «Якщо Айріс скаже ні, то ні. І навіть якщо погодиться, спершу говоритиму з нею, а не з цілим Беллвіком».',
      },
    ],
    options: [
      {
        id: 'final-eleanor-memory-box-back',
        label: 'Повернутися до вечора читання',
        next: 'gathering',
        grants: ['final_eleanor_memory_done'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-people',
    speaker: 'Елеонора',
    text: '«Нора допомагала переносити коробки. Мара принесла пиріг — тарілок тоді не знайшлося, їли руками. А майстер, що лагодив проводку, згодом переїхав до Грейфорда». Елеонора зітхає. «Можемо запитати їх. Тільки не дивуйся, якщо кожен запам’ятав своє».',
    options: [
      {
        id: 'final-eleanor-memory-witness',
        label: '«Можна запитати про проводку, не про чужі листи»',
        next: 'final-eleanor-memory-people-result',
        grants: ['final_eleanor_memory_witness_lead'],
      },
      {
        id: 'final-eleanor-memory-tea',
        label: '«А що це був за пиріг?»',
        next: 'final-eleanor-memory-people-result',
        grants: ['final_eleanor_memory_pie_story'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-people-result',
    speaker: 'Елеонора',
    text: 'Елеонора підсовує до себе чашку, в якій давно охолов чай.',
    textWhen: [
      {
        requires: ['final_eleanor_memory_witness_lead'],
        text: '«Можу знайти стару адресу майстра. Тільки не обіцяю, що він згадає телефон». Елеонора усміхається. «Він і тоді забував, де залишив інструменти. Одного разу ми знайшли викрутку в коробці з поезією».',
      },
      {
        requires: ['final_eleanor_memory_pie_story'],
        text: '«Грушевий. Мара переплутала сіль і цукор, але сказала, що так задумано». Елеонора сміється вже голосніше. «Ми все з’їли. Мені здається, відтоді вона й не дозволяє нікому стояти поруч, коли пече».',
      },
    ],
    options: [
      {
        id: 'final-eleanor-memory-people-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_eleanor_memory_done'],
      },
    ],
  },
  {
    id: 'final-eleanor-memory-leave',
    speaker: 'Елеонора',
    text: '«І добре». Елеонора ставить на стіл дві чашки. «Краще допоможи знайти кришку від чайника. Френк щойно зіштовхнув зі столу серветки, і я тепер нічого не бачу». За спиною пані Міллер обурено каже: «Я б цей фінал переписала!»',
    options: [
      {
        id: 'final-eleanor-memory-leave-back',
        label: 'Посміятися й повернутися до гостей',
        next: 'gathering',
        grants: ['final_eleanor_memory_done'],
      },
    ],
  },
];

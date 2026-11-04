import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Leo's career callback can happen even if the player avoided the main case. */
export const leoNightCourseFinalOption: DialogueOption = {
  id: 'final-leo-night-course',
  label: '«Лео, що сталося з курсом у Грейфорді?»',
  next: 'final-leo-night-course',
  requires: ['leo_night_course_discussed'],
  unless: ['final_leo_night_course_done'],
};

export const leoNightCourseFinalNodes: readonly DialogueNode[] = [
  {
    id: 'final-leo-night-course',
    speaker: 'Лео',
    text: 'Лео гортає атлас старих вокзалів біля вікна. «У Грейфорді ще приймають заявки. Гарріс питає, чого я весь час дивлюся на календар». Він закриває книжку. «Бо табло я вже вивчив напам’ять. Йому ця відповідь не сподобалася».',
    textWhen: [
      {
        requires: ['leo_night_course_application_planned'],
        text: '«Я надіслав заявку в середу. Відповіді поки немає». Лео кладе телефон у кишеню. «Гарріс уже нагадав про дві вечірні зміни. Знаю, що треба домовлятися. Просто хотів спочатку натиснути “надіслати”, інакше переписував би її до зими».',
      },
      {
        requires: ['leo_night_course_shift_request_planned'],
        text: '«Джун може підмінити мене одного вечора, не двох. У неї свої заняття». Лео розгортає розклад. «У понеділок покажу Гаррісу, як можна переставити зміни. Він обіцяв подивитися. Це ще не згода, але вже розмова».',
      },
      {
        requires: ['leo_night_course_deferred'],
        text: 'Лео дістає з сумки роман про морський маяк, заклавши сторінку старим квитком. «Я не подав заявку. У суботу їздив до моря. На станції купив каву, яка смакувала мокрим картоном. Зате не перевіряв жодного розкладу». Він усміхається. «Про наступний набір подумаю пізніше. Цього разу мені вистачило поїздки».',
      },
    ],
    options: [
      {
        id: 'final-leo-course-ask-jun',
        label: '«А Джун що сказала?»',
        next: 'final-leo-night-course-jun',
      },
      {
        id: 'final-leo-course-ask-book',
        label: '«І яку книжку ти взяв із собою?»',
        next: 'final-leo-night-course-book',
      },
      {
        id: 'final-leo-course-no-questions',
        label: '«Не затримуватиму тебе розпитуваннями»',
        next: 'gathering',
        grants: ['final_leo_night_course_done', 'final_leo_course_space_respected'],
      },
    ],
  },
  {
    id: 'final-leo-night-course-jun',
    speaker: 'Лео',
    text: '«Джун сказала: “Надішли вже ту заявку, бо я встигну вийти на пенсію, поки ти підбираєш слова”». Лео усміхається. «І попросила не вписувати її в розклад без запитання. Я пообіцяв».',
    textWhen: [
      {
        requires: ['leo_night_course_shift_request_planned'],
        text: '«Джун сказала, що один вечір підмінить, а другий — ні. У неї заняття». Лео ховає олівець. «І правильно. Ми навіть склали нову таблицю, щоб Гарріс не міг сказати, ніби не розібрався. Хоча він усе одно спробує».',
      },
      {
        requires: ['leo_night_course_deferred'],
        text: '«Джун попросила привезти їй листівку з моря». Лео показує синій конверт. «Я купив дві. Одну для неї, а другу — собі, щоб наступного разу не забути, як виглядає вихідний».',
      },
    ],
    options: [
      {
        id: 'final-leo-course-jun-next',
        label: '«А тобі самому що зараз потрібно?»',
        next: 'final-leo-night-course-choice',
      },
      {
        id: 'final-leo-course-jun-back',
        label: '«Добре, повернімося до гостей»',
        next: 'gathering',
        grants: ['final_leo_night_course_done', 'final_leo_course_space_respected'],
      },
    ],
  },
  {
    id: 'final-leo-night-course-book',
    speaker: 'Лео',
    text: '«Атлас старих вокзалів. У ньому є сторінка про Грейфорд: на фотографії 1932 року біля входу стоїть автомат із гарячим шоколадом». Лео зітхає. «Автомат прибрали, а сходи залишилися. Я перевіряв. Шоколад був би кориснішим».',
    textWhen: [
      {
        requires: ['leo_night_course_deferred'],
        text: '«Роман про морський маяк. Я дочитав половину, поки чекав зворотного потяга». Лео усміхається. «Не скажу, чим закінчилося. Там ще двісті сторінок, і я поки підозрюю всіх, включно з чайкою».',
      },
    ],
    options: [
      {
        id: 'final-leo-course-book-next',
        label: '«То що тепер робитимеш?»',
        next: 'final-leo-night-course-choice',
      },
      {
        id: 'final-leo-course-book-back',
        label: '«Залишу тобі книжку й тишу»',
        next: 'gathering',
        grants: ['final_leo_night_course_done', 'final_leo_course_space_respected'],
      },
    ],
  },
  {
    id: 'final-leo-night-course-choice',
    speaker: 'Лео',
    text: '«Спочатку розберуся з наступним тижнем. У нас інвентаризація, а я вже двічі загубив свій список». Лео дивиться на полицю з блокнотами. «Мені б щось, куди записувати справи, перш ніж знову все переплутати».',
    textWhen: [
      {
        requires: ['leo_night_course_deferred'],
        text: '«Поки дочитаю роман і віддам Джун листівку». Лео кладе книжку на прилавок. «Але список того, що хочу вивчити, нікуди не подівся. Просто цього тижня я не збираюся змагатися з годинником».',
      },
    ],
    options: [
      {
        id: 'final-leo-course-notebook',
        label: '«Можу відкласти тобі невеликий блокнот для навчання»',
        next: 'final-leo-night-course-result',
        grants: ['final_leo_course_notebook_offered'],
      },
      {
        id: 'final-leo-course-space',
        label: '«Тоді не заважатиму тобі вирішувати»',
        next: 'final-leo-night-course-result',
        grants: ['final_leo_course_space_respected'],
      },
    ],
  },
  {
    id: 'final-leo-night-course-result',
    speaker: 'Лео',
    text: '«Домовилися». Лео поправляє книжку на столі. «А зараз я краще допоможу з чашками. Тут принаймні все зрозуміло: порожні — до мийки, повні — до Мари».',
    textWhen: [
      {
        requires: ['final_leo_course_notebook_offered'],
        text: '«Відклади, будь ласка. Тільки без напису “Великі плани Лео” на обкладинці». Він сміється. «Джун побачить і негайно додасть туди графік чергувань». Лео обирає тонкий синій блокнот і кладе біля каси гроші. «Нехай буде звичайний. Це вже добре».',
      },
      {
        requires: ['final_leo_course_space_respected'],
        text: '«Дякую». Лео прибирає телефон. «Піду допоможу Елеонорі з чашками. Вона щойно назвала мою роботу “пересувати поїзди, як книжки на полиці”. Я маю їй дещо пояснити».',
      },
    ],
    options: [
      {
        id: 'final-leo-course-return',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_leo_night_course_done'],
      },
    ],
  },
];

import type { DialogueStory } from '../game/dialogue';
import { leoNightCourseNodes, leoNightCourseOption } from './leo-night-course';

/** День другий: Лео має власне життя й не є нагородою за розгадану таємницю. */
export const leoVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'Надвечір дзвіночок над дверима дзенькає вдруге. Чоловік у темному пальті зупиняється біля полиці з дорожніми книжками. На його рукаві — маленька латка у формі потяга.',
      options: [
        { id: 'greet', label: '«Добрий вечір. Шукаєте щось про подорожі?»', next: 'greet' },
      ],
    },
    {
      id: 'greet',
      speaker: 'Лео',
      text: '«Я Лео. Працюю на залізниці. Іноді заходжу в книгарні, щоб нагадати собі: у світі існують історії без розкладу». Він усміхається. «Хоча це трохи лякає».',
      textWhen: [
        {
          requires: ['leo_mara_platform_idea_heard'],
          text: 'Лео показує складений аркуш. «Я таки запросив Мару послухати музику на станції. Вона запитала, чи можна принести булочки. Звісно, можна. Тепер я хвилююся більше, ніж перед перевіркою колій».',
        },
        {
          requires: ['leo_honesty_discussed'],
          text: 'Лео проводить пальцем по корінцях книжок. «Я ще думаю над тим, що сказати Марі. Цього разу хоча б не репетирую розмову перед дзеркалом». Він усміхається. «А от на роботі сьогодні знову затримали потяг».',
        },
        {
          requires: ['leo_reflected_on_uncertainty'],
          text: "Лео кладе на прилавок зім'ятий розклад. «Два потяги запізнилися, один прибув раніше. Мій улюблений день». Він знизує плечима. «Може, знайдеться книжка, де все ще гірше?».",
        },
      ],
      options: [
        { id: 'leo-schedule', label: '«Розкажеш, як минула зміна на залізниці?»', next: 'trains' },
        {
          id: 'leo-station-funny',
          label: '«Яка найдивніша річ губилася у ваших потягах?»',
          next: 'leo-station-funny',
        },
        {
          id: 'leo-platform-music',
          label: '«А що люди слухають на пероні, коли чекають потяг?»',
          next: 'leo-platform-music',
        },
        {
          id: 'leo-books',
          label: '«Що тобі подобається в Беллвіку, крім залізниці?»',
          next: 'town',
        },
        {
          id: 'leo-reflection',
          label: '«А що робиш, коли потяг запізнюється й план летить шкереберть?»',
          next: 'leo-reflection',
          unless: ['leo_reflected_on_uncertainty'],
        },
        {
          id: 'leo-honest-talk',
          label: '«Ти завжди так довго збираєшся сказати важливе?»',
          next: 'leo-honest-talk',
          unless: ['leo_honesty_discussed'],
        },
        { id: 'mara', label: '«Ви знайомі з Марою з пекарні?»', next: 'mara' },
        {
          id: 'letter',
          label: '«Я знайшов старий лист на ваше ім’я»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        {
          id: 'finish',
          label: '«Можете спокійно оглянути полиці»',
          next: 'end',
          repeatability: 'repeatable',
        },
      ],
    },
    {
      id: 'trains',
      speaker: 'Лео',
      text: '«Передбачуваність. Ти знаєш, де маєш бути. А потім на колії з’являється туман — і розумієш, що навіть точний розклад не пояснює всього».',
      options: [
        { id: 'trains-follow', label: '«А куди ви самі хотіли б поїхати?»', next: 'journey' },
        leoNightCourseOption,
        { id: 'trains-back', label: '«Про що ще поговоримо?»', next: 'greet' },
      ],
    },
    {
      id: 'journey',
      speaker: 'Лео',
      text: '«На море взимку. Мара каже, там пахне свободою, а я підозрюю — мокрими рукавицями. Ми досі сперечаємося. Мабуть, доведеться перевірити разом».',
      options: [
        {
          id: 'journey-back',
          label: '«Гарний план»',
          next: 'greet',
          grants: ['leo_shared_future_plan'],
        },
      ],
    },
    {
      id: 'mara',
      speaker: 'Лео',
      text: '«Так. Вона пам’ятає, як я люблю чай, хоча сама п’є каву, міцнішу за локомотив. І сміється з моїх списків. Добре, коли поруч є людина, з якою можна бути трохи смішним».',
      options: [
        {
          id: 'mara-book',
          label: '«Вона шукала для вас книжку»',
          next: 'gift',
          requires: ['mara_talked_about_leo'],
        },
        {
          id: 'gift-station',
          label: '«Здається, їй трапилася історія про стару станцію»',
          next: 'gift-station',
          requires: ['sold_station'],
        },
        {
          id: 'gift-roads',
          label: '«Вона вибрала книжку про мапи та дороги»',
          next: 'gift-roads',
          requires: ['sold_roads'],
        },
        {
          id: 'gift-letters',
          label: '«Їй сподобався роман у листах»',
          next: 'gift-letters',
          requires: ['sold_letters'],
        },
        { id: 'mara-back', label: '«Звучить тепло»', next: 'greet' },
      ],
    },
    {
      id: 'gift',
      speaker: 'Лео',
      text: '«Справді?» Він ховає усмішку. «Тоді я зроблю вигляд, що нічого не знаю. Вона страшенно не любить, коли сюрпризи псують».',
      options: [
        {
          id: 'gift-back',
          label: '«Збережу таємницю»',
          next: 'greet',
          grants: ['leo_respected_mara_surprise'],
        },
      ],
    },
    {
      id: 'gift-station',
      speaker: 'Лео',
      text: '«Стара станція?» Його очі світлішають. «Мара знає, що я можу годинами говорити про забуті колії. Але я краще не питатиму назви. Хочу, щоб вона сама вручила подарунок».',
      options: [
        {
          id: 'gift-station-back',
          label: '«Залишимо сюрприз Марі»',
          next: 'greet',
          grants: ['leo_respected_mara_surprise'],
        },
      ],
    },
    {
      id: 'gift-roads',
      speaker: 'Лео',
      text: '«Мапи?» Він сміється. «Вона постійно каже, що ми повинні хоча б раз поїхати кудись без плану. Може, ця книжка — її спосіб мене підготувати».',
      options: [
        {
          id: 'gift-roads-back',
          label: '«Не псуватиму несподіванку»',
          next: 'greet',
          grants: ['leo_respected_mara_surprise'],
        },
      ],
    },
    {
      id: 'gift-letters',
      speaker: 'Лео',
      text: '«Листи...» Він на мить замислюється. «Мара вміє знаходити історії, після яких хочеться говорити чесніше. Сподіваюся, я теж навчився слухати».',
      options: [
        {
          id: 'gift-letters-back',
          label: '«Нехай вона сама розповість про книжку»',
          next: 'greet',
          grants: ['leo_respected_mara_surprise'],
        },
      ],
    },
    {
      id: 'town',
      speaker: 'Лео',
      text: '«Майже все життя. У двадцять років думав, що поїду назавжди. Тепер думаю, що іноді залишитися — теж рішення. Але це не означає, що я ніколи не шкодував про інші».',
      options: [
        { id: 'town-follow', label: '«Про що шкодуєте?»', next: 'past' },
        { id: 'town-respect', label: '«Не обов’язково відповідати»', next: 'respect' },
      ],
    },
    {
      id: 'past',
      speaker: 'Лео',
      text: '«Про розмови, яких не було. Одного разу я так і не зрозумів, чому людина поїхала, не попрощавшись. Але тепер не хочу будувати життя навколо питання, на яке не знаю відповіді».',
      options: [
        {
          id: 'past-back',
          label: '«Дякую, що поділилися»',
          next: 'greet',
          grants: ['leo_spoke_about_past'],
        },
      ],
    },
    {
      id: 'respect',
      speaker: 'Лео',
      text: '«Дякую. Люди в Беллвіку іноді плутають цікавість із турботою». Він поправляє книжку на полиці.',
      options: [{ id: 'respect-back', label: '«Повернімося до книжок»', next: 'greet' }],
    },
    {
      id: 'letter',
      speaker: 'Лео',
      text: '«Лист?» Він уважно дивиться на вас. «Звідки він? І чому ви вирішили сказати мені зараз?» Його голос рівний, але він більше не розглядає полиці.',
      options: [
        {
          id: 'letter-privacy',
          label: '«Спершу я хочу з’ясувати, чи можу його передати»',
          next: 'privacy',
          grants: ['leo_letter_disclosed_carefully'],
        },
        {
          id: 'letter-pressure',
          label: '«Вам треба негайно його прочитати»',
          next: 'pressure',
          grants: ['leo_letter_pressured'],
        },
      ],
    },
    {
      id: 'privacy',
      speaker: 'Лео',
      text: '«Розумію. Я не хочу, щоб хтось вирішував за мене — чи за людину, яка його написала. Якщо лист справді мій, поговорімо про це тоді, коли всі будуть готові».',
      options: [{ id: 'privacy-end', label: '«Домовилися»', next: 'end' }],
    },
    {
      id: 'pressure',
      speaker: 'Лео',
      text: '«Можливо. Але ви не знаєте, що я маю робити зі своїм минулим». Він відступає від прилавка. «Мені потрібен час».',
      options: [{ id: 'pressure-end', label: 'Не наполягати', next: 'end' }],
    },
    {
      id: 'leo-station-funny',
      speaker: 'Лео',
      text: '«Величезний картонний місяць. Хтось віз декорації до шкільної вистави й залишив його в останньому вагоні». Лео усміхається. «Черговий написав у журналі: “Знайдено небесне тіло”. Начальник попросив уточнити, чи воно небезпечне».',
      options: [
        {
          id: 'leo-station-funny-boss',
          label: '«І що ти відповів начальнику?»',
          next: 'leo-station-funny-boss',
        },
        {
          id: 'leo-station-funny-back',
          label: '«Місяць хоч повернули?»',
          next: 'leo-station-funny-back',
        },
      ],
    },
    {
      id: 'leo-station-funny-boss',
      speaker: 'Лео',
      text: '«Що небезпечний тільки для тих, хто забув текст ролі». Лео дивиться у вікно. «Увечері прибігла вчителька й забрала його. Здається, діти навіть не помітили пропажі».',
      options: [
        {
          id: 'leo-station-funny-boss-return',
          label: 'Повернутися до книжок',
          next: 'greet',
          grants: ['leo_station_moon_story_heard'],
        },
      ],
    },
    {
      id: 'leo-station-funny-back',
      speaker: 'Лео',
      text: '«Так. Із записом у журналі: “Місяць повернуто власнику”». Він усміхається. «У нас рідко бувають такі красиві звіти».',
      options: [
        {
          id: 'leo-station-funny-return',
          label: 'Повернутися до книжок',
          next: 'greet',
          grants: ['leo_station_moon_story_heard'],
        },
      ],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Лео виходить на вулицю. Дзвіночок над дверима стихає, а ви помічаєте, що він акуратно повернув усі книжки на свої місця.',
      options: [],
    },
    {
      id: 'leo-honest-talk',
      speaker: 'Лео',
      text: '«Коли відкладаєш розмову, щоб не зробити гірше, це обережність. А коли відкладаєш її десятий раз — вже не впевнений».',
      options: [
        { id: 'leo-honest-ask', label: '«Що саме ти відкладаєш?»', next: 'leo-honest-specific' },
        {
          id: 'leo-honest-respect',
          label: '«Можемо не говорити про особисте»',
          next: 'leo-honest-end',
        },
      ],
    },
    {
      id: 'leo-honest-specific',
      speaker: 'Лео',
      text: '«Мара вміє запитати прямо: ти сьогодні зі мною чи знову складаєш план? А я відповідаю, що втомився. Це правда. Тільки не вся. Іноді боюся, що моя розгубленість її образить».',
      options: [
        {
          id: 'leo-specific-care',
          label: '«Може, вона хоче почути тебе, а не план?»',
          next: 'leo-honest-objection',
        },
        {
          id: 'leo-specific-privacy',
          label: '«Не все потрібно розповідати відразу»',
          next: 'leo-honest-objection',
        },
      ],
    },
    {
      id: 'leo-honest-objection',
      speaker: 'Лео',
      text: '«А якщо щирість — просто спосіб перекласти тривогу на іншу людину? Сказати “мені важко”, а потім чекати, що вона мене заспокоїть? Я так теж не хочу».',
      options: [
        {
          id: 'leo-objection-boundary',
          label: '«Можна говорити без вимоги негайної відповіді»',
          next: 'leo-honest-attempt',
        },
        {
          id: 'leo-objection-delay',
          label: '«Можна спершу зрозуміти, чого хочеш від розмови»',
          next: 'leo-honest-attempt',
        },
      ],
    },
    {
      id: 'leo-honest-attempt',
      speaker: 'Лео',
      text: '«Тоді я сказав би: я зараз не знаю, як пояснити деякі речі. Але не хочу вдавати, що все просто. І не прошу тебе розв’язати це за мене». Він пробує вимовити фразу ще раз, тихіше.',
      options: [
        {
          id: 'leo-attempt-real',
          label: '«Це чесніше за готову промову»',
          next: 'leo-honest-choice',
        },
        {
          id: 'leo-attempt-ask',
          label: '«А якщо вона не захоче слухати?»',
          next: 'leo-honest-choice',
        },
      ],
    },
    {
      id: 'leo-honest-choice',
      speaker: 'Лео',
      text: '«Тоді я маю почути і це. Раніше думав, що правильні слова гарантують правильний результат. Тепер підозрюю, що вони лише дають людині право відповісти по-своєму».',
      options: [
        { id: 'leo-choice-finish', label: '«Можна почати з цього»', next: 'leo-honest-end' },
        { id: 'leo-choice-time', label: '«І можна не поспішати»', next: 'leo-honest-end' },
      ],
    },
    {
      id: 'leo-honest-end',
      speaker: 'Лео',
      text: '«Дякую. Не обіцяю, що сьогодні стану найвідвертішим у місті. Але наступного разу спробую не ховатися за розкладом».',
      options: [
        {
          id: 'leo-honest-return',
          label: '«Повернімося до книжок»',
          next: 'greet',
          grants: ['leo_honesty_discussed'],
        },
      ],
    },
    {
      id: 'leo-reflection',
      speaker: 'Лео',
      text: '«Я вмію чекати на потяг, але не завжди вмію чекати на відповідь людини».',
      options: [
        {
          id: 'leo-reflect-question',
          label: '«І що ти робиш, коли вже нічого не можна змінити?»',
          next: 'leo-reflection-deep',
        },
        {
          id: 'leo-reflect-return',
          label: '«Дякую, що поділився цим»',
          next: 'leo-reflection-end',
        },
      ],
    },
    {
      id: 'leo-reflection-platform',
      speaker: 'Лео',
      text: '«Одного разу я пропустив потяг, бо чекав, доки людина скаже мені, що все гаразд. Потяг пішов, а вона так нічого й не сказала. Я досі пам’ятаю не запізнення, а те, що подумав: якщо я не можу все виправити, то я їй не потрібен».',
      options: [
        {
          id: 'leo-platform-ask',
          label: '«Ти питав, чого вона насправді хотіла?»',
          next: 'leo-reflection-asking',
        },
        {
          id: 'leo-platform-silence',
          label: '«Можливо, мовчання теж було відповіддю»',
          next: 'leo-reflection-silence',
        },
      ],
    },
    {
      id: 'leo-reflection-asking',
      speaker: 'Лео',
      text: '«Ні. Я складав план, як урятувати нашу розмову, замість того щоб її слухати. Мабуть, це найгірша звичка диспетчера: вважати, що кожна затримка має бути чиєюсь провиною».',
      options: [
        {
          id: 'leo-asking-continue',
          label: '«А якщо не шукати винного?»',
          next: 'leo-reflection-boundary',
          grants: ['leo_chose_listening'],
        },
      ],
    },
    {
      id: 'leo-reflection-silence',
      speaker: 'Лео',
      text: '«Я так боявся тиші, що говорив за двох. Може, вона просто хотіла, щоб я залишився поруч. А може, щоб пішов. Не запитавши, я ніколи цього не дізнаюся».',
      options: [
        {
          id: 'leo-silence-continue',
          label: '«Тепер ти можеш залишити іншій людині вибір»',
          next: 'leo-reflection-boundary',
          grants: ['leo_accepted_silence'],
        },
      ],
    },
    {
      id: 'leo-reflection-boundary',
      speaker: 'Лео',
      text: '«Я хочу навчитися говорити: я поруч, але рішення твоє. Не так урочисто, як звучить у книжках. Просто без прихованого прохання негайно заспокоїти мене».',
      options: [
        {
          id: 'leo-boundary-try',
          label: '«Можеш спробувати вже сьогодні»',
          next: 'leo-reflection-end',
          grants: ['leo_will_offer_choice'],
        },
        {
          id: 'leo-boundary-wait',
          label: '«І можеш дати собі час»',
          next: 'leo-reflection-end',
          grants: ['leo_will_take_time'],
        },
      ],
    },
    {
      id: 'leo-reflection-deep',
      speaker: 'Лео',
      text: '«Можна бути уважним і все одно не вгадати, що іншому потрібно».',
      options: [
        {
          id: 'leo-reflect-continue',
          label: '«І що ти хочеш змінити?»',
          next: 'leo-reflection-platform',
        },
        {
          id: 'leo-reflect-listen',
          label: '«Можна просто побути з цим»',
          next: 'leo-reflection-platform',
        },
      ],
    },
    {
      id: 'leo-reflection-end',
      speaker: 'Лео',
      text: '«Мабуть, план — це спосіб не визнавати, що я боюся помилитися».',
      textWhen: [
        {
          requires: ['leo_chose_listening'],
          text: '«Тепер я спробую спершу запитати, чого людина хоче, а вже потім будувати маршрут. Навіть якщо відповідь буде незручною».',
        },
        {
          requires: ['leo_accepted_silence'],
          text: '«Може, найскладніше — не заповнювати паузу своїм страхом. Дати іншій людині час сказати своє».',
        },
      ],
      options: [
        {
          id: 'leo-reflect-finish',
          label: 'Повернутися до розмови',
          next: 'greet',
          grants: ['leo_reflected_on_uncertainty'],
        },
      ],
    },
    ...leoNightCourseNodes,
    {
      id: 'leo-platform-music',
      speaker: 'Лео',
      text: '«Одного разу чоловік грав на гармошці, а жінка поруч переконувала його, що це не та пісня». Лео сміється. «Потім вони почали співати разом. Увесь перон чекав, чим закінчиться концерт».',
      options: [
        { id: 'leo-music-join', label: '«А ти підспівував?»', next: 'leo-music-join' },
        { id: 'leo-music-train', label: '«А потяг тим часом прибув?»', next: 'leo-music-train' },
        { id: 'leo-music-mara', label: '«Мара була б у захваті»', next: 'leo-music-mara' },
      ],
    },
    {
      id: 'leo-music-join',
      speaker: 'Лео',
      text: '«Ні. Я намагався оголосити посадку». Він знічується. «Але потім хтось попросив мене заспівати приспів у мікрофон. Начальник досі згадує».',
      options: [
        {
          id: 'leo-music-join-back',
          label: '«Хочу почути запис»',
          next: 'greet',
          grants: ['leo_platform_singing_heard'],
        },
      ],
    },
    {
      id: 'leo-music-train',
      speaker: 'Лео',
      text: '«На сім хвилин раніше. Люди навіть образилися». Лео розводить руками. «Єдиний випадок у моїй кар’єрі, коли пунктуальність усім зіпсувала настрій».',
      options: [
        {
          id: 'leo-music-train-back',
          label: '«Наступного разу затримай його заради бісу»',
          next: 'greet',
          grants: ['leo_platform_concert_heard'],
        },
      ],
    },
    {
      id: 'leo-music-mara',
      speaker: 'Лео',
      text: '«Мара б принесла булочки й почала продавати квитки». Він усміхається. «Вона завжди бачить можливість там, де я бачу порушення розкладу».',
      options: [
        {
          id: 'leo-music-mara-back',
          label: '«Може, запросиш її на наступний концерт?»',
          next: 'greet',
          grants: ['leo_mara_platform_idea_heard'],
        },
      ],
    },
  ],
};

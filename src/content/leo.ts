import type { DialogueStory } from '../game/dialogue';
import { leoNightCourseNodes, leoNightCourseOption } from './leo-night-course';

/** День другий: Лео має власне життя й не є нагородою за розгадану таємницю. */
export const leoVisit: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      staging: [
        { kind: 'move', actor: 'visitor', x: 240, y: 235 },
        { kind: 'face', actor: 'visitor', direction: 'left' },
      ],
      speaker: 'Оповідач',
      text: 'Лео зупиняється біля прилавка. З кишені стирчить складений бланк, на рукаві — латка у формі потяга. Він дивиться на годинник, потім на двері. «До пекарні ще встигаю. Можна спершу хвилину тут?»',
      options: [
        {
          id: 'greet',
          label: '«Звісно. Ти зі станції?»',
          next: 'greet',
        },
      ],
    },
    {
      id: 'greet',
      mood: 'warm',
      staging: [
        { kind: 'face', actor: 'visitor', direction: 'left' },
        { kind: 'gesture', actor: 'visitor', action: 'greet', duration: 550 },
      ],
      speaker: 'Лео',
      text: '«Я Лео, зі станції. Сьогодні пасажир вимагав повернути йому тридцять п’ять хвилин». Він усміхається, але бланк не ховає. «Мені б теж не завадило. У Грейфорді набір на курс, а моя вечірня зміна закінчується пізніше за останню пересадку».',
      textWhen: [
        {
          requires: ['leo_mara_platform_idea_heard'],
          text: 'Лео показує складений аркуш. «Запишу: покликати Мару на наступний концерт. І попередити, що перон холодний. А то вона принесе булочки, а рукавиці знову забудемо обоє»',
        },
        {
          requires: ['leo_honesty_discussed'],
          text: 'Лео проводить пальцем по корінцях книжок. «Я ще думаю над тим, що сказати Марі. Цього разу хоча б не репетирую розмову перед дзеркалом». Він усміхається. «А от на роботі сьогодні знову затримали потяг».',
        },
        {
          requires: ['leo_reflected_on_uncertainty'],
          text: "Лео кладе на прилавок зім'ятий розклад. «Два потяги запізнилися, один прибув раніше. Мій улюблений день». Він знизує плечима. «Може, знайдеться книжка, де все ще гірше?»",
        },
      ],
      options: [
        {
          id: 'leo-course-now',
          label: '«Покажеш бланк? Може, знайдемо, що саме заважає»',
          next: 'leo-night-course',
          unless: ['leo_night_course_discussed'],
        },
        {
          id: 'leo-schedule',
          label: '«Скільки разів за зміну тебе звинувачують у запізненні потяга?»',
          next: 'trains',
        },
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
          label: '«Ти вже втретє дивишся на годинник. На когось чекаєш?»',
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
      text: '«Обіцяв Марі зайти до закриття. Хотів попросити її послухати, як я поясню Гаррісу про навчання. Тепер думаю: вона після зміни, а я знову прийду зі своїм розкладом».',
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
      text: '«Після вечірньої зміни люблю пройтися повз річку. Біля мосту продають суп у паперових стаканах. Мара каже, це найсумніша моя звичка». Лео усміхається. «Але в темряві видно всю станцію. Колись я звідти дивився на потяги й думав, що неодмінно поїду»',
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
      staging: [{ kind: 'gesture', actor: 'visitor', action: 'receive', duration: 550 }],
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
      mood: 'firm',
      staging: [
        { kind: 'move', actor: 'visitor', x: 275, y: 235 },
        { kind: 'face', actor: 'visitor', direction: 'left' },
      ],
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
      staging: [{ kind: 'exit', actor: 'visitor' }],
      afterwordWhen: [
        {
          requires: ['leo_night_course_application_planned'],
          text: 'Заявка ще не надіслана. Лео домовився спершу описати свій досвід, а не чекати ідеального графіка.',
        },
        {
          requires: ['leo_night_course_shift_request_planned'],
          text: 'На бланку залишається позначка про зміну графіка. Домовитися з Гаррісом Лео має сам.',
        },
        {
          requires: ['leo_night_course_deferred'],
          text: 'Цього набору Лео вирішив не поспішати. Його вихідний не став невдачею, яку треба виправити.',
        },
      ],
      speaker: 'Оповідач',
      text: 'Лео вже біля дверей. «У пекарню ще встигаю. Книжку виберу наступного разу». За порогом ясно; на мокрій після ранкового дощу бруківці відбивається вивіска.',
      options: [],
    },
    {
      id: 'leo-honest-talk',
      mood: 'thoughtful',
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
      text: '«Учора вона розповідала про столик біля вікна пекарні. Я одразу почав рахувати, скільки місця він забере. Вона перестала говорити. От тоді й треба було запитати, навіщо їй той столик».',
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
      text: '«А якщо я зараз скажу: “Розкажи ще раз”, — це не прозвучить так, ніби вона мусить повторити все на моє замовлення?» Лео кривиться. «Можу ж я хоч одну розмову не перетворити на пересадку».',
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
      mood: 'thoughtful',
      staging: [{ kind: 'gesture', actor: 'visitor', action: 'talk', duration: 550 }],
      speaker: 'Лео',
      text: '«Маро, я вчора тебе перебив. Якщо ще хочеш розповісти про столик, я послухаю. Якщо втомилася — заберу хліб і прийду завтра». Він замовкає. «А про курс спитаю окремо. Мабуть, не все треба встигнути сьогодні».',
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
      text: '«Добре. Не проситиму її заразом підказати, що сказати начальнику. Нехай це вже буде моя розмова». Він усміхається. «З Гаррісом. Не з тобою замість Гарріса».',
      options: [
        { id: 'leo-choice-finish', label: '«Можна почати з цього»', next: 'leo-honest-end' },
        { id: 'leo-choice-time', label: '«І можна не поспішати»', next: 'leo-honest-end' },
      ],
    },
    {
      id: 'leo-honest-end',
      mood: 'warm',
      speaker: 'Лео',
      text: '«Почну з того, що встигну до пекарні. А далі — без готової відповіді за Мару». Лео перевіряє годинник востаннє й ховає руку в кишеню.',
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
      text: '«Спершу шукаю, кому треба змінити пересадку. Потім згадую, що сам не обідав». Лео всміхається. «З робочими затримками простіше. Принаймні можна зателефонувати й запитати, що сталося»',
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
      text: '«Чекаю. Погано, до речі. Починаю перевіряти телефон щохвилини, ніби це допоможе». Він кладе його екраном донизу. «Якось через це взагалі не помітив свій потяг»',
      options: [
        {
          id: 'leo-reflect-continue',
          label: '«На кого ти чекав?»',
          next: 'leo-reflection-platform',
        },
        {
          id: 'leo-reflect-listen',
          label: '«Можеш розповісти, якщо хочеш»',
          next: 'leo-reflection-platform',
        },
      ],
    },
    {
      id: 'leo-reflection-end',
      speaker: 'Лео',
      text: '«Так, телефон теж може полежати спокійно». Лео відсуває його від ліктя. «Покажеш щось почитати на вихідний? Бажано без диспетчерів»',
      textWhen: [
        {
          requires: ['leo_chose_listening'],
          text: '«Наступного разу спитаю. І постараюся дочекатися відповіді, перш ніж пропонувати три варіанти». Лео відкладає телефон. «Це мені треба було записати великими літерами»',
        },
        {
          requires: ['leo_accepted_silence'],
          text: '«Не буду вгадувати, що означає тиша. Один раз уже вгадав». Лео зітхає. «А зараз пошукаймо книжку. Поки я знову не взявся за телефон»',
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
      text: '«Мара б принесла булочки й почала продавати квитки». Він усміхається. «Вона за десять хвилин дізналася б імена всіх на пероні, а я б перевіряв, чи не заважають вони посадці. Мара каже, що ми добре доповнюємо одне одного. Іноді думаю, що вона просто терпляча».',
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

import type { DialogueStory } from '../game/dialogue';

/** День четвертий: Мара — повноцінна людина зі своїми бажаннями, не перешкода для чужого роману. */
export const maraDecision: DialogueStory = {
  start: 'arrival',
  nodes: [
    {
      id: 'arrival',
      speaker: 'Оповідач',
      text: 'По обіді Мара заходить із двома паперовими пакетами. «Один із булочками для книгарні, інший — із вечерею, яку я нарешті не віддам комусь іншому». Вона втомлена, але усміхається.',
      options: [{ id: 'greet', label: 'Запросити Мару перепочити', next: 'greet' }],
    },
    {
      id: 'greet',
      speaker: 'Мара',
      text: '«Я принесла булочки. Тільки не питай, чому в пакеті одна надкушена». Мара кладе пакунок на прилавок. «У мене був довгий день. Можна хвилинку посидіти?»',
      textWhen: [
        {
          requires: ['mara_letter_pressured', 'mara_letter_privacy_respected'],
          text: 'Мара закриває пакет і зітхає. «Ти спочатку обіцяв не втручатися, а потім усе одно почав мене вмовляти. Я не збираюся сваритися посеред книгарні. Але про лист більше не питай».',
        },
        {
          requires: ['mara_letter_pressured'],
          text: 'Мара прибирає пакет ближче до себе. «Про чужий лист я вже сказала. Якщо хочеш поговорити про щось інше — гаразд. Але не проси мене передавати його Лео».',
        },
        {
          requires: ['mara_letter_privacy_respected'],
          text: 'Мара обережно загортає булочку в серветку. «Дякую, що не показував мені листа. Лео сам вирішить, коли говорити. А поки я хочу нарешті вибрати йому подарунок».',
        },
        {
          requires: ['mara_day_four_own_story_heard'],
          text: 'Мара підсовує тобі паперовий пакет. «Цього разу всі булочки цілі. Перевірила особисто». Вона сміється. «До речі, я так і не вирішила, коли вручити Лео книжку».',
        },
        {
          requires: ['mara_day_four_rest_heard'],
          text: 'Мара вмощується зручніше й знімає з плеча сумку. «Ось тепер можна говорити. Тільки якщо я засну, не буди до закриття». Вона усміхається. «Що ти там питав?».',
        },
      ],
      options: [
        {
          id: 'mara-rest',
          label: '«Звісно. Сідай, я поки зроблю чай»',
          next: 'mara-rest',
          unless: ['mara_day_four_rest_heard'],
        },
        { id: 'work', label: '«Ти змогла відмовитися від зайвої зміни?»', next: 'work' },
        {
          id: 'book',
          label: '«Ти вже подарувала Лео книжку?»',
          next: 'book',
          requires: ['mara_day_four_rest_heard'],
        },
        {
          id: 'letter',
          label: '«Є дещо з минулого, що може стосуватися Лео»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        {
          id: 'remember-trust',
          label: '«Ти після нашої розмови ще бачила Лео?»',
          next: 'remember-trust',
          requires: ['mara_discussed_forgiveness'],
        },
        {
          id: 'future',
          label: '«Чого ти сама хочеш цього року?»',
          next: 'future',
          requires: ['mara_day_four_own_story_heard'],
        },
        {
          id: 'mara-own-story',
          label: '«Що сталося сьогодні в пекарні?»',
          next: 'mara-own-story',
          unless: ['mara_day_four_own_story_heard'],
        },
        { id: 'finish', label: 'Побажати Марі гарного вечора', next: 'end' },
      ],
    },
    {
      id: 'mara-rest',
      speaker: 'Мара',
      text: 'Мара сідає й розв’язує стрічку на пакеті. «Тільки п’ять хвилин. Якщо я зараз встану, знову знайду собі якусь роботу». Вона підсуває тобі булочку. «Цю я точно не надкусила».',
      options: [
        {
          id: 'mara-rest-back',
          label: '«А що було найгіршим за сьогодні?»',
          next: 'mara-own-story',
          grants: ['mara_day_four_rest_heard'],
        },
      ],
    },
    {
      id: 'mara-own-story',
      speaker: 'Мара',
      text: '«Сьогодні покупчиня сказала, що мої булочки стали менші. Я ледь не спекла їй окрему, завбільшки з колесо». Мара крутить паперовий пакет. «Чому я так нервую, коли хтось незадоволений?»',
      options: [
        {
          id: 'mara-own-story-work',
          label: '«А що ти хотіла їй відповісти?»',
          next: 'mara-own-story-choice',
          grants: ['mara_day_four_chose_own_time'],
        },
        {
          id: 'mara-own-story-love',
          label: '«І що, віддала їй печиво заради миру?»',
          next: 'mara-own-story-choice',
          grants: ['mara_day_four_named_own_needs'],
        },
      ],
    },
    {
      id: 'mara-own-story-choice',
      speaker: 'Мара',
      text: '«Я навіть не знаю, як це сказати, щоб нікого не образити». Вона складає пакет удвоє.',
      textWhen: [
        {
          requires: ['mara_day_four_chose_own_time'],
          text: '«Що масло подорожчало, а булочки ті самі». Мара фиркає. «Натомість я вибачилася. Двічі. І дала їй печиво».',
        },
        {
          requires: ['mara_day_four_named_own_needs'],
          text: '«Так, ще й загорнула печиво в серветку». Мара пирхає. «А вона повернулася за годину й купила ще шість булочок. Я досі не знаю, хто кого переграв».',
        },
      ],
      options: [
        {
          id: 'mara-own-story-followup-direct',
          label: '«І що зробиш наступного разу?»',
          next: 'mara-own-story-followup',
          grants: ['mara_day_four_followup_direct'],
        },
        {
          id: 'mara-own-story-followup-joke',
          label: '«Наступного разу видаси їй печиво з рахунком?»',
          next: 'mara-own-story-followup',
          grants: ['mara_day_four_followup_joke'],
        },
      ],
    },
    {
      id: 'mara-own-story-followup',
      speaker: 'Мара',
      text: '«Спробую». Вона відламує половину булочки. «Якщо завтра знову роздам усе печиво, зроби вигляд, що не бачив».',
      textWhen: [
        {
          requires: ['mara_day_four_followup_direct'],
          text: '«Скажу, що булочки такого розміру, бо я так їх печу». Мара робить паузу. «І не вибачатимуся за це. Принаймні спробую».',
        },
        {
          requires: ['mara_day_four_followup_joke'],
          text: '«Впишу окремим рядком: “за душевні страждання пекарки”». Мара сміється. «Начальниця, звісно, мене вб’є. Але уявити приємно».',
        },
      ],
      options: [
        {
          id: 'mara-own-story-back',
          label: '«То коли плануєш вручити Лео книжку?»',
          next: 'book',
          grants: ['mara_day_four_own_story_heard'],
        },
      ],
    },
    {
      id: 'work',
      speaker: 'Мара',
      text: '«У неділю не вийду. Начальниця спершу сказала, що без мене не впораються, а потім знайшла підміну за п’ять хвилин». Мара фиркає. «Я вже вибрала книжку на вихідний».',
      options: [
        {
          id: 'work-back',
          label: '«А що ти взяла почитати на вихідний?»',
          next: 'book',
          grants: ['mara_supported_independence'],
        },
      ],
    },
    {
      id: 'book',
      speaker: 'Мара',
      text: '«Я досі не вручила Лео книжку. Учора сховала її за коробкою з борошном, а він ледь не знайшов». Мара сміється. «Якщо він спитає, що це, скажу: інвентаризація».',
      options: [
        {
          id: 'station',
          label: '«Він точно оцінить історію про станцію»',
          next: 'station',
          requires: ['sold_station'],
        },
        {
          id: 'roads',
          label: '«Мапи — гарна нагода спланувати подорож»',
          next: 'roads',
          requires: ['sold_roads'],
        },
        {
          id: 'letters',
          label: '«Він уже здогадався, що це подарунок?»',
          next: 'letters',
          requires: ['sold_letters'],
        },
        { id: 'book-back', label: '«Нехай це буде твій сюрприз»', next: 'greet' },
      ],
    },
    {
      id: 'station',
      speaker: 'Мара',
      text: '«Я сховала в книжці копію квитка з нашої першої спільної поїздки. Оригінал у Лео, він досі зберігає його в шухляді». Мара сміється. «Тільки не кажи йому про сюрприз!»',
      options: [
        {
          id: 'station-back',
          label: '«Обіцяю зберегти сюрприз»',
          next: 'greet',
          grants: ['mara_gift_encouraged'],
        },
      ],
    },
    {
      id: 'roads',
      speaker: 'Мара',
      text: '«Я заклала сторінку, де герої вирушають без плану. Може, ми теж одного дня просто сядемо на потяг і поїдемо до моря».',
      options: [
        {
          id: 'roads-back',
          label: '«Бажаю вам цієї подорожі»',
          next: 'greet',
          grants: ['mara_gift_encouraged'],
        },
      ],
    },
    {
      id: 'letters',
      speaker: 'Мара',
      text: '«Він прочитає її за ніч, а вранці зробить вигляд, що просто цікавився залізницею». Мара хитає головою. «Я його знаю».',
      options: [
        {
          id: 'letters-back',
          label: '«Тільки не розповідай йому фінал»',
          next: 'greet',
          grants: ['mara_gift_encouraged'],
        },
      ],
    },
    {
      id: 'remember-trust',
      speaker: 'Мара',
      text: '«Ще й як пам’ятаю. Він приніс квіти, а вона одразу погодилася на весілля». Мара пирхає. «Я досі хочу знати, куди поділася її подруга, яка його терпіти не могла».',
      options: [
        {
          id: 'remember-trust-back',
          label: '«Тепер мені теж цікаво, де поділася подруга»',
          next: 'greet',
          grants: ['mara_day_four_reflected'],
        },
      ],
    },
    {
      id: 'future',
      speaker: 'Мара',
      text: '«Поставлю маленький столик біля вікна пекарні. Купила скатертину з жовтими квітами». Мара сміється. «Сем уже хотів скласти на нього порожні коробки, але я встигла забрати».',
      options: [
        {
          id: 'future-back',
          label: '«Не дай Сему зайняти столик коробками»',
          next: 'greet',
          grants: ['mara_future_supported'],
        },
      ],
    },
    {
      id: 'letter',
      speaker: 'Мара',
      text: 'Мара завмирає, але не перебиває. «Я розумію, що в Лео було життя до мене. І в мене було. Але якщо це чужий лист, я не хочу, щоб ти читав його мені замість авторки».',
      options: [
        {
          id: 'privacy',
          label: '«Не розкриватиму нічого без згоди»',
          next: 'privacy',
          grants: ['mara_letter_privacy_respected'],
        },
        {
          id: 'truth',
          label: '«Може, просто запитаєш Лео про той квиток?»',
          next: 'truth',
          grants: ['mara_supported_independence'],
        },
        {
          id: 'push',
          label: '«Треба змусити Лео все пояснити сьогодні»',
          next: 'push',
          grants: ['mara_letter_pressured'],
        },
      ],
    },
    {
      id: 'privacy',
      speaker: 'Мара',
      text: '«Добре. Якщо Лео захоче щось розповісти, я вислухаю». Мара дивиться на пакунок. «Але чужий лист мені не показуй. Я навіть свій список покупок від нього ховаю».',
      options: [{ id: 'privacy-back', label: 'Повернутися до розмови', next: 'greet' }],
    },
    {
      id: 'truth',
      speaker: 'Мара',
      text: '«Запитаю його про квиток сьогодні ввечері». Мара мнеться. «Тільки спочатку нагодую. Голодний Лео починає пояснювати все так, ніби захищає дисертацію».',
      options: [{ id: 'truth-back', label: 'Повернутися до розмови', next: 'greet' }],
    },
    {
      id: 'push',
      speaker: 'Мара',
      text: '«Ні. Не ти вирішуєш, коли і що мені знати». Вона повільно складає паперовий пакет. «Я поговорю з Лео, коли ми обоє будемо готові».',
      options: [{ id: 'push-back', label: '«Вибач, я поспішив»', next: 'greet' }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Мара йде до пекарні через сквер. Уже на порозі згадує про забуту булочку, махає рукою й кричить: «Залишайте собі!»',
      options: [],
    },
  ],
};

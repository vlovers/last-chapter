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
      options: [
        { id: 'work', label: '«Ти змогла відмовитися від зайвої зміни?»', next: 'work' },
        { id: 'book', label: '«Як тобі книжка для Лео?»', next: 'book' },
        {
          id: 'letter',
          label: '«Є дещо з минулого, що може стосуватися Лео»',
          next: 'letter',
          requires: ['saw_envelope'],
        },
        {
          id: 'remember-trust',
          label: '«Пам’ятаєш нашу розмову про прощення?»',
          next: 'remember-trust',
          requires: ['mara_discussed_forgiveness'],
        },
        { id: 'future', label: '«Чого ти сама хочеш цього року?»', next: 'future' },
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
          label: '«З Лео ти теж так робиш?»',
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
          text: '«Іноді. Він питає, куди я хочу поїхати, а я відповідаю: куди ти хочеш. Потім злюся, що він не здогадався». Мара закочує очі. «Чудова система, правда?»',
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
          label: '«Може, потренуєшся казати “ні”?»',
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
          text: '«Ні», — урочисто каже Мара. Потім підсуває тобі пакет. «От бачиш, уже виходить. Булочку все одно бери».',
        },
      ],
      options: [
        {
          id: 'mara-own-story-back',
          label: '«Гаразд. А як там книжка для Лео?»',
          next: 'greet',
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
          label: '«То що читатимеш у неділю?»',
          next: 'greet',
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
      text: '«Я сховала в книжці квиток із нашої першої спільної поїздки. Лео шукав його минулого тижня й перевернув усю шухляду». Мара сміється. «Тільки не кажи йому!»',
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
          label: '«А який розділ він прочитає першим?»',
          next: 'greet',
          grants: ['mara_gift_encouraged'],
        },
      ],
    },
    {
      id: 'remember-trust',
      speaker: 'Мара',
      text: '«Пам’ятаю той роман. У фіналі він приніс квіти, а вона одразу погодилася на весілля». Мара пирхає. «Я досі хочу знати, куди поділася її подруга, яка його терпіти не могла».',
      options: [
        {
          id: 'remember-trust-back',
          label: '«А ти вже вибрала, де поставиш столик?»',
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
          label: '«А булочки для столика вже придумала?»',
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

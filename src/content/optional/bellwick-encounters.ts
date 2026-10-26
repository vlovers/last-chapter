import type { DialogueStory } from '../../game/dialogue';

/** Ten optional Bellwick encounters. No mystery clues, mandatory progression or morality scores. */
export const bellwickEncounters: Readonly<Record<string, DialogueStory>> = {
  mara: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Мара',
        text: 'Мара ставить на прилавок лимонний пиріг. «Не дивись на нього так. Він пережив важкий ранок».',
        options: [
          { id: 'talk', label: 'У тебе щось сталося?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Мара',
        text: 'Пекарка назвала мою випічку браком. Я відповіла, що в неї теж неідеальна зачіска. Тепер мені соромно, але вибачатися не хочеться.',
        options: [
          { id: 'choice-a', label: 'Вона справді була груба.', next: 'reply-a' },
          { id: 'choice-b', label: 'Ти могла промовчати.', next: 'reply-b' },
          { id: 'choice-c', label: 'Дай скуштувати.', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Мара',
        text: 'Була. І я була. Можемо залишити обидва факти на столі, поруч із пирогом.',
        options: [
          {
            id: 'follow-a',
            label:
              'Мара відрізає ще один шматок. «Завтра скажу їй, що перегнула. Не обіцяю, що скажу красиво».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Мара',
        text: 'Могла. А ти міг не казати цього так, ніби сам ніколи не зривався.',
        options: [
          {
            id: 'follow-b',
            label:
              'Мара відрізає ще один шматок. «Завтра скажу їй, що перегнула. Не обіцяю, що скажу красиво».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Мара',
        text: 'Оце розмова. Тільки не називай його «цікавим». Це найгірший комплімент для пирога.',
        options: [
          {
            id: 'follow-c',
            label:
              'Мара відрізає ще один шматок. «Завтра скажу їй, що перегнула. Не обіцяю, що скажу красиво».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Мара',
        text: 'Мара забирає коробку. «Гаразд. Сьогодні мені й так вистачило оцінок».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  leo: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Лео',
        text: 'Лео вкладає в книжку старий залізничний квиток. «Не закладка. Просто не знаю, куди його подіти».',
        options: [
          { id: 'talk', label: 'Ти кудись не поїхав?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Лео',
        text: 'Поїхав. Просто повернувся наступного дня. Усі вирішили, що це була помилка.',
        options: [
          { id: 'choice-a', label: 'Ти жалкуєш?', next: 'reply-a' },
          { id: 'choice-b', label: 'Чому не розповів Марі?', next: 'reply-b' },
          { id: 'choice-c', label: 'Можеш нічого не пояснювати.', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Лео',
        text: 'За грошима на квиток — так. За тим, що побачив місто, — ні.',
        options: [
          {
            id: 'follow-a',
            label:
              'Лео кладе квиток назад. «Може, колись поїду туди ще раз. Без великого оголошення».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Лео',
        text: 'Бо вона спитає, чи я знову тікаю. І матиме право. Але я не хочу, щоб кожен мій крок був відповіддю на стару сварку.',
        options: [
          {
            id: 'follow-b',
            label:
              'Лео кладе квиток назад. «Може, колись поїду туди ще раз. Без великого оголошення».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Лео',
        text: 'Дякую. Дивно, як важко прийняти таку просту пропозицію.',
        options: [
          {
            id: 'follow-c',
            label:
              'Лео кладе квиток назад. «Може, колись поїду туди ще раз. Без великого оголошення».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Лео',
        text: 'Лео ховає квиток у кишеню. «Це не загадка, яку треба розгадати».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  nora: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Нора',
        text: "Нора сміється над обкладинкою роману. «Графиня втретє втратила пам'ять. Їй би вже завести записник».",
        options: [
          { id: 'talk', label: 'Тобі подобається ця книжка?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Нора',
        text: 'Страшенно. У ній усе неправильно, навіть карта королівства. Зате я не думаю про роботу.',
        options: [
          { id: 'choice-a', label: 'Ти ж завжди любиш точність.', next: 'reply-a' },
          { id: 'choice-b', label: 'Мені б було шкода часу.', next: 'reply-b' },
          { id: 'choice-c', label: 'Позичиш потім?', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Нора',
        text: 'На роботі. А вдома я дозволяю вигаданим людям поводитися безглуздо.',
        options: [
          {
            id: 'follow-a',
            label:
              "Нора закладає сторінку чеком. «Якщо вона втратить пам'ять учетверте, я все одно дочитаю».",
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Нора',
        text: 'А мені шкода часу на книжки, які змушують мене здавати іспит після кожного розділу.',
        options: [
          {
            id: 'follow-b',
            label:
              "Нора закладає сторінку чеком. «Якщо вона втратить пам'ять учетверте, я все одно дочитаю».",
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Нора',
        text: 'Так, але не дивись на мене, коли дійдеш до другого таємного близнюка.',
        options: [
          {
            id: 'follow-c',
            label:
              "Нора закладає сторінку чеком. «Якщо вона втратить пам'ять учетверте, я все одно дочитаю».",
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Нора',
        text: 'Нора повертається до читання. «Не переживай. Я й без рецензії впораюся».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  iris: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Айріс',
        text: 'Айріс показує малюнок: за вікном помаранчевий дощ. «Малювала грозу. Вийшов суп».',
        options: [
          { id: 'talk', label: 'Чому помаранчевий?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Айріс',
        text: 'Бо я втомилася від синього. І тому, що в мене закінчилася нормальна фарба.',
        options: [
          { id: 'choice-a', label: 'Мені подобається суп.', next: 'reply-a' },
          { id: 'choice-b', label: 'Ти переробиш?', next: 'reply-b' },
          { id: 'choice-c', label: 'Я бачу в ньому бурю.', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Айріс',
        text: 'Тоді забирай його в уявну галерею. Вхід коштує один комплімент без слова «сміливо».',
        options: [
          {
            id: 'follow-a',
            label: 'Айріс підписує аркуш «Листопадова юшка» й усміхається сама до себе.',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Айріс',
        text: 'Може. А може, домалюю ложку. Люди завжди шукають, що художник «хотів сказати».',
        options: [
          {
            id: 'follow-b',
            label: 'Айріс підписує аркуш «Листопадова юшка» й усміхається сама до себе.',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Айріс',
        text: 'А я — моркву. Добре, що ми не мусимо домовлятися.',
        options: [
          {
            id: 'follow-c',
            label: 'Айріс підписує аркуш «Листопадова юшка» й усміхається сама до себе.',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Айріс',
        text: 'Айріс прикриває альбом. «Сьогодні без художньої ради, гаразд?»',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  thomas: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Томас',
        text: 'Томас дивиться на старий стілець. «Хто його поставив так, що двері відчиняються на три чверті?»',
        options: [
          { id: 'talk', label: 'Пересунемо?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Томас',
        text: 'Звісно. Тільки тримай ніжку. Ні, іншу. Ця вдає, що тримається.',
        options: [
          { id: 'choice-a', label: 'Мені так зручно.', next: 'reply-a' },
          { id: 'choice-b', label: 'Ти завжди все лагодиш?', next: 'reply-b' },
          { id: 'choice-c', label: 'Може, він просто гарний?', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Томас',
        text: 'Тоді поставлю табличку «Прохід для людей без плечей».',
        options: [
          {
            id: 'follow-a',
            label: 'Стілець скрипить, коли Томас сідає. «Ось. Тепер він принаймні чесний».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Томас',
        text: 'Ні. Є речі, яких я не торкаюся. Наприклад, чужі стосунки. Там не допоможе викрутка.',
        options: [
          {
            id: 'follow-b',
            label: 'Стілець скрипить, коли Томас сідає. «Ось. Тепер він принаймні чесний».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Томас',
        text: 'Він гарний. І двері все одно зачиняє. Два факти можуть існувати одночасно.',
        options: [
          {
            id: 'follow-c',
            label: 'Стілець скрипить, коли Томас сідає. «Ось. Тепер він принаймні чесний».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Томас',
        text: 'Томас відходить від стільця. «Коли застрягнеш у дверях, клич».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  anna: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Анна',
        text: 'Анна розкладає дитячі закладки. «У нас чотири мечі, три коти й один дракон, якого всі називають огірком».',
        options: [
          { id: 'talk', label: 'Можна взяти кота?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Анна',
        text: "Можна. Але він із п'ятьма лапами. Автор сказав, що так швидше бігати.",
        options: [
          { id: 'choice-a', label: 'А чому ти не виправила?', next: 'reply-a' },
          { id: 'choice-b', label: 'Я б обрав огірка.', next: 'reply-b' },
          { id: 'choice-c', label: 'Діти люблять сперечатися?', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Анна',
        text: 'Бо це закладка, а не контрольна з анатомії. Хоча батьки вже написали мені два листи.',
        options: [
          {
            id: 'follow-a',
            label:
              'Анна залишає одну закладку біля каси. «Не продавай. Автор обіцяв прийти перевірити».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Анна',
        text: 'Дракона. Будь ласка, не починай. Він і так образився на весь клас.',
        options: [
          {
            id: 'follow-b',
            label:
              'Анна залишає одну закладку біля каси. «Не продавай. Автор обіцяв прийти перевірити».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Анна',
        text: 'Коли їм дозволяють. Учора вони двадцять хвилин доводили, чи може лиходій бути хорошим другом.',
        options: [
          {
            id: 'follow-c',
            label:
              'Анна залишає одну закладку біля каси. «Не продавай. Автор обіцяв прийти перевірити».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Анна',
        text: 'Анна збирає папірці. «Гаразд, мистецьку виставку перенесемо».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  eleanor: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Елеонора',
        text: 'Елеонора розгортає старе видання. На полях — пляма від чаю. «Я колись назвала б це зіпсованою річчю».',
        options: [
          { id: 'talk', label: 'А тепер?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Елеонора',
        text: 'Тепер думаю, що хтось читав її, поки чай холонув. Але ціну я все одно знижую.',
        options: [
          { id: 'choice-a', label: 'Ти продаєш спогади?', next: 'reply-a' },
          { id: 'choice-b', label: 'Я люблю нові видання.', next: 'reply-b' },
          { id: 'choice-c', label: 'Хто залишив пляму?', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Елеонора',
        text: 'Ні. Я продаю книжки. Спогади люди додають без мого дозволу.',
        options: [
          {
            id: 'follow-a',
            label:
              'Елеонора обережно кладе книжку на полицю з уцінкою. «Може, її нарешті хтось прочитає».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Елеонора',
        text: 'І я люблю. Особливо коли вони не розсипаються від одного погляду. Не роби з мене музейну доглядачку.',
        options: [
          {
            id: 'follow-b',
            label:
              'Елеонора обережно кладе книжку на полицю з уцінкою. «Може, її нарешті хтось прочитає».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Елеонора',
        text: 'Не знаю. І не маю наміру влаштовувати допит кожній чашці в Беллвіку.',
        options: [
          {
            id: 'follow-c',
            label:
              'Елеонора обережно кладе книжку на полицю з уцінкою. «Може, її нарешті хтось прочитає».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Елеонора',
        text: 'Елеонора закриває обкладинку. «Не кожна пляма потребує історії».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  miller: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Міллер',
        text: 'Пані Міллер тримає три детективи. «У кожному злочинець — дворецький. Це вже неповага до професії».',
        options: [
          { id: 'talk', label: 'Може, обрати інший жанр?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Міллер',
        text: 'А хто тоді стежитиме за дворецькими? Ти не продумав наслідків.',
        options: [
          { id: 'choice-a', label: 'Ви завжди вгадуєте фінал?', next: 'reply-a' },
          { id: 'choice-b', label: 'Можна просто насолоджуватися?', next: 'reply-b' },
          { id: 'choice-c', label: 'Вам подобається сперечатися.', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Міллер',
        text: "Ні. Але після фіналу завжди згадую, що все знала. Зручна пам'ять.",
        options: [
          {
            id: 'follow-a',
            label:
              'Міллер обирає роман без дворецького. «Якщо винен садівник, я вимагатиму повернення грошей».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Міллер',
        text: 'Можна. Але тоді я не зможу обурюватися автором. Навіщо мені книжка без обурення?',
        options: [
          {
            id: 'follow-b',
            label:
              'Міллер обирає роман без дворецького. «Якщо винен садівник, я вимагатиму повернення грошей».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Міллер',
        text: 'Так. Але не завжди хочу перемагати. Іноді просто не хочу, щоб розмова закінчувалася.',
        options: [
          {
            id: 'follow-c',
            label:
              'Міллер обирає роман без дворецького. «Якщо винен садівник, я вимагатиму повернення грошей».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Міллер',
        text: 'Міллер забирає свої три книжки. «Подумаю сама. Це теж приємно».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  sophie: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Софі',
        text: 'Софі приносить одну гілку жовтих квітів. «Замовник сказав: букет має виглядати так, ніби він випадково зібраний».',
        options: [
          { id: 'talk', label: 'Хіба це складно?', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Софі',
        text: 'Спробуй випадково зібрати дванадцять однакових квіток і не отримати скаргу.',
        options: [
          { id: 'choice-a', label: 'Кому він?', next: 'reply-a' },
          { id: 'choice-b', label: 'Я люблю прості букети.', next: 'reply-b' },
          { id: 'choice-c', label: 'Ти злишся на клієнта?', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Софі',
        text: 'Не знаю. І не хочу. Інакше доведеться вгадувати, чи людина зрадіє.',
        options: [
          {
            id: 'follow-a',
            label: 'Софі залишає гілку в склянці біля вікна. «Це не декор. Просто їй тут добре».',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Софі',
        text: 'Я теж. Особливо коли ніхто не питає, що символізує кожна травинка.',
        options: [
          {
            id: 'follow-b',
            label: 'Софі залишає гілку в склянці біля вікна. «Це не декор. Просто їй тут добре».',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Софі',
        text: 'Трохи. А потім він приніс мені каву. Тепер незручно злитися на повну силу.',
        options: [
          {
            id: 'follow-c',
            label: 'Софі залишає гілку в склянці біля вікна. «Це не декор. Просто їй тут добре».',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Софі',
        text: 'Софі забирає квіти. «Повернуся, коли перестану сперечатися з пелюстками».',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
  frank: {
    start: 'opening',
    nodes: [
      {
        id: 'opening',
        speaker: 'Оповідач',
        text: 'Френк, маленький сірий девон-рекс, сидить на полиці з новинками й дивиться на тебе так, ніби книгарня належить йому.',
        options: [
          { id: 'talk', label: 'Зняти його з полиці.', next: 'topic' },
          { id: 'leave', label: 'Повернутися до справ.', next: 'exit' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Оповідач',
        text: 'Френк дозволяє взяти себе на руки, але лише для того, щоб одразу перелізти тобі на плече.',
        options: [
          { id: 'choice-a', label: 'Запропонувати іграшку.', next: 'reply-a' },
          { id: 'choice-b', label: 'Просто сісти поруч.', next: 'reply-b' },
          { id: 'choice-c', label: 'Почухати за вухом.', next: 'reply-c' },
        ],
      },
      {
        id: 'reply-a',
        speaker: 'Оповідач',
        text: 'Френк ігнорує мишку й починає полювати на мотузку від пакета. Мотузку доводиться прибрати.',
        options: [
          {
            id: 'follow-a',
            label:
              'Френк згортається клубком на теплій підстилці. Тепер ніхто не має права рухати цю підстилку.',
            next: 'afterthought',
          },
          { id: 'finish-a', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-b',
        speaker: 'Оповідач',
        text: 'За хвилину Френк спускається сам, торкається лапою твого черевика й удає, що це випадковість.',
        options: [
          {
            id: 'follow-b',
            label:
              'Френк згортається клубком на теплій підстилці. Тепер ніхто не має права рухати цю підстилку.',
            next: 'afterthought',
          },
          { id: 'finish-b', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'reply-c',
        speaker: 'Оповідач',
        text: 'Френк муркоче так голосно, що покупець озирається від детективів.',
        options: [
          {
            id: 'follow-c',
            label:
              'Френк згортається клубком на теплій підстилці. Тепер ніхто не має права рухати цю підстилку.',
            next: 'afterthought',
          },
          { id: 'finish-c', label: 'Попрощатися.', next: 'end' },
        ],
      },
      {
        id: 'afterthought',
        speaker: 'Оповідач',
        text: 'Френк позіхає й повертається до своїх дуже важливих котячих справ.',
        options: [{ id: 'afterthought-end', label: 'Залишити розмову на цьому.', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: undefined, options: [] },
      { id: 'exit', speaker: 'Оповідач', text: undefined, options: [] },
    ],
  },
};

import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * A hands-on reconstruction of the two fragments. The physical marks constrain
 * the hypotheses but do not establish authorship or identify a missing page.
 */
export const paperStudyOption: DialogueOption = {
  id: 'paper-study',
  label: 'Порівняти два рукописні аркуші під лампою',
  next: 'paper-study',
  requires: ['final_chapter_evidence_reviewed', 'final_ledger_scene_complete'],
  unless: ['final_paper_study_done', 'final_manuscript_provenance_decided'],
};

export const paperStudyNodes: readonly DialogueNode[] = [
  {
    id: 'paper-study',
    speaker: 'Нора',
    text: 'Айріс дозволяє розкласти обидва аркуші на столі. Нора прибирає чашки й ставить лампу між ними. «Один закінчується поверненням, другий — від’їздом. І я вже придумала чотири пояснення». Елеонора кладе поруч чистий папір. «Спершу подивімося, що перед нами. І не торкайся чорнила мокрими пальцями».',
    textWhen: [
      {
        requires: ['final_paper_iris_lent_originals', 'final_ledger_record_private'],
        text: 'Айріс сама виймає два аркуші з альбому й залишається біля лампи. «Без фотографій, домовилися?» Нора прибирає чашки, а Елеонора не дістає приватний журнал із шухляди. «Порівнюємо тільки те, на що Айріс погодилася», — нагадує вона.',
      },
      {
        requires: ['final_paper_iris_lent_originals'],
        text: 'Айріс сама розкладає два аркуші під лампою. «П’ять хвилин. І жодних фотографій». Нора прибирає чашки й розгортає чистий блокнот. «Я лише порівняю краї та чорнило. Авторство від цього не з’явиться». Айріс залишається поруч, поки вони працюють.',
      },
      {
        requires: ['final_ledger_record_private'],
        text: 'Нора прибирає чашки й кладе під лампу два рукописні аркуші. Елеонора залишає журнал у шухляді: «Про нього домовилися поки мовчати. Папір можемо роздивитися, але без чужих імен». Нора киває: «Тоді почнімо з країв».',
      },
    ],
    options: [
      {
        id: 'paper-study-edges',
        label: 'Порівняти краї аркушів',
        next: 'paper-study-edges',
        unless: ['final_paper_edges_checked'],
      },
      {
        id: 'paper-study-ink',
        label: 'Розглянути почерк і чорнило',
        next: 'paper-study-ink',
        unless: ['final_paper_ink_checked'],
      },
      {
        id: 'paper-study-voices',
        label: 'Почути версії інших, не називаючи їх доказами',
        next: 'paper-study-voices',
        unless: ['final_paper_voices_heard'],
      },
      {
        id: 'paper-study-conclude',
        label: 'Вирішити, що записати про знахідку',
        next: 'paper-study-decision',
        requires: [
          'final_paper_edges_checked',
          'final_paper_ink_checked',
          'final_paper_voices_heard',
        ],
      },
    ],
  },
  {
    id: 'paper-study-edges',
    speaker: 'Елеонора',
    text: '«Ось тут рівний зріз, наче від ножиць. А тут край нерівний». Елеонора підсуває аркуші, не з’єднуючи їх. «Коли ми сушили книжки після повені, папір лежав усюди. Але я не пам’ятаю, хто й навіщо різав саме цей». Нора нахиляється ближче: «То вони не були одним листком?» «Цього ми теж не довели».',
    options: [
      {
        id: 'paper-edges-fit',
        label: '«Можна скласти їх як пазл?»',
        next: 'paper-study-fit',
      },
      {
        id: 'paper-edges-thomas',
        label: 'Запитати Томаса, як переносили мокрий папір',
        next: 'paper-study-thomas',
      },
      {
        id: 'paper-edges-back',
        label: 'Записати різницю країв без висновку про автора',
        next: 'paper-study',
        grants: ['final_paper_edges_checked'],
      },
    ],
  },
  {
    id: 'paper-study-fit',
    speaker: 'Нора',
    text: 'Нора обережно зближує кути, але зріз не продовжує нерівний край. «Не складається». Мара за її плечем хмикає: «І що? Я теж не складаюся з усіма людьми, які пишуть тією самою ручкою». Нора відсуває аркуші. «Добре. Невдала спроба — теж результат, тільки не сенсація».',
    options: [
      {
        id: 'paper-fit-back',
        label: 'Не називати невдале зіставлення доказом двох авторів',
        next: 'paper-study',
        grants: ['final_paper_edges_checked'],
      },
    ],
  },
  {
    id: 'paper-study-thomas',
    speaker: 'Томас',
    text: '«Ми перекладали мокрі книжки рушниками, а окремі аркуші клали між чистими листами», — згадує Томас. «Я загубив власний список коробок і потім тиждень шукав його під касою». Елеонора пирхає: «Два тижні». Томас розводить руками: «Бачите? Навіть про це ми пам’ятаємо по-різному».',
    options: [
      {
        id: 'paper-thomas-back',
        label: 'Відділити загальну практику від долі цих аркушів',
        next: 'paper-study',
        grants: ['final_paper_edges_checked'],
      },
    ],
  },
  {
    id: 'paper-study-ink',
    speaker: 'Нора',
    text: '«У цьому уривку літери щільніші, а в другому рядки ніби поспішають». Нора піднімає лампу. «Може, писали в різні дні. Може, різні люди». Елеонора стукає пальцем по столу: «А може, хтось писав стоячи. Я після інвентаризації теж не впізнаю власних цифр».',
    options: [
      {
        id: 'paper-ink-nora',
        label: '«Що ти написала б у статті?»',
        next: 'paper-study-headline',
      },
      {
        id: 'paper-ink-mara',
        label: 'Попросити Мару прочитати обидва фінали',
        next: 'paper-study-mara',
      },
      {
        id: 'paper-ink-back',
        label: 'Позначити, що почерк не встановлює авторства',
        next: 'paper-study',
        grants: ['final_paper_ink_checked'],
      },
    ],
  },
  {
    id: 'paper-study-headline',
    speaker: 'Нора',
    text: '«Два фінали, один таємничий автор», — Нора вимовляє заголовок із театральним пафосом. Мара дивиться на неї поверх чашки. «Ти щойно сама сказала, що авторів може бути двоє». Нора закреслює слова в блокноті. «Ненавиджу, коли гарний заголовок псує звичайна логіка».',
    options: [
      {
        id: 'paper-headline-back',
        label: 'Залишити заголовок у чернетці',
        next: 'paper-study',
        grants: ['final_paper_ink_checked'],
      },
    ],
  },
  {
    id: 'paper-study-mara',
    speaker: 'Мара',
    text: 'Мара читає останні речення вголос. «У першому хтось повертається додому. У другому їде й навіть не озирається». Вона замовкає. «Я б вибрала другий. Але це нічого не каже про те, хто його написав». Нора тихо відповідає: «Мені більше подобається перший». На мить вони просто сперечаються про книжку.',
    options: [
      {
        id: 'paper-mara-back',
        label: 'Не плутати улюблений фінал зі справжнім',
        next: 'paper-study',
        grants: ['final_paper_ink_checked'],
      },
    ],
  },
  {
    id: 'paper-study-voices',
    speaker: 'Елеонора',
    text: '«У книгарні кожен уже знає, як усе було», — каже Елеонора. «Міллер бачила чиюсь тінь, Нора впізнала почерк, а я нібито пам’ятаю кожну коробку». Томас з-за стелажа озивається: «Я пам’ятаю, що ми були мокрі й сердиті». «Оце хоча б схоже на правду», — бурчить Елеонора.',
    options: [
      {
        id: 'paper-voices-iris',
        label: 'Запитати, чи хоче Айріс долучитися',
        next: 'paper-study-iris',
        requires: ['final_ledger_iris_told'],
        unless: ['final_case_iris_declined'],
      },
      {
        id: 'paper-voices-miller',
        label: '«А що насправді бачила Міллер?»',
        next: 'paper-study-miller',
      },
      {
        id: 'paper-voices-back',
        label: 'Не видавати чутки за свідчення',
        next: 'paper-study',
        grants: ['final_paper_voices_heard'],
      },
    ],
  },
  {
    id: 'paper-study-iris',
    speaker: 'Айріс',
    text: 'Айріс зупиняється біля лампи, але не торкається аркушів. «Можна я спочатку прочитаю, що ви вже записали? Я не хочу, щоб ви питали мене, який фінал обрала б мама. Я цього не знаю». Нора простягає їй блокнот відкритим на сторінці з питаннями, не з відповідями.',
    textWhen: [
      {
        requires: ['final_letter_breach_disclosed'],
        text: 'Айріс не підходить до столу. «Після того, як ти відкрив мій лист, я не хочу ще одного допиту». Нора закриває блокнот. «Ми можемо просто показати список питань. Не зараз, якщо ти не хочеш». Айріс киває, але залишається біля дверей.',
      },
    ],
    options: [
      {
        id: 'paper-iris-respect',
        label: 'Не просити Айріс вгадувати чужі думки',
        next: 'paper-study',
        grants: ['final_paper_voices_heard', 'final_paper_iris_not_pressured'],
      },
    ],
  },
  {
    id: 'paper-study-miller',
    speaker: 'Пані Міллер',
    text: '«Тінь? Я бачила, як хтось ніс коробку через двір. Дощ лив стіною. Я не бачила ні обличчя, ні напису на коробці». Нора піднімає брову: «А вчора ви казали, що це був автор». «Вчора я сказала багато дурниць», — сердиться Міллер. «Мені тепер заборонено пам’ятати дощ?»',
    options: [
      {
        id: 'paper-miller-back',
        label: 'Записати лише те, що Міллер могла бачити',
        next: 'paper-study',
        grants: ['final_paper_voices_heard', 'final_paper_miller_limit_recorded'],
      },
    ],
  },
  {
    id: 'paper-study-decision',
    speaker: 'Нора',
    text: 'Нора кладе поруч три записи: «Краї не збігаються. Почерк не дає імені. Свідки не бачили, хто вклав аркуш у роман». Вона тримає олівець над чистим рядком. «Тепер що? Я можу написати, що ми не знаємо. Але це, боюся, найкоротша стаття в моєму житті».',
    options: [
      {
        id: 'paper-decision-private',
        label: 'Зберегти порівняння лише в приватних нотатках',
        next: 'paper-study-outcome',
        grants: ['final_paper_private_notes'],
      },
      {
        id: 'paper-decision-neutral',
        label: 'Дозволити Норі описати метод, але не називати автора',
        next: 'paper-study-outcome',
        unless: ['final_paper_iris_lent_originals'],
        grants: ['final_paper_neutral_report'],
      },
      {
        id: 'paper-decision-iris',
        label: 'Віддати Айріс список запитань без вимоги відповіді',
        next: 'paper-study-outcome',
        requires: ['final_ledger_iris_told'],
        unless: ['final_case_iris_declined'],
        grants: ['final_paper_iris_questions'],
      },
      {
        id: 'paper-decision-defer',
        label: 'Відкласти запис, доки не з’явиться нове свідчення',
        next: 'paper-study-outcome',
        grants: ['final_paper_deferred'],
      },
    ],
  },
  {
    id: 'paper-study-outcome',
    speaker: 'Елеонора',
    text: 'Елеонора вимикає лампу й обережно вкладає аркуші назад у захисні обкладинки. «Не знаю, чи ми наблизилися до фіналу. Зате тепер ніхто не покладе на них мокру чашку». Френк уже вмостився на звільненому столі. Нора сміється: «У нього всі історії закінчуються однаково».',
    textWhen: [
      {
        requires: ['final_paper_private_notes'],
        text: 'Нора ховає порівняння до приватного конверта. «Ніякої вітрини». Елеонора гасить лампу, а Френк сідає на порожнє місце між аркушами. Відповідей не побільшало, зате ніхто не отримав чужої історії без дозволу.',
      },
      {
        requires: ['final_paper_neutral_report'],
        text: 'Нора залишає в чернетці тільки опис порівняння: два різні краї, непевний почерк і жодного встановленого автора. Елеонора прибирає аркуші в захисні обкладинки. «Це вперше, коли твій текст коротший за мою квитанцію», — усміхається вона.',
      },
      {
        requires: ['final_paper_iris_questions'],
        text: 'Айріс забирає список питань, не обіцяючи відповідати. Нора закриває блокнот. Елеонора вимикає лампу, і Френк негайно займає тепле місце. Список не став ні дозволом на виставку, ні згодою на розголос.',
      },
      {
        requires: ['final_paper_deferred'],
        text: 'Нора ставить дату на порожній картці: «Повернутися, якщо з’явиться новий доказ». Елеонора вимикає лампу. Френк намагається вкрасти олівець. Сьогодні не довелося придумувати фінал, щоб зачинити книгарню.',
      },
    ],
    options: [
      {
        id: 'paper-study-return',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_paper_study_done'],
      },
    ],
  },
];

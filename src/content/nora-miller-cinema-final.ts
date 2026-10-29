import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * Nora and Miller can disagree about a memory without publishing a private portrait.
 * The finale records a plan, not an exhibition or consent that never happened.
 */
export const noraMillerCinemaFinalOption: DialogueOption = {
  id: 'final-nora-miller-cinema-topic',
  label: 'Поговорити з Норою й Міллер про старий кінотеатр',
  next: 'final-nora-miller-cinema',
  requires: ['nora_cinema_exhibit_discussed'],
  unless: ['final_nora_miller_cinema_done'],
};

export const millerCinemaFinalOption: DialogueOption = {
  id: 'final-miller-cinema-topic',
  label: 'Запитати Міллер про світлину старого кінотеатру',
  next: 'final-miller-cinema-intro',
  requires: ['miller_cinema_photo_discussed'],
  unless: ['final_nora_miller_cinema_done'],
};

export const noraMillerCinemaFinalNodes: readonly DialogueNode[] = [
  {
    id: 'final-miller-cinema-intro',
    speaker: 'Пані Міллер',
    text: '«У Нори знову цілий стіл фотографій. Я принесла листівку, але вона залишиться в мене». Міллер озирається на гостей. «Якщо вже говоритимемо про старий кінотеатр, давайте без мікрофона. Я не збираюся сперечатися з усім містом».',
    textWhen: [
      {
        requires: ['miller_cinema_family_story_private'],
        text: '«Я принесла листівку, але історію про брата розповідати всім не буду», — каже Міллер. «Нора знає, що вона приватна. Можемо поговорити про сам кінотеатр, якщо без чужих біографій».',
      },
    ],
    options: [
      {
        id: 'final-miller-cinema-open',
        label: '«Покличмо Нору, поговоримо за чаєм»',
        next: 'final-nora-miller-cinema',
      },
      {
        id: 'final-miller-cinema-later',
        label: '«Можемо повернутися до цього пізніше»',
        next: 'gathering',
        suspend: true,
      },
    ],
  },
  {
    id: 'final-nora-miller-cinema',
    speaker: 'Оповідач',
    text: 'Нора розкладає біля чайника кілька старих афіш. Пані Міллер підсуває стілець і одразу знаходить помилку в даті. «Я ж казала — літо!» Нора сміється: «Ти казала і про червень, і про вересень. Давай хоч чай наллємо, перш ніж почнемо четверту версію».',
    textWhen: [
      {
        requires: ['nora_cinema_exhibit_paused', 'miller_cinema_photo_discussed'],
        text: '«Виставку відклали», — каже Нора, ставлячи на стіл каталог афіш. Міллер підсовує листівку. «А я прийшла не сваритися. Тільки не називай мій спогад вигадкою». Нора бере чайник. «Не назву. Але й дату на стіні не вигадаю».',
      },
      {
        requires: ['nora_cinema_exhibit_consent_pending', 'miller_cinema_photo_discussed'],
        text: 'Нора тримає конверт із листом про дозвіл. «Відповіді досі немає». Міллер показує листівку, але не віддає її з рук. «Мою можеш описати. А ту, де люди, краще поки не чіпати». Вони вперше за вечір погоджуються без суперечки.',
      },
      {
        requires: ['nora_cinema_exhibit_facade', 'miller_cinema_photo_discussed'],
        text: 'Нора показує порожній фасад кінотеатру. «Оце можна повісити без зайвих запитань». Міллер придивляється: «Я там стояла в черзі. Не на цій світлині, звісно. Але черга була чудова». Нора усміхається й підсовує їй стілець.',
      },
      {
        requires: ['miller_cinema_family_story_private'],
        text: 'Міллер дістає листівку, але одразу перевертає її зображенням донизу. «Історію про брата я залишу вдома». Нора киває. «Я й не просила її для виставки. Хочеш подивитися каталог афіш?»',
      },
      {
        requires: ['nora_cinema_exhibit_discussed'],
        text: 'Нора поправляє папку зі світлинами. «Я ще не вирішила, що можна показати. Зате маю три різні дати й жодної певної». Міллер із сусіднього столу озивається: «Тільки не пиши, що я нічого не пам’ятаю!»',
      },
    ],
    options: [
      {
        id: 'final-nora-miller-compare',
        label: '«Може, порівняєте спогади без глядачів?»',
        next: 'final-nora-miller-compare',
      },
      {
        id: 'final-nora-miller-caption',
        label: '«Можна підготувати обережний підпис до фасаду»',
        next: 'final-nora-miller-caption',
      },
      {
        id: 'final-nora-miller-defer',
        label: '«Залишимо це до іншого дня»',
        next: 'final-nora-miller-defer',
      },
    ],
  },
  {
    id: 'final-nora-miller-compare',
    speaker: 'Нора',
    text: '«Я можу записати два спогади окремо, без імен на публічному стенді». Міллер поправляє окуляри. «А я можу принести свій блокнот. Там, щоправда, ще список варення». Нора киває: «Блокнот залишиться в тебе. Я лише занотую, де наші версії різняться».',
    options: [
      {
        id: 'final-nora-miller-compare-detail',
        label: '«І що ви вже точно пам’ятаєте?»',
        next: 'final-nora-miller-compare-result',
      },
    ],
  },
  {
    id: 'final-nora-miller-compare-result',
    speaker: 'Пані Міллер',
    text: '«Було людно, я запізнилася, а мій брат прийшов із квітами». Вона дивиться на Нору. «Про дату можеш поставити знак питання». Нора записує лише ці три речі. «А якщо знайдемо афішу, допишемо четверту».',
    options: [
      {
        id: 'final-nora-miller-compare-invite',
        label: '«Приходьте якось на розмову про старі фільми»',
        next: 'final-nora-miller-invite',
        grants: ['final_nora_miller_notes_compared'],
      },
      {
        id: 'final-nora-miller-compare-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_nora_miller_notes_compared', 'final_nora_miller_cinema_done'],
      },
    ],
  },
  {
    id: 'final-nora-miller-caption',
    speaker: 'Нора',
    text: '«Підписати порожній фасад — можливо. Але не ту світлину, де видно людей». Міллер зітхає: «Знову без моєї зеленої сукні». Нора підморгує: «Зате твоя сукня переживе всі наші суперечки про рік».',
    textWhen: [
      {
        requires: ['nora_cinema_exhibit_paused'],
        text: '«Ми ж відклали виставку», — нагадує Нора. «Але підпис можна підготувати на майбутнє. Це не означає, що завтра щось повісимо». Міллер бере олівець: «Тоді я хоча б перевірю, чи правильно написали назву кінотеатру».',
      },
    ],
    options: [
      {
        id: 'final-nora-miller-caption-detail',
        label: '«Як сформулюєте дату?»',
        next: 'final-nora-miller-caption-result',
      },
    ],
  },
  {
    id: 'final-nora-miller-caption-result',
    speaker: 'Нора',
    text: '«“Старий кінотеатр Беллвіка. Рік зйомки не встановлено”». Міллер читає вголос, морщить ніс і нарешті каже: «Ну добре. Але слово “старий” я б прибрала. Він тоді був новенький». Нора перекреслює одне слово. Табличка залишається чернеткою.',
    options: [
      {
        id: 'final-nora-miller-caption-invite',
        label: '«Може, обговоримо старе кіно на книжковому вечорі?»',
        next: 'final-nora-miller-invite',
        grants: ['final_nora_miller_caption_drafted'],
      },
      {
        id: 'final-nora-miller-caption-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_nora_miller_caption_drafted', 'final_nora_miller_cinema_done'],
      },
    ],
  },
  {
    id: 'final-nora-miller-defer',
    speaker: 'Пані Міллер',
    text: '«Невже ми вперше в житті не сперечатимемося до опівночі?» Міллер ставить листівку в торбу. Нора підсуває їй тарілку з останнім грушевим завитком. «Можемо посперечатися, кому він дістанеться». «Не можемо, — відповідає Міллер. — Він уже мій».',
    options: [
      {
        id: 'final-nora-miller-defer-detail',
        label: '«А рамка й фотографії?»',
        next: 'final-nora-miller-defer-result',
      },
    ],
  },
  {
    id: 'final-nora-miller-defer-result',
    speaker: 'Нора',
    text: '«Рамка почекає. Я поверну фотографії в теку, а Міллер забере свою листівку». Міллер піднімає палець: «І ніяких оголошень, що я передумала щодо червня. Я лише погодилася не друкувати його на плакаті».',
    options: [
      {
        id: 'final-nora-miller-defer-invite',
        label: '«Зате можете прийти поговорити про фільми»',
        next: 'final-nora-miller-invite',
        grants: ['final_nora_miller_exhibit_deferred'],
      },
      {
        id: 'final-nora-miller-defer-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_nora_miller_exhibit_deferred', 'final_nora_miller_cinema_done'],
      },
    ],
  },
  {
    id: 'final-nora-miller-invite',
    speaker: 'Оповідач',
    text: '«Якщо будуть крісла, прийду», — каже Міллер. Нора сміється: «А якщо крісел не буде, Томас принесе». Вони не обіцяють нічого напевно, але Міллер вже питає, чи можна принести печиво, а Нора записує назву фільму на серветці.',
    options: [
      {
        id: 'final-nora-miller-invite-back',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_nora_miller_reading_invited', 'final_nora_miller_cinema_done'],
      },
    ],
  },
];

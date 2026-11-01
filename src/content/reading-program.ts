import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** Published fiction for the public reading; never private letters or fragments. */
export const readingProgramOption: DialogueOption = {
  id: 'reading-program',
  label: 'Обрати книжку й почати спільне читання',
  next: 'reading-program',
  unless: ['final_reading_program_done'],
};

export const readingProgramNodes: readonly DialogueNode[] = [
  {
    id: 'reading-program',
    speaker: 'Анна',
    text: 'Анна звільняє місце під лампою. «У мене є три видані книжки. По сторінці з кожної читати не будемо — Міллер не встигне посперечатися». Та обурено піднімає голову. «Я встигну». Мара розставляє чашки подалі від паперу. Яку історію прочитаємо?',
    options: [
      {
        id: 'reading-station',
        label: '«Скляна станція» — як починають заново',
        next: 'reading-station',
        grants: ['final_reading_station'],
      },
      {
        id: 'reading-roads',
        label: '«Мапи незавершених доріг» — як обирають дорогу',
        next: 'reading-roads',
        grants: ['final_reading_roads'],
      },
      {
        id: 'reading-letters',
        label: '«Листи до незнайомця» — несподівана відповідь',
        next: 'reading-letters',
        grants: ['final_reading_letters'],
      },
      {
        id: 'reading-later',
        label: 'Підготувати чай і повернутися до вибору пізніше',
        next: 'gathering',
        suspend: true,
        repeatability: 'repeatable',
      },
    ],
  },
  {
    id: 'reading-station',
    speaker: 'Анна',
    text: '«На станції не було жодного пасажира. Олена все одно витерла лаву, поклала на неї новий розклад і сіла чекати. Першим прийшов чоловік, якому не треба було нікуди їхати. Він спитав, чи тут досі продають чай».\n\nАнна робить паузу. Лео дивиться на ілюстрацію: «На нашій лаві теж ніхто не чекає потяга. Там найкраще ловить телефон». Елеонора фиркає: «А я колись приходила саме по чай». Хтось із гостей підсуває стілець ближче. Анна продовжує читати.',
    options: [
      {
        id: 'reading-station-back',
        label: 'Залишити книжку під лампою й повернутися до гостей',
        next: 'gathering',
        grants: ['final_reading_program_done'],
      },
    ],
  },
  {
    id: 'reading-roads',
    speaker: 'Анна',
    text: '«На мапі дорога закінчувалася біля річки. Тамара вже зібралася скласти її, коли помітила міст. Маленький, кривий і зовсім не схожий на те, що вона вміла креслити. На другому березі хтось махав їй мокрою шапкою».\n\n«Я б спочатку перевірив опори», — тихо каже Томас. Мара штовхає Лео ліктем: «А ти — розклад мосту». «Поромів», — виправляє він і сам починає сміятися. Анна чекає, поки вони вгамуються, й читає далі. Нора закладає пальцем сторінку, щоб потім знайти цей уривок.',
    options: [
      {
        id: 'reading-roads-back',
        label: 'Посунути Норі закладку й повернутися до гостей',
        next: 'gathering',
        grants: ['final_reading_program_done'],
      },
    ],
  },
  {
    id: 'reading-letters',
    speaker: 'Анна',
    text: '«Відповідь прийшла у вівторок. Замість довгого пояснення там було три рядки: “Парасолю знайшла. Ручку полагодила. Зайдіть, якщо хочете її забрати”. А нижче іншим чорнилом: “Чай о п’ятій”».\n\nПані Міллер задоволено киває: «Оце нормальний лист. Одразу зрозуміло, коли приходити». Нора питає, чи парасолю хоча б упізнали. Айріс розглядає намальовану чашку на полях видання й усміхається. Ніхто не просить її розповідати про власні листи. Анна перегортає сторінку.',
    options: [
      {
        id: 'reading-letters-back',
        label: 'Налити ще чаю й повернутися до гостей',
        next: 'gathering',
        grants: ['final_reading_program_done'],
      },
    ],
  },
];

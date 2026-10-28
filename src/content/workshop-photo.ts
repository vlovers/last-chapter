import type { DialogueNode, DialogueOption } from '../game/dialogue';

/**
 * A voluntary, evidence-safe follow-up to the box-17 resolution.
 * The workshop photograph is a false lead, not a second box-17 proof.
 */
export const workshopPhotoOption: DialogueOption = {
  id: 'workshop-photo',
  label: 'Повернутися до фотографії палітурної майстерні',
  next: 'workshop-photo',
  requires: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
  unless: ['final_workshop_photo_complete'],
};

export const workshopPhotoNodes: readonly DialogueNode[] = [
  {
    id: 'workshop-photo',
    speaker: 'Нора',
    text: 'Нора тримає стару світлину за краї, наче це гарячий пиріг. «Пам’ятаєш, як ми зраділи цій сімнадцятці? Я навіть хотіла намалювати стрілку». Елеонора поправляє окуляри: «На коробці майстерні була сімка. Подряпина поруч — від цвяха. Я сама ту полицю лагодила». Френк тягнеться лапою до кутика фотографії, і Нора піднімає її вище. «Зате один підозрюваний у нас точно є».',
    textWhen: [
      {
        requires: ['final_miller_ledger_rumor_seeded'],
        text: 'Нора ховає світлину від чужих поглядів. «Після того, що Міллер розповіла про нібито знайдений фінал, ще однієї сенсації нам не треба». Елеонора показує на цифру: «Це сімка. Поруч подряпина від цвяха, я сама ремонтувала полицю». Френк намагається сісти на фото. «Ось хто тут справді хоче залишити слід», — каже Нора.',
      },
    ],
    options: [
      {
        id: 'photo-compare',
        label: 'Зіставити світлину із записом Елеонори',
        next: 'workshop-photo-compare',
      },
      {
        id: 'photo-ask',
        label: 'Запитати, чому Нора так трималася за версію',
        next: 'workshop-photo-ask',
      },
      {
        id: 'photo-leave',
        label: 'Не розбирати чужі коробки сьогодні',
        next: 'workshop-photo-leave',
      },
    ],
  },
  {
    id: 'workshop-photo-compare',
    speaker: 'Елеонора',
    text: '«У журналі я записала, що сушила розрізнені аркуші в коробці сімнадцять. У книгарні, не в майстерні». Вона кладе олівець поряд зі світлиною, не торкаючись її. «Тут номер полиці. Навіть якщо б там стояло сімнадцять, це ще не зробило б її авторкою». Нора фиркає: «От бачиш, чому з тебе ніколи не вийде рекламниця детективів?»',
    options: [
      {
        id: 'photo-annotate',
        label: 'Додати до закритого опису обидва джерела окремо',
        next: 'workshop-photo-result',
        grants: ['final_workshop_photo_sources_separated'],
      },
      {
        id: 'photo-unmarked',
        label: 'Залишити світлину без підписів до перевірки',
        next: 'workshop-photo-result',
        grants: ['final_workshop_photo_unmarked'],
      },
    ],
  },
  {
    id: 'workshop-photo-ask',
    speaker: 'Нора',
    text: '«Бо це було красиво, — каже Нора. — Одна цифра, одна світлина, і ось тобі злодій у фіналі». Вона дивиться на свої нотатки. «А потім я згадала, як сама підписала книжку не тим прізвищем. Покупець два тижні шукав неіснуючого автора». Елеонора всміхається: «Він досі заходить питати, чи ти знайшла того письменника».',
    options: [
      {
        id: 'photo-admit',
        label: 'Запропонувати Норі виправити свою нотатку',
        next: 'workshop-photo-result',
        grants: ['final_workshop_photo_nora_corrected'],
      },
      {
        id: 'photo-keep-joke',
        label: 'Залишити помилку між вами, без вистави для гостей',
        next: 'workshop-photo-result',
        grants: ['final_workshop_photo_private_joke'],
      },
    ],
  },
  {
    id: 'workshop-photo-leave',
    speaker: 'Оповідач',
    text: 'Нора прибирає світлину в конверт. «Тоді завтра візьмемося за справжню загадку: хто поставив пригодницькі романи між кулінарними». Елеонора не відводить очей від Френка. Кіт повільно стягує з прилавка закладку.',
    options: [
      {
        id: 'photo-leave-finish',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_workshop_photo_complete', 'final_workshop_photo_deferred'],
      },
    ],
  },
  {
    id: 'workshop-photo-result',
    speaker: 'Нора',
    text: 'Нора ставить у закритому описі дві окремі позначки: «коробка книгарні № 17 — підтверджено журналом» і «цифра на світлині майстерні — 7». «Нарешті щось, що не треба вгадувати», — каже вона. Елеонора забирає світлину зі столу, перш ніж Френк встигне її вкусити.',
    textWhen: [
      {
        requires: ['final_workshop_photo_unmarked'],
        text: 'Нора повертає світлину в конверт без нових підписів. «У мене язик свербить написати хоч щось», — зізнається вона. «Напиши цінники на книжки», — радить Елеонора. Френк уже розлігся на чистому папері.',
      },
      {
        requires: ['final_workshop_photo_nora_corrected'],
        text: 'Нора перекреслює у своєму зошиті слово «сімнадцять» біля світлини. «Ненавиджу виправляти гарні версії». Елеонора заглядає через плече: «Тоді напиши ще, що мій чайник не причетний». Нора залишає внизу маленький знак питання.',
      },
      {
        requires: ['final_workshop_photo_private_joke'],
        text: 'Нора згортає нотатки. «Добре. Ніхто не почує про нашу геніальну сімнадцятку». Елеонора киває: «Особливо Міллер». Вони обидві дивляться на Френка, який уже вкрав стрічку від конверта.',
      },
    ],
    options: [
      {
        id: 'photo-result-finish',
        label: 'Повернутися до гостей',
        next: 'gathering',
        grants: ['final_workshop_photo_complete'],
      },
    ],
  },
];

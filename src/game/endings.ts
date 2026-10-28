import type { ChapterState } from './chapter';

export interface SeasonEnding {
  readonly title: string;
  readonly letter: string;
  readonly community: string;
  readonly epilogue: string;
}

/** Deterministic, spoiler-safe epilogue computed from the player's actual choices. */
export function seasonEnding(state: Pick<ChapterState, 'flags'>): SeasonEnding {
  const flags = new Set(state.flags);
  const letter = flags.has('final_mutual_conversation')
    ? 'Айріс і Лео поговорили наодинці. Що саме вони сказали, залишається їхньою історією.'
    : flags.has('final_letter_kept_private')
      ? 'Айріс залишила лист у себе. Ніхто не вимагав відповіді раніше, ніж вона буде готова.'
      : 'Старий лист не став публічним видовищем. Його майбутнє залишається відкритим.';
  const pressedPrivacy = [
    'anna_rumor_pressed',
    'thomas_privacy_pressed',
    'nora_confidentiality_pressed',
  ].some((flag) => flags.has(flag));
  const community =
    flags.has('final_repaired_rumor') || flags.has('final_respected_privacy')
      ? pressedPrivacy
        ? 'На вечорі прозвучало прохання не переказувати чужих історій. Воно не стирає попередніх нав’язливих запитань, але залишає місце для іншої поведінки.'
        : 'На вечорі історій гості говорили про різницю між турботою й цікавістю. Ніхто не може обіцяти за все місто, але сьогодні чужі таємниці не стали розвагою.'
      : 'Гості розійшлися з новими книжками й запитаннями, які не обов’язково мають негайну відповідь.';
  // Independent plans can coexist: supporting Iris must not erase Mara's future,
  // and neither choice should remove the bookstore's next book-club meeting.
  const epilogue = [
    ...(flags.has('final_iris_exhibition')
      ? ['На стіні біля вікна з’явилася серія малюнків Айріс — «Вікна Беллвіка».']
      : []),
    ...(flags.has('mara_future_supported')
      ? ['Мара почала шукати місце для маленького столика з кавою та книжками біля пекарні.']
      : []),
    ...(flags.has('final_quiet_manuscript_returned')
      ? ['Айріс забрала сторінку додому. Вона сама вирішить, чи повертатися до пошуків.']
      : flags.has('final_quiet_manuscript_archived')
        ? ['Знайдену сторінку зберегли у книгарні без припущень про її автора.']
        : flags.has('iris_quiet_page_privacy_respected')
          ? ['Айріс попросила поки не показувати знайдену сторінку іншим.']
          : flags.has('iris_quiet_page_identity_questioned')
            ? ['Айріс погодилася обережно пошукати власника знайденої сторінки.']
            : flags.has('quiet_evening_page_found')
              ? ['Знайдена ввечері сторінка залишилася нерозгаданою.']
              : []),
    ...(flags.has('final_chapter_home_version_read')
      ? [
          'Айріс залишила на поличці копію уривка про повернення. Вона ще не вирішила, чи це справжній фінал.',
        ]
      : flags.has('final_chapter_departure_version_read')
        ? [
            'Айріс зберегла уривок про ранкову пекарню. Ніхто поки не знає, чи він завершує історію.',
          ]
        : flags.has('final_chapter_reading_declined')
          ? ['Два уривки залишилися в альбомі Айріс. Вона відкриє їх, коли сама захоче.']
          : []),
    ...(flags.has('final_chapter_mara_supported')
      ? ['Мара пообіцяла принести до наступної зустрічі булочки для «команди сніданку».']
      : flags.has('final_chapter_iris_supported')
        ? [
            'Айріс записала на закладці: «Повернутися — теж вибір». Мара намалювала поруч маленький чайник.',
          ]
        : flags.has('final_chapter_versions_questioned')
          ? [
              'Мара й Айріс домовилися перечитати рукопис від початку, перш ніж сперечатися про останній рядок.',
            ]
          : []),
    ...(flags.has('final_margin_handwriting_compared')
      ? [
          'Фотографію майстерні й сторінку вирішили порівняти уважніше. Цифра сімнадцять поки лишилася загадкою.',
        ]
      : flags.has('final_margin_inquiry_paused')
        ? [
            'Айріс прибрала фотографію майстерні до альбому. Сьогодні вона хотіла побути серед друзів, а не серед доказів.',
          ]
        : []),
    ...(flags.has('final_workshop_paper_compared')
      ? ['На двох уривках помітили різні краї паперу. Айріс вирішила не називати їх частинами одного рукопису без перевірки.']
      : flags.has('final_workshop_permission_requested')
        ? ['Айріс вирішила написати реставраторці й попросити дозволу оглянути старі коробки.']
        : flags.has('final_workshop_search_deferred')
          ? ['Фотографія майстерні залишилася в альбомі. Розмова про коробки почекає до іншого дня.']
          : []),
    ...(flags.has('final_provenance_iris_custody')
      ? ['Айріс забрала оригінали обох аркушів і домовилася перевірити їхнє походження, перш ніж вирішувати щось про публікацію.']
      : flags.has('final_provenance_consent_archive')
        ? ['З дозволу Айріс у книгарні залишилися лише копії сторінок, без імені автора, якого ще не встановили.']
        : flags.has('final_provenance_wait_for_evidence')
          ? ['Рішення про сторінки відклали до огляду коробки в майстерні. Оригінали поки залишилися в Айріс.']
          : []),
    ...(flags.has('book_club_started')
      ? ['Наступного тижня на дверях з’явилося нове оголошення про книжковий клуб.']
      : [
          flags.has('evening_shop_kept_open')
            ? 'Того вечора замість книжкового клубу книгарня залишилася тихою. Френк заснув біля вікна, а на столі лишилися книжки для тих, хто прийде завтра.'
            : 'Біля каси залишили чистий аркуш: може, хтось іще захоче зібратися тут за книжкою.',
        ]),
  ].join(' ');
  return { title: 'Останній розділ · Перший сезон', letter, community, epilogue };
}

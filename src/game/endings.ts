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

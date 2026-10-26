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
  const letter =
    flags.has('opened_private_letter') && !flags.has('iris_letter_breach_admitted')
      ? 'Печатку на листі зламано. Айріс не знає всієї правди про те, хто його читав, і це мовчання залишається між вами.'
      : flags.has('final_accepted_consequences')
        ? 'Айріс почула зізнання про відкритий без дозволу лист. Вона не дала обіцянки пробачити — і цього вечора ви не вимагали її.'
        : flags.has('final_mutual_conversation')
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
  const epilogue = flags.has('chapter_accused_eleanor')
    ? 'Після публічного звинувачення Елеонора пішла раніше. Наступного ранку її крісло порожнє, а Френк спить на залишеній закладці.'
    : flags.has('chapter_blame_shifted')
      ? 'Міллер не забула, як ви переклали на неї відповідальність за власну вигадку. Тепер вона вітається стримано і не заходить на чай.'
      : flags.has('missing_chapter_false_claim') && !flags.has('chapter_lie_admitted')
        ? 'Чутка про зізнання Генрі розійшлася містом. Люди заходять до книгарні не лише по книжки, а й по відповідь, якої у вас немає.'
        : flags.has('chapter_provenance_checked') && flags.has('chapter_kept_private')
          ? 'На столі залишилися афіша й копія сторінки з невідповідними датами. Елеонора допоможе перевірити почерк, перш ніж хтось назве підозру доказом.'
          : flags.has('final_iris_exhibition')
            ? 'На стіні біля вікна з’явилася серія малюнків Айріс — «Вікна Беллвіка».'
            : flags.has('mara_future_supported')
              ? 'Мара почала шукати місце для маленького столика з кавою та книжками біля пекарні.'
              : 'Наступного тижня на дверях з’явилося нове оголошення про книжковий клуб.';
  return { title: 'Останній розділ · Перший сезон', letter, community, epilogue };
}

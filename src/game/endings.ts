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
  const community = flags.has('final_repaired_rumor') || flags.has('final_respected_privacy')
    ? 'Беллвік вчиться розрізняти цікавість і турботу. Чужі таємниці більше не є темою вечірніх розваг.'
    : 'Гості розійшлися з новими книжками й запитаннями, які не обов’язково мають негайну відповідь.';
  const epilogue = flags.has('final_iris_exhibition')
    ? 'На стіні біля вікна з’явилася серія малюнків Айріс — «Вікна Беллвіка».'
    : flags.has('mara_future_supported')
      ? 'Мара почала шукати місце для маленького столика з кавою та книжками біля пекарні.'
      : 'Наступного тижня на дверях з’явилося нове оголошення про книжковий клуб.';
  return { title: 'Останній розділ · Перший сезон', letter, community, epilogue };
}

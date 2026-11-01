import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { irisDecision } from '../src/content/day-four-iris';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';
import { seasonEnding } from '../src/game/endings';

const choose = (state: DialogueState, id: string) => selectOption(finalReading, state, id);
const restore = (dialogue: DialogueState) => {
  const state = { stage: 'day5-reading' as const, flags: dialogue.flags, dialogue };
  const restored = decodeSave(encodeSave(state));
  expect(restored).toEqual(state);
  return restored!.dialogue;
};

describe('Production V2: public reading and durable final consequences', () => {
  it.each([
    ['station', 'Скляну станцію'],
    ['roads', 'Мап незавершених доріг'],
    ['letters', 'Листів до незнайомця'],
  ])(
    'reading %s is playable without private discoveries, resumes, and cannot be replaced',
    (book, title) => {
      let state = choose(startDialogue(finalReading), 'open');
      state = choose(state, 'reading-program');
      expect(availableOptions(finalReading, state)).toHaveLength(4);
      state = restore(choose(state, 'reading-' + book));
      expect(currentNode(finalReading, state).text).toContain('Анна');
      state = restore(choose(state, 'reading-' + book + '-back'));
      expect(availableOptions(finalReading, state).map((o) => o.id)).not.toContain(
        'reading-program',
      );
      expect(state.flags.filter((f) => /^final_reading_(station|roads|letters)$/.test(f))).toEqual([
        'final_reading_' + book,
      ]);
      const ending = seasonEnding({ flags: state.flags });
      expect(ending.epilogue).toContain(title);
      expect(state.flags).not.toContain('opened_private_letter');
      expect(choose(state, 'close').node).toBe('end');
    },
  );

  it('deferring the reading leaves it available after save/load', () => {
    let state = choose(startDialogue(finalReading), 'open');
    state = choose(state, 'reading-program');
    state = restore(choose(state, 'reading-later'));
    expect(availableOptions(finalReading, state).map((o) => o.id)).toContain('reading-program');
    expect(state.flags).not.toContain('final_reading_program_done');
  });

  it.each([
    [['opened_private_letter'], 'не зізнався'],
    [['opened_private_letter', 'iris_letter_breach_admitted'], 'Айріс знає'],
    [['opened_private_letter', 'final_accepted_consequences'], 'не обіцяла пробачення'],
    [['opened_private_letter', 'final_letter_kept_private'], 'не зізнався'],
    [['final_mutual_conversation'], 'поговорили наодинці'],
    [['final_letter_kept_private'], 'залишила лист у себе'],
  ] as const)('season screen preserves the actual letter history %j', (flags, text) => {
    const ending = seasonEnding({ flags });
    expect(ending.letter).toContain(text);
    if ((flags as readonly string[]).includes('opened_private_letter'))
      expect(ending.letter).not.toContain('поговорили наодинці');
  });

  it('confession and a later good deed do not remove the player’s rumor responsibility', () => {
    expect(seasonEnding({ flags: ['rumor_amplified', 'final_repaired_rumor'] }).epilogue).toContain(
      'чуже виправлення не стало твоїм вибаченням',
    );
    expect(
      seasonEnding({
        flags: ['rumor_amplified', 'final_player_rumor_owned', 'final_repaired_rumor'],
      }).epilogue,
    ).toContain('Вони не просили посередника');
  });

  it('a private one-picture decision remains one picture through the finale and save', () => {
    let iris: DialogueState = startDialogue(irisDecision);
    for (const id of [
      'welcome',
      'iris-exhibition-plan',
      'iris-exhibition-private',
      'iris-exhibition-result-back',
      'art',
      'art-done-back',
    ])
      iris = selectOption(irisDecision, iris, id);
    let state = choose(
      { ...startDialogue(finalReading), flags: [...iris.flags, 'iris_offered_exhibition'] },
      'open',
    );
    state = choose(state, 'iris');
    expect(currentNode(finalReading, state).text).toContain('одну рамку');
    state = restore(choose(state, 'iris-exhibit'));
    expect(currentNode(finalReading, state).text).toContain('одну рамку');
    state = restore(choose(state, 'exhibit-back'));
    expect(currentNode(finalReading, state).text).not.toContain('третій малюнок');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('один малюнок');
  });

  it('reading a manuscript extract does not publish a copy', () => {
    const ending = seasonEnding({
      flags: ['final_chapter_home_version_read', 'final_provenance_iris_custody'],
    });
    expect(ending.epilogue).toContain('не стало дозволом');
    expect(ending.epilogue).not.toContain('залишила на поличці копію');
  });
});

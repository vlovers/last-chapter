import { describe, expect, it } from 'vitest';
import { leoDecision } from '../src/content/day-four-leo';
import { advanceToDayFourLeo, finishFourthDay, type ChapterState } from '../src/game/chapter';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 4: Leo and mutual consent', () => {
  it('validates the dialogue graph', () => expect(validateDialogue(leoDecision)).toEqual([]));
  it('gates old evidence and letter by actual discoveries', () => {
    const greet = selectOption(leoDecision, startDialogue(leoDecision), 'welcome');
    const options = availableOptions(leoDecision, greet).map((option) => option.id);
    expect(options).not.toContain('letter');
    expect(options).not.toContain('evidence');
    const informed = { ...greet, flags: ['saw_envelope', 'eleanor_confirmed_reservation'] };
    const available = availableOptions(leoDecision, informed).map((option) => option.id);
    expect(available).toContain('letter');
    expect(available).toContain('evidence');
  });
  it('guards transitions and preserves letter decisions through a save', () => {
    const maraDone: ChapterState = {
      stage: 'day4-mara',
      dialogue: { ...startDialogue(leoDecision), node: 'end' },
      flags: ['saw_envelope', 'mara_letter_privacy_respected'],
    };
    let state = advanceToDayFourLeo(maraDone);
    expect(() => finishFourthDay(state)).toThrow();
    for (const id of ['welcome', 'letter', 'letter-ask', 'ask-back', 'finish']) {
      const next = selectOption(leoDecision, state.dialogue, id);
      state = { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
    }
    state = finishFourthDay(state);
    expect(state.stage).toBe('day4-complete');
    expect(state.flags).toContain('leo_open_to_conversation');
    expect(state.flags).toContain('mara_letter_privacy_respected');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
});

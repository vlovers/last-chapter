import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import { finishFourthDay, startFourthDay, type ChapterState } from '../src/game/chapter';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 4: Iris and the sealed letter', () => {
  it('has a valid dialogue graph', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
  });
  it('does not reveal letter discussion without finding the envelope', () => {
    const welcome = selectOption(irisDecision, startDialogue(irisDecision), 'welcome');
    expect(availableOptions(irisDecision, welcome).map((option) => option.id)).not.toContain('letter');
    const withEvidence = { ...welcome, flags: ['saw_envelope'] };
    expect(availableOptions(irisDecision, withEvidence).map((option) => option.id)).toContain('letter');
  });
  it('preserves consent choices across saves and does not advance prematurely', () => {
    const previous: ChapterState = {
      stage: 'day3-complete',
      dialogue: startDialogue(irisDecision),
      flags: ['saw_envelope', 'iris_requested_privacy'],
    };
    let state = startFourthDay(previous);
    expect(() => finishFourthDay(state)).toThrow();
    for (const id of ['welcome', 'letter', 'offer', 'offer-back', 'leave']) {
      const next = selectOption(irisDecision, state.dialogue, id);
      state = { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
    }
    expect(state.flags).toContain('iris_letter_delivery_offered');
    expect(state.flags).toContain('iris_letter_choice_respected');
    state = finishFourthDay(state);
    expect(state.stage).toBe('day4-complete');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
});

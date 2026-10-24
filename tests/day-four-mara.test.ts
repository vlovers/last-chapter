import { describe, expect, it } from 'vitest';
import { maraDecision } from '../src/content/day-four-mara';
import { advanceToDayFourMara, finishFourthDay, type ChapterState } from '../src/game/chapter';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 4: Mara has her own story', () => {
  it('has a valid graph', () => expect(validateDialogue(maraDecision)).toEqual([]));
  it('only refers to the specific gift when that book was sold', () => {
    const greet = selectOption(maraDecision, startDialogue(maraDecision), 'greet');
    const book = selectOption(maraDecision, greet, 'book');
    expect(availableOptions(maraDecision, book).map((option) => option.id)).not.toContain(
      'station',
    );
    const withGift = { ...book, flags: ['sold_station'] };
    expect(availableOptions(maraDecision, withGift).map((option) => option.id)).toContain(
      'station',
    );
    expect(availableOptions(maraDecision, withGift).map((option) => option.id)).not.toContain(
      'roads',
    );
  });
  it('does not expose the private letter before it is discovered', () => {
    const greet = selectOption(maraDecision, startDialogue(maraDecision), 'greet');
    expect(availableOptions(maraDecision, greet).map((option) => option.id)).not.toContain(
      'letter',
    );
  });
  it('persists Mara’s choices and guards day transitions', () => {
    const irisDone: ChapterState = {
      stage: 'day4-iris',
      dialogue: { ...startDialogue(maraDecision), node: 'end' },
      flags: ['saw_envelope', 'sold_roads', 'iris_letter_choice_respected'],
    };
    let state = advanceToDayFourMara(irisDone);
    expect(() => finishFourthDay(state)).toThrow();
    for (const id of ['greet', 'letter', 'privacy', 'privacy-back', 'finish']) {
      const next = selectOption(maraDecision, state.dialogue, id);
      state = { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
    }
    state = finishFourthDay(state);
    expect(state.flags).toContain('mara_letter_privacy_respected');
    expect(state.flags).toContain('iris_letter_choice_respected');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
});

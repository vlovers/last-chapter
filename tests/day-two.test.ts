import { describe, expect, it } from 'vitest';
import { irisVisit } from '../src/content/iris';
import {
  advanceChapter,
  advanceSecondDay,
  advanceToLeo,
  chooseChapterOption,
  finishSecondDay,
  startChapter,
  startSecondDay,
} from '../src/game/chapter';
import { currentNode, validateDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 2 Iris encounter', () => {
  it('validates its branching story', () => {
    expect(validateDialogue(irisVisit)).toEqual([]);
  });
  it('keeps the sealed letter private and persists prior discoveries', () => {
    let state = startChapter();
    for (const id of ['greet', 'books', 'orchard', 'leave-orchard'])
      state = chooseChapterOption(state, id);
    state = advanceChapter(state);
    for (const id of ['hello', 'thank', 'professional', 'station', 'finish-station'])
      state = chooseChapterOption(state, id);
    state = advanceChapter(state);
    for (const id of ['receipt', 'receipt-back', 'letter', 'letter-conclude', 'keep-and-ask'])
      state = chooseChapterOption(state, id);
    state = advanceChapter(state);
    state = startSecondDay(state);
    for (const id of ['welcome', 'ask-letter', 'letter-ask', 'keep-back'])
      state = chooseChapterOption(state, id);
    expect(currentNode(irisVisit, state.dialogue).id).toBe('end');
    expect(state.flags).toContain('iris_requested_privacy');
    expect(state.flags).toContain('letter_secured');
    expect(state.flags).not.toContain('opened_private_letter');
    expect(decodeSave(encodeSave(state))).toEqual(state);
    state = advanceSecondDay(state);
    expect(state.stage).toBe('anna');
    for (const id of [
      'hello',
      'teacher',
      'teacher-rest',
      'rest-listen',
      'listened-books',
      'maps',
      'purchase-end',
    ])
      state = chooseChapterOption(state, id);
    expect(state.flags).toContain('anna_listened_to');
    state = advanceToLeo(state);
    for (const id of ['greet', 'letter', 'letter-privacy', 'privacy-end'])
      state = chooseChapterOption(state, id);
    expect(state.flags).toContain('leo_letter_disclosed_carefully');
    state = finishSecondDay(state);
    expect(state.stage).toBe('day2-complete');
  });
  it('does not permit Day 2 before completing Day 1', () => {
    expect(() => startSecondDay(startChapter())).toThrow();
  });
});

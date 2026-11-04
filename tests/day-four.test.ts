import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import {
  advanceToDayFourMara,
  finishFourthDay,
  startFourthDay,
  type ChapterState,
} from '../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 4: Iris and the sealed letter', () => {
  it('has a valid dialogue graph', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
  });
  it('does not reveal letter discussion without finding the envelope', () => {
    const welcome = selectOption(irisDecision, startDialogue(irisDecision), 'welcome');
    expect(availableOptions(irisDecision, welcome).map((option) => option.id)).not.toContain(
      'letter',
    );
    const withEvidence = { ...welcome, flags: ['saw_envelope'] };
    expect(availableOptions(irisDecision, withEvidence).map((option) => option.id)).toContain(
      'letter',
    );
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
    state = advanceToDayFourMara(state);
    expect(state.stage).toBe('day4-mara');
    expect(() => finishFourthDay(state)).toThrow('Finish Leo first');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('does not invent a found envelope when Day 4 begins without one', () => {
    const previous: ChapterState = {
      stage: 'day3-complete',
      dialogue: startDialogue(irisDecision),
      flags: [],
    };
    const dayFour = startFourthDay(previous);
    const welcome = selectOption(irisDecision, dayFour.dialogue, 'welcome');
    expect(availableOptions(irisDecision, welcome).map((option) => option.id)).not.toEqual(
      expect.arrayContaining(['iris-letter-feeling', 'iris-letter-ask', 'letter']),
    );
    for (const id of ['iris-letter-feeling', 'iris-letter-ask', 'letter']) {
      expect(availableOptions(irisDecision, welcome).map((option) => option.id)).not.toContain(id);
      expect(() => selectOption(irisDecision, welcome, id)).toThrow('Option unavailable');
    }
    expect(currentNode(irisDecision, welcome).text).not.toMatch(/конверт|лист/u);
    const restored = decodeSave(encodeSave({ ...dayFour, dialogue: welcome }));
    expect(restored).not.toBeNull();
    expect(restored?.flags).not.toContain('saw_envelope');
    expect(currentNode(irisDecision, restored!.dialogue).text).toBe(
      currentNode(irisDecision, welcome).text,
    );
    expect(
      availableOptions(irisDecision, restored!.dialogue).map((option) => option.id),
    ).not.toContain('letter');
    const end = selectOption(irisDecision, welcome, 'leave');
    expect(currentNode(irisDecision, end).text).not.toContain('Конверт');
    expect(advanceToDayFourMara({ ...dayFour, dialogue: end }).stage).toBe('day4-mara');
  });

  it('preserves the original envelope scenes when it was actually found', () => {
    const previous: ChapterState = {
      stage: 'day3-complete',
      dialogue: startDialogue(irisDecision),
      flags: ['saw_envelope'],
    };
    const welcome = selectOption(irisDecision, startFourthDay(previous).dialogue, 'welcome');
    expect(currentNode(irisDecision, welcome).text).toContain('знайдений конверт');
    for (const id of ['iris-letter-feeling', 'iris-letter-ask', 'letter']) {
      expect(availableOptions(irisDecision, welcome).map((option) => option.id)).toContain(id);
    }
    const end = selectOption(irisDecision, welcome, 'leave');
    expect(currentNode(irisDecision, end).text).toContain('Конверт залишається за касою');
  });

  it('does not replay Iris’s completed boundaries scene from a later letter question', () => {
    const start = {
      ...startDialogue(irisDecision),
      flags: ['saw_envelope', 'iris_day_four_boundary_heard'],
    };
    const welcome = selectOption(irisDecision, start, 'welcome');
    const question = selectOption(irisDecision, welcome, 'iris-letter-ask');
    expect(availableOptions(irisDecision, question).map((option) => option.id)).toEqual([
      'iris-letter-ask-back',
    ]);
    const returned = selectOption(irisDecision, question, 'iris-letter-ask-back');
    expect(returned.node).toBe('welcome');
    expect(returned.flags).toContain('iris_day_four_letter_fear_heard');
    expect(availableOptions(irisDecision, returned).map((option) => option.id)).not.toContain(
      'iris-boundaries',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { firstEvening } from '../src/content/evening';
import { currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

function follow(story: typeof maraVisit, ids: readonly string[]) {
  let state = startDialogue(story);
  for (const id of ids) state = selectOption(story, state, id);
  return state;
}

describe('Day one narrative consequences', () => {
  it('keeps Mara and evening dialogue references valid', () => {
    expect(validateDialogue(maraVisit)).toEqual([]);
    expect(validateDialogue(firstEvening)).toEqual([]);
  });

  it('lets Mara discuss forgiveness and return to buying a gift', () => {
    const state = follow(maraVisit, [
      'hello',
      'talk',
      'trust',
      'trust-forgive',
      'trust-forgive-deeper',
      'trust-ending-order',
    ]);
    expect(state.node).toBe('order');
    expect(state.flags).toContain('mara_discussed_forgiveness');
    expect(state.flags).toContain('mara_autonomy_discussed');
  });

  it('respects Mara choosing silence without blocking the day', () => {
    const state = follow(maraVisit, [
      'hello',
      'talk',
      'trust',
      'trust-quiet',
      'trust-respect-order',
    ]);
    expect(state.node).toBe('order');
    expect(state.flags).toContain('mara_boundaries_respected');
  });

  it('changes evening interpretation without changing evidence', () => {
    const state = {
      ...startDialogue(firstEvening),
      node: 'deduction',
      flags: ['miller_observation_distinguished'],
    };
    expect(currentNode(firstEvening, state).text).toContain('пані Міллер');
    const ordinary = { ...state, flags: [] };
    expect(currentNode(firstEvening, ordinary).text).not.toContain('пані Міллер');
  });
});

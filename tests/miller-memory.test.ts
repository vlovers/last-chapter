import { describe, expect, it } from 'vitest';
import { millerVisit } from '../src/content/first-day';
import { selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Miller memory branch', () => {
  it('keeps dialogue graph valid', () => {
    expect(validateDialogue(millerVisit)).toEqual([]);
  });

  it('records observation without blocking the order', () => {
    let state = startDialogue(millerVisit);
    for (const id of ['greet', 'chat', 'memory', 'memory-fact', 'memory-answer-order']) {
      state = selectOption(millerVisit, state, id);
    }
    expect(state.node).toBe('order');
    expect(state.flags).toContain('miller_observation_distinguished');
  });
});

import { describe, expect, it } from 'vitest';
import { leoVisit } from '../src/content/leo';
import { availableOptions, currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Leo visit', () => {
  it('has valid dialogue links', () => {
    expect(validateDialogue(leoVisit)).toEqual([]);
  });
  it('does not expose a letter the player has not discovered', () => {
    const state = selectOption(leoVisit, startDialogue(leoVisit), 'greet');
    expect(availableOptions(leoVisit, state).some((option) => option.id === 'letter')).toBe(false);
  });
  it('supports a personal conversation without mentioning the letter', () => {
    let state = startDialogue(leoVisit);
    for (const id of ['greet', 'trains', 'trains-follow', 'journey-back', 'finish']) state = selectOption(leoVisit, state, id);
    expect(currentNode(leoVisit, state).id).toBe('end');
    expect(state.flags).toContain('leo_shared_future_plan');
  });
});

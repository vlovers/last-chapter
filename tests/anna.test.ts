import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Anna visit and rumor boundaries', () => {
  it('has a valid graph', () => {
    expect(validateDialogue(annaVisit)).toEqual([]);
  });
  it('hides gossip unless it was heard on Day 1', () => {
    const state = selectOption(annaVisit, startDialogue(annaVisit), 'hello');
    expect(availableOptions(annaVisit, state).some((option) => option.id === 'rumor')).toBe(false);
  });
  it('allows Anna to set boundaries when the rumor was heard', () => {
    let state = { ...startDialogue(annaVisit), flags: ['rumor_heard'] };
    for (const id of ['hello', 'rumor', 'rumor-apologize', 'respect-books', 'browse'])
      state = selectOption(annaVisit, state, id);
    expect(currentNode(annaVisit, state).id).toBe('end');
    expect(state.flags).toContain('anna_rumor_boundary');
  });
});

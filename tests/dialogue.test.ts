import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { millerVisit } from '../src/content/first-day';

describe('Ukrainian dialogue slice', () => {
  it('has a valid, fully linked authored graph', () => {
    expect(validateDialogue(millerVisit)).toEqual([]);
  });

  it('allows customers to buy a book without hearing gossip', () => {
    let state = startDialogue(millerVisit);
    for (const choice of ['greet', 'books', 'orchard', 'leave-orchard']) {
      state = selectOption(millerVisit, state, choice);
    }
    expect(currentNode(millerVisit, state).id).toBe('end');
    expect(state.flags).toContain('sold_orchard');
    expect(state.flags).not.toContain('rumor_heard');
  });

  it('records a rumor as a rumor and allows challenging it', () => {
    let state = startDialogue(millerVisit);
    for (const choice of ['greet', 'town', 'gossip', 'what-saw', 'challenge']) {
      state = selectOption(millerVisit, state, choice);
    }
    expect(state.flags).toContain('rumor_heard');
    expect(state.flags).toContain('rumor_challenged');
    expect(currentNode(millerVisit, state).id).toBe('boundary');
  });

  it('rejects options that are unavailable at the current node', () => {
    expect(() => selectOption(millerVisit, startDialogue(millerVisit), 'orchard')).toThrow();
  });

  it('uses Ukrainian prose and dialogue choices', () => {
    expect(currentNode(millerVisit, startDialogue(millerVisit)).text).toContain('Дзвіночок');
    expect(availableOptions(millerVisit, startDialogue(millerVisit))).toHaveLength(1);
  });
});

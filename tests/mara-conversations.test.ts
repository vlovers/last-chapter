import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { availableOptions, currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Mara optional conversation hub', () => {
  it('has valid destinations and unique options', () => {
    expect(validateDialogue(maraVisit)).toEqual([]);
  });

  it('supports a long discussion and returns to the original book order', () => {
    let state = startDialogue(maraVisit);
    for (const id of ['hello', 'thank', 'talk', 'fiction', 'fiction-ask', 'ask-respect', 'respect-more', 'bakery', 'bakery-tired', 'tired-ask', 'silence-return', 'gift-now', 'station', 'finish-station']) {
      expect(availableOptions(maraVisit, state).some((option) => option.id === id)).toBe(true);
      state = selectOption(maraVisit, state, id);
    }
    expect(currentNode(maraVisit, state).id).toBe('end');
    expect(state.flags).toContain('mara_boundaries_respected');
  });

  it('keeps the direct purchase path intact', () => {
    let state = startDialogue(maraVisit);
    for (const id of ['hello', 'thank', 'professional', 'roads', 'finish-roads']) {
      state = selectOption(maraVisit, state, id);
    }
    expect(currentNode(maraVisit, state).id).toBe('end');
  });
});

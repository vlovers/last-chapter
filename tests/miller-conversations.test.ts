import { describe, expect, it } from 'vitest';
import { millerVisit } from '../src/content/first-day';
import { currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Miller optional conversations', () => {
  it('has valid dialogue links', () => {
    expect(validateDialogue(millerVisit)).toEqual([]);
  });

  it('supports a long talk without forcing rumors', () => {
    let state = startDialogue(millerVisit);
    for (const id of [
      'greet',
      'chat',
      'detectives',
      'detective-clues',
      'clues-follow',
      'apology-return',
      'jam',
      'jam-kind',
      'jam-kind-return',
      'loneliness',
      'lonely-question',
      'lonely-respect',
      'lonely-respect-return',
      'miller-order',
      'orchard',
      'leave-orchard',
    ]) {
      state = selectOption(millerVisit, state, id);
    }
    expect(currentNode(millerVisit, state).id).toBe('end');
    expect(state.flags).not.toContain('rumor_heard');
  });
});

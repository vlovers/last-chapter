import { describe, expect, it } from 'vitest';
import { thomasVisit } from '../src/content/thomas';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
  validateDialogue,
} from '../src/game/dialogue';

describe('Thomas and rumor privacy', () => {
  it('has a valid dialogue graph', () => expect(validateDialogue(thomasVisit)).toEqual([]));
  it('does not offer rumors without prior knowledge', () => {
    const state = selectOption(thomasVisit, startDialogue(thomasVisit), 'greet');
    expect(availableOptions(thomasVisit, state).some((option) => option.id === 'rumor')).toBe(
      false,
    );
  });
  it('allows a private conversation without disclosing counseling', () => {
    let state: DialogueState = { ...startDialogue(thomasVisit), flags: ['rumor_heard'] };
    for (const id of ['greet', 'rumor', 'rumor-boundary', 'boundary-back', 'finish'])
      state = selectOption(thomasVisit, state, id);
    expect(currentNode(thomasVisit, state).id).toBe('end');
    expect(state.flags).toContain('thomas_rumor_respected');
  });
});

import { describe, expect, it } from 'vitest';
import { noraVisit } from '../src/content/nora';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Nora and confidentiality', () => {
  it('has valid references', () => expect(validateDialogue(noraVisit)).toEqual([]));
  it('does not expose rumor options without prior knowledge', () => {
    const state = selectOption(noraVisit, startDialogue(noraVisit), 'hello');
    expect(availableOptions(noraVisit, state).some((option) => option.id === 'rumor')).toBe(false);
  });
  it('allows respecting privacy without revealing client details', () => {
    let state = { ...startDialogue(noraVisit), flags: ['rumor_heard'] };
    for (const id of ['hello', 'rumor', 'rumor-respect', 'boundary-back', 'end'])
      state = selectOption(noraVisit, state, id);
    expect(currentNode(noraVisit, state).id).toBe('end');
    expect(state.flags).toContain('nora_confidentiality_respected');
  });
});

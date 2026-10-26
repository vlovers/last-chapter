import { describe, expect, it } from 'vitest';
import { firstEvening } from '../src/content/evening';
import { eleanorVisit } from '../src/content/eleanor';
import { availableOptions, currentNode, selectOption, validateDialogue, type DialogueState } from '../src/game/dialogue';

function at(node: string, flags: string[] = []): DialogueState {
  return { node, flags, history: [] };
}

describe('Forgotten cabinet playable slice', () => {
  it('opens from the existing first-evening hub', () => {
    expect(availableOptions(firstEvening, at('box')).some((option) => option.id === 'forgotten-cabinet')).toBe(true);
  });

  it('offers three different dispositions of the photograph', () => {
    const options = availableOptions(firstEvening, at('cabinet-photo')).map((option) => option.id);
    expect(options).toEqual(['cabinet-return', 'cabinet-hide', 'cabinet-copy']);
    const hidden = selectOption(firstEvening, at('cabinet-photo'), 'cabinet-hide');
    const copied = selectOption(firstEvening, at('cabinet-photo'), 'cabinet-copy');
    expect(hidden.flags).toContain('cabinet_photo_hidden');
    expect(copied.flags).toContain('cabinet_photo_copied');
    expect(currentNode(firstEvening, hidden).text).toContain('кишені');
  });

  it('unlocks an Eleanor callback and distinguishes secrecy from a copy', () => {
    expect(availableOptions(eleanorVisit, at('greet')).some((option) => option.id === 'cabinet-question')).toBe(false);
    expect(availableOptions(eleanorVisit, at('greet', ['cabinet_photo_seen'])).some((option) => option.id === 'cabinet-question')).toBe(true);
    expect(currentNode(eleanorVisit, at('cabinet-question', ['cabinet_photo_hidden'])).text).toContain('сховав');
    expect(currentNode(eleanorVisit, at('cabinet-question', ['cabinet_photo_copied'])).text).toContain('копію');
  });

  it('keeps the existing story graphs valid', () => {
    expect(validateDialogue(firstEvening)).toEqual([]);
    expect(validateDialogue(eleanorVisit)).toEqual([]);
  });
});

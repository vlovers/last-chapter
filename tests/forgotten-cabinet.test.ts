import { describe, expect, it } from 'vitest';
import { firstEvening } from '../src/content/evening';
import { eleanorVisit } from '../src/content/eleanor';
import { irisVisit } from '../src/content/iris';
import { bookClub } from '../src/content/book-club';
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

  it('makes the cinema conversation available only after the photograph', () => {
    expect(availableOptions(irisVisit, at('welcome')).some((option) => option.id === 'cinema')).toBe(false);
    expect(availableOptions(irisVisit, at('welcome', ['cabinet_photo_seen'])).some((option) => option.id === 'cinema')).toBe(true);
    const next = selectOption(irisVisit, at('cinema'), 'cinema-poster');
    expect(next.flags).toContain('cinema_poster_lead');
  });

  it('lets book-club guests choose rumors, records, or another subject', () => {
    expect(availableOptions(bookClub, at('welcome', ['cabinet_photo_seen'])).some((option) => option.id === 'cinema-discussion')).toBe(true);
    const rumor = selectOption(bookClub, at('cinema-discussion'), 'cinema-club-rumor');
    const records = selectOption(bookClub, at('cinema-discussion'), 'cinema-club-facts');
    expect(currentNode(bookClub, rumor).text).toContain('службового входу');
    expect(currentNode(bookClub, records).text).toContain('тубу');
  });

  it('keeps the existing story graphs valid', () => {
    expect(validateDialogue(firstEvening)).toEqual([]);
    expect(validateDialogue(eleanorVisit)).toEqual([]);
    expect(validateDialogue(irisVisit)).toEqual([]);
    expect(validateDialogue(bookClub)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { firstEvening } from '../src/content/evening';
import { eleanorVisit } from '../src/content/eleanor';
import { irisVisit } from '../src/content/iris';
import { bookClub } from '../src/content/book-club';
import { irisDecision } from '../src/content/day-four-iris';
import { finalReading } from '../src/content/day-five';
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

  it('unlocks the missing chapter only after converging cinema leads', () => {
    const flags = ['cabinet_photo_seen', 'cinema_poster_lead', 'cinema_club_asked_for_records'];
    expect(availableOptions(irisDecision, at('welcome', flags)).some((option) => option.id === 'missing-chapter')).toBe(true);
    expect(availableOptions(irisDecision, at('welcome', flags.slice(0, 1))).some((option) => option.id === 'missing-chapter')).toBe(true);
    expect(availableOptions(irisDecision, at('welcome')).some((option) => option.id === 'missing-chapter')).toBe(false);
    const falseClaim = selectOption(irisDecision, at('missing-chapter', flags), 'chapter-rumor');
    expect(falseClaim.flags).toContain('missing_chapter_false_claim');
    expect(currentNode(irisDecision, falseClaim).text).toContain('вигадав');
  });

  it('carries manuscript choices into the final reading', () => {
    expect(availableOptions(finalReading, at('gathering', ['missing_chapter_discussed'])).some((option) => option.id === 'chapter-reckoning')).toBe(true);
    const blame = selectOption(finalReading, at('chapter-reckoning', ['missing_chapter_discussed']), 'chapter-blame');
    expect(blame.flags).toContain('chapter_accused_eleanor');
    expect(currentNode(finalReading, blame).text).toContain('йде раніше');
  });

  it('lets a careful player discover the manuscript dating contradiction', () => {
    const flags = ['missing_chapter_discussed', 'missing_chapter_copied'];
    expect(availableOptions(finalReading, at('chapter-reckoning', flags)).some((option) => option.id === 'chapter-check-provenance')).toBe(true);
    const verified = selectOption(finalReading, at('chapter-provenance', flags), 'chapter-provenance-back');
    expect(verified.flags).toContain('chapter_provenance_checked');
    expect(availableOptions(finalReading, at('chapter-reckoning', verified.flags)).some((option) => option.id === 'chapter-check-provenance')).toBe(false);
  });

  it('keeps the existing story graphs valid', () => {
    expect(validateDialogue(firstEvening)).toEqual([]);
    expect(validateDialogue(eleanorVisit)).toEqual([]);
    expect(validateDialogue(irisVisit)).toEqual([]);
    expect(validateDialogue(bookClub)).toEqual([]);
    expect(validateDialogue(irisDecision)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

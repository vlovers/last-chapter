import { describe, expect, it } from 'vitest';
import { bookClub } from '../src/content/book-club';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { startBookClub, finishThirdDay } from '../src/game/chapter';

describe('Day 3 book club', () => {
  it('offers three distinct villain opinions without making any of them mandatory', () => {
    const arrival = selectOption(bookClub, startDialogue(bookClub), 'welcome');
    for (const [choice, back] of [
      ['club-villain-argue', 'club-villain-argue-back'],
      ['club-villain-admit', 'club-villain-admit-back'],
      ['club-villain-ask-anna', 'club-villain-anna-back'],
    ]) {
      const scene = selectOption(bookClub, arrival, 'club-villain-defense');
      const answer = selectOption(bookClub, scene, choice);
      const returned = selectOption(bookClub, answer, back);
      expect(returned.node).toBe('welcome');
      expect(returned.flags).toContain('club_villain_debate_heard');
    }
  });
  it('keeps Nora’s borrowed-book secret optional and respects boundaries', () => {
    const arrival = selectOption(bookClub, startDialogue(bookClub), 'welcome');
    for (const [choice, back, flag] of [
      ['club-loan-protect', 'club-loan-protect-back', 'club_nora_privacy_respected'],
      ['club-loan-joke', 'club-loan-joke-back', 'club_book_loan_joke_heard'],
      ['club-loan-ask', 'club-loan-ask-back', 'club_nora_boundary_heard'],
    ]) {
      const scene = selectOption(bookClub, arrival, 'club-book-loan');
      const answer = selectOption(bookClub, scene, choice);
      const returned = selectOption(bookClub, answer, back);
      expect(returned.node).toBe('welcome');
      expect(returned.flags).toContain(flag);
    }
  });
  it('has a valid branching dialogue', () => expect(validateDialogue(bookClub)).toEqual([]));
  it('only offers book-specific discussion after the corresponding recommendation', () => {
    const arrival = selectOption(bookClub, startDialogue(bookClub), 'welcome');
    const books = selectOption(bookClub, arrival, 'discuss-books');
    expect(availableOptions(bookClub, books).map((option) => option.id)).not.toContain(
      'maps-follow',
    );
    const informed = { ...books, flags: ['anna_chose_maps'] };
    expect(availableOptions(bookClub, informed).map((option) => option.id)).toContain(
      'maps-follow',
    );
    expect(availableOptions(bookClub, informed).map((option) => option.id)).not.toContain(
      'mystery-follow',
    );
  });
  it('cannot skip Nora or finish while the club is still talking', () => {
    const nora = { stage: 'nora' as const, dialogue: startDialogue(bookClub), flags: [] };
    expect(() => startBookClub(nora)).toThrow();
    const club = { stage: 'book-club' as const, dialogue: startDialogue(bookClub), flags: [] };
    expect(() => finishThirdDay(club)).toThrow();
  });
});

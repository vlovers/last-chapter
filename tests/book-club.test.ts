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

import { describe, expect, it } from 'vitest';
import {
  exploreAfterBookClub,
  finishThirdDay,
  startChapter,
  chooseChapterOption,
} from '../src/game/chapter';
import { startDialogue, currentNode, availableOptions, selectOption } from '../src/game/dialogue';
import { bookClub } from '../src/content/book-club';
import { quietEvening } from '../src/content/quiet-evening';
import { decodeSave, encodeSave } from '../src/game/save';

describe('manuscript route after book club', () => {
  const finishedClub = {
    ...startChapter(),
    stage: 'book-club' as const,
    flags: ['book_club_started'],
    dialogue: { ...startDialogue(bookClub), node: 'end', flags: ['book_club_started'] },
  };

  it('cannot interrupt the active book club to investigate', () => {
    expect(() =>
      exploreAfterBookClub({
        ...finishedClub,
        dialogue: startDialogue(bookClub),
      }),
    ).toThrow('Finish the book club first');
  });

  it('preserves the club and lets the player find the manuscript', () => {
    const afterClub = exploreAfterBookClub(finishedClub);
    expect(afterClub.stage).toBe('quiet-evening');
    expect(afterClub.flags).toContain('book_club_started');
    expect(currentNode(quietEvening, afterClub.dialogue).text).toContain('книжкового клубу');
    const discovered = chooseChapterOption(afterClub, 'tidy-books');
    const collected = chooseChapterOption(discovered, 'keep-page');
    const restored = decodeSave(encodeSave(collected));
    expect(restored?.flags).toContain('book_club_started');
    expect(restored?.flags).toContain('quiet_evening_page_found');
    expect(finishThirdDay(restored!).stage).toBe('day3-complete');
  });

  it('keeps the evening entrance compact and the forgotten book reachable via Frank', () => {
    const start = { ...startDialogue(quietEvening), flags: ['book_club_started'] };
    const closing = availableOptions(quietEvening, start).map((option) => option.id);
    expect(new Set(closing).size).toBe(closing.length);
    expect(closing).toContain('closing-book-club-cleanup');
    const withFrank = selectOption(quietEvening, start, 'sit-frank');
    const frankOptions = availableOptions(quietEvening, withFrank).map((option) => option.id);
    expect(frankOptions).toContain('closing-leftovers');
    expect(frankOptions.length).toBeLessThanOrEqual(4);
    const lostBook = selectOption(quietEvening, withFrank, 'closing-leftovers');
    expect(lostBook.node).toBe('closing-leftovers');
    const shelved = selectOption(quietEvening, lostBook, 'closing-leftovers-save');
    const finished = selectOption(quietEvening, shelved, 'closing-leftovers-save-books');
    expect(finished.flags).toContain('quiet_evening_lost_book_shelved');
    expect(finished.node).toBe('manuscript');
  });

  it('still allows ending the day directly after the club', () => {
    const finished = finishThirdDay(finishedClub);
    expect(finished.stage).toBe('day3-complete');
    expect(finished.flags).toContain('book_club_started');
  });
});

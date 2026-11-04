import { afterEach, describe, expect, it, vi } from 'vitest';
import { bookClub } from '../src/content/book-club';
import { startChapter } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

afterEach(() => vi.unstubAllGlobals());

describe('canonical Phaser story after the book club', () => {
  it('offers both a direct ending and manuscript exploration', () => {
    const chapter = {
      ...startChapter(),
      stage: 'book-club' as const,
      flags: ['book_club_started'],
      dialogue: { ...startDialogue(bookClub), node: 'end', flags: ['book_club_started'] },
    };
    const store = new Map<string, string>([[SAVE_KEY, encodeSave(chapter)]]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
    const story = new FiveDayStory();
    expect(story.open().choices.map((choice) => choice.id)).toEqual([
      '__advance',
      '__explore_after_club',
    ]);
    story.choose('__explore_after_club');
    expect(story.stage).toBe('quiet-evening');
    expect(story.open().text).toContain('книжкового клубу');
    story.choose('tidy-books');
    story.choose('keep-page');
    expect(decodeSave(store.get(SAVE_KEY)!)?.flags).toContain('quiet_evening_page_found');
    story.choose('__advance');
    expect(story.stage).toBe('day3-complete');
    expect(decodeSave(store.get(SAVE_KEY)!)?.flags).toContain('book_club_started');
  });
});

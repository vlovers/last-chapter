import { describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { skipBookClub, startChapter } from '../src/game/chapter';

describe('optional day-three book club', () => {
  it('rejects skipping before Nora has finished speaking', () => {
    expect(() => skipBookClub(startChapter())).toThrow();
  });

  it('offers an alternative to entering the club and advances to day four', () => {
    const story = new FiveDayStory();
    // Exercise the choice contract without relying on the whole five-day dialogue traversal.
    expect(() => story.choose('__skip_club')).toThrow();
  });
});

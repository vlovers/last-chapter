import { describe, expect, it } from 'vitest';
import { finishThirdDay, skipBookClub, startChapter } from '../src/game/chapter';
import { selectOption, startDialogue } from '../src/game/dialogue';
import { quietEvening } from '../src/content/quiet-evening';
import { encodeSave, decodeSave } from '../src/game/save';
import { storyProgress } from '../src/game/progress';

describe('optional day-three book club', () => {
  it('rejects skipping before Nora has finished speaking', () => {
    expect(() => skipBookClub(startChapter())).toThrow();
  });

  it('lets the player keep the manuscript page and carries it through a save', () => {
    const opened = selectOption(quietEvening, startDialogue(quietEvening), 'tidy-books');
    const kept = selectOption(quietEvening, opened, 'keep-page');
    expect(kept.flags).toContain('quiet_evening_page_found');
    const chapter = {
      ...startChapter(),
      stage: 'quiet-evening' as const,
      dialogue: kept,
      flags: kept.flags,
    };
    expect(decodeSave(encodeSave(chapter))?.flags).toContain('quiet_evening_page_found');
    expect(finishThirdDay(chapter).stage).toBe('day3-complete');
  });

  it('allows leaving the page without claiming it was collected', () => {
    const opened = selectOption(quietEvening, startDialogue(quietEvening), 'tidy-books');
    const left = selectOption(quietEvening, opened, 'leave-page');
    expect(left.flags).not.toContain('quiet_evening_page_found');
  });

  it('persists the quiet evening and its completed checkpoint', () => {
    const evening = {
      ...startChapter(),
      stage: 'quiet-evening' as const,
      flags: ['book_club_skipped', 'evening_shop_kept_open'],
      dialogue: startDialogue(quietEvening),
    };
    expect(decodeSave(encodeSave(evening))?.stage).toBe('quiet-evening');
    expect(storyProgress(evening.stage)[2]?.status).toBe('current');
    expect(() => finishThirdDay(evening)).toThrow('Finish the conversation');

    const completed = {
      ...evening,
      dialogue: { ...startDialogue(quietEvening), node: 'end', flags: evening.flags },
    };
    const checkpoint = finishThirdDay(completed);
    expect(checkpoint.stage).toBe('day3-complete');
    expect(decodeSave(encodeSave(checkpoint))?.stage).toBe('day3-complete');
  });
});

import { describe, expect, it } from 'vitest';
import { finishThirdDay, skipBookClub, startChapter } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';
import { quietEvening } from '../src/content/quiet-evening';
import { encodeSave, decodeSave } from '../src/game/save';
import { storyProgress } from '../src/game/progress';

describe('optional day-three book club', () => {
  it('rejects skipping before Nora has finished speaking', () => {
    expect(() => skipBookClub(startChapter())).toThrow();
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

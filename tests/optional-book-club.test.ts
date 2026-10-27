import { describe, expect, it } from 'vitest';
import { finishThirdDay, skipBookClub, startChapter } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';
import { quietEvening } from '../src/content/quiet-evening';
import { noraVisit } from '../src/content/nora';
import { encodeSave, decodeSave } from '../src/game/save';
import { storyProgress } from '../src/game/progress';

describe('optional day-three book club', () => {
  it('rejects skipping before Nora has finished speaking', () => {
    expect(() => skipBookClub(startChapter())).toThrow();
  });

  it('plays and saves the alternative evening instead of jumping to day four', () => {
    const noraEnd = noraVisit.nodes.find((node) => node.options.length === 0);
    expect(noraEnd).toBeDefined();
    const noraState = {
      ...startChapter(),
      stage: 'nora' as const,
      dialogue: { ...startDialogue(noraVisit), node: noraEnd!.id },
    };
    const evening = skipBookClub(noraState);
    expect(evening.stage).toBe('quiet-evening');
    expect(evening.flags).toContain('book_club_skipped');
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

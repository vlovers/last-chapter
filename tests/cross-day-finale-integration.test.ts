import { describe, expect, it } from 'vitest';
import { chooseChapterOption, finishSeason, startFifthDay, type ChapterState } from '../src/game/chapter';
import { availableOptions, currentNode, startDialogue } from '../src/game/dialogue';
import { finalReading } from '../src/content/day-five';

describe('Cross-day finale integration', () => {
  it('carries earlier decisions into the fifth day and records the callback', () => {
    const flags = ['mara_day_four_reflected', 'eleanor_shared_shop_memory', 'leo_shared_future_plan'];
    const previous: ChapterState = {
      stage: 'day4-complete',
      flags,
      dialogue: { ...startDialogue(finalReading), flags },
    };
    let chapter = startFifthDay(previous);
    expect(chapter.stage).toBe('day5-reading');
    chapter = chooseChapterOption(chapter, 'open');
    for (const id of ['mara-callback', 'eleanor-memory', 'leo-memory']) {
      expect(availableOptions(finalReading, chapter.dialogue).some((option) => option.id === id)).toBe(true);
    }
    chapter = chooseChapterOption(chapter, 'mara-callback');
    chapter = chooseChapterOption(chapter, 'mara-callback-back');
    expect(chapter.flags).toContain('final_mara_heard');
    chapter = chooseChapterOption(chapter, 'close');
    expect(currentNode(finalReading, chapter.dialogue).id).toBe('end');
    chapter = finishSeason(chapter);
    expect(chapter.stage).toBe('season-complete');
    expect(chapter.flags).toContain('final_mara_heard');
  });
});

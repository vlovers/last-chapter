import { describe, expect, it } from 'vitest';
import {
  chooseChapterOption,
  finishSeason,
  startFifthDay,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, currentNode, startDialogue } from '../src/game/dialogue';
import { finalReading } from '../src/content/day-five';

describe('Cross-day finale integration', () => {
  it('carries earlier decisions into the fifth day and records the callback', () => {
    const flags = [
      'mara_day_four_reflected',
      'eleanor_shared_shop_memory',
      'leo_shared_future_plan',
    ];
    const previous: ChapterState = {
      stage: 'day4-complete',
      flags,
      dialogue: { ...startDialogue(finalReading), flags },
    };
    let chapter = startFifthDay(previous);
    expect(chapter.stage).toBe('day5-reading');
    chapter = chooseChapterOption(chapter, 'open');
    for (const id of ['mara-callback', 'eleanor-memory', 'leo-memory']) {
      expect(
        availableOptions(finalReading, chapter.dialogue).some((option) => option.id === id),
      ).toBe(true);
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
  it('carries all three day-four dilemmas into day five without losing outcomes', () => {
    const flags = [
      'iris_day_four_boundary_heard',
      'iris_day_four_respected_freedom',
      'mara_day_four_own_story_heard',
      'mara_day_four_named_own_needs',
      'leo_day_four_future_heard',
      'leo_day_four_chose_honesty',
    ];
    const previous: ChapterState = {
      stage: 'day4-complete',
      flags,
      dialogue: { ...startDialogue(finalReading), flags },
    };
    let chapter = startFifthDay(previous);
    chapter = chooseChapterOption(chapter, 'open');
    for (const person of ['iris', 'mara', 'leo']) {
      const optionId = `day-four-${person}-callback`;
      expect(availableOptions(finalReading, chapter.dialogue).some((option) => option.id === optionId)).toBe(true);
      chapter = chooseChapterOption(chapter, optionId);
      expect(currentNode(finalReading, chapter.dialogue).text.length).toBeGreaterThan(40);
      chapter = chooseChapterOption(chapter, `day-four-${person}-back`);
      expect(chapter.flags).toContain(`final_day_four_${person}_heard`);
      expect(availableOptions(finalReading, chapter.dialogue).some((option) => option.id === optionId)).toBe(false);
    }
    chapter = chooseChapterOption(chapter, 'close');
    chapter = finishSeason(chapter);
    expect(chapter.stage).toBe('season-complete');
    for (const flag of flags) expect(chapter.flags).toContain(flag);
  });

});

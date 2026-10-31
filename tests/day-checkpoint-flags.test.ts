import { describe, expect, it } from 'vitest';
import { finishSecondDay, finishFourthDay, finishSeason, startChapter } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';
import { leoDecision } from '../src/content/day-four-leo';
import { leoVisit } from '../src/content/leo';
import { finalReading } from '../src/content/day-five';

describe('checkpoint discoveries', () => {
  it('retains dialogue-only flags when day two ends', () => {
    const ending = leoVisit.nodes.find((node) => node.options.length === 0);
    expect(ending).toBeDefined();
    const chapter = {
      ...startChapter(),
      stage: 'leo' as const,
      flags: ['earlier_choice'],
      dialogue: {
        ...startDialogue(leoVisit),
        node: ending!.id,
        flags: ['earlier_choice', 'day_two_new_discovery'],
      },
    };
    const result = finishSecondDay(chapter);
    expect(result.flags).toContain('day_two_new_discovery');
    expect(decodeSave(encodeSave(result))?.flags).toContain('day_two_new_discovery');
  });

  it('retains dialogue-only flags when day four ends', () => {
    const ending = leoDecision.nodes.find((node) => node.options.length === 0);
    expect(ending).toBeDefined();
    const chapter = {
      ...startChapter(),
      stage: 'day4-leo' as const,
      flags: ['earlier_choice'],
      dialogue: {
        ...startDialogue(leoDecision),
        node: ending!.id,
        flags: ['earlier_choice', 'day_four_new_discovery'],
      },
    };
    const result = finishFourthDay(chapter);
    expect(result.stage).toBe('day4-complete');
    expect(result.flags).toEqual(['earlier_choice', 'day_four_new_discovery']);
    expect(decodeSave(encodeSave(result))?.flags).toContain('day_four_new_discovery');
  });

  it('retains dialogue-only flags when the season ends', () => {
    const ending = finalReading.nodes.find((node) => node.options.length === 0);
    expect(ending).toBeDefined();
    const chapter = {
      ...startChapter(),
      stage: 'day5-reading' as const,
      flags: ['earlier_choice'],
      dialogue: {
        ...startDialogue(finalReading),
        node: ending!.id,
        flags: ['earlier_choice', 'final_new_discovery'],
      },
    };
    const result = finishSeason(chapter);
    expect(result.stage).toBe('season-complete');
    expect(result.flags).toEqual(['earlier_choice', 'final_new_discovery']);
    expect(decodeSave(encodeSave(result))?.flags).toContain('final_new_discovery');
  });
});

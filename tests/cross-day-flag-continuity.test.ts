import { describe, expect, it } from 'vitest';
import {
  startSecondDay,
  startThirdDay,
  startFourthDay,
  startFifthDay,
  type ChapterState,
  type ChapterStage,
} from '../src/game/chapter';
import { startDialogue, type DialogueStory } from '../src/game/dialogue';
import { firstEvening } from '../src/content/evening';
import { leoVisit } from '../src/content/leo';
import { bookClub } from '../src/content/book-club';
import { finalReading } from '../src/content/day-five';
import { irisDecision } from '../src/content/day-four-iris';

const persistentFlags = [
  'found_blue_book',
  'mara_respects_boundaries',
  'iris_letter_choice_respected',
] as const;

function checkpoint(stage: ChapterStage, story: DialogueStory): ChapterState {
  return {
    stage,
    flags: [...persistentFlags],
    dialogue: { ...startDialogue(story), flags: [...persistentFlags] },
  };
}

describe('Cross-day narrative flag continuity', () => {
  it('carries Day 1 discoveries into Day 2', () => {
    const next = startSecondDay(checkpoint('complete', firstEvening));
    expect(next.flags).toEqual(expect.arrayContaining(persistentFlags));
    expect(next.dialogue.flags).toEqual(expect.arrayContaining(persistentFlags));
  });

  it('carries persistent choices into Day 3', () => {
    const next = startThirdDay(checkpoint('day2-complete', leoVisit));
    expect(next.flags).toEqual(expect.arrayContaining(persistentFlags));
    expect(next.dialogue.flags).toEqual(expect.arrayContaining(persistentFlags));
  });

  it('carries persistent choices into Day 4', () => {
    const next = startFourthDay(checkpoint('day3-complete', bookClub));
    expect(next.flags).toEqual(expect.arrayContaining(persistentFlags));
    expect(next.dialogue.flags).toEqual(expect.arrayContaining(persistentFlags));
  });

  it('carries persistent choices into Day 5', () => {
    const next = startFifthDay(checkpoint('day4-complete', irisDecision));
    expect(next.flags).toEqual(expect.arrayContaining(persistentFlags));
    expect(next.dialogue.flags).toEqual(expect.arrayContaining(persistentFlags));
    expect(next.stage).toBe('day5-reading');
    expect(finalReading.nodes.some((node) => node.id === next.dialogue.node)).toBe(true);
  });
});

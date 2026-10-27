import { describe, expect, it } from 'vitest';
import { stageStory, type ChapterStage, type ChapterState } from '../src/game/chapter';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const stages: readonly ChapterStage[] = [
  'miller', 'mara', 'evening', 'complete', 'iris', 'anna', 'leo',
  'day2-complete', 'eleanor', 'thomas', 'nora', 'book-club',
  'day3-complete', 'day4-iris', 'day4-mara', 'day4-leo',
  'day4-complete', 'day5-reading', 'season-complete',
];

describe('intermediate dialogue save compatibility', () => {
  it.each(stages)('round trips the initial dialogue state for %s', (stage) => {
    const state: ChapterState = { stage, dialogue: startDialogue(stageStory(stage)), flags: [] };
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it.each(stages)('restores an available first choice for %s', (stage) => {
    const story = stageStory(stage);
    const initial = startDialogue(story);
    const first = availableOptions(story, initial)[0];
    if (!first) return;
    const dialogue = selectOption(story, initial, first.id);
    const state: ChapterState = { stage, dialogue, flags: dialogue.flags };
    const restored = decodeSave(encodeSave(state));
    expect(restored).toEqual(state);
    expect(availableOptions(story, restored!.dialogue)).toEqual(availableOptions(story, dialogue));
  });
});

import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  chooseChapterOption,
  finishSeason,
  stageStory,
  startChapter,
  type ChapterStage,
} from '../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

const activeStages: readonly ChapterStage[] = [
  'miller',
  'mara',
  'evening',
  'iris',
  'anna',
  'leo',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day5-reading',
];

describe('Narrative graph integrity', () => {
  it.each(activeStages)('%s has valid nodes and reachable terminal dialogue', (stage) => {
    const story = stageStory(stage);
    expect(validateDialogue(story)).toEqual([]);
    const queue = [startDialogue(story)];
    const visited = new Set<string>();
    let foundEnding = false;
    for (let index = 0; index < queue.length && index < 1000; index++) {
      const state = queue[index]!;
      const key = JSON.stringify([state.node, [...state.flags].sort()]);
      if (visited.has(key)) continue;
      visited.add(key);
      if (currentNode(story, state).options.length === 0) {
        foundEnding = true;
        break;
      }
      for (const option of availableOptions(story, state)) {
        queue.push(selectOption(story, state, option.id));
      }
    }
    expect(foundEnding).toBe(true);
    expect(visited.size).toBeGreaterThan(0);
  });

  it('rejects advancing an unfinished dialogue', () => {
    expect(() => advanceChapter(startChapter())).toThrow('Finish the conversation');
  });

  it('rejects completing the season before the final scene', () => {
    expect(() => finishSeason(startChapter())).toThrow('Finish Day 5 first');
  });

  it('rejects selecting options not offered by the current scene', () => {
    expect(() => chooseChapterOption(startChapter(), 'not-a-real-option')).toThrow(
      'Option unavailable',
    );
  });
});

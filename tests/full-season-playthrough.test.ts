import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  advanceSecondDay,
  advanceToDayFourLeo,
  advanceToDayFourMara,
  advanceToLeo,
  advanceToNora,
  advanceToThomas,
  chooseChapterOption,
  finishFourthDay,
  finishSeason,
  finishSecondDay,
  finishThirdDay,
  stageStory,
  startBookClub,
  startChapter,
  startFifthDay,
  startFourthDay,
  startSecondDay,
  startThirdDay,
  type ChapterState,
  type ChapterStage,
} from '../src/game/chapter';
import { availableOptions } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';
import { storyProgress } from '../src/game/progress';

const order: readonly ChapterStage[] = [
  'miller',
  'mara',
  'evening',
  'complete',
  'iris',
  'anna',
  'leo',
  'day2-complete',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'day3-complete',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day4-complete',
  'day5-reading',
  'season-complete',
];

const completionStages: readonly ChapterStage[] = [
  'complete',
  'day2-complete',
  'day3-complete',
  'day4-complete',
  'season-complete',
];

const transitions: Partial<Record<ChapterStage, (state: ChapterState) => ChapterState>> = {
  miller: advanceChapter,
  mara: advanceChapter,
  evening: advanceChapter,
  complete: startSecondDay,
  iris: advanceSecondDay,
  anna: advanceToLeo,
  leo: finishSecondDay,
  'day2-complete': startThirdDay,
  eleanor: advanceToThomas,
  thomas: advanceToNora,
  nora: startBookClub,
  'book-club': finishThirdDay,
  'day3-complete': startFourthDay,
  'day4-iris': advanceToDayFourMara,
  'day4-mara': advanceToDayFourLeo,
  'day4-leo': finishFourthDay,
  'day4-complete': startFifthDay,
  'day5-reading': finishSeason,
};

function finishScene(initial: ChapterState, reverse: boolean): ChapterState {
  const queue: ChapterState[] = [initial];
  const seen = new Set<string>();
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const state = queue[cursor];
    if (!state) throw new Error('Missing queued dialogue state at index ' + cursor);
    const key = state.dialogue.node + '|' + [...state.flags].sort().join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    const options = availableOptions(stageStory(state.stage), state.dialogue);
    if (options.length === 0) return state;
    for (const option of reverse ? [...options].reverse() : options) {
      queue.push(chooseChapterOption(state, option.id));
    }
    if (seen.size > 5000) throw new Error('Unbounded dialogue search: ' + state.stage);
  }
  throw new Error('No reachable exit from ' + initial.stage);
}

describe('Complete five-day save-and-resume playthrough', () => {
  for (const reverse of [false, true]) {
    it(reverse ? 'finishes alternate-choice route' : 'finishes default-choice route', () => {
      let state = startChapter();
      const visited: ChapterStage[] = [];
      for (const stage of order) {
        expect(state.stage).toBe(stage);
        visited.push(state.stage);
        const saved = decodeSave(encodeSave(state));
        expect(saved).toEqual(state);
        state = saved!;
        if (stage === 'season-complete') break;
        // Completion checkpoints reuse the last dialogue but reject new choices.
        if (
          !completionStages.includes(stage) &&
          availableOptions(stageStory(stage), state.dialogue).length
        ) {
          state = finishScene(state, reverse);
        }
        const transition = transitions[stage];
        expect(transition).toBeDefined();
        state = transition!(state);
        const restored = decodeSave(encodeSave(state));
        expect(restored).toEqual(state);
        state = restored!;
      }
      expect(visited).toEqual(order);
      expect(storyProgress(state.stage).every((day) => day.status === 'completed')).toBe(true);
    });
  }
});

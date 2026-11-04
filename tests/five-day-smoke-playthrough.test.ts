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
  finishSecondDay,
  finishSeason,
  finishThirdDay,
  stageStory,
  startBookClub,
  startChapter,
  startFifthDay,
  startFourthDay,
  startSecondDay,
  startThirdDay,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, currentNode } from '../src/game/dialogue';

/** Find a reachable ending without hardcoding the scene author's dialogue choices. */
function finishConversation(initial: ChapterState): ChapterState {
  const queue: ChapterState[] = [initial];
  const seen = new Set<string>();
  for (let index = 0; index < queue.length && index < 2500; index++) {
    const state = queue[index]!;
    const story = stageStory(state.stage);
    const node = currentNode(story, state.dialogue);
    if (node.options.length === 0) return state;
    const key = JSON.stringify([node.id, [...state.flags].sort()]);
    if (seen.has(key)) continue;
    seen.add(key);
    for (const option of availableOptions(story, state.dialogue)) {
      queue.push(chooseChapterOption(state, option.id));
    }
  }
  throw new Error(`No reachable ending for ${initial.stage}`);
}

describe('Five-day chapter smoke playthrough', () => {
  it('can reach season completion while preserving early discoveries', () => {
    let state = finishConversation(startChapter());
    state = finishConversation(advanceChapter(state));
    state = finishConversation(advanceChapter(state));
    state = advanceChapter(state);
    expect(state.stage).toBe('complete');

    state = finishConversation(startSecondDay(state));
    state = finishConversation(advanceSecondDay(state));
    state = finishConversation(advanceToLeo(state));
    state = finishSecondDay(state);
    expect(state.stage).toBe('day2-complete');

    state = finishConversation(startThirdDay(state));
    state = finishConversation(advanceToThomas(state));
    state = finishConversation(advanceToNora(state));
    state = finishConversation(startBookClub(state));
    state = finishThirdDay(state);
    expect(state.stage).toBe('day3-complete');

    state = finishConversation(startFourthDay(state));
    state = finishConversation(advanceToDayFourMara(state));
    state = finishConversation(advanceToDayFourLeo(state));
    state = finishFourthDay(state);
    expect(state.stage).toBe('day4-complete');

    state = finishConversation(startFifthDay(state));
    state = finishSeason(state);
    expect(state.stage).toBe('season-complete');
    expect(state.dialogue.node).toBe('end');
  });
});

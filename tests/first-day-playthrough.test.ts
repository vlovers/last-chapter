import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  chooseChapterOption,
  stageStory,
  startChapter,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, currentNode } from '../src/game/dialogue';

function reachEnd(start: ChapterState, avoid: readonly string[] = []): ChapterState {
  const queue: ChapterState[] = [start];
  const visited = new Set<string>();
  for (let index = 0; index < queue.length && index < 2000; index++) {
    const state = queue[index]!;
    const key = JSON.stringify([state.dialogue.node, [...state.flags].sort()]);
    if (visited.has(key)) continue;
    visited.add(key);
    const story = stageStory(state.stage);
    if (currentNode(story, state.dialogue).options.length === 0) return state;
    for (const option of availableOptions(story, state.dialogue)) {
      if (!avoid.includes(option.id)) queue.push(chooseChapterOption(state, option.id));
    }
  }
  throw new Error(`No ending reachable in ${start.stage}`);
}

describe('First-day chapter transitions', () => {
  it('can finish all three conversations without opening a private letter', () => {
    let state = startChapter();
    for (const stage of ['miller', 'mara', 'evening'] as const) {
      expect(state.stage).toBe(stage);
      state = reachEnd(state, ['letter-open']);
      state = advanceChapter(state);
    }
    expect(state.stage).toBe('complete');
    expect(state.flags).not.toContain('opened_private_letter');
  });

  it('preserves discoveries across day-one transitions', () => {
    let state = startChapter();
    state = reachEnd(state);
    const previousFlags = [...state.flags];
    state = advanceChapter(state);
    for (const flag of previousFlags) expect(state.dialogue.flags).toContain(flag);
    state = reachEnd(state);
    state = advanceChapter(state);
    for (const flag of previousFlags) expect(state.dialogue.flags).toContain(flag);
  });
});

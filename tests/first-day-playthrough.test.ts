import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  chooseChapterOption,
  startChapter,
  type ChapterState,
} from '../src/game/chapter';

function choose(state: ChapterState, ids: readonly string[]): ChapterState {
  return ids.reduce((current, id) => chooseChapterOption(current, id), state);
}

describe('First day playable chapter flow', () => {
  it('finishes Day 1 without opening the private letter', () => {
    let state = startChapter();
    state = choose(state, ['greet', 'books', 'orchard', 'leave-orchard']);
    state = advanceChapter(state);
    expect(state.stage).toBe('mara');
    state = choose(state, ['hello', 'thank', 'professional', 'station', 'finish-station']);
    state = advanceChapter(state);
    expect(state.stage).toBe('evening');
    state = choose(state, ['letter', 'letter-back', 'receipt', 'receipt-conclude', 'keep-safe']);
    state = advanceChapter(state);
    expect(state.stage).toBe('complete');
    expect(state.flags).toContain('letter_secured');
    expect(state.flags).toContain('sold_station');
    expect(state.flags).not.toContain('opened_private_letter');
  });

  it('carries Miller observations into the evening narration', () => {
    let state = startChapter();
    state = choose(state, [
      'greet', 'chat', 'memory', 'memory-fact', 'memory-answer-order',
      'witnesses', 'leave-witnesses',
    ]);
    expect(state.flags).toContain('miller_observation_distinguished');
    state = advanceChapter(state);
    state = choose(state, ['hello', 'thank', 'professional', 'roads', 'finish-roads']);
    state = advanceChapter(state);
    state = choose(state, ['letter', 'letter-back', 'receipt', 'receipt-conclude']);
    expect(state.dialogue.node).toBe('deduction');
    expect(state.dialogue.flags).toContain('miller_observation_distinguished');
  });
});

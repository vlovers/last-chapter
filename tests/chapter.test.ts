import { describe, expect, it } from 'vitest';
import { advanceChapter, chooseChapterOption, startChapter } from '../src/game/chapter';
import { currentNode, validateDialogue } from '../src/game/dialogue';
import { millerVisit } from '../src/content/first-day';
import { maraVisit } from '../src/content/mara';
import { firstEvening } from '../src/content/evening';

function follow(ids: readonly string[], initial = startChapter()) {
  return ids.reduce((state, id) => chooseChapterOption(state, id), initial);
}

describe('day one vertical slice', () => {
  it('validates all Ukrainian dialogue graphs', () => {
    for (const story of [millerVisit, maraVisit, firstEvening]) {
      expect(validateDialogue(story)).toEqual([]);
    }
  });

  it('plays through both book orders and the sealed-letter evening', () => {
    let state = follow(['greet', 'books', 'orchard', 'leave-orchard']);
    state = advanceChapter(state);
    expect(state.stage).toBe('mara');
    state = follow(['hello', 'thank', 'professional', 'station', 'finish-station'], state);
    state = advanceChapter(state);
    expect(state.stage).toBe('evening');
    state = follow(['receipt', 'receipt-back', 'letter', 'letter-conclude', 'keep-safe'], state);
    expect(state.flags).toContain('letter_secured');
    expect(state.flags).not.toContain('opened_private_letter');
    state = advanceChapter(state);
    expect(state.stage).toBe('complete');
  });

  it('cannot skip an unfinished conversation', () => {
    expect(() => advanceChapter(startChapter())).toThrow();
  });

  it('keeps a declined gossip topic optional', () => {
    const state = follow(['greet', 'town', 'skip-gossip', 'witnesses', 'leave-witnesses']);
    expect(state.flags).not.toContain('rumor_heard');
    expect(currentNode(millerVisit, state.dialogue).id).toBe('end');
  });
});

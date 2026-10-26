import { describe, expect, it } from 'vitest';
import { encodeSave, decodeSave } from '../src/game/save';
import type { ChapterState } from '../src/game/chapter';

const history = Array.from({ length: 400 }, (_, index) => `choice-${index}`);
const completed = Array.from({ length: 400 }, (_, index) =>
  JSON.stringify(['gathering', `topic-${index}`, []]),
);

describe('Long-session save resilience', () => {
  const state: ChapterState = {
    stage: 'day5-reading',
    flags: ['saw_envelope', 'missing_chapter_discussed'],
    dialogue: {
      node: 'gathering',
      flags: ['saw_envelope', 'missing_chapter_discussed'],
      history,
      completed,
      pending: [],
    },
  };

  it('keeps the latest 256 diagnostic choices without discarding progress', () => {
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).not.toBeNull();
    expect(decoded!.dialogue.history).toEqual(history.slice(-256));
    expect(decoded!.dialogue.completed).toEqual(completed);
    expect(decoded!.flags).toEqual(state.flags);
  });

  it('preserves the completion ledger across repeated save cycles', () => {
    const once = decodeSave(encodeSave(state));
    expect(once).not.toBeNull();
    const twice = decodeSave(encodeSave(once!));
    expect(twice?.dialogue.completed).toEqual(completed);
    expect(twice?.dialogue.history).toEqual(history.slice(-256));
  });

  it('rejects oversized input rather than silently accepting unbounded history', () => {
    const serialized = JSON.parse(encodeSave(state)) as Record<string, unknown>;
    serialized.history = history;
    expect(decodeSave(JSON.stringify(serialized))).toBeNull();
  });
});

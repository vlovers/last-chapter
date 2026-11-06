import { describe, expect, it } from 'vitest';
import { chooseChapterOption, startChapter } from '../src/game/chapter';
import { decodeSave, encodeSave, SAVE_LIMITS } from '../src/game/save';

describe('local narrative save', () => {
  it('round trips a player choice', () => {
    const state = chooseChapterOption(startChapter(), 'greet');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('rejects malformed, future and incompatible saves', () => {
    expect(decodeSave('broken')).toBeNull();
    expect(decodeSave('{"version":999}')).toBeNull();
    expect(
      decodeSave('{"version":1,"stage":"miller","node":"missing","flags":[],"history":[]}'),
    ).toBeNull();
  });
  it('does not execute code or accept oversized journal arrays', () => {
    expect(
      decodeSave(
        JSON.stringify({
          version: 1,
          stage: 'miller',
          node: 'arrival',
          flags: Array(200).fill('x'),
          history: [],
        }),
      ),
    ).toBeNull();
  });
  it('rejects oversized histories, duplicate flags and invalid flag values before scene resolution', () => {
    const base = {
      version: 1,
      stage: 'miller',
      node: 'arrival',
      flags: [],
      history: [],
    };
    expect(
      decodeSave(
        JSON.stringify({ ...base, history: Array(SAVE_LIMITS.history + 1).fill('greet') }),
      ),
    ).toBeNull();
    expect(decodeSave(JSON.stringify({ ...base, flags: ['same', 'same'] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...base, flags: [''] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...base, flags: ['x'.repeat(121)] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...base, history: ['x'.repeat(121)] }))).toBeNull();
  });

  it('preserves valid state when resuming at a non-start node', () => {
    const state = chooseChapterOption(startChapter(), 'greet');
    const restored = decodeSave(encodeSave(state));
    expect(restored).toEqual(state);
    expect(restored?.dialogue.node).toBe(state.dialogue.node);
    expect(restored?.dialogue.history).toEqual(state.dialogue.history);
  });

  it('preserves flags present only in the active dialogue snapshot', () => {
    const state = startChapter();
    const divergent = {
      ...state,
      dialogue: { ...state.dialogue, flags: ['active_dialogue_decision'] },
    };
    const restored = decodeSave(encodeSave(divergent));
    expect(restored?.flags).toContain('active_dialogue_decision');
    expect(restored?.dialogue.flags).toContain('active_dialogue_decision');
  });

  it('enforces the UTF-8 byte limit for multilingual saves, not just string length', () => {
    // Cyrillic characters occupy two bytes in UTF-8. This payload was accepted
    // by the previous character-count-only guard despite exceeding 1 MiB.
    const completed = Array.from(
      { length: 1400 },
      (_, index) => `topic-${index}-${'ї'.repeat(650)}`,
    );
    const oversized = JSON.stringify({
      version: 1,
      stage: 'miller',
      node: 'arrival',
      flags: [],
      history: [],
      completed,
      pending: [],
    });
    expect(oversized.length).toBeLessThan(SAVE_LIMITS.bytes);
    expect(new TextEncoder().encode(oversized).byteLength).toBeGreaterThan(SAVE_LIMITS.bytes);
    expect(decodeSave(oversized)).toBeNull();

    const chapter = startChapter();
    expect(() =>
      encodeSave({
        ...chapter,
        dialogue: { ...chapter.dialogue, completed, pending: [] },
      }),
    ).toThrow('Save exceeds byte limit');
  });

  it('never encodes saves that the decoder would discard on the next launch', () => {
    const base = startChapter();
    const invalidStates = [
      {
        ...base,
        flags: Array.from({ length: SAVE_LIMITS.flags + 1 }, (_, i) => `flag_${i}`),
      },
      {
        ...base,
        dialogue: {
          ...base.dialogue,
          completed: Array.from({ length: SAVE_LIMITS.completed + 1 }, (_, i) => `completed_${i}`),
          pending: [],
        },
      },
      {
        ...base,
        dialogue: {
          ...base.dialogue,
          completed: [],
          pending: Array.from({ length: SAVE_LIMITS.pending + 1 }, (_, i) => ({
            hub: 'arrival',
            key: `topic_${i}`,
          })),
        },
      },
      {
        ...base,
        dialogue: { ...base.dialogue, node: 'missing-node' },
      },
    ];
    for (const state of invalidStates) {
      expect(() => encodeSave(state)).toThrow('Save cannot be restored');
    }
    const valid = chooseChapterOption(base, 'greet');
    const encoded = encodeSave(valid);
    expect(decodeSave(encoded)).toEqual(valid);
  });

  it('still round trips normal Ukrainian story flags and dialogue', () => {
    const chapter = chooseChapterOption(startChapter(), 'greet');
    const flags = [...chapter.flags, 'нотатка_про_книгарню'];
    const state = {
      ...chapter,
      flags,
      dialogue: { ...chapter.dialogue, flags },
    };
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
});

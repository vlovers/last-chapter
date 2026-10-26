import { describe, expect, it } from 'vitest';
import { chooseChapterOption, startChapter } from '../src/game/chapter';
import { decodeSave, encodeSave } from '../src/game/save';

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
    expect(decodeSave(JSON.stringify({ ...base, history: Array(300).fill('greet') }))).toBeNull();
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

});

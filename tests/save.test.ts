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
});

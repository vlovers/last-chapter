import { describe, expect, it } from 'vitest';
import { startChapter } from '../src/game/chapter';
import { inspectShopSpot } from '../src/game/exploration';
import { accessibleClues, collectClue } from '../src/phaser/clue-board';
import { decodeSave, encodeSave } from '../src/game/save';

describe('optional bookstore investigation', () => {
  it('unlocks finds through exploration and cannot obtain locked evidence', () => {
    let state = startChapter();
    expect(accessibleClues(state.flags)).toHaveLength(0);
    expect(() => collectClue(state, 'bookmark')).toThrow('Clue is not accessible');
    state = inspectShopSpot(state, 'frank');
    expect(accessibleClues(state.flags).map((clue) => clue.id)).toEqual(['bookmark']);
    state = collectClue(state, 'bookmark');
    expect(state.flags).toContain('clue_bookmark');
    expect(state.dialogue.flags).toContain('clue_bookmark');
    expect(collectClue(state, 'bookmark')).toBe(state);
  });

  it('combines three finds into a timeline and survives v1 save roundtrip', () => {
    let state = startChapter();
    for (const spot of ['frank', 'counter', 'shelves'] as const)
      state = inspectShopSpot(state, spot);
    for (const clue of ['bookmark', 'stamp', 'shelf']) state = collectClue(state, clue);
    expect(accessibleClues(state.flags).some((clue) => clue.id === 'timeline')).toBe(true);
    state = collectClue(state, 'timeline');
    const restored = decodeSave(encodeSave(state));
    expect(restored?.flags).toContain('clue_timeline');
    expect(restored?.flags).not.toContain('opened_private_letter');
  });
});

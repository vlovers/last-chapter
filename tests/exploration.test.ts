import { describe, expect, it } from 'vitest';
import { startChapter } from '../src/game/chapter';
import { inspectShopSpot, shopSpots } from '../src/game/exploration';
import { decodeSave, encodeSave } from '../src/game/save';

describe('bookshop exploration', () => {
  it('provides five distinct, accessible object descriptions', () => {
    expect(shopSpots.map((spot) => spot.id)).toEqual(['frank', 'shelves', 'window', 'counter', 'plant']);
    expect(new Set(shopSpots.map((spot) => spot.discoveryFlag)).size).toBe(5);
    expect(shopSpots.find((spot) => spot.id === 'frank')?.discoveryFlag).toBe('met_frank');
    for (const spot of shopSpots) {
      expect(spot.title.length).toBeGreaterThan(0);
      expect(spot.detail.length).toBeGreaterThan(40);
    }
  });
  it('remembers inspected objects without advancing dialogue', () => {
    const initial = startChapter();
    const visited = inspectShopSpot(initial, 'shelves');
    expect(visited.dialogue.node).toBe(initial.dialogue.node);
    expect(visited.flags).toContain('explored_shelves');
    expect(visited.dialogue.flags).toContain('explored_shelves');
    expect(inspectShopSpot(visited, 'shelves')).toBe(visited);
  });
  it('persists exploration and supports discovering multiple objects', () => {
    const state = inspectShopSpot(inspectShopSpot(startChapter(), 'window'), 'counter');
    expect(decodeSave(encodeSave(state))).toEqual(state);
    expect(state.flags).toContain('explored_window');
    expect(state.flags).toContain('explored_counter');
  });
});

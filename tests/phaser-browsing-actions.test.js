import { describe, expect, it } from 'vitest';
import { BROWSE_ACTIONS, browsingAction } from '../public/phaser-prototype/visitor-roaming.js';
import { VISITOR_IDS } from '../public/phaser-prototype/visitor-art.js';
describe('visitor browsing moments', () => {
  it('provides Ukrainian descriptions and valid facing directions', () => {
    expect(BROWSE_ACTIONS.length).toBeGreaterThanOrEqual(4);
    for (const action of BROWSE_ACTIONS) {
      expect(action.label.length).toBeGreaterThan(12);
      expect(['up', 'down', 'left', 'right']).toContain(action.facing);
    }
  });
  it('rotates behaviors for each visitor', () => {
    for (const id of VISITOR_IDS) {
      const moments = new Set(
        Array.from({ length: BROWSE_ACTIONS.length }, (_, step) => browsingAction(id, step).label),
      );
      expect(moments.size).toBe(BROWSE_ACTIONS.length);
    }
  });
});

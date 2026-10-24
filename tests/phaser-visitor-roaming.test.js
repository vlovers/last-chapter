import { describe, expect, it } from 'vitest';
import {
  BROWSE_SPOTS,
  browsingRoute,
  visitorApproach,
} from '../public/phaser-prototype/visitor-roaming.js';
import { canStand, distance, findPath } from '../public/phaser-prototype/world.js';
import { VISITOR_IDS } from '../public/phaser-prototype/visitor-art.js';
import { visitorEntrance } from '../public/phaser-prototype/visitor-entrances.js';
describe('visitor autonomous browsing', () => {
  it('uses only walkable destinations', () => {
    for (const spot of BROWSE_SPOTS) expect(canStand(spot)).toBe(true);
  });
  it('plans reachable paths for every visitor', () => {
    for (const id of VISITOR_IDS) {
      const start = visitorEntrance(id);
      for (let step = 0; step < 5; step++) {
        const route = browsingRoute(start, id, step);
        expect(route.length).toBeGreaterThan(0);
        const goal = route.at(-1);
        expect(canStand(goal)).toBe(true);
        expect(distance(start, goal)).toBeGreaterThan(20);
        expect(findPath(start, goal).length).toBeGreaterThan(0);
      }
    }
  });
  it('finds safe interaction points near browsing stops', () => {
    for (const point of BROWSE_SPOTS) {
      const approach = visitorApproach(point);
      expect(canStand(approach)).toBe(true);
      expect(distance(approach, point)).toBeLessThanOrEqual(24);
    }
  });
});

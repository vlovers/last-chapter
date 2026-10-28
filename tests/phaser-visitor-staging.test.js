import { describe, expect, it } from 'vitest';
import { VISITOR_IDS } from '../public/phaser-prototype/visitor-art.js';
import {
  VISITOR_ENTRANCES,
  visitorEntrance,
} from '../public/phaser-prototype/visitor-entrances.js';
import { canStand, distance } from '../public/phaser-prototype/world.js';

describe('five-day visitor staging', () => {
  it('gives every canonical visitor a safe, individual arrival', () => {
    expect(Object.keys(VISITOR_ENTRANCES).sort()).toEqual([...VISITOR_IDS].sort());
    const destinations = new Set();
    for (const actor of VISITOR_IDS) {
      const entrance = visitorEntrance(actor);
      expect(canStand(entrance)).toBe(true);
      expect(entrance.pace).toBeGreaterThan(0.4);
      expect(entrance.pace).toBeLessThan(1.2);
      expect(distance(entrance, { x: 440, y: 220 })).toBeLessThan(32);
      destinations.add(`${entrance.x}:${entrance.y}`);
    }
    expect(destinations.size).toBe(VISITOR_IDS.length);
  });

  it('falls back safely for unknown visitor IDs', () => {
    expect(visitorEntrance('unknown')).toEqual(VISITOR_ENTRANCES.mara);
  });
});

import { describe, expect, it } from 'vitest';
import {
  FRANK_PLACES,
  initialFrank,
  tickFrank,
  reactFrank,
  frankApproach,
} from '../public/phaser-prototype/frank-behavior.js';
import { drawFrank } from '../public/phaser-prototype/frank.js';
import { canStand, distance, eligible, findPath } from '../public/phaser-prototype/world.js';

describe('Frank ambient resident', () => {
  it('visits all five places, pauses, sleeps, and never crosses solids over ten minutes', () => {
    const cat = initialFrank();
    const positions = new Set(),
      activities = new Set();
    let moving = 0,
      still = 0;
    for (let frame = 0; frame < 12000; frame++) {
      const before = { ...cat };
      tickFrank(cat, 50, { x: 171, y: 204 });
      expect(canStand(cat)).toBe(true);
      expect(distance(before, cat)).toBeLessThanOrEqual(1.301);
      positions.add(cat.place);
      activities.add(cat.activity);
      if (distance(before, cat)) moving++;
      else still++;
    }
    expect(positions.size).toBe(5);
    expect(activities).toContain('sleeping');
    expect(activities).toContain('grooming');
    expect(activities).toContain('stretching');
    expect(moving).toBeGreaterThan(0);
    expect(still).toBeGreaterThan(moving);
  });
  it('has reachable destinations and accessible proximity points', () => {
    for (const place of FRANK_PLACES) {
      expect(canStand(place)).toBe(true);
      const approach = frankApproach(place);
      expect(canStand(approach)).toBe(true);
      // Every edge of the proximity prompt must also allow an action. Offsets
      // of 24 plus the shared 32-pixel prompt radius fit the 56-pixel reach.
      expect(distance(place, approach)).toBeLessThanOrEqual(24);
      for (const [dx, dy] of [
        [32, 0],
        [-32, 0],
        [0, 32],
        [0, -32],
      ]) {
        const edge = { x: approach.x + dx, y: approach.y + dy };
        if (canStand(edge) && eligible(edge, { id: 'frank', approach }, { mode: 'explore' }))
          expect(reactFrank({ ...initialFrank(), ...place }, 'watch', edge)).toBeTruthy();
      }
      expect(findPath({ x: 171, y: 204 }, approach).length).toBeGreaterThan(0);
      expect(eligible(approach, { id: 'frank', approach }, { mode: 'explore' })).toBe(true);
      expect(reactFrank({ ...initialFrank(), ...place }, 'pet', approach)).toBeTruthy();
    }
  });
  it('yields to the player, never blocks them, and freezes during dialogue or approach', () => {
    const cat = initialFrank();
    tickFrank(cat, 50, { x: 171, y: 204 });
    const before = structuredClone(cat);
    tickFrank(cat, 50, { x: 171, y: 204 }, { paused: true });
    expect(cat).toEqual(before);
    cat.held = true;
    tickFrank(cat, 50, { x: 171, y: 204 });
    expect(cat.x).toBe(before.x);
    cat.held = false;
    cat.path = [{ x: 450, y: 205 }];
    tickFrank(cat, 50, { x: 469, y: 205 });
    expect(cat.x).toBe(before.x);
    expect(cat.activity).toBe('looking');
  });
  it('reacts to current activity, enforces distance, and keeps ambient state out of saves', () => {
    const cat = initialFrank(),
      player = frankApproach(cat);
    expect(reactFrank(cat, 'pet', { x: 30, y: 330 })).toBeNull();
    cat.activity = 'sleeping';
    expect(reactFrank(cat, 'call', player)).toContain('спати далі');
    expect(cat.activity).toBe('sleeping');
    expect(reactFrank(cat, 'pet', player)).toContain('потягується');
    expect(cat.activity).toBe('stretching');
    cat.activity = 'grooming';
    expect(reactFrank(cat, 'call', player)).toContain('свої котячі справи');
    cat.activity = 'sitting';
    expect(reactFrank(cat, 'call', player)).toContain('ближче');
    expect(cat.path.length).toBeGreaterThan(0);
    expect(initialFrank()).toEqual(initialFrank());
  });
  it('lets Frank sleep instead of forcing play or a tree climb', () => {
    const cat = initialFrank();
    cat.activity = 'sleeping';
    const before = structuredClone(cat);
    const player = frankApproach(cat);
    expect(reactFrank(cat, 'play', player)).toContain('Стрічка почекає');
    expect(reactFrank(cat, 'tree', player)).toContain('коли сам захоче');
    expect(cat).toEqual(before);
    expect(cat.games).toBe(0);
    expect(cat.cooldowns).toEqual({});
  });

  it('keeps the current activity and counters if the bowl route is blocked', () => {
    const cat = initialFrank();
    cat.x = 0;
    cat.y = 0;
    cat.activity = 'grooming';
    const before = structuredClone(cat);
    expect(reactFrank(cat, 'feed', { x: 0, y: 0 })).toContain('не може пройти');
    expect(cat).toEqual(before);
    expect(cat.meals).toBe(0);
  });

  it('draws distinct native pixel poses with no fractional geometry', () => {
    const poses = new Set();
    for (const activity of [
      'idle',
      'walking',
      'sitting',
      'sleeping',
      'stretching',
      'grooming',
      'looking',
      'reacting',
    ]) {
      const pixels = [];
      for (let phase = 0; phase < 4; phase++)
        for (const facing of [-1, 1]) {
          drawFrank((...r) => pixels.push(r), activity, phase, facing);
        }
      for (const [x, y, w, h] of pixels) {
        expect([x, y, w, h].every(Number.isInteger)).toBe(true);
        expect(w).toBeGreaterThan(0);
        expect(h).toBeGreaterThan(0);
        expect(Math.abs(x)).toBeLessThanOrEqual(21);
        expect(y).toBeGreaterThanOrEqual(-34);
      }
      poses.add(JSON.stringify(pixels));
    }
    expect(poses.size).toBeGreaterThanOrEqual(6);
  });
});

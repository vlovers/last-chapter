import { canStand, distance } from '../public/phaser-prototype/world.js';
import { expect, it } from 'vitest';
import {
  BOWL,
  initialFrank,
  reactFrank,
  tickFrank,
} from '../public/phaser-prototype/frank-behavior.js';
it('reproduces the fixed-wall-time CI race without weakening the movement requirement', () => {
  const cat = initialFrank(),
    player = { x: 171, y: 204 };
  // At 5 FPS, 8.4 real seconds deliver only 2.1 seconds of safe simulation.
  for (let i = 0; i < 42; i++) tickFrank(cat, 200, player);
  expect(cat.elapsed).toBe(2100);
  expect(cat.x).toBe(485);
  expect(cat.y).toBe(205);
  while (cat.elapsed < 7000) tickFrank(cat, 200, player);
  expect(Math.hypot(cat.x - 485, cat.y - 205)).toBeGreaterThan(10);
});

it('finishes the tree climb at low FPS using simulation time while preserving its full elevation', () => {
  const cat = initialFrank(),
    player = { x: 171, y: 204 };
  Object.assign(cat, BOWL); // Browser route has just fed Frank before inviting him to the tree.
  reactFrank(cat, 'tree', player);
  // Six frames per second: a twenty-second wall timeout is only six simulation seconds.
  for (let i = 0; i < 120; i++) tickFrank(cat, 1000 / 6, player);
  expect(cat.activity).not.toBe('resting');
  while (cat.elapsed < 15000 && cat.activity !== 'resting') tickFrank(cat, 1000 / 6, player);
  expect(cat.activity).toBe('resting');
  expect(cat.elevation).toBe(85);
  expect(canStand(cat)).toBe(true);
});

it('keeps thirty simulated minutes of ambient cat motion collision-safe with no persistent growth', () => {
  const cat = initialFrank(),
    size = Object.keys(cat).length;
  for (let i = 0; i < 36000; i++) {
    const before = { x: cat.x, y: cat.y };
    tickFrank(cat, 50, { x: 171, y: 204 });
    expect(canStand(cat)).toBe(true);
    expect(distance(cat, before)).toBeLessThanOrEqual(1.301);
  }
  expect(Object.keys(cat).length).toBe(size);
  expect(cat.pets).toBe(0);
  expect(cat.meals).toBe(0);
});

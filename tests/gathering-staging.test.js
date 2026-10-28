import { describe, expect, it } from 'vitest';
import { gatheringGuests, createGathering } from '../public/phaser-prototype/gathering.js';
import { canStand, findPath } from '../public/phaser-prototype/world.js';

describe('book club and final reading guests', () => {
  it('shows the club guests, all eight finale guests and no gathering on the quiet route', () => {
    expect(gatheringGuests('book-club').map((guest) => guest.name)).toEqual([
      'mara',
      'anna',
      'miller',
      'leo',
    ]);
    expect(gatheringGuests('day5-reading')).toHaveLength(8);
    for (const stage of ['quiet-evening', 'day4-iris', 'season-complete'])
      expect(gatheringGuests(stage)).toEqual([]);
  });
  it('places every guest on reachable floor with enough room between sprites', () => {
    const guests = gatheringGuests('day5-reading');
    for (const guest of guests) {
      expect(canStand(guest), guest.name).toBe(true);
      expect(findPath({ x: 171, y: 204 }, guest).length, guest.name).toBeGreaterThan(0);
      for (const other of guests)
        if (other !== guest)
          expect(Math.hypot(guest.x - other.x, guest.y - other.y)).toBeGreaterThan(32);
    }
  });
  it('keeps sprite counts stable across refreshes and destroys only its owned actors', () => {
    const live = new Set();
    const make = () => {
      const object = {
        setOrigin() {
          return this;
        },
        setPosition() {
          return this;
        },
        setDepth() {
          return this;
        },
        setTint() {
          return this;
        },
        setFrame() {
          return this;
        },
        play() {
          return this;
        },
        anims: { stop() {} },
        destroy() {
          live.delete(this);
        },
      };
      live.add(object);
      return object;
    };
    const gathering = createGathering({ add: { sprite: make, ellipse: make } });
    for (let cycle = 0; cycle < 100; cycle++) {
      gathering.sync('book-club');
      gathering.sync('book-club');
      gathering.update(false, 'Мара');
      expect(live.size).toBe(8);
      gathering.sync('quiet-evening');
      expect(live.size).toBe(0);
      gathering.sync('day5-reading');
      gathering.update(true, 'Айріс');
      expect(live.size).toBe(16);
      gathering.sync('season-complete');
      expect(live.size).toBe(0);
    }
    gathering.destroy();
    gathering.destroy();
    expect(live.size).toBe(0);
  });
});

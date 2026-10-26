import { afterEach, describe, expect, it, vi } from 'vitest';
import { viewportPlan, projectRect, frameWorld } from '../public/phaser-prototype/viewport.js';
import { Interactions } from '../public/phaser-prototype/interactions.js';
import { createFrameBudget } from '../public/phaser-prototype/performance.js';
import {
  initialFrank,
  tickFrank,
  reactFrank,
  frankMemory,
  restoreFrankMemory,
  BOWL,
  TREE,
} from '../public/phaser-prototype/frank-behavior.js';
import { createFrank } from '../public/phaser-prototype/frank.js';
import {
  canStand,
  distance,
  findPath,
  HOTSPOTS,
  FURNITURE,
} from '../public/phaser-prototype/world.js';
import { assessRecommendation, restoreService, SERVICE_KEY } from '../src/game/recommendation';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { encodeSave, SAVE_KEY, decodeSave } from '../src/game/save';

afterEach(() => vi.unstubAllGlobals());
const store = () => {
  const data = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  });
  return data;
};
function orderStory(stage) {
  const data = store();
  data.set(
    SAVE_KEY,
    encodeSave({
      stage,
      flags: [],
      dialogue: { node: stage === 'anna' ? 'books' : 'order', flags: [], history: [] },
    }),
  );
  return { story: new FiveDayStory(), data };
}
describe('native mobile geometry', () => {
  it.each([
    [375, 555],
    [390, 732],
    [430, 820],
    [768, 904],
    [1440, 780],
    [844, 338],
  ])('uses integer zoom at %i × %i', (width, height) => {
    const plan = viewportPlan(width, height);
    expect(Number.isInteger(plan.zoom)).toBe(true);
    expect(plan.width * plan.zoom).toBe(width);
    const rect = projectRect(
      { x: 100, y: 180, w: 25, h: 40 },
      { worldView: { x: 33, y: 20 }, zoom: plan.zoom },
    );
    expect(Object.values(rect).every(Number.isInteger)).toBe(true);
    expect(rect.x).toBe(67 * plan.zoom);
  });
  it('projects the top-left camera origin using scroll coordinates, not the centered worldView', () => {
    expect(
      projectRect(
        { x: 100, y: 180, w: 25, h: 40 },
        { scrollX: 77, scrollY: 41, worldView: { x: 171, y: 180 }, zoom: 2 },
      ),
    ).toEqual({ x: 46, y: 278, w: 50, h: 80 });
  });
  it('keeps offscreen reachable objects in keyboard cycling while excluding unavailable visitors', () => {
    const shelf = { id: 'shelves' },
      visitor = { id: 'mara' };
    const fixture = {
      spots: [shelf, visitor],
      buttons: new Map([
        ['shelves', { hidden: true, dataset: { available: 'true' } }],
        ['mara', { hidden: true, dataset: { available: 'false' } }],
      ]),
    };
    expect(Interactions.prototype.cycle.call(fixture)).toBe(shelf);
    fixture.buttons.get('mara').dataset.available = 'true';
    expect(Interactions.prototype.cycle.call(fixture)).toBe(visitor);
  });
  it('keeps feet and head visible at both vertical limits in landscape', () => {
    for (const y of [166, 204, 335]) {
      const frame = frameWorld({ x: 280, y }, 422, 169);
      expect(y - frame.y).toBeLessThanOrEqual(169 - 10);
      expect(y - 46 - frame.y).toBeGreaterThanOrEqual(0);
    }
  });
  it('makes every interaction reachable after furniture resizing', () => {
    for (const spot of HOTSPOTS) {
      expect(canStand(spot.approach), spot.id).toBe(true);
      expect(findPath({ x: 171, y: 204 }, spot.approach).length, spot.id).toBeGreaterThan(0);
    }
    expect(FURNITURE.find((f) => f.id === 'chair').w).toBe(36);
    expect(FURNITURE.find((f) => f.id === 'counter').h).toBe(42);
  });
  it('degrades only decoration after sustained slow frames, ignoring tab suspension', () => {
    const budget = createFrameBudget();
    budget.sample(20000);
    expect(budget.reduced).toBe(false);
    for (let i = 0; i < 180; i++) budget.sample(16.67);
    expect(budget.reduced).toBe(false);
    for (let i = 0; i < 170; i++) budget.sample(33.34);
    expect(budget.reduced).toBe(true);
  });
});
describe('Frank interaction lifecycle', () => {
  it('walks to food, eats, and cannot be fed repeatedly after reloading', () => {
    const cat = initialFrank();
    expect(reactFrank(cat, 'feed', { x: 513, y: 214 })).toContain('мисочку');
    let eating = false;
    for (let i = 0; i < 2000; i++) {
      const before = { ...cat };
      tickFrank(cat, 50, { x: 171, y: 204 });
      expect(canStand(cat)).toBe(true);
      expect(distance(cat, before)).toBeLessThanOrEqual(1.301);
      if (cat.activity === 'eating') {
        eating = true;
        break;
      }
    }
    expect(eating).toBe(true);
    expect(distance(cat, BOWL)).toBeLessThan(0.1);
    const loaded = { ...initialFrank(), ...restoreFrankMemory(frankMemory(cat)) };
    expect(loaded.meals).toBe(1);
    expect(reactFrank(loaded, 'feed', { x: 513, y: 214 })).toContain('трохи часу');
    expect(loaded.meals).toBe(1);
  });
  it('climbs continuously, rests and descends before walking away', () => {
    const cat = initialFrank();
    reactFrank(cat, 'tree', { x: 438, y: 217 });
    let rest = false,
      descent = false;
    let lastElevation = 0;
    for (let i = 0; i < 2100; i++) {
      tickFrank(cat, 50, { x: 171, y: 204 });
      expect(canStand(cat)).toBe(true);
      expect(Math.abs(cat.elevation - lastElevation)).toBeLessThanOrEqual(1.11);
      lastElevation = cat.elevation;
      if (cat.activity === 'resting') {
        rest = true;
        expect(distance(cat, TREE)).toBeLessThan(0.1);
        expect(cat.elevation).toBe(85);
      }
      if (cat.activity === 'descending') descent = true;
      if (descent && cat.elevation === 0) break;
    }
    expect(rest).toBe(true);
    expect(descent).toBe(true);
    expect(cat.elevation).toBe(0);
  });
  it('plays optionally, throttles petting, and normalizes missing or malformed old data', () => {
    const cat = initialFrank(),
      player = { x: 485, y: 229 };
    reactFrank(cat, 'play', player);
    expect(cat.activity).toBe('playing');
    expect(cat.games).toBe(1);
    reactFrank(cat, 'pet', player);
    reactFrank(cat, 'pet', player);
    expect(cat.pets).toBe(1);
    expect(restoreFrankMemory(null)).toEqual({ cooldowns: {}, pets: 0, meals: 0, games: 0 });
    expect(restoreFrankMemory('{"version":1,"pets":-1}').pets).toBe(0);
    const memory = JSON.parse(frankMemory(cat));
    memory.cooldowns.feed = Infinity;
    expect(restoreFrankMemory(JSON.stringify(memory)).games).toBe(0);
  });
  it('disposes sprites and listeners once and cannot animate after destruction', () => {
    store();
    const win = new EventTarget(),
      doc = new EventTarget();
    vi.stubGlobal('window', win);
    vi.stubGlobal('document', doc);
    const spy = vi.spyOn(win, 'removeEventListener'),
      docSpy = vi.spyOn(doc, 'removeEventListener');
    const make = () => ({
      setDepth() {
        return this;
      },
      setPosition() {
        return this;
      },
      clear() {
        return this;
      },
      fillStyle() {
        return this;
      },
      fillRect() {
        return this;
      },
      destroy: vi.fn(),
    });
    const sprite = make(),
      shadow = make();
    const cat = createFrank({ add: { ellipse: () => shadow, graphics: () => sprite } });
    cat.destroy();
    cat.destroy();
    const before = structuredClone(cat.state);
    cat.update(50, { x: 171, y: 204 }, { reduced: false });
    expect(cat.state).toEqual(before);
    expect(sprite.destroy).toHaveBeenCalledOnce();
    expect(shadow.destroy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('last-chapter:new-game', expect.any(Function));
    expect(docSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});
describe('catalog recommendations preserve narrative and saves', () => {
  it.each([
    ['miller', 'orchard', 'sold_orchard'],
    ['mara', 'station', 'sold_station'],
    ['anna', 'roads', 'anna_chose_maps'],
  ])('serves %s once through its original branch', (stage, book, flag) => {
    const { story, data } = orderStory(stage);
    expect(story.request.asked).toBe(false);
    story.clarifyRequest();
    expect(story.request.asked).toBe(true);
    const pending = data.get(SAVE_KEY);
    expect(story.recommend('letters')?.accepted).toBe(stage === 'mara');
    if (stage === 'mara') return; // Letters is an authored valid, unexpected gift.
    expect(data.get(SAVE_KEY)).toBe(pending);
    const resumed = new FiveDayStory();
    expect(resumed.request.asked).toBe(true);
    expect(resumed.recommend(book).accepted).toBe(true);
    expect(decodeSave(data.get(SAVE_KEY)).flags).toContain(flag);
    const complete = data.get(SAVE_KEY),
      count = resumed.orders.length;
    const loaded = new FiveDayStory();
    expect(loaded.orders.length).toBe(count);
    expect(loaded.recommend(book)).toBeNull();
    expect(data.get(SAVE_KEY)).toBe(complete);
  });
  it('preserves Mara’s different valid gift branches without adding rewards', () => {
    for (const [book, flag] of [
      ['station', 'sold_station'],
      ['roads', 'sold_roads'],
      ['letters', 'sold_letters'],
    ]) {
      const { story, data } = orderStory('mara');
      expect(story.recommend(book).accepted).toBe(true);
      expect(decodeSave(data.get(SAVE_KEY)).flags).toContain(flag);
      expect(new FiveDayStory().orders).toHaveLength(1);
    }
  });
  it('gives distinct personal reactions without changing facts on poor fits', () => {
    expect(assessRecommendation('miller', 'orchard').fit).toBe('excellent');
    expect(assessRecommendation('miller', 'witnesses').fit).toBe('alternative');
    expect(assessRecommendation('miller', 'letters').fit).toBe('unexpected');
    expect(assessRecommendation('miller', 'station').fit).toBe('poor');
    expect(assessRecommendation('miller', 'untrusted-id')).toBeNull();
    const { story, data } = orderStory('miller'),
      before = data.get(SAVE_KEY);
    expect(story.recommend('station').accepted).toBe(false);
    expect(data.get(SAVE_KEY)).toBe(before);
    expect(restoreService(data.get(SERVICE_KEY)).attempts).toHaveLength(1);
  });
  it('loads untouched old story saves with defaults and rejects imported service prose', () => {
    const { data } = orderStory('anna');
    const original = data.get(SAVE_KEY);
    data.delete(SERVICE_KEY);
    expect(new FiveDayStory().request.asked).toBe(false);
    expect(data.get(SAVE_KEY)).toBe(original);
    expect(restoreService('{"version":1,"asked":["hidden_flag"],"attempts":[]}').asked).toEqual([]);
    expect(
      restoreService('{"version":1,"asked":[],"attempts":[{"stage":"miller","book":"<script>"}]}')
        .attempts,
    ).toEqual([]);
  });
});

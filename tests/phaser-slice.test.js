import { describe, expect, it } from 'vitest';
import {
  BOUNDS,
  FURNITURE,
  HOTSPOTS,
  canStand,
  intersects,
  moveWithCollision,
  findPath,
  eligible,
  nearestSpot,
} from '../public/phaser-prototype/world.js';
import { initialState, transition } from '../public/phaser-prototype/state.js';
import { MARA } from '../public/phaser-prototype/dialogue-content.js';
import {
  openDialogue,
  dialogueNode,
  chooseDialogue,
  validateDialogue,
} from '../public/phaser-prototype/dialogue-state.js';
import {
  ASSET_MANIFEST,
  validateManifest,
  assetFallback,
  createCharacterSheets,
} from '../public/phaser-prototype/assets.js';
import { BookshopAudio } from '../public/phaser-prototype/audio.js';
import maraPortrait from '../public/art/portraits/mara.svg?raw';

describe('isolated bookshop dialogue', () => {
  it('validates every authored edge and rejects malformed imported prose or effects', () => {
    expect(validateDialogue()).toBe(true);
    expect(() => validateDialogue({ bad: { speaker: '', text: 42, choices: [] } }, {})).toThrow();
    expect(() =>
      validateDialogue(
        {
          a: {
            speaker: 'Мара',
            text: 'Так',
            choices: [{ id: 'a', label: 'Далі', next: 'missing' }],
          },
        },
        {},
      ),
    ).toThrow();
    expect(() =>
      validateDialogue(
        {
          a: {
            speaker: 'Мара',
            text: 'Так',
            choices: [{ id: 'a', label: 'Далі', next: 'a', effect: { completed: true } }],
          },
        },
        {},
      ),
    ).toThrow();
  });

  it('walks every branch to a completed gift without changing objective facts or the input state', () => {
    const initial = Object.freeze(initialState());
    const outcomes = [];
    const walk = (dialogue, state, route = []) => {
      expect(route.length).toBeLessThan(10);
      const node = dialogueNode(dialogue, state);
      expect(node).not.toBeNull();
      if (!node.choices.length) {
        expect(dialogue.node).toBe('end');
        expect(state.completed).toBe(true);
        expect(['station', 'roads']).toContain(state.book);
        outcomes.push({ ...state, route });
        return;
      }
      for (const choice of node.choices) {
        const result = chooseDialogue(dialogue, choice.id);
        let next = transition(state, { type: 'choose', effect: result.effect });
        if (result.complete) next = transition(next, { type: 'complete' });
        expect(state.completed).toBe(false);
        walk(result.dialogue, next, [...route, choice.id]);
      }
    };
    walk(openDialogue('mara'), transition(initial, { type: 'open' }));
    expect(outcomes.length).toBe(10);
    expect(new Set(outcomes.map((state) => state.book))).toEqual(new Set(['station', 'roads']));
    expect(new Set(outcomes.map((state) => state.privacy))).toEqual(
      new Set(['respected', 'asked', null]),
    );
    expect(initial).toEqual(initialState());
  });

  it('acknowledges a confidentiality boundary without contacting or informing Leo', () => {
    let dialogue = openDialogue('mara');
    dialogue = chooseDialogue(dialogue, 'listen').dialogue;
    const boundary = chooseDialogue(dialogue, 'ask-leo');
    expect(boundary.effect).toEqual({ privacy: 'asked' });
    expect(dialogueNode(boundary.dialogue, initialState()).text).toContain(
      'Не питай його від мого імені',
    );
    expect(chooseDialogue(boundary.dialogue, 'respect').dialogue.node).toBe('books');
  });

  it.each(['station', 'roads'])('remembers the %s book in the follow-up', (book) => {
    const state = { ...initialState(), book, completed: true };
    expect(dialogueNode(openDialogue('mara', true), state).text).toContain(
      book === 'station' ? 'Скляна станція' : 'Мапи незавершених доріг',
    );
  });

  it('rejects unknown or prototype-inherited choices and targets', () => {
    expect(openDialogue('constructor')).toBeNull();
    expect(chooseDialogue(openDialogue('mara'), 'wrap')).toBeNull();
    expect(chooseDialogue({ kind: 'mara', node: 'constructor' }, 'x')).toBeNull();
    expect(dialogueNode({ kind: 'object', node: 'constructor' }, initialState())).toBeNull();
    expect(dialogueNode({ kind: 'invalid', node: 'hello' }, initialState())).toBeNull();
    expect(Object.keys(MARA)).toContain('end');
  });
});

describe('bookshop state transitions', () => {
  it('keeps exploration, arrival, inspection, and dialogue transitions immutable', () => {
    const start = initialState();
    expect(transition(start, { type: 'complete' }).completed).toBe(false);
    expect(transition(start, { type: 'choose', effect: { book: 'roads' } })).toBe(start);
    const ready = transition(start, { type: 'arrive' });
    expect(ready.mara).toBe('ready');
    const inspected = transition(transition(ready, { type: 'inspect', id: 'window' }), {
      type: 'inspect',
      id: 'window',
    });
    expect(inspected.inspected).toEqual(['window']);
    expect(start.inspected).toEqual([]);
    expect(transition(ready, { type: 'inspect', id: 'fake' })).toBe(ready);
    const talking = transition(inspected, { type: 'open' });
    expect(transition(talking, { type: 'inspect', id: 'table' })).toBe(talking);
    expect(transition(talking, { type: 'complete' }).completed).toBe(false);
    const chosen = transition(talking, {
      type: 'choose',
      effect: { book: 'roads', mode: 'hacked', completed: true, secret: 'leak' },
    });
    expect(chosen).toEqual({ ...talking, book: 'roads' });
    const done = transition(chosen, { type: 'complete' });
    expect(done.completed).toBe(true);
    expect(transition(done, { type: 'choose', effect: { book: 'station' } })).toBe(done);
    expect(transition(done, { type: 'close' }).mode).toBe('explore');
  });
});

describe('movement and spatial interactions', () => {
  it('keeps the feet inside the room and rejects nonfinite coordinates', () => {
    for (const point of [
      { x: 300, y: BOUNDS.top },
      { x: 300, y: BOUNDS.bottom },
      { x: BOUNDS.left, y: 220 },
      { x: BOUNDS.right, y: 220 },
    ])
      expect(canStand(point)).toBe(true);
    for (const point of [
      { x: 29, y: 220 },
      { x: 611, y: 220 },
      { x: 300, y: 165 },
      { x: 300, y: 336 },
      { x: NaN, y: 220 },
      { x: 300, y: Infinity },
    ])
      expect(canStand(point)).toBe(false);
  });

  it('uses strict rectangle overlap, including the character foot radius', () => {
    expect(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 2, h: 2 })).toBe(false);
    expect(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 2, h: 2 })).toBe(true);
    for (const rect of FURNITURE)
      expect(canStand({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 })).toBe(false);
    expect(canStand({ x: 160, y: 240 })).toBe(false);
    expect(canStand({ x: 160, y: 239 })).toBe(true);
  });

  it('does not tunnel through the counter or bounds even with large movement deltas', () => {
    const start = { x: 160, y: 210 };
    const next = moveWithCollision(start, 0, 140);
    expect(next.y).toBeLessThanOrEqual(239);
    expect(canStand(next)).toBe(true);
    expect(start).toEqual({ x: 160, y: 210 });
    expect(moveWithCollision({ x: 300, y: 210 }, 1000, 0).x).toBeLessThanOrEqual(610);
  });

  it('slides along furniture rather than blocking both movement axes', () => {
    const next = moveWithCollision({ x: 280, y: 270 }, 60, 45);
    expect(next.x).toBeGreaterThan(280);
    expect(next.y).toBeGreaterThan(291);
    expect(canStand(next)).toBe(true);
  });

  it('routes around the reading furniture, with collision-free segments all the way', () => {
    const start = { x: 290, y: 270 },
      goal = { x: 435, y: 270 };
    const path = findPath(start, goal);
    expect(path.length).toBeGreaterThan(1);
    let from = start;
    for (const to of path) {
      for (let i = 0; i <= 100; i++)
        expect(
          canStand({
            x: from.x + ((to.x - from.x) * i) / 100,
            y: from.y + ((to.y - from.y) * i) / 100,
          }),
        ).toBe(true);
      from = to;
    }
    expect(path.at(-1)).toEqual(goal);
    expect(findPath(start, { x: 365, y: 260 })).toEqual([]);
    expect(findPath({ x: -1, y: 220 }, goal)).toEqual([]);
  });

  it('reaches every authored interaction point from the entrance and player spawn', () => {
    const spots = [...HOTSPOTS, { id: 'mara', approach: { x: 415, y: 220 } }];
    for (const spot of spots) {
      expect(canStand(spot.approach)).toBe(true);
      expect(findPath({ x: 171, y: 204 }, spot.approach).length).toBeGreaterThan(0);
      expect(findPath({ x: 590, y: 221 }, spot.approach).length).toBeGreaterThan(0);
    }
  });

  it('requires proximity, exploration, and a completed arrival before talking', () => {
    const spot = { id: 'mara', approach: { x: 415, y: 220 } },
      near = { x: 415, y: 220 };
    expect(eligible(near, spot, initialState())).toBe(false);
    const ready = transition(initialState(), { type: 'arrive' });
    expect(eligible(near, spot, ready)).toBe(true);
    expect(eligible({ x: 448, y: 220 }, spot, ready)).toBe(false);
    expect(eligible(near, spot, transition(ready, { type: 'open' }))).toBe(false);
    expect(nearestSpot({ x: 365, y: 222 }, HOTSPOTS, ready)?.id).toBe('table');
  });

  it('keeps object hit areas unambiguous', () => {
    for (const [i, a] of HOTSPOTS.entries())
      for (const b of HOTSPOTS.slice(i + 1)) expect(intersects(a.rect, b.rect)).toBe(false);
  });
});

describe('original asset pipeline and silent fallback', () => {
  it('validates provenance, local paths, and sheet geometry', () => {
    expect(validateManifest(ASSET_MANIFEST)).toBe(true);
    expect(maraPortrait).toContain('<svg');
    for (const manifest of [
      [],
      [ASSET_MANIFEST[0], ASSET_MANIFEST[0]],
      [{ ...ASSET_MANIFEST[0], frames: 4 }],
      [{ ...ASSET_MANIFEST[2], path: 'https://example.com/a.svg' }],
      [{ ...ASSET_MANIFEST[0], license: 'unknown' }],
    ])
      expect(() => validateManifest(manifest)).toThrow();
    expect(assetFallback('mara-portrait')).toMatchObject({ initials: 'М', label: 'Мара' });
  });

  it('generates two reusable sheets with 24 integer, in-bounds animation frames each', () => {
    const sheets = [];
    const scene = {
      textures: {
        exists: () => false,
        createCanvas: (name, width, height) => {
          const frames = [],
            pixels = [];
          const sheet = { name, width, height, frames, pixels };
          sheets.push(sheet);
          return {
            getContext: () => ({ fillRect: (...args) => pixels.push(args) }),
            add: (...args) => frames.push(args),
            refresh: () => {},
          };
        },
      },
    };
    createCharacterSheets(scene);
    expect(sheets).toHaveLength(2);
    for (const sheet of sheets) {
      expect(sheet.frames).toHaveLength(24);
      for (const [x, y, w, h] of sheet.pixels) {
        expect([x, y, w, h].every(Number.isInteger)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(sheet.width);
        expect(y + h).toBeLessThanOrEqual(sheet.height);
      }
    }
  });

  it('reports a fatal sprite allocation failure instead of continuing with invisible characters', () => {
    expect(() =>
      createCharacterSheets({ textures: { exists: () => false, createCanvas: () => null } }),
    ).toThrow('Cannot create player texture');
  });

  it('stays functional when audio is unsupported, with bounded volume and no autoplay', async () => {
    const audio = new BookshopAudio(null);
    expect(audio.muted).toBe(true);
    expect(audio.context).toBeUndefined();
    expect(await audio.unlock()).toBe(false);
    expect(await audio.toggle()).toBe(false);
    expect(() => {
      audio.play('book');
      audio.update(5000, true);
      audio.suspend();
    }).not.toThrow();
    audio.setVolume(8);
    expect(audio.volume).toBe(1);
    audio.setVolume(-1);
    expect(audio.volume).toBe(0);
    await audio.dispose();
  });
});

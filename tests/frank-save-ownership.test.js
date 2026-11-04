import { afterEach, expect, it, vi } from 'vitest';
import { createFrank } from '../public/phaser-prototype/frank.js';
import { FRANK_SAVE_KEY } from '../public/phaser-prototype/frank-behavior.js';
afterEach(() => vi.unstubAllGlobals());
it.each([false, true])('Frank respects chapter save ownership: writable=%s', (writable) => {
  const raw = JSON.stringify({ version: 1, cooldowns: {}, pets: 3, meals: 2, games: 1 });
  const data = new Map([[FRANK_SAVE_KEY, raw]]);
  const write = vi.fn((key, value) => data.set(key, value));
  vi.stubGlobal('localStorage', { getItem: (key) => data.get(key) ?? null, setItem: write });
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', new EventTarget());
  const graphic = {
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
  };
  const cat = createFrank({
    story: { isProgressSaved: writable },
    add: { ellipse: () => graphic, graphics: () => graphic },
  });
  expect(cat.state.pets).toBe(writable ? 3 : 0);
  cat.react('feed', { x: 171, y: 204 });
  cat.destroy();
  if (writable) {
    expect(JSON.parse(data.get(FRANK_SAVE_KEY)).meals).toBe(3);
  } else {
    expect(write).not.toHaveBeenCalled();
    expect(data.get(FRANK_SAVE_KEY)).toBe(raw);
  }
});

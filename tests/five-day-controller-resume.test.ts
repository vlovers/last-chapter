import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY } from '../src/game/save';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

afterEach(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
});

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
    clear: () => {
      values.clear();
    },
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  };
}

describe('Playable UI five-day journey', () => {
  it('persists a first-day choice across a new game controller instance', () => {
    const memory = storage();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: memory,
    });
    try {
      const game = new FiveDayStory();
      expect(game.day).toBe(1);
      const first = game.open();
      expect(first.choices.length).toBeGreaterThan(0);
      const choice = first.choices.find((option) => !option.id.startsWith('__'));
      expect(choice).toBeDefined();
      const after = game.choose(choice!.id);
      expect(memory.getItem(SAVE_KEY)).not.toBeNull();
      const resumed = new FiveDayStory();
      expect(resumed.stage).toBe(game.stage);
      expect(resumed.open()).toEqual(after);
    } finally {
      // afterEach restores the original property descriptor.
    }
  });

  it('refuses an internal advance action while conversation choices remain', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: storage(),
    });
    try {
      const game = new FiveDayStory();
      expect(() => game.choose('__advance')).toThrow();
      expect(game.stage).toBe('miller');
      expect(() => game.choose('__restart')).toThrow();
    } finally {
      // afterEach restores the original property descriptor.
    }
  });
});

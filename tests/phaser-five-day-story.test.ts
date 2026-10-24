import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY, encodeSave } from '../src/game/save';
import { chooseChapterOption, startChapter } from '../src/game/chapter';

const values = new Map<string, string>();
const previousStorage = globalThis.localStorage;
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  },
});
afterEach(() => values.clear());

describe('canonical Phaser story bridge', () => {
  it('starts at the real first encounter, not the standalone Mara fixture', () => {
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(story.day).toBe(1);
    expect(story.open().speaker).toBe('Пані Міллер');
  });
  it('uses the shared dialogue graph and persists each choice in the legacy save format', () => {
    const story = new FiveDayStory();
    story.choose('greet');
    expect(story.open().choices.length).toBeGreaterThan(0);
    expect(values.get(SAVE_KEY)).toBe(encodeSave(chooseChapterOption(startChapter(), 'greet')));
  });
  it('restores an existing story checkpoint without overwriting it', () => {
    const state = chooseChapterOption(startChapter(), 'greet');
    values.set(SAVE_KEY, encodeSave(state));
    const story = new FiveDayStory();
    expect(story.open().text).toBeDefined();
    expect(story.stage).toBe('miller');
    expect(values.get(SAVE_KEY)).toBe(encodeSave(state));
  });
  it('rejects premature stage changes and malformed save data', () => {
    values.set(SAVE_KEY, 'not-json');
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(() => story.choose('__advance')).toThrow();
  });
});
afterEach(() => {
  if (previousStorage) Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previousStorage });
});

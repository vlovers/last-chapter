import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY, encodeSave } from '../src/game/save';
import { chooseChapterOption, startChapter } from '../src/game/chapter';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  },
});
afterEach(() => values.clear());

describe('canonical Phaser story bridge', () => {
  it('starts at the real first encounter, not the standalone Mara fixture', () => {
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(story.day).toBe(1);
    expect(story.open().speaker).toBe('Оповідач');
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
  it('plays through the full five-day story using the shared narrative engine', () => {
    const story = new FiveDayStory();
    const visited = new Set<string>();
    for (let i = 0; i < 250 && story.stage !== 'season-complete'; i++) {
      visited.add(story.stage);
      const node = story.open();
      expect(node.choices.length).toBeGreaterThan(0);
      story.choose(node.choices[0].id);
    }
    expect(story.stage).toBe('season-complete');
    expect(story.day).toBe(5);
    expect(visited.size).toBeGreaterThanOrEqual(18);
    expect(story.open().choices[0].id).toBe('__restart');
  });
  it('uses the correct visitor identity and preserves inspected shop discoveries', () => {
    const story = new FiveDayStory();
    expect(story.actor).toBe('miller');
    expect(story.visitor).toBe('Пані Міллер');
    expect(story.notes.length).toBe(0);
    const inspection = story.inspect('shelves');
    expect(inspection?.speaker).toBe('Книжкові полиці');
    expect(story.notes.some((note) => note.includes('полиці'))).toBe(true);
    expect(story.catalog('all')).toHaveLength(5);
    expect(story.catalog('mystery').length).toBeGreaterThan(0);
    expect(story.catalog('literary').length).toBeGreaterThan(0);
    expect(story.progress.find((day) => day.status === 'current')?.day).toBe(1);
    const restored = new FiveDayStory();
    expect(restored.notes).toEqual(story.notes);
    expect(restored.inspect('not-a-place')).toBeNull();
  });
  it('rejects premature stage changes and malformed save data', () => {
    values.set(SAVE_KEY, 'not-json');
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(() => story.choose('__advance')).toThrow();
  });
});

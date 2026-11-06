import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY, decodeSave, encodeSave } from '../src/game/save';
import {
  chooseChapterOption,
  stageStory,
  startChapter,
  type ChapterState,
  type ChapterStage,
} from '../src/game/chapter';
import { availableOptions } from '../src/game/dialogue';

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

const order: readonly ChapterStage[] = [
  'miller',
  'mara',
  'evening',
  'complete',
  'iris',
  'anna',
  'leo',
  'day2-complete',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'day3-complete',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day4-complete',
  'day5-reading',
  'season-complete',
];
const checkpoints: readonly ChapterStage[] = [
  'complete',
  'day2-complete',
  'day3-complete',
  'day4-complete',
];
function routeToEnd(initial: ChapterState): string[] {
  const queue: { state: ChapterState; route: string[] }[] = [{ state: initial, route: [] }];
  const visited = new Set<string>();
  for (let index = 0; index < queue.length && index < 5000; index++) {
    const entry = queue[index];
    if (!entry) throw new Error('Missing dialogue search entry');
    const key = entry.state.dialogue.node + '|' + [...entry.state.flags].sort().join(',');
    if (visited.has(key)) continue;
    visited.add(key);
    const options = availableOptions(stageStory(initial.stage), entry.state.dialogue);
    if (!options.length) return entry.route;
    for (const option of options) {
      queue.push({
        state: chooseChapterOption(entry.state, option.id),
        route: [...entry.route, option.id],
      });
    }
  }
  throw new Error('No reachable exit from ' + initial.stage);
}

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
  it('plays all 19 canonical stages through the Phaser bridge', () => {
    const story = new FiveDayStory();
    for (const stage of order) {
      expect(story.stage).toBe(stage);
      if (stage === 'season-complete') break;
      if (!checkpoints.includes(stage)) {
        const snapshot = decodeSave(values.get(SAVE_KEY) ?? '') ?? startChapter();
        for (const id of routeToEnd(snapshot)) story.choose(id);
      }
      expect(story.open().choices[0]?.id).toBe('__advance');
      story.choose('__advance');
    }
    expect(story.stage).toBe('season-complete');
    expect(story.day).toBe(5);
    expect(story.open().choices[0]?.id).toBe('__restart');
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
    expect(restored.inspect('plant')?.speaker).toBe('Рослина біля вікна');
  });
  it('rejects premature stage changes and malformed save data', () => {
    values.set(SAVE_KEY, 'not-json');
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(() => story.choose('__advance')).toThrow();
  });
});

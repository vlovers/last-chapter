import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY, decodeSave, encodeSave } from '../src/game/save';

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

describe('Phaser bookshop tomorrow integration', () => {
  it('paginates the large finale hub and plays a new optional scene with at most four visible choices', () => {
    const flags = ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'];
    values.set(
      SAVE_KEY,
      encodeSave({
        stage: 'day5-reading',
        dialogue: { node: 'gathering', flags, history: [] },
        flags,
      }),
    );

    const story = new FiveDayStory();
    expect(story.stage).toBe('day5-reading');

    let found = false;
    for (let page = 0; page < 30; page++) {
      const options = story.open().choices;
      expect(options.length).toBeLessThanOrEqual(4);
      if (options.some((option) => option.id === 'bookshop-tomorrow')) {
        found = true;
        break;
      }
      expect(options.some((option) => option.id === '__more_choices')).toBe(true);
      story.choose('__more_choices');
    }

    expect(found).toBe(true);
    const entry = story.choose('bookshop-tomorrow');
    expect(entry.choices.map((option) => option.id)).toEqual([
      'tomorrow-shelf',
      'tomorrow-cards',
      'tomorrow-tea',
      '__more_choices',
    ]);
    expect(entry.choices).toHaveLength(4);
    expect(story.choose('__more_choices').choices.some((option) => option.id === 'tomorrow-later')).toBe(true);

    expect(entry.choices).toHaveLength(4);

    story.choose('tomorrow-cards');
    story.choose('tomorrow-cards-box');
    story.choose('tomorrow-cards-finish');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_bookshop_wish_box');
    expect(saved?.flags).toContain('final_bookshop_tomorrow_done');

    const restored = new FiveDayStory();
    expect(restored.stage).toBe('day5-reading');
    expect(restored.open().choices.length).toBeLessThanOrEqual(4);
  });
});

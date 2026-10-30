import { afterEach, describe, expect, it, vi } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions } from '../src/game/dialogue';
import { encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

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
    clear: () => values.clear(),
  };
}

const gathering = finalReading.nodes.find((node) => node.id === 'gathering');
if (!gathering) throw new Error('Missing final gathering');

const allPrerequisites = [
  ...new Set(gathering.options.flatMap((option) => option.requires ?? [])),
];

function savedFinale(flags: readonly string[]) {
  const local = storage();
  const initial = {
    stage: 'day5-reading' as const,
    flags: [...flags],
    dialogue: { node: 'gathering', flags: [...flags], history: [] as string[] },
  };
  local.setItem(SAVE_KEY, encodeSave(initial));
  vi.stubGlobal('localStorage', local);
  return { local, story: new FiveDayStory(), initial };
}

afterEach(() => vi.unstubAllGlobals());

describe('Finale UI pagination and save regression', () => {
  for (const [name, flags] of [
    ['ordinary evening', []],
    ['evening with all prior scene prerequisites', allPrerequisites],
  ] as const) {
    it(`exposes every choice exactly once across pages: ${name}`, () => {
      const { local, story, initial } = savedFinale(flags);
      const expected = availableOptions(finalReading, initial.dialogue).map((option) => option.id);
      const pageCount = Math.ceil(expected.length / 3);
      const originalSave = local.getItem(SAVE_KEY);
      expect(pageCount).toBeGreaterThan(1);

      const seen: string[] = [];
      const firstPage = story.open().choices.map((choice) => choice.id);
      for (let page = 0; page < pageCount; page++) {
        const choices = story.open().choices;
        const ids = choices.map((choice) => choice.id);
        expect(ids.length, `page ${page} has too many buttons`).toBeLessThanOrEqual(4);
        expect(ids.filter((id) => id !== '__more_choices')).toHaveLength(
          Math.min(3, expected.length - page * 3),
        );
        expect(ids).toContain('__more_choices');
        seen.push(...ids.filter((id) => id !== '__more_choices'));
        story.choose('__more_choices');
        expect(local.getItem(SAVE_KEY), 'Paging must not rewrite the story save').toBe(
          originalSave,
        );
      }

      expect(seen).toEqual(expected);
      expect(new Set(seen).size).toBe(expected.length);
      expect(story.open().choices.map((choice) => choice.id)).toEqual(firstPage);
      expect(story.stage).toBe('day5-reading');
    });
  }

  it('restores the first page without losing dialogue flags or the closing action', () => {
    const { local, story, initial } = savedFinale(allPrerequisites);
    const firstPage = story.open().choices.map((choice) => choice.id);
    story.choose('__more_choices');
    expect(story.open().choices.map((choice) => choice.id)).not.toEqual(firstPage);

    const restored = new FiveDayStory();
    expect(restored.open().choices.map((choice) => choice.id)).toEqual(firstPage);
    expect(local.getItem(SAVE_KEY)).toBe(encodeSave(initial));

    const expected = availableOptions(finalReading, initial.dialogue).map((option) => option.id);
    const maxPages = Math.ceil(expected.length / 3);
    let foundClose = false;
    for (let page = 0; page < maxPages; page++) {
      if (restored.open().choices.some((choice) => choice.id === 'close')) {
        foundClose = true;
        break;
      }
      restored.choose('__more_choices');
    }
    expect(foundClose, 'The player must be able to reach the final choice').toBe(true);
    restored.choose('close');
    expect(restored.open().choices.map((choice) => choice.id)).toContain('__advance');
    restored.choose('__advance');
    expect(restored.stage).toBe('season-complete');
    expect(new FiveDayStory().stage).toBe('season-complete');
  });
});

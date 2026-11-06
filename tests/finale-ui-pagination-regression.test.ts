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

const allPrerequisites = [...new Set(gathering.options.flatMap((option) => option.requires ?? []))];

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
      const pageable = expected.filter((id) => id !== 'close');
      const pageCount = pageable.length <= 2 ? 1 : 1 + Math.ceil((pageable.length - 2) / 3);
      const originalSave = local.getItem(SAVE_KEY);
      expect(pageCount).toBeGreaterThan(1);

      const seen: string[] = [];
      const firstPage = story.open().choices.map((choice) => choice.id);
      expect(firstPage).toContain('close');
      for (let page = 0; page < pageCount; page++) {
        const choices = story.open().choices;
        const ids = choices.map((choice) => choice.id);
        const offset = page === 0 ? 0 : 2 + (page - 1) * 3;
        const size = page === 0 ? 2 : 3;
        expect(ids.length, `page ${page} has too many buttons`).toBeLessThanOrEqual(4);
        expect(ids.filter((id) => id !== '__more_choices' && id !== 'close')).toEqual(
          pageable.slice(offset, offset + size),
        );
        expect(ids.filter((id) => id === 'close')).toHaveLength(page === 0 ? 1 : 0);
        expect(ids).toContain('__more_choices');
        if (page === pageCount - 1) {
          expect(choices.find((choice) => choice.id === '__more_choices')?.label).toBe(
            '↩ На початок списку',
          );
        }
        seen.push(...ids.filter((id) => id !== '__more_choices' && id !== 'close'));
        story.choose('__more_choices');
        expect(local.getItem(SAVE_KEY), 'Paging must not rewrite the story save').toBe(
          originalSave,
        );
      }

      expect(seen).toEqual(pageable);
      expect(new Set(seen).size).toBe(pageable.length);
      expect(story.open().choices.map((choice) => choice.id)).toEqual(firstPage);
      expect(story.stage).toBe('day5-reading');
    });
  }

  it('rejects pagination after the final reply, without advancing the story', () => {
    const { story } = savedFinale([]);
    expect(story.open().choices.map((choice) => choice.id)).toContain('close');
    story.choose('close');
    expect(story.open().choices.map((choice) => choice.id)).toEqual(['__advance']);
    expect(() => story.choose('__more_choices')).toThrow('No additional dialogue choices');
    expect(story.stage).toBe('day5-reading');
    story.choose('__advance');
    expect(story.stage).toBe('season-complete');
    expect(() => story.choose('__more_choices')).toThrow('No additional dialogue choices');
  });

  it('restores the first page without losing dialogue flags or the closing action', () => {
    const { local, story, initial } = savedFinale(allPrerequisites);
    const firstPage = story.open().choices.map((choice) => choice.id);
    story.choose('__more_choices');
    expect(story.open().choices.map((choice) => choice.id)).not.toEqual(firstPage);

    const restored = new FiveDayStory();
    expect(restored.open().choices.map((choice) => choice.id)).toEqual(firstPage);
    expect(local.getItem(SAVE_KEY)).toBe(encodeSave(initial));

    const expected = availableOptions(finalReading, initial.dialogue).map((option) => option.id);
    const pageable = expected.filter((id) => id !== 'close');
    const maxPages = pageable.length <= 2 ? 1 : 1 + Math.ceil((pageable.length - 2) / 3);
    for (let page = 0; page < maxPages; page++) {
      expect(restored.open().choices.length).toBeLessThanOrEqual(4);
      restored.choose('__more_choices');
    }
    expect(restored.open().choices.map((choice) => choice.id)).toEqual(firstPage);
    expect(firstPage).toContain('close');
    restored.choose('close');
    expect(restored.open().choices.map((choice) => choice.id)).toContain('__advance');
    restored.choose('__advance');
    expect(restored.stage).toBe('season-complete');
    expect(new FiveDayStory().stage).toBe('season-complete');
  });
});

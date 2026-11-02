import { afterEach, describe, expect, it, vi } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, startDialogue, type DialogueState } from '../src/game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

const gathering = finalReading.nodes.find((node) => node.id === 'gathering');
if (!gathering) throw new Error('Missing final gathering');

function openAtGathering(flags: readonly string[]) {
  const dialogue: DialogueState = {
    ...startDialogue(finalReading),
    node: 'gathering',
    flags: [...flags],
  };
  const expected = availableOptions(finalReading, dialogue).map((option) => option.id);
  const values = new Map<string, string>([
    [SAVE_KEY, encodeSave({ stage: 'day5-reading', dialogue, flags })],
  ]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  return { story: new FiveDayStory(), values, expected };
}

function walkEveryPage(story: FiveDayStory) {
  const firstPage = story.open().choices.map((choice) => choice.id);
  const visitedPages = new Set<string>();
  const authored: string[] = [];
  let returnedToFirst = false;

  for (let step = 0; step < 100; step++) {
    const ids = story.open().choices.map((choice) => choice.id);
    const pageKey = JSON.stringify(ids);
    if (visitedPages.has(pageKey)) {
      expect(ids).toEqual(firstPage);
      returnedToFirst = true;
      break;
    }
    visitedPages.add(pageKey);
    expect(ids.length).toBeLessThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.includes('close')).toBe(visitedPages.size === 1);
    authored.push(...ids.filter((id) => id !== 'close' && id !== '__more_choices'));
    if (!ids.includes('__more_choices')) break;
    story.choose('__more_choices');
  }

  expect(visitedPages.size).toBeLessThan(0 + 100);
  if (visitedPages.size > 1) expect(returnedToFirst).toBe(true);
  expect(new Set(authored).size).toBe(authored.length);
  return authored;
}

afterEach(() => vi.unstubAllGlobals());

describe('final gathering: every conditional reply remains reachable on a four-button screen', () => {
  it.each(gathering.options.filter((option) => option.id !== 'close'))(
    '$id: all available replies appear exactly once across pages',
    (option) => {
      const { story, values, expected } = openAtGathering(option.requires ?? []);
      expect(expected).toContain(option.id);
      expect(expected).toContain('close');
      const originalSave = values.get(SAVE_KEY);
      expect(walkEveryPage(story)).toEqual(expected.filter((id) => id !== 'close'));
      expect(values.get(SAVE_KEY)).toBe(originalSave);
      expect(story.open().choices.map((choice) => choice.id)).toContain('close');
    },
  );

  it.each(gathering.options.filter((option) => option.id !== 'close'))(
    '$id: a selected reply survives reload without losing its conditions',
    (option) => {
      const { story, values } = openAtGathering(option.requires ?? []);
      let found = false;
      for (let page = 0; page < 100; page++) {
        const ids = story.open().choices.map((choice) => choice.id);
        if (ids.includes(option.id)) {
          found = true;
          break;
        }
        expect(ids).toContain('__more_choices');
        story.choose('__more_choices');
      }
      expect(found).toBe(true);
      story.choose(option.id);
      const saved = decodeSave(values.get(SAVE_KEY) ?? '');
      expect(saved?.stage).toBe('day5-reading');
      expect(saved?.dialogue.node).toBe(option.next);
      expect(saved?.flags).toEqual(expect.arrayContaining(option.grants ?? []));
      const restored = new FiveDayStory();
      expect(restored.stage).toBe('day5-reading');
      expect(restored.isProgressSaved).toBe(true);
      expect(restored.open().choices.length).toBeLessThanOrEqual(4);
    },
  );
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_KEY } from '../src/game/recommendation';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

const emptyService = JSON.stringify({ version: 1, asked: [], attempts: [] });

function setup() {
  const values = new Map<string, string>();
  let denyChapterWrites = false;
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === SAVE_KEY && denyChapterWrites) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  const story = new FiveDayStory();
  story.choose('greet');
  story.choose('books');
  expect(story.request).not.toBeNull();
  expect(story.isProgressSaved).toBe(true);
  return { story, values, denyWrites: () => (denyChapterWrites = true) };
}

afterEach(() => vi.unstubAllGlobals());

describe('recommendation history stays consistent with durable chapter progress', () => {
  it('does not persist an accepted recommendation when its chapter choice fails to save', () => {
    const { story, values, denyWrites } = setup();
    const chapterBefore = values.get(SAVE_KEY);
    expect(values.get(SERVICE_KEY)).toBe(emptyService);

    denyWrites();
    expect(story.recommend('orchard')?.accepted).toBe(true);

    expect(story.isProgressSaved).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(chapterBefore);
    expect(values.get(SERVICE_KEY)).toBe(emptyService);
    expect(decodeSave(values.get(SAVE_KEY)!)?.dialogue.node).toBe('books');
  });

  it('does not persist a clarification after the chapter has become unsaved', () => {
    const { story, values, denyWrites } = setup();
    const chapterBefore = values.get(SAVE_KEY);
    denyWrites();

    // A rejected catalog suggestion does not change the dialogue, but the
    // chapter write must still be the gate for durable service diagnostics.
    story.choose('orchard');
    expect(story.isProgressSaved).toBe(false);
    story.clarifyRequest();
    expect(values.get(SAVE_KEY)).toBe(chapterBefore);
    expect(values.get(SERVICE_KEY)).toBe(emptyService);
  });

  it('still persists the service attempt after a successful accepted chapter choice', () => {
    const { story, values } = setup();
    story.clarifyRequest();
    expect(story.recommend('orchard')?.accepted).toBe(true);

    expect(story.isProgressSaved).toBe(true);
    expect(decodeSave(values.get(SAVE_KEY)!)?.dialogue.node).not.toBe('books');
    expect(JSON.parse(values.get(SERVICE_KEY)!)).toEqual({
      version: 1,
      asked: ['miller'],
      attempts: [{ stage: 'miller', book: 'orchard' }],
    });
  });
});

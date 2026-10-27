import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY, decodeSave } from '../src/game/save';
import { SERVICE_KEY } from '../src/game/recommendation';

function mockStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  return values;
}

afterEach(() => vi.unstubAllGlobals());

describe('recommendation memory and narrative save stay aligned', () => {
  it('restores a rejected recommendation and its clarification without creating a receipt', () => {
    const storage = mockStorage();
    const story = new FiveDayStory();
    // Advance only through authored options until a recommendation is offered.
    for (let i = 0; i < 30 && !story.request; i++) {
      const choices = story.open().choices;
      expect(choices.length).toBeGreaterThan(0);
      story.choose(choices[0]!.id);
    }
    expect(story.request).not.toBeNull();
    const stage = story.stage;
    story.clarifyRequest();
    const accepted = new Set(story.recommendationChoices.map((choice) => choice.bookId));
    const catalog = story.catalog();
    const rejected = catalog.find((entry) => !accepted.has(entry.book.id));
    expect(rejected).toBeDefined();
    const result = story.recommend(rejected!.book.id);
    expect(result?.accepted).toBe(false);
    const savedChapter = storage.get(SAVE_KEY);
    expect(savedChapter).toBeDefined();
    expect(decodeSave(savedChapter!)?.stage).toBe(stage);

    const restored = new FiveDayStory();
    expect(restored.stage).toBe(stage);
    expect(restored.request?.asked).toBe(true);
    expect(restored.lastRecommendation?.accepted).toBe(false);
    expect(restored.orders).toEqual(story.orders);
    expect(JSON.parse(storage.get(SERVICE_KEY)!).attempts).toContainEqual({
      stage,
      book: rejected!.book.id,
    });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

afterEach(() => vi.unstubAllGlobals());

describe('Mara gift choices reach Leo after save and restore', () => {
  it.each([
    ['station', 'sold_station', 'gift-station'],
    ['roads', 'sold_roads', 'gift-roads'],
    ['letters', 'sold_letters', 'gift-letters'],
  ])('preserves %s and unlocks %s in Leo dialogue', (book, receipt, gift) => {
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
    let story = new FiveDayStory();
    let purchased = false;
    let sawGift = false;
    for (let step = 0; step < 500 && !sawGift; step++) {
      const view = story.open();
      if (
        story.stage === 'mara' &&
        story.recommendationChoices.some((item) => item.bookId === book)
      ) {
        expect(story.recommend(book)?.accepted).toBe(true);
        purchased = true;
      } else if (
        story.stage === 'miller' &&
        story.recommendationChoices.some((item) => item.bookId === 'orchard')
      ) {
        expect(story.recommend('orchard')?.accepted).toBe(true);
      } else if (story.stage === 'leo' && view.choices.some((item) => item.id === gift)) {
        expect(view.choices.some((item) => item.id === gift)).toBe(true);
        story.choose(gift);
        sawGift = true;
      } else {
        const preferred =
          story.stage === 'leo' ? view.choices.find((item) => item.id === 'mara') : undefined;
        const choice =
          preferred ??
          view.choices.find((item) => item.id === '__advance') ??
          view.choices.find((item) => item.id === 'finish') ??
          view.choices.find((item) => !item.id.startsWith('__'));
        if (!choice) throw new Error(`Stuck at ${story.stage}`);
        story.choose(choice.id);
      }
      story = new FiveDayStory();
    }
    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(purchased).toBe(true);
    expect(sawGift).toBe(true);
    expect(saved?.flags).toContain(receipt);
    expect(story.orders.some((order) => order.book.id === book)).toBe(true);
    expect(story.open().speaker).toBe('Лео');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

afterEach(() => vi.unstubAllGlobals());

describe('Anna book recommendations persist through the second day', () => {
  it.each([
    ['roads', 'anna_chose_maps'],
    ['witnesses', 'anna_chose_mystery'],
  ])('restores the %s recommendation and receipt', (book, receipt) => {
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
    let leftAnna = false;
    for (let step = 0; step < 500 && !leftAnna; step++) {
      const view = story.open();
      if (
        story.stage === 'anna' &&
        story.recommendationChoices.some((item) => item.bookId === book)
      ) {
        expect(story.recommend(book)?.accepted).toBe(true);
        purchased = true;
      } else {
        const choice =
          view.choices.find((item) => item.id === '__advance') ??
          view.choices.find((item) => item.id === 'books') ??
          view.choices.find((item) => item.id === 'finish') ??
          view.choices.find((item) => !item.id.startsWith('__'));
        if (!choice) throw new Error(`Stuck at ${story.stage}`);
        story.choose(choice.id);
      }
      story = new FiveDayStory();
      leftAnna = purchased && story.stage === 'leo';
    }

    expect(purchased).toBe(true);
    expect(leftAnna).toBe(true);
    expect(decodeSave(values.get(SAVE_KEY) ?? '')?.flags).toContain(receipt);
    expect(story.orders.some((order) => order.book.id === book)).toBe(true);
    expect(story.stage).toBe('leo');
    const completedOrders = story.orders.length;
    expect(completedOrders).toBeGreaterThan(0);
    const resumed = new FiveDayStory();
    expect(resumed.orders).toEqual(story.orders);
    expect(resumed.stage).toBe('leo');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

function useStorage() {
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

describe('order receipts survive five-day save/restore', () => {
  it('keeps each completed order after every choice and clears receipts on restart', () => {
    const values = useStorage();
    let story = new FiveDayStory();
    const visitedDays = new Set<number>([story.day]);
    const observedReceipts = new Set<string>();
    let maxOrders = 0;

    for (let step = 0; step < 1000 && story.stage !== 'season-complete'; step++) {
      const view = story.open();
      const choice =
        view.choices.find((option) => option.id === '__advance') ??
        view.choices.find((option) => option.id === 'finish') ??
        view.choices.find((option) => !option.id.startsWith('__'));
      if (!choice) throw new Error(`Story stuck at ${story.stage} after ${step} steps`);
      story.choose(choice.id);
      const beforeRestore = story.orders.map((order) => ({
        customer: order.customer,
        book: order.book.id,
      }));
      expect(beforeRestore.length).toBeGreaterThanOrEqual(maxOrders);
      maxOrders = beforeRestore.length;
      for (const receipt of beforeRestore) observedReceipts.add(JSON.stringify(receipt));
      story = new FiveDayStory();
      visitedDays.add(story.day);
      expect(
        story.orders.map((order) => ({
          customer: order.customer,
          book: order.book.id,
        })),
      ).toEqual(beforeRestore);
      expect(decodeSave(values.get(SAVE_KEY) ?? '')).not.toBeNull();
    }

    expect(story.stage).toBe('season-complete');
    expect([...visitedDays].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(observedReceipts.size).toBeGreaterThan(0);
    story.choose('__restart');
    story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(story.orders).toEqual([]);
  });
});

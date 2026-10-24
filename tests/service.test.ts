import { describe, expect, it } from 'vitest';
import { startChapter } from '../src/game/chapter';
import { completedOrders, currentCustomer } from '../src/game/service';
import { decodeSave, encodeSave } from '../src/game/save';

describe('customer service ledger', () => {
  it('starts empty and shows the current customer', () => {
    expect(completedOrders(startChapter())).toEqual([]);
    expect(currentCustomer('miller')).toBe('Пані Міллер');
    expect(currentCustomer('mara')).toBe('Мара');
    expect(currentCustomer('evening')).toBeNull();
  });
  it('derives a single receipt from each fulfilled order flag', () => {
    const receipts = completedOrders({ flags: ['sold_orchard', 'sold_station'] });
    expect(receipts.map((item) => [item.customer, item.book.id])).toEqual([
      ['Пані Міллер', 'orchard'],
      ['Мара', 'station'],
    ]);
  });
  it('does not duplicate receipts and survives save restoration', () => {
    const original = startChapter();
    const flags = ['sold_witnesses', 'sold_witnesses', 'explored_shelves'];
    const state = { ...original, flags, dialogue: { ...original.dialogue, flags } };
    const restored = decodeSave(encodeSave(state));
    expect(restored).not.toBeNull();
    expect(completedOrders(restored!)).toHaveLength(1);
    expect(completedOrders(restored!)[0]?.book.title).toBe('Ніхто не знає кінцівки');
  });
});

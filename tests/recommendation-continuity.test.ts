import { describe, expect, it } from 'vitest';
import { leoVisit } from '../src/content/leo';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';
import { completedOrders, currentCustomer } from '../src/game/service';

describe('book recommendations echo across days', () => {
  it('tracks Anna’s classroom recommendation in the same ledger', () => {
    expect(currentCustomer('anna')).toBe('Анна');
    const orders = completedOrders({ flags: ['sold_station', 'anna_chose_maps'] });
    expect(orders.map((order) => order.book.id)).toEqual(['station', 'roads']);
    expect(orders[1]?.customer).toBe('Анна');
  });

  it.each([
    ['sold_station', 'gift-station'],
    ['sold_roads', 'gift-roads'],
    ['sold_letters', 'gift-letters'],
  ])('offers Leo a specific reaction to %s only when that book was chosen', (flag, option) => {
    const greet = selectOption(leoVisit, startDialogue(leoVisit), 'greet');
    const mara = selectOption(leoVisit, { ...greet, flags: [flag] }, 'mara');
    expect(availableOptions(leoVisit, mara).some((item) => item.id === option)).toBe(true);
    const reaction = selectOption(leoVisit, mara, option);
    expect(reaction.node).toBe(option);
    const back = selectOption(leoVisit, reaction, `${option}-back`);
    expect(back.flags).toContain('leo_respected_mara_surprise');
    const withoutGift = selectOption(leoVisit, greet, 'mara');
    expect(availableOptions(leoVisit, withoutGift).some((item) => item.id === option)).toBe(false);
  });

  it('preserves the integrity of Leo’s dialogue graph', () => {
    expect(validateDialogue(leoVisit)).toEqual([]);
  });
});

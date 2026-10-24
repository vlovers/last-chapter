import { describe, expect, it } from 'vitest';
import { books } from '../src/content/books';
import { millerVisit } from '../src/content/first-day';
import { maraVisit } from '../src/content/mara';
import { catalogEntries, matchingOrderOptions } from '../src/game/catalog';

describe('interactive book catalog', () => {
  it('lists every book and divides them into non-overlapping categories', () => {
    expect(catalogEntries('all')).toEqual(books);
    const mystery = catalogEntries('mystery');
    const literary = catalogEntries('literary');
    expect(mystery.length).toBeGreaterThan(0);
    expect(literary.length).toBeGreaterThan(0);
    expect([...mystery, ...literary].map((book) => book.id).sort()).toEqual(
      books.map((book) => book.id).sort(),
    );
  });

  it('offers only actual dialogue choices during a book order', () => {
    const millerOrder = millerVisit.nodes.find((node) => node.id === 'order')?.options ?? [];
    const maraOrder = maraVisit.nodes.find((node) => node.id === 'order')?.options ?? [];
    expect(matchingOrderOptions('miller', 'order', millerOrder).map((option) => option.id)).toEqual(
      ['orchard', 'witnesses'],
    );
    expect(matchingOrderOptions('mara', 'order', maraOrder).map((option) => option.id)).toEqual([
      'station',
      'roads',
      'letters',
    ]);
    expect(matchingOrderOptions('miller', 'hello', millerOrder)).toEqual([]);
    expect(matchingOrderOptions('nora', 'order', maraOrder)).toEqual([]);
  });
});

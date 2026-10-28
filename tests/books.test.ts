import { describe, expect, it } from 'vitest';
import { bookForChoice, books } from '../src/content/books';
import { millerVisit } from '../src/content/first-day';
import { maraVisit } from '../src/content/mara';

describe('book recommendations', () => {
  it('has unique authored Ukrainian catalog entries with meaningful context', () => {
    expect(new Set(books.map((book) => book.id)).size).toBe(books.length);
    for (const book of books) {
      expect(book.blurb.length).toBeGreaterThan(100);
      expect(book.readerFit.length).toBeGreaterThan(35);
      expect(book.possibleImpact.length).toBeGreaterThan(45);
    }
  });
  it('covers all book recommendation options without mismatching visitors', () => {
    for (const [stage, story] of [
      ['miller', millerVisit],
      ['mara', maraVisit],
    ] as const) {
      const order = story.nodes.find((node) => node.id === 'order');
      expect(order).toBeDefined();
      for (const option of order?.options ?? []) {
        expect(bookForChoice(stage, 'order', option.id)?.id).toBe(option.id);
      }
    }
    expect(bookForChoice('miller', 'order', 'station')).toBeUndefined();
    expect(bookForChoice('mara', 'hello', 'station')).toBeUndefined();
  });
});

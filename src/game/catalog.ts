import { books, bookForChoice, type Book } from '../content/books';
import type { ChapterStage } from './chapter';
import type { DialogueOption } from './dialogue';

export type CatalogFilter = 'all' | 'mystery' | 'literary';

export function catalogEntries(filter: CatalogFilter): readonly Book[] {
  if (filter === 'all') return books;
  if (filter === 'mystery') return books.filter((book) => book.genre.includes('детектив'));
  return books.filter((book) => !book.genre.includes('детектив'));
}

/** Only offer a recommendation when the visitor is actually waiting for a book. */
export function matchingOrderOptions(
  stage: ChapterStage,
  nodeId: string,
  options: readonly DialogueOption[],
): readonly DialogueOption[] {
  if (nodeId !== 'order' || (stage !== 'miller' && stage !== 'mara')) return [];
  return options.filter((option) => bookForChoice(stage, nodeId, option.id) !== undefined);
}

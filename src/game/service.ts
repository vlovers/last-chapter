import { books, type Book } from '../content/books';
import type { ChapterState } from './chapter';

export interface OrderReceipt {
  readonly customer: string;
  readonly book: Book;
  readonly note: string;
}

const orderDefinitions = [
  {
    flag: 'sold_orchard',
    customer: 'Пані Міллер',
    id: 'orchard',
    note: 'Тиха загадка з родинними таємницями.',
  },
  {
    flag: 'sold_witnesses',
    customer: 'Пані Міллер',
    id: 'witnesses',
    note: 'Ненадійні свідки й мистецтво сумніватися.',
  },
  {
    flag: 'sold_station',
    customer: 'Мара',
    id: 'station',
    note: 'Подарунок для Лео, який любить потяги.',
  },
  {
    flag: 'sold_roads',
    customer: 'Мара',
    id: 'roads',
    note: 'Можливість прочитати історію разом.',
  },
  {
    flag: 'anna_chose_maps',
    customer: 'Анна',
    id: 'roads',
    note: 'Історія для розмови з учнями про вибір і дороги.',
  },
  {
    flag: 'anna_chose_mystery',
    customer: 'Анна',
    id: 'witnesses',
    note: 'Загадка для обговорення різних версій подій.',
  },
  {
    flag: 'sold_letters',
    customer: 'Мара',
    id: 'letters',
    note: 'Натяк на важливість невисловлених слів.',
  },
] as const;

/** A receipt is derived from existing narrative flags: old saves remain compatible. */
export function completedOrders(state: Pick<ChapterState, 'flags'>): readonly OrderReceipt[] {
  return orderDefinitions.flatMap(({ flag, customer, id, note }) => {
    if (!state.flags.includes(flag)) return [];
    const book = books.find((item) => item.id === id);
    return book ? [{ customer, book, note }] : [];
  });
}

export function currentCustomer(stage: ChapterState['stage']): string | null {
  if (stage === 'miller') return 'Пані Міллер';
  if (stage === 'mara') return 'Мара';
  if (stage === 'anna') return 'Анна';
  return null;
}

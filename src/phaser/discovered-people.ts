import type { ChapterStage } from '../game/chapter';

/** Keep the journal's cast in the order the bookseller first meets them. */
const visitors = [
  ['miller', 'Пані Міллер'],
  ['mara', 'Мара'],
  ['iris', 'Айріс'],
  ['anna', 'Анна'],
  ['leo', 'Лео'],
  ['eleanor', 'Елеонора'],
  ['thomas', 'Томас'],
  ['nora', 'Нора'],
] as const;

/**
 * Each story stage includes everyone met through that point. Checkpoints,
 * optional evenings and the finale must never make earlier people disappear.
 * Record<ChapterStage, number> makes missing new stages a TypeScript error.
 */
const lastVisitor: Record<ChapterStage, number> = {
  miller: 0,
  mara: 1,
  evening: 1,
  complete: 1,
  iris: 2,
  anna: 3,
  leo: 4,
  'day2-complete': 4,
  eleanor: 5,
  thomas: 6,
  nora: 7,
  'book-club': 7,
  'quiet-evening': 7,
  'day3-complete': 7,
  'day4-iris': 7,
  'day4-mara': 7,
  'day4-leo': 7,
  'day4-complete': 7,
  'day5-reading': 7,
  'season-complete': 7,
};

export function discoveredPeopleAtStage(
  stage: ChapterStage,
): readonly (readonly [string, string])[] {
  return visitors.slice(0, lastVisitor[stage] + 1);
}

import { books } from '../content/books';
import { customerOrders, type CustomerOrderDefinition } from '../content/customer-orders';
import type { ChapterStage } from './chapter';
import type { DialogueStory } from './dialogue';
export type { Fit, RequestContext } from '../content/customer-orders';
export function orderDefinition(stage: ChapterStage, node?: string) {
  return (
    customerOrders.find(
      (order) => order.stage === stage && (node === undefined || order.node === node),
    ) ?? null
  );
}
export function requestContext(stage: ChapterStage) {
  return orderDefinition(stage);
}
export function orderBook(stage: ChapterStage, node: string, choice: string) {
  const id = orderDefinition(stage, node)?.choices.find((item) => item.choice === choice)?.book;
  return books.find((book) => book.id === id);
}
export function assessRecommendation(stage: ChapterStage, bookId: string) {
  if (!books.some((book) => book.id === bookId)) return null;
  const order = orderDefinition(stage);
  return order ? (order.reactions[bookId] ?? { fit: 'poor' as const, text: order.decline }) : null;
}
/** Authoring gate: new orders cannot reference nonexistent books, options or receipt flags. */
export function validateOrderDefinition(
  order: CustomerOrderDefinition,
  story: DialogueStory,
): string[] {
  const errors: string[] = [];
  const node = story.nodes.find((node) => node.id === order.node);
  if (!order.id.trim() || !order.question.trim() || !order.answer.trim() || !order.decline.trim())
    errors.push('Missing authored order text');
  if (!node) errors.push('Missing order node: ' + order.node);
  if (!order.choices.length) errors.push('Order has no accepted recommendations');
  const seen = new Set<string>();
  for (const item of order.choices) {
    if (!books.some((book) => book.id === item.book))
      errors.push('Unknown catalog book: ' + item.book);
    if (seen.has(item.book)) errors.push('Duplicate recommendation: ' + item.book);
    seen.add(item.book);
    const option = node?.options.find((option) => option.id === item.choice);
    if (!option) errors.push('Missing authored option: ' + item.choice);
    if (!option?.grants?.includes(item.receipt))
      errors.push('Missing original receipt grant: ' + item.receipt);
    if (!order.reactions[item.book]?.text.trim())
      errors.push('Missing accepted reaction: ' + item.book);
  }
  return errors;
}
export const SERVICE_KEY = 'last-chapter:service:v1';
export interface ServiceMemory {
  version: 1;
  asked: string[];
  attempts: { stage: ChapterStage; book: string }[];
}
export function restoreService(raw: string): ServiceMemory {
  const empty: ServiceMemory = { version: 1, asked: [], attempts: [] };
  try {
    const data = JSON.parse(raw);
    if (
      data?.version !== 1 ||
      !Array.isArray(data.asked) ||
      !Array.isArray(data.attempts) ||
      data.asked.length > customerOrders.length ||
      data.attempts.length > 30
    )
      return empty;
    if (
      !data.asked.every(
        (stage: unknown) =>
          typeof stage === 'string' && customerOrders.some((order) => order.stage === stage),
      )
    )
      return empty;
    if (
      !data.attempts.every(
        (a: ServiceMemory['attempts'][number]) =>
          a &&
          customerOrders.some((order) => order.stage === a.stage) &&
          books.some((b) => b.id === a.book),
      )
    )
      return empty;
    return {
      version: 1,
      asked: [...new Set<string>(data.asked)],
      attempts: data.attempts.map((a: ServiceMemory['attempts'][number]) => ({
        stage: a.stage,
        book: a.book,
      })),
    };
  } catch {
    return empty;
  }
}

import { canStand, distance, findPath } from './world.js';
export const BROWSE_SPOTS = Object.freeze([
  { x: 325, y: 218 },
  { x: 278, y: 221 },
  { x: 438, y: 222 },
  { x: 516, y: 225 },
  { x: 395, y: 220 },
]);
export function browsingRoute(from, actor, step = 0) {
  const seed = ['mara', 'miller', 'iris', 'anna', 'leo', 'eleanor', 'thomas', 'nora'].indexOf(
    actor,
  );
  const index = (Math.max(0, seed) + step * 3) % BROWSE_SPOTS.length;
  for (let offset = 0; offset < BROWSE_SPOTS.length; offset++) {
    const goal = BROWSE_SPOTS[(index + offset) % BROWSE_SPOTS.length];
    if (!canStand(goal) || distance(from, goal) < 20) continue;
    const path = findPath(from, goal);
    if (path.length) return path;
  }
  return [];
}
export function visitorApproach(visitor) {
  for (const offset of [
    { x: -24, y: 0 },
    { x: 24, y: 0 },
    { x: 0, y: 20 },
    { x: 0, y: -20 },
  ]) {
    const goal = { x: visitor.x + offset.x, y: visitor.y + offset.y };
    if (canStand(goal)) return goal;
  }
  return { x: visitor.x, y: visitor.y };
}

export const BROWSE_ACTIONS = Object.freeze([
  { label: 'розглядає книжки на полиці', facing: 'up', prop: 'book' },
  { label: 'переглядає корінці книжок', facing: 'up', prop: 'book' },
  { label: 'дивиться на дощ за вікном', facing: 'up' },
  { label: 'затримується біля читального куточка', facing: 'left' },
  { label: 'шукає цікаву історію', facing: 'left', prop: 'book' },
]);
export function browsingAction(actor, step = 0) {
  const seed = Math.max(
    0,
    ['mara', 'miller', 'iris', 'anna', 'leo', 'eleanor', 'thomas', 'nora'].indexOf(actor),
  );
  return BROWSE_ACTIONS[(seed + step) % BROWSE_ACTIONS.length];
}

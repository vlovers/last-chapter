// Feet coordinates, with a 14×8 collision body. All geometry uses native pixels.
export const BOUNDS = { left: 30, right: 610, top: 166, bottom: 335 };
export const FURNITURE = [
  { id: 'counter', x: 92, y: 253, w: 128, h: 42 },
  { id: 'table', x: 329, y: 254, w: 72, h: 32 },
  { id: 'chair', x: 466, y: 267, w: 36, h: 36 },
  { id: 'cat-tree', x: 422, y: 176, w: 34, h: 24 },
  { id: 'crate', x: 546, y: 289, w: 58, h: 30 },
  { id: 'plant', x: 541, y: 179, w: 30, h: 26 },
  { id: 'box', x: 33, y: 280, w: 44, h: 27 },
  { id: 'books', x: 45, y: 232, w: 28, h: 17 },
  { id: 'window-books', x: 250, y: 184, w: 28, h: 10 },
  { id: 'lamp', x: 514, y: 299, w: 20, h: 6 },
];
export const HOTSPOTS = [
  {
    id: 'chair',
    label: 'Посидіти з книжкою',
    rect: { x: 466, y: 263, w: 36, h: 40 },
    approach: { x: 484, y: 320 },
  },
  {
    id: 'cat-tree',
    label: 'Котяче дерево Френка',
    rect: { x: 418, y: 115, w: 42, h: 85 },
    approach: { x: 411, y: 217 },
  },
  {
    id: 'bowl',
    label: 'Насипати корм Френкові',
    rect: { x: 502, y: 181, w: 22, h: 16 },
    approach: { x: 490, y: 217 },
  },
  {
    id: 'shelves',
    label: 'Книжкові полиці',
    rect: { x: 29, y: 29, w: 195, h: 120 },
    approach: { x: 155, y: 177 },
  },
  {
    id: 'window',
    label: 'Дощове вікно',
    rect: { x: 249, y: 22, w: 144, h: 125 },
    approach: { x: 321, y: 177 },
  },
  {
    id: 'counter',
    label: 'Прилавок',
    rect: { x: 92, y: 235, w: 128, h: 60 },
    approach: { x: 160, y: 222 },
  },
  {
    id: 'table',
    label: 'Читацький столик',
    rect: { x: 329, y: 240, w: 72, h: 46 },
    approach: { x: 365, y: 222 },
  },
];
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function canStand(point, obstacles = FURNITURE) {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
  if (
    point.x < BOUNDS.left ||
    point.x > BOUNDS.right ||
    point.y < BOUNDS.top ||
    point.y > BOUNDS.bottom
  )
    return false;
  return !obstacles.some((rect) =>
    intersects({ x: point.x - 7, y: point.y - 4, w: 14, h: 8 }, rect),
  );
}
export function moveWithCollision(position, dx, dy, obstacles = FURNITURE) {
  // Substeps prevent tunnelling even after a delayed frame; slide along walls.
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 3) || 1;
  const next = { x: position.x, y: position.y };
  for (let i = 0; i < steps; i++) {
    if (canStand({ x: next.x + dx / steps, y: next.y }, obstacles)) next.x += dx / steps;
    if (canStand({ x: next.x, y: next.y + dy / steps }, obstacles)) next.y += dy / steps;
  }
  return next;
}
function clearSegment(a, b) {
  const steps = Math.ceil(distance(a, b) / 2);
  for (let i = 0; i <= steps; i++) {
    const t = steps ? i / steps : 0;
    if (!canStand({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return false;
  }
  return true;
}
export function findPath(start, goal) {
  if (!canStand(start) || !canStand(goal)) return [];
  if (clearSegment(start, goal)) return [goal];
  // A small four-neighbour navigation grid. Segment checks forbid corner cutting.
  const grid = 8;
  const nodes = [];
  for (let y = 170; y <= 330; y += grid)
    for (let x = 34; x <= 610; x += grid) {
      if (canStand({ x, y })) nodes.push({ x, y });
    }
  const nearest = (point) =>
    nodes
      .filter((node) => clearSegment(point, node))
      .sort((a, b) => distance(point, a) - distance(point, b))[0];
  const first = nearest(start),
    last = nearest(goal);
  if (!first || !last) return [];
  const key = (p) => `${p.x},${p.y}`;
  const map = new Map(nodes.map((p) => [key(p), p]));
  const queue = [first],
    costs = new Map([[key(first), 0]]),
    previous = new Map();
  while (queue.length) {
    queue.sort(
      (a, b) => costs.get(key(a)) + distance(a, last) - costs.get(key(b)) - distance(b, last),
    );
    const current = queue.shift();
    if (key(current) === key(last)) {
      const result = [goal];
      let cursor = current;
      while (cursor) {
        result.unshift(cursor);
        cursor = previous.get(key(cursor));
      }
      return result;
    }
    for (const [dx, dy] of [
      [grid, 0],
      [-grid, 0],
      [0, grid],
      [0, -grid],
    ]) {
      const next = map.get(`${current.x + dx},${current.y + dy}`);
      if (!next || !clearSegment(current, next)) continue;
      const cost = costs.get(key(current)) + grid;
      if (cost >= (costs.get(key(next)) ?? Infinity)) continue;
      costs.set(key(next), cost);
      previous.set(key(next), current);
      if (!queue.includes(next)) queue.push(next);
    }
  }
  return [];
}
export function eligible(player, spot, state) {
  return (
    state.mode === 'explore' &&
    (spot.id !== 'mara' || (state.mara === 'ready' && state.visitorVisible !== false)) &&
    distance(player, spot.approach) <= 32
  );
}
export function nearestSpot(player, spots, state) {
  return (
    spots
      .filter((spot) => eligible(player, spot, state))
      .sort((a, b) => distance(player, a.approach) - distance(player, b.approach))[0] ?? null
  );
}

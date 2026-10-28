import { canStand, distance, findPath, moveWithCollision } from './world.js';

// Feet coordinates, shared navigation clearance with visitors; never a player collider.
export const FRANK_PLACES = [
  { x: 485, y: 205, activity: 'sitting' },
  { x: 365, y: 184, activity: 'looking' },
  { x: 271, y: 221, activity: 'grooming' },
  { x: 440, y: 283, activity: 'stretching' },
  { x: 438, y: 315, activity: 'sleeping' },
];
export const FRANK_ACTIONS = [
  { id: 'pet', label: 'Погладити Френка' },
  { id: 'feed', label: 'Насипати корм' },
  { id: 'play', label: 'Погратися стрічкою' },
  { id: 'tree', label: 'Запросити на котяче дерево' },
  { id: 'watch', label: 'Поспостерігати' },
  { id: 'call', label: 'Покликати тихенько' },
  { id: 'leave', label: 'Дати йому спокій' },
];
export const FRANK_SAVE_KEY = 'last-chapter:frank:v1';
export const BOWL = { x: 513, y: 211 };
export const TREE = { x: 438, y: 211 };
export function frankMemory(cat) {
  return JSON.stringify({
    version: 1,
    cooldowns: cat.cooldowns,
    pets: cat.pets,
    meals: cat.meals,
    games: cat.games,
  });
}
export function restoreFrankMemory(raw) {
  const defaults = { cooldowns: {}, pets: 0, meals: 0, games: 0 };
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1) return defaults;
    for (const key of ['pets', 'meals', 'games'])
      if (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > 1000000)
        return defaults;
    if (!value.cooldowns || typeof value.cooldowns !== 'object' || Array.isArray(value.cooldowns))
      return defaults;
    const cooldowns = {};
    for (const key of ['pet', 'feed', 'play', 'call', 'tree']) {
      const remaining = Object.hasOwn(value.cooldowns, key) ? value.cooldowns[key] : 0;
      if (!Number.isFinite(remaining) || remaining < 0 || remaining > 180000) return defaults;
      cooldowns[key] = remaining;
    }
    return { cooldowns, pets: value.pets, meals: value.meals, games: value.games };
  } catch {
    return defaults;
  }
}
export function initialFrank() {
  return {
    x: 485,
    y: 205,
    activity: 'sitting',
    remaining: 4500,
    path: [],
    place: 0,
    facing: -1,
    elapsed: 0,
    held: false,
    cooldowns: {},
    pets: 0,
    meals: 0,
    games: 0,
    elevation: 0,
    afterArrival: null,
  };
}
function goTo(cat, target, activity = 'walking') {
  cat.path = findPath(cat, target);
  cat.activity = cat.path.length ? activity : 'looking';
  cat.remaining = 5000;
}
export function frankApproach(cat) {
  const offsets = [
    [0, 24],
    [-24, 0],
    [24, 0],
    [0, -24],
  ];
  return (
    offsets.map(([x, y]) => ({ x: cat.x + x, y: cat.y + y })).find((point) => canStand(point)) ?? {
      x: cat.x,
      y: cat.y,
    }
  );
}
export function tickFrank(cat, delta, player, { paused = false, reduced = false } = {}) {
  if (paused || cat.held) return cat;
  const dt = Math.max(0, Math.min(delta, 50));
  for (const key of Object.keys(cat.cooldowns))
    cat.cooldowns[key] = Math.max(0, cat.cooldowns[key] - dt);
  cat.elapsed += reduced ? 0 : dt;
  if (cat.activity === 'climbing' || cat.activity === 'descending') {
    cat.elevation = Math.max(
      0,
      Math.min(85, cat.elevation + (cat.activity === 'climbing' ? 1 : -1) * dt * 0.022),
    );
    if (cat.elevation === 85) {
      cat.activity = 'resting';
      cat.remaining = 22000;
    }
    if (cat.elevation === 0) {
      cat.activity = 'sitting';
      cat.remaining = 3000;
    }
    return cat;
  }
  if (cat.activity === 'resting') {
    cat.remaining -= dt;
    if (cat.remaining <= 0) cat.activity = 'descending';
    return cat;
  }
  if (cat.path.length) {
    const target = cat.path[0];
    const gap = distance(cat, target);
    const step = Math.min(gap, dt * 0.026);
    const next =
      gap < 0.01
        ? target
        : moveWithCollision(
            cat,
            ((target.x - cat.x) / gap) * step,
            ((target.y - cat.y) / gap) * step,
          );
    // Pause for feet in the aisle. The player always retains right of way.
    if (distance(next, player) < 19 && distance(next, player) < distance(cat, player)) {
      cat.activity = 'looking';
      return cat;
    }
    cat.facing = next.x === cat.x ? cat.facing : next.x > cat.x ? 1 : -1;
    cat.x = next.x;
    cat.y = next.y;
    cat.activity = 'walking';
    if (distance(cat, target) < 0.1) cat.path.shift();
    if (!cat.path.length) {
      cat.activity = cat.afterArrival ?? FRANK_PLACES[cat.place].activity;
      cat.afterArrival = null;
      cat.remaining = cat.activity === 'sleeping' ? 28000 : 12000 + cat.place * 1800;
    }
    return cat;
  }
  if (cat.activity !== 'sleeping' && distance(cat, player) < 65)
    cat.facing = player.x >= cat.x ? 1 : -1;
  cat.remaining -= dt;
  if (cat.remaining <= 0) {
    if (cat.activity === 'stretching') {
      cat.activity = 'idle';
      cat.remaining = 7000;
    } else {
      cat.place = (cat.place + 1) % FRANK_PLACES.length;
      goTo(cat, FRANK_PLACES[cat.place], cat.place === 0 ? 'returning' : 'walking');
    }
  }
  return cat;
}
export function reactFrank(cat, action, player) {
  if (
    (!['feed', 'tree'].includes(action) && distance(cat, player) > 56) ||
    !FRANK_ACTIONS.some((a) => a.id === action)
  )
    return null;
  if (cat.cooldowns[action] > 0) return 'Френк ще зайнятий. Дайте йому трохи часу.';
  if (cat.elevation > 0 && !['watch', 'leave'].includes(action))
    return 'Френк затишно вмостився нагорі. Нехай відпочине.';
  const sleeping = cat.activity === 'sleeping';
  const busy = cat.activity === 'grooming' || cat.path.length > 0;
  if (action === 'leave') return 'Френк лишається на своєму місці. Ви тихо відходите.';
  if (action === 'watch')
    return sleeping
      ? 'Великі вуха ледь здригаються уві сні. Френк дихає повільно й рівно.'
      : cat.path.length
        ? 'Френк неквапливо йде вздовж проходу. Ви не заважаєте його прогулянці.'
        : busy
          ? 'Френк старанно вмивається, а тоді на мить завмирає з піднятою лапою.'
          : 'Френк повертає голову до вікна. Кінчик хвоста повільно рухається по підлозі.';
  if (action === 'feed' || action === 'tree') {
    const target = action === 'feed' ? BOWL : TREE;
    goTo(cat, target);
    cat.afterArrival = action === 'feed' ? 'eating' : 'climbing';
    if (!cat.path.length) return 'Френк поки не може пройти. Звільніть прохід.';
    cat.cooldowns[action] = action === 'feed' ? 180000 : 45000;
    if (action === 'feed') cat.meals++;
    return action === 'feed'
      ? 'Корм тихенько стукає об мисочку. Френк прямує до неї.'
      : 'Френк оглядає дерево й неквапливо підходить до нижньої платформи.';
  }
  if (action === 'play') {
    cat.path = [];
    cat.activity = 'playing';
    cat.remaining = 6500;
    cat.cooldowns.play = 20000;
    cat.games++;
    return 'Ви ведете стрічкою по підлозі. Френк припадає до землі й ловить її лапою.';
  }
  if (action === 'call') {
    if (sleeping) return 'Одне вухо повертається на ваш голос. Решта Френка вирішує спати далі.';
    if (busy) return 'Френк озирається, але має свої котячі справи.';
    cat.cooldowns.call = 12000;
    const target = frankApproach(player);
    goTo(cat, target, 'approaching');
    return 'Френк підводиться й неквапливо рушає ближче. Ви залишаєте йому місце.';
  }
  cat.cooldowns.pet = 10000;
  cat.pets++;
  cat.path = [];
  cat.activity = sleeping ? 'stretching' : 'reacting';
  cat.remaining = sleeping ? 6000 : 9000;
  return sleeping
    ? 'Френк розплющує очі, довго потягується й торкається носом вашої долоні.'
    : 'Френк підставляє чоло під долоню. Ледь чутне муркотіння губиться в шумі дощу.';
}

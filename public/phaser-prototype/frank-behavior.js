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
  { id: 'watch', label: 'Поспостерігати' },
  { id: 'call', label: 'Покликати тихенько' },
  { id: 'leave', label: 'Дати йому спокій' },
];
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
    [-26, 0],
    [26, 0],
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
  cat.elapsed += reduced ? 0 : dt;
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
      cat.activity = FRANK_PLACES[cat.place].activity;
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
  if (distance(cat, player) > 56 || !FRANK_ACTIONS.some((a) => a.id === action)) return null;
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
  if (action === 'call') {
    if (sleeping) return 'Одне вухо повертається на ваш голос. Решта Френка вирішує спати далі.';
    if (busy) return 'Френк озирається, але має свої котячі справи.';
    const target = frankApproach(player);
    goTo(cat, target, 'approaching');
    return 'Френк підводиться й неквапливо рушає ближче. Ви залишаєте йому місце.';
  }
  cat.path = [];
  cat.activity = sleeping ? 'stretching' : 'reacting';
  cat.remaining = sleeping ? 6000 : 9000;
  return sleeping
    ? 'Френк розплющує очі, довго потягується й торкається носом вашої долоні.'
    : 'Френк підставляє чоло під долоню. Ледь чутне муркотіння губиться в шумі дощу.';
}

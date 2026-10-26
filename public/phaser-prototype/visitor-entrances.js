import { canStand } from './world.js';

// Each visitor has a recognizable pace and place to pause, but all destinations
// stay within the existing navigation geometry and the shared dialogue hotspot.
export const VISITOR_ENTRANCES = Object.freeze({
  miller: { x: 449, y: 221, pace: 0.58 },
  mara: { x: 440, y: 220, pace: 0.7 },
  iris: { x: 455, y: 219, pace: 0.95 },
  anna: { x: 464, y: 220, pace: 0.72 },
  leo: { x: 451, y: 226, pace: 1.05 },
  eleanor: { x: 445, y: 217, pace: 0.55 },
  thomas: { x: 458, y: 223, pace: 0.82 },
  nora: { x: 444, y: 225, pace: 0.88 },
});

export function visitorEntrance(actor) {
  const entry = VISITOR_ENTRANCES[actor] ?? VISITOR_ENTRANCES.mara;
  if (!canStand(entry)) throw new Error('Visitor entrance is blocked: ' + actor);
  return entry;
}

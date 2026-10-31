import {
  initialFrank,
  tickFrank,
  reactFrank,
  FRANK_SAVE_KEY,
  frankMemory,
  restoreFrankMemory,
} from './frank-behavior.js';

// Original native-resolution pixel art, drawn at the same density as the room.
// Devon Rex silhouette: slender body, wedge-shaped face, oversized ears, wavy coat.
export function drawFrank(r, activity, phase, facing) {
  const ink = 0x43454e,
    coat = 0x898a96,
    light = 0xb3afb9,
    pink = 0xc8959f;
  // Author compact native cat geometry; the renderer still paints only whole pixels.
  const rect = (x, y, w, h, c) =>
    r(
      Math.round((facing < 0 ? -x - w : x) * 0.7),
      Math.round(y * 0.7),
      Math.max(1, Math.round(w * 0.7)),
      Math.max(1, Math.round(h * 0.7)),
      c,
    );
  const sleeping = activity === 'sleeping' || activity === 'resting';
  const stretch = activity === 'stretching';
  const walk = ['walking', 'approaching', 'returning', 'climbing', 'descending'].includes(activity);
  const breath = phase === 1 && !walk ? 1 : 0;
  // Tail has a stepped curve and its own quiet swish.
  rect(-17, -7, 8, 3, ink);
  rect(-19, -12 - (phase % 2), 3, 7, coat);
  rect(-18, -14 - (phase % 2), 4, 3, light);
  if (sleeping) {
    rect(-11, -9 - breath, 23, 8 + breath, ink);
    rect(-10, -10 - breath, 20, 7 + breath, coat);
    rect(-7, -11 - breath, 13, 2, light);
    rect(6, -10, 10, 8, coat);
    rect(8, -15, 4, 7, coat);
    rect(13, -14, 3, 6, coat);
    rect(9, -14, 1, 4, pink);
    rect(14, -13, 1, 3, pink);
    rect(10, -7, 3, 1, ink);
    rect(-4, -3, 14, 2, light);
    return;
  }
  const bodyY = stretch ? -8 : -10 - breath;
  rect(-11, bodyY, 20, 10, ink);
  rect(-10, bodyY - 1, 18, 9, coat);
  rect(-7, bodyY - 2, 11, 2, light);
  // Three uneven highlights suggest the short curly coat without noise.
  rect(-8, bodyY + 3, 3, 1, light);
  rect(-3, bodyY + 5, 3, 1, light);
  rect(2, bodyY + 2, 3, 1, light);
  for (const [x, offset] of [
    [-8, 0],
    [4, 1],
  ]) {
    const lift = walk && phase % 2 === offset ? 2 : 0;
    rect(x, -7, 3, 7 - lift, coat);
    rect(x, -2 - lift, stretch ? 6 : 4, 2, light);
  }
  const hy = stretch ? -10 : -17 - breath;
  rect(3, hy, 12, 11, ink);
  rect(4, hy, 11, 9, coat);
  rect(6, hy + 8, 7, 3, coat);
  rect(8, hy + 9, 4, 2, light);
  const twitch = phase === 3 ? 1 : 0;
  rect(3, hy - 5 + twitch, 5, 6, coat);
  rect(3, hy - 7 + twitch, 2, 3, light);
  rect(11, hy - 6, 5, 7, coat);
  rect(13, hy - 8, 2, 3, light);
  rect(4, hy - 4 + twitch, 2, 4, pink);
  rect(12, hy - 5, 2, 5, pink);
  rect(5, hy + 4, 3, 2, phase === 3 ? ink : 0xdfc17c);
  rect(12, hy + 4, 3, 2, phase === 3 ? ink : 0xdfc17c);
  rect(9, hy + 7, 2, 1, pink);
  if (activity === 'eating') {
    rect(12, -7, 6, 4, coat);
    rect(13, -4, 4, 2, pink);
  }
  if (activity === 'playing') {
    rect(12, -6, 7 + phase, 3, light);
    rect(18 + phase, -3, 9, 1, 0xb17c67);
  }
  if (activity === 'grooming') {
    rect(11, -13 - (phase % 2), 3, 7, light);
    rect(9, -17, 3, 2, pink);
  }
  if (activity === 'sitting' || activity === 'reacting' || activity === 'looking') {
    rect(-7, -10, 10, 8, coat);
    rect(-5, -3, 12, 3, light);
  }
}
export function createFrank(scene) {
  const state = initialFrank();
  try {
    Object.assign(state, restoreFrankMemory(localStorage.getItem(FRANK_SAVE_KEY)));
  } catch {
    /* optional storage */
  }
  let disposed = false;
  const persist = () => {
    try {
      localStorage.setItem(FRANK_SAVE_KEY, frankMemory(state));
    } catch {
      /* optional */
    }
  };
  const reset = () => {
    Object.assign(state, initialFrank());
    persist();
  };
  const saveOnHide = () => {
    if (document.hidden) persist();
  };
  window.addEventListener('last-chapter:new-game', reset);
  document.addEventListener('visibilitychange', saveOnHide);
  const shadow = scene.add.ellipse(state.x, state.y - 1, 28, 7, 0x25232d, 0.25);
  const sprite = scene.add.graphics();
  let lastFrame = '';
  const render = (reduced) => {
    const phase = reduced ? 0 : Math.floor(state.elapsed / (state.path.length ? 160 : 850)) % 4;
    const frame = `${state.activity}:${phase}:${state.facing}`;
    sprite
      .setPosition(Math.round(state.x), Math.round(state.y - state.elevation))
      .setDepth(state.elevation ? 202 : state.y);
    shadow.setPosition(Math.round(state.x), Math.round(state.y - 1)).setDepth(state.y - 0.5);
    if (lastFrame === frame) return;
    lastFrame = frame;
    sprite.clear();
    drawFrank(
      (x, y, w, h, color) => {
        sprite.fillStyle(color);
        sprite.fillRect(x, y, w, h);
      },
      state.activity,
      phase,
      state.facing,
    );
  };
  render(false);
  return {
    state,
    sprite,
    update(delta, player, options) {
      if (disposed) return;
      tickFrank(state, delta, player, options);
      render(options.reduced);
    },
    react(action, player) {
      const result = reactFrank(state, action, player);
      persist();
      return result;
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      persist();
      window.removeEventListener('last-chapter:new-game', reset);
      document.removeEventListener('visibilitychange', saveOnHide);
      sprite.destroy();
      shadow.destroy();
    },
  };
}

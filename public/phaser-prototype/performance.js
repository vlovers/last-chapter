// A sustained frame-time budget, not a device-name heuristic. Decoration only.
export function createFrameBudget(initialLow = false) {
  let elapsed = 0,
    frames = 0,
    lowWindows = 0;
  let reduced = initialLow;
  return {
    get reduced() {
      return reduced;
    },
    sample(delta) {
      if (!Number.isFinite(delta) || delta <= 0 || delta > 250) return reduced;
      elapsed += delta;
      frames++;
      if (elapsed >= 2000) {
        lowWindows = (frames / elapsed) * 1000 < 42 ? lowWindows + 1 : Math.max(0, lowWindows - 1);
        if (lowWindows >= 2) reduced = true;
        elapsed = 0;
        frames = 0;
      }
      return reduced;
    },
  };
}

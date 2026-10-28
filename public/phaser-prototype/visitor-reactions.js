// Gentle reactions without extra sprite sheets. All movement is cosmetic.
export function facingToward(from, to, fallback = 'down') {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.hypot(dx, dy) < 2) return fallback;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
}
export function visitorReaction(visitor, player, speaking, elapsed, reduced) {
  const near = Math.hypot(visitor.x - player.x, visitor.y - player.y) < 52;
  return {
    facing: speaking || near ? facingToward(visitor, player, visitor.direction) : null,
    lift: speaking && !reduced ? Math.round(Math.sin(elapsed / 190) * 1) : 0,
    glow: speaking && !reduced ? 0xffedd2 : 0xffffff,
  };
}

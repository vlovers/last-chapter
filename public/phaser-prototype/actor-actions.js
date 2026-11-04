// Shared physical cues. Missing choreography falls back to the existing idle/walk sheets.
export function cueActor(actor, kind, now, duration = 1800) {
  actor.cue = { kind, start: now, until: now + duration };
}
export function createActorActions(scene) {
  const hands = scene.add.graphics().setDepth(901);
  let disposed = false;
  return {
    update(actors, time, reduced, speaking = null) {
      if (disposed) return;
      hands.clear();
      for (const actor of actors) {
        if (!actor.sprite.visible) continue;
        if (actor.cue && time >= actor.cue.until) actor.cue = null;
        const kind = actor.cue?.kind ?? (actor === speaking ? 'talk' : null);
        actor.sprite.setCrop();
        actor.shadow.setVisible(true);
        if (!kind) continue;
        const x = Math.round(actor.x),
          y = Math.round(actor.y);
        const side = actor.direction === 'left' ? -1 : 1;
        const lift = reduced ? 0 : Math.floor((time / 250) % 2);
        const rect = (px, py, w, h, color) => hands.fillStyle(color).fillRect(px, py, w, h);
        if (kind === 'sit') {
          actor.sprite.setPosition(x, y - 18).setCrop(0, 0, 32, 36);
          actor.shadow.setVisible(false);
          rect(x - 7, y - 24, 14, 5, 0x474c4b);
          rect(x - 8, y - 38, 16, 7, 0xe9d5af);
          rect(x, y - 38, 1, 7, 0x9d8564);
        } else if (kind === 'give' || kind === 'receive') {
          rect(x + side * 9 - 2, y - 23, 6, 4, 0xe8b88a);
          rect(x + side * 12 - 5, y - 26, 12, 7, 0x657d72);
          rect(x + side * 12 - 3, y - 25, 8, 4, 0xe9d5af);
        } else {
          rect(x + side * 9 - 2, y - 22 - lift, 5, 4, 0xe8b88a);
          if (kind === 'greet' && !reduced) rect(x + side * 10 - 2, y - 29 - lift, 4, 6, 0xe8b88a);
        }
      }
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      hands.destroy();
    },
  };
}

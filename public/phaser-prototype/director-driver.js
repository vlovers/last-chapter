import { findPath, distance } from './world.js';
import { updateCharacter } from './characters.js';
import { cueActor } from './actor-actions.js';

export function sceneDirectorDriver(scene) {
  const actor = (id) => (id === 'player' ? scene.characters.player : scene.characters.mara);
  return {
    begin(command) {
      if (command.kind === 'wait') return { duration: Math.min(3000, command.duration) };
      if (command.kind === 'camera') {
        scene.cameraLook = { x: command.x };
        return {
          duration: 650,
          finish() {
            scene.cameraLook = { x: command.x };
          },
        };
      }
      if (command.kind === 'cat') {
        if (!scene.frank) return null;
        return scene.frank.stage(command);
      }
      const target = actor(command.actor);
      if (!target?.sprite?.active || !target.sprite.visible) return null;
      if (command.kind === 'face') {
        const finish = () => {
          target.direction = command.direction;
          updateCharacter(target, target, scene.reduced);
        };
        finish();
        return { finish };
      }
      if (command.kind === 'gesture') {
        cueActor(target, command.action, scene.time.now, command.duration ?? 650);
        return {
          duration: command.duration ?? 650,
          finish() {
            target.cue = null;
          },
        };
      }
      if (command.kind !== 'move' && command.kind !== 'exit') return null;
      scene.orderApproach = false;
      scene.roaming.path = [];
      scene.arrival = [];
      scene.state = { ...scene.state, mara: 'ready' };
      const destination = command.kind === 'exit' ? { x: 590, y: 221 } : command;
      const path = findPath(target, destination);
      if (!path.length && distance(target, destination) > 2) return null;
      const points = [{ x: target.x, y: target.y }, ...path];
      const lengths = points.slice(1).map((point, i) => distance(points[i], point));
      const total = lengths.reduce((a, b) => a + b, 0);
      const finish = () => {
        updateCharacter(target, points.at(-1), scene.reduced);
        if (command.kind === 'exit') {
          target.sprite.setVisible(false);
          target.shadow.setVisible(false);
          target.stagedExit = true;
        }
      };
      return {
        duration: Math.max(80, (total / 110) * 1000),
        update(progress) {
          let along = total * progress;
          for (let i = 0; i < lengths.length; i++) {
            if (along > lengths[i]) {
              along -= lengths[i];
              continue;
            }
            const ratio = along / (lengths[i] || 1);
            updateCharacter(
              target,
              {
                x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
                y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
              },
              scene.reduced,
            );
            break;
          }
        },
        finish,
      };
    },
    release() {
      scene.cameraLook = null;
    },
  };
}

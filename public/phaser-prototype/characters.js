import { DIRECTIONS } from './config.js';
import { createCharacterSheets } from './assets.js';
export function createCharacters(scene) {
  createCharacterSheets(scene);
  for (const name of ['player', 'mara'])
    for (const direction of DIRECTIONS) {
      const offset = DIRECTIONS.indexOf(direction) * 6;
      for (const [kind, start, end, rate] of [
        ['idle', 0, 1, 1.2],
        ['walk', 2, 5, 8],
      ]) {
        const key = `${name}-${direction}-${kind}`;
        if (!scene.anims.exists(key))
          scene.anims.create({
            key,
            frames: scene.anims.generateFrameNumbers(name, {
              start: offset + start,
              end: offset + end,
            }),
            frameRate: rate,
            repeat: -1,
          });
      }
    }
  const create = (name, x, y) => ({
    name,
    x,
    y,
    direction: 'down',
    shadow: scene.add.ellipse(x, y - 1, 23, 7, 0x201b27, 0.32).setDepth(y - 1),
    sprite: scene.add
      .sprite(x, y + 1, name, 0)
      .setOrigin(0.5, 1)
      .setDepth(y),
  });
  return { player: create('player', 171, 204), mara: create('mara', 590, 221) };
}
export function updateCharacter(character, position, reduced, reacting = false) {
  const dx = position.x - character.x,
    dy = position.y - character.y;
  const walking = Math.hypot(dx, dy) > 0.01;
  if (walking)
    character.direction =
      Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  Object.assign(character, position);
  character.sprite
    .setPosition(Math.round(character.x), Math.round(character.y + 1))
    .setDepth(character.y);
  character.shadow.setPosition(character.x, character.y - 1).setDepth(character.y - 0.5);
  character.sprite.setTint(reacting ? 0xffe2b2 : 0xffffff);
  if (reduced) {
    character.sprite.anims.stop();
    character.sprite.setFrame(DIRECTIONS.indexOf(character.direction) * 6);
  } else
    character.sprite.play(
      `${character.name}-${character.direction}-${walking ? 'walk' : 'idle'}`,
      true,
    );
}

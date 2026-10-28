import { updateCharacter } from './characters.js';

const guests = [
  { name: 'mara', speaker: 'Мара', x: 236, y: 238, direction: 'right' },
  { name: 'anna', speaker: 'Анна', x: 326, y: 230, direction: 'right' },
  { name: 'miller', speaker: 'Пані Міллер', x: 286, y: 218, direction: 'down' },
  { name: 'leo', speaker: 'Лео', x: 414, y: 236, direction: 'left' },
  { name: 'iris', speaker: 'Айріс', x: 280, y: 276, direction: 'right' },
  { name: 'eleanor', speaker: 'Елеонора', x: 442, y: 294, direction: 'left' },
  { name: 'thomas', speaker: 'Томас', x: 340, y: 316, direction: 'up' },
  { name: 'nora', speaker: 'Нора', x: 397, y: 316, direction: 'up' },
];

/** Cosmetic staging reuses the original cast sheets and never changes story or collisions. */
export function gatheringGuests(stage) {
  return (stage === 'book-club' ? guests.slice(0, 4) : stage === 'day5-reading' ? guests : []).map(
    (guest) => ({ ...guest }),
  );
}

export function createGathering(scene) {
  let stage = null;
  let actors = [];
  const clear = () => {
    for (const actor of actors) {
      actor.sprite.destroy();
      actor.shadow.destroy();
    }
    actors = [];
  };
  return {
    get actors() {
      return actors;
    },
    sync(nextStage) {
      if (stage === nextStage) return;
      clear();
      stage = nextStage;
      actors = gatheringGuests(stage).map((guest) => ({
        ...guest,
        shadow: scene.add.ellipse(guest.x, guest.y - 1, 23, 7, 0x201b27, 0.28),
        sprite: scene.add.sprite(guest.x, guest.y + 1, guest.name, 0).setOrigin(0.5, 1),
      }));
    },
    update(reduced, speaker) {
      for (const actor of actors) updateCharacter(actor, actor, reduced, actor.speaker === speaker);
    },
    destroy() {
      clear();
      stage = null;
    },
  };
}

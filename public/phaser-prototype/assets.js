import { DIRECTIONS } from './config.js';

export const ASSET_MANIFEST = [
  {
    id: 'player',
    kind: 'generated-sheet',
    frameWidth: 32,
    frameHeight: 48,
    frames: 24,
    source: 'original-project-art',
    license: 'project-original',
  },
  {
    id: 'mara',
    kind: 'generated-sheet',
    frameWidth: 32,
    frameHeight: 48,
    frames: 24,
    source: 'original-project-art',
    license: 'project-original',
  },
  {
    id: 'mara-portrait',
    kind: 'image',
    path: '/art/portraits/mara.svg',
    source: 'original-project-art',
    license: 'project-original',
    optional: true,
  },
  {
    id: 'soundscape',
    kind: 'synthesized-audio',
    source: 'original-project-audio',
    license: 'project-original',
  },
];
export function validateManifest(manifest) {
  if (!Array.isArray(manifest) || !manifest.length)
    throw new Error('Asset manifest must be a nonempty array');
  const ids = new Set();
  for (const entry of manifest) {
    if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id))
      throw new Error('Asset id missing or duplicated');
    ids.add(entry.id);
    if (
      !['generated-sheet', 'image', 'synthesized-audio'].includes(entry.kind) ||
      entry.license !== 'project-original' ||
      !entry.source?.startsWith('original-project-')
    )
      throw new Error('Unreviewed asset provenance or kind');
    if (
      entry.kind === 'image' &&
      (typeof entry.path !== 'string' || !/^\/art\/[a-z0-9/-]+\.svg$/.test(entry.path))
    )
      throw new Error('Invalid local image path');
    if (
      entry.kind === 'generated-sheet' &&
      (entry.frames !== 24 || entry.frameWidth !== 32 || entry.frameHeight !== 48)
    )
      throw new Error('Invalid sprite geometry');
  }
  return true;
}
export function assetFallback(id) {
  return id === 'mara-portrait'
    ? { label: 'Мара', initials: 'М', color: '#8b5261' }
    : { label: 'Книгарня', initials: 'К', color: '#4b7976' };
}
function drawPerson(context, ox, direction, frame, mara) {
  const r = (x, y, w, h, color) => {
    context.fillStyle = color;
    context.fillRect(ox + x, y, w, h);
  };
  const skin = mara ? '#edba91' : '#dba17b';
  const hair = mara ? '#6b3c38' : '#392b36';
  const coat = mara ? '#bd805a' : '#527e7b';
  const light = mara ? '#e4b477' : '#80aaa0';
  const walk = frame >= 2;
  const stride = walk ? [0, 2, 0, -2][frame - 2] : 0;
  const bob = walk && frame % 2 ? -1 : frame === 1 ? 1 : 0;
  // Boot soles remain anchored at y=46; silhouette and clothes are consistent in every direction.
  r(9, 43 + stride, 6, 3, '#282632');
  r(18, 43 - stride, 6, 3, '#282632');
  r(10, 34, 5, 10 + stride, '#454251');
  r(18, 34, 5, 10 - stride, '#454251');
  r(7, 21 + bob, 19, 15, '#302837');
  r(8, 20 + bob, 17, 15, coat);
  r(9, 22 + bob, 3, 10, light);
  r(22, 22 + bob, 2, 12, mara ? '#9b604c' : '#39615f');
  r(5, 23 + bob + stride / 2, 4, 11, coat);
  r(25, 23 + bob - stride / 2, 3, 11, coat);
  r(5, 33 + bob + stride / 2, 4, 3, skin);
  r(25, 33 + bob - stride / 2, 3, 3, skin);
  r(13, 17 + bob, 8, 7, skin);
  r(8, 4 + bob, 18, 17, hair);
  r(7, 9 + bob, 20, 9, hair);
  if (direction !== 'up') {
    const side = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
    r(10 + side, 10 + bob, 13, 10, skin);
    r(11 + side, 18 + bob, 11, 3, skin);
    r(10 + side, 8 + bob, 14, 4, hair);
    if (direction !== 'right') r(12 + side, 14 + bob, 2, 2, '#302837');
    if (direction !== 'left') r(20 + side, 14 + bob, 2, 2, '#302837');
    r(16 + side, 19 + bob, 3, 1, '#a2635c');
  } else {
    r(10, 6 + bob, 12, 12, mara ? '#884c40' : '#49333e');
  }
  if (mara) {
    r(direction === 'left' ? 21 : 8, 13 + bob, 4, 13, hair);
    r(11, 26 + bob, 12, 9, '#ead6b5');
    r(13, 26 + bob, 8, 2, '#f2e3c9');
    r(21, 25 + bob, 2, 2, '#f2e3c9'); // flour on her sleeve
    r(22, 9 + bob, 4, 3, '#d4a15e');
  } else {
    r(12, 23 + bob, 10, 3, '#d4a15e');
    r(20, 26 + bob, 3, 7, '#bf8c58');
    r(14, 30 + bob, 2, 1, '#e6c19a');
  }
}
export function createCharacterSheets(scene) {
  validateManifest(ASSET_MANIFEST);
  for (const name of ['player', 'mara']) {
    if (scene.textures.exists(name)) continue;
    const texture = scene.textures.createCanvas(name, 32 * 24, 48);
    if (!texture) throw new Error(`Cannot create ${name} texture`);
    const context = texture.getContext();
    context.imageSmoothingEnabled = false;
    DIRECTIONS.forEach((direction, row) => {
      for (let frame = 0; frame < 6; frame++) {
        const index = row * 6 + frame;
        drawPerson(context, index * 32, direction, frame, name === 'mara');
        texture.add(index, 0, index * 32, 0, 32, 48);
      }
    });
    texture.refresh();
  }
}

import { DIRECTIONS } from './config.js';
import { drawPerson } from './character-art.js';

export const ASSET_MANIFEST = [
  {
    id: 'player',
    kind: 'generated-sheet',
    frameWidth: 32,
    frameHeight: 48,
    frames: 24,
    revision: 4,
    source: 'original-project-art',
    license: 'project-original',
  },
  {
    id: 'mara',
    kind: 'generated-sheet',
    frameWidth: 32,
    frameHeight: 48,
    frames: 24,
    revision: 4,
    source: 'original-project-art',
    license: 'project-original',
  },
  {
    id: 'mara-portrait',
    kind: 'image',
    path: '/art/bookshop/mara.svg',
    width: 64,
    height: 80,
    source: 'original-project-art',
    license: 'project-original',
    optional: true,
  },
  ...['thoughtful', 'firm'].map((mood) => ({
    id: `mara-${mood}`,
    kind: 'image',
    path: `/art/bookshop/mara-${mood}.svg`,
    width: 64,
    height: 80,
    source: 'original-project-art',
    license: 'project-original',
    optional: true,
  })),
  {
    id: 'soundscape',
    kind: 'synthesized-audio',
    source: 'original-project-audio',
    license: 'project-original',
  },
  {
    id: 'bookshop-room',
    kind: 'generated-environment',
    width: 640,
    height: 360,
    revision: 4,
    source: 'original-project-art',
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
      !['generated-sheet', 'image', 'synthesized-audio', 'generated-environment'].includes(
        entry.kind,
      ) ||
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
    if (entry.kind === 'generated-environment' && (entry.width !== 640 || entry.height !== 360))
      throw new Error('Invalid room geometry');
  }
  return true;
}
export function assetFallback(id) {
  return id === 'mara-portrait'
    ? { label: 'Мара', initials: 'М', color: '#8b5261' }
    : { label: 'Книгарня', initials: 'К', color: '#4b7976' };
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

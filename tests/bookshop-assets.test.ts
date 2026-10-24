import { describe, expect, it } from 'vitest';
import manifest from '../public/assets/bookshop/manifest.json';
import visitorSprite from '../public/assets/bookshop/visitors.svg?raw';

describe('Bookshop Phaser asset manifest', () => {
  it('declares the original visitor sprite sheet as a local asset', () => {
    expect(manifest.version).toBe(1);
    expect(manifest.assets).toHaveLength(1);
    const asset = manifest.assets[0];
    if (!asset) throw new Error('Bookshop asset manifest is empty');
    expect(asset.id).toBe('bookshop-visitors');
    expect(asset.path).toBe('/assets/bookshop/visitors.svg');
    expect(asset.source).toBe('original-project-art');
    expect(asset.license).toBe('project-original');
    expect(visitorSprite).toContain('<svg');
  });

  it('keeps frame geometry consistent with the SVG dimensions', () => {
    const asset = manifest.assets[0];
    if (!asset) throw new Error('Bookshop asset manifest is empty');
    expect(asset.width).toBe(asset.frameWidth * asset.columns);
    expect(asset.height).toBe(asset.frameHeight * asset.rows);
    expect(asset.frames.reader).toEqual({ start: 0, end: 3 });
    expect(asset.frames.mara).toEqual({ start: 4, end: 7 });
    expect(asset.frames.mara.end).toBeLessThan(asset.columns * asset.rows);
  });
});

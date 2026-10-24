import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const manifestPath = resolve('public/assets/bookshop/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
  version: number;
  assets: Array<{
    id: string;
    path: string;
    source: string;
    license: string;
    width: number;
    height: number;
    frameWidth: number;
    frameHeight: number;
    columns: number;
    rows: number;
    frames: Record<string, { start: number; end: number }>;
  }>;
};

describe('Bookshop Phaser asset manifest', () => {
  it('declares the original visitor sprite sheet as a local asset', () => {
    expect(manifest.version).toBe(1);
    expect(manifest.assets).toHaveLength(1);
    const asset = manifest.assets[0];
    expect(asset.id).toBe('bookshop-visitors');
    expect(asset.path).toBe('/assets/bookshop/visitors.svg');
    expect(asset.source).toBe('original-project-art');
    expect(asset.license).toBe('project-original');
    expect(readFileSync(resolve('public', asset.path.slice(1)), 'utf8')).toContain('<svg');
  });

  it('keeps frame geometry consistent with the SVG dimensions', () => {
    const asset = manifest.assets[0];
    expect(asset.width).toBe(asset.frameWidth * asset.columns);
    expect(asset.height).toBe(asset.frameHeight * asset.rows);
    expect(asset.frames.reader).toEqual({ start: 0, end: 3 });
    expect(asset.frames.mara).toEqual({ start: 4, end: 7 });
    expect(asset.frames.mara.end).toBeLessThan(asset.columns * asset.rows);
  });
});

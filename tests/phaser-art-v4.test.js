import { describe, expect, it } from 'vitest';
import { drawEnvironment } from '../public/phaser-prototype/environment.js';
import { ASSET_MANIFEST, validateManifest } from '../public/phaser-prototype/assets.js';
import { createAtmosphere } from '../public/phaser-prototype/atmosphere.js';
import warm from '../public/art/bookshop/mara.svg?raw';
import thoughtful from '../public/art/bookshop/mara-thoughtful.svg?raw';
import firm from '../public/art/bookshop/mara-firm.svg?raw';

describe('V4 authored art boundaries and provenance', () => {
  it('keeps every room paint rectangle on the native pixel grid and inside the canvas', () => {
    const rectangles = [];
    const graphics = (position = {}) => ({
      x: position.x ?? 0,
      y: position.y ?? 0,
      setDepth() {
        return this;
      },
      setVisible() {
        return this;
      },
      setAlpha() {
        return this;
      },
      fillStyle() {
        return this;
      },
      lineStyle() {
        return this;
      },
      lineBetween() {
        return this;
      },
      fillEllipse() {
        return this;
      },
      fillRect(x, y, w, h) {
        rectangles.push([x + this.x, y + this.y, w, h]);
        return this;
      },
    });
    drawEnvironment({ cameras: { main: { setBackgroundColor() {} } }, add: { graphics } });
    expect(rectangles.length).toBeGreaterThan(1000);
    for (const [x, y, w, h] of rectangles) {
      expect([x, y, w, h].every(Number.isInteger)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(640);
      expect(y + h).toBeLessThanOrEqual(360);
    }
  });

  it('records the original room and three distinct local expression sources', () => {
    expect(validateManifest(ASSET_MANIFEST)).toBe(true);
    expect(ASSET_MANIFEST.find((entry) => entry.id === 'bookshop-room')).toMatchObject({
      kind: 'generated-environment',
      width: 640,
      height: 360,
      revision: 4,
      license: 'project-original',
    });
    expect(
      ASSET_MANIFEST.filter((entry) => entry.kind === 'image').map((entry) => entry.path),
    ).toEqual([
      '/art/bookshop/mara.svg',
      '/art/bookshop/mara-thoughtful.svg',
      '/art/bookshop/mara-firm.svg',
    ]);
    expect(new Set([warm, thoughtful, firm]).size).toBe(3);
    for (const source of [warm, thoughtful, firm]) {
      expect(source).toContain('viewBox="0 0 64 80"');
      expect(source).toContain('shape-rendering="crispEdges"');
      expect(source).not.toMatch(/<script|<image|<filter|href=/);
    }
    expect(() =>
      validateManifest([
        { ...ASSET_MANIFEST.find((entry) => entry.id === 'bookshop-room'), width: 1024 },
      ]),
    ).toThrow('Invalid room geometry');
  });

  it('freezes weather and lighting in reduced motion and confines rain to glass', () => {
    const lines = [];
    const rain = {
      setDepth() {
        return this;
      },
      clear() {
        lines.length = 0;
        return this;
      },
      lineStyle() {
        return this;
      },
      lineBetween(...args) {
        lines.push(args);
        return this;
      },
    };
    const values = [];
    const light = {
      setAlpha(value) {
        values.push(value);
        return this;
      },
      setY(value) {
        values.push(value);
        return this;
      },
    };
    let reduced = false;
    const atmosphere = createAtmosphere(
      { add: { graphics: () => rain } },
      { halo: light, readingGlow: light, steam: light },
      () => reduced,
    );
    atmosphere.update(2000, 16);
    for (const [x1, y1, x2, y2] of lines) {
      expect(Math.min(x1, x2)).toBeGreaterThanOrEqual(255);
      expect(Math.max(x1, x2)).toBeLessThanOrEqual(387);
      expect(y1).toBeGreaterThanOrEqual(28);
      expect(y2).toBeLessThanOrEqual(133);
      expect(x1 < 316 || x1 > 325).toBe(true);
      expect(y2 < 74 || y1 > 80).toBe(true);
    }
    reduced = true;
    atmosphere.reset();
    const before = JSON.stringify({ lines, values });
    atmosphere.update(9000, 1000);
    expect(JSON.stringify({ lines, values })).toBe(before);
  });
});

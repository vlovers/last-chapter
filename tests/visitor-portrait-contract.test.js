import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cast } from '../src/game/cast';
import { VISITOR_IDS } from '../public/phaser-prototype/visitor-art.js';
import { PORTRAIT_NAMES, portraitDataUrl } from '../public/phaser-prototype/visitor-portraits.js';

afterEach(() => vi.unstubAllGlobals());

describe('finale portrait renderer contract', () => {
  it('uses the same Ukrainian names as the cast and sprite registry', () => {
    expect(Object.keys(PORTRAIT_NAMES).sort()).toEqual([...VISITOR_IDS].sort());
    expect(cast.map((member) => member.id).sort()).toEqual([...VISITOR_IDS].sort());
    for (const member of cast) {
      expect(PORTRAIT_NAMES[member.id]).toBe(member.name);
    }
  });

  it('ships a local 64×80 SVG portrait for every character', () => {
    for (const member of cast) {
      const asset = new URL(`../public${member.portrait}`, import.meta.url);
      const svg = readFileSync(asset, 'utf8');
      expect(svg).toContain('<svg ');
      expect(svg).toContain('viewBox="0 0 64 80"');
      expect(svg).not.toMatch(/<(?:image|script)\b/i);
    }
  });

  it('renders every cast portrait without external assets', () => {
    const draw = vi.fn();
    const canvases = [];
    vi.stubGlobal('document', {
      createElement: vi.fn((tag) => {
        expect(tag).toBe('canvas');
        const canvas = {
          width: 0,
          height: 0,
          getContext: () => ({
            fillRect: draw,
            set fillStyle(_value) {},
          }),
          toDataURL: (type) => `data:${type};base64,AAAA`,
        };
        canvases.push(canvas);
        return canvas;
      }),
    });

    for (const member of cast) {
      expect(portraitDataUrl(member.id, 'quiet')).toBe('data:image/png;base64,AAAA');
    }
    expect(canvases).toHaveLength(cast.length);
    for (const canvas of canvases) {
      expect(canvas.width).toBe(64);
      expect(canvas.height).toBe(80);
    }
    expect(draw.mock.calls.length).toBeGreaterThan(cast.length * 10);
    expect(portraitDataUrl('unknown-character')).toBeNull();
  });

  it('returns a fallback signal when a canvas context is unavailable', () => {
    vi.stubGlobal('document', {
      createElement: () => ({ getContext: () => null }),
    });
    expect(portraitDataUrl('iris')).toBeNull();
  });
});

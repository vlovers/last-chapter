import { describe, expect, it, vi } from 'vitest';
import { createVisitorBook } from '../public/phaser-prototype/visitor-book.js';

function fakeScene() {
  const calls = [];
  const graphics = {
    clear() { calls.push(['clear']); return this; },
    setVisible(value) { calls.push(['visible', value]); return this; },
    fillStyle(color) { calls.push(['color', color]); return this; },
    fillRect(x, y, w, h) { calls.push(['rect', x, y, w, h]); return this; },
    lineStyle() { return this; },
    lineBetween() { return this; },
    setDepth(depth) { calls.push(['depth', depth]); return this; },
    destroy: vi.fn(),
  };
  return { scene: { add: { graphics: () => graphics } }, calls, graphics };
}

describe('animated book prop', () => {
  const visitor = { x: 300, y: 220, direction: 'left' };
  it('renders two hands and page turning while browsing', () => {
    const { scene, calls } = fakeScene();
    const book = createVisitorBook(scene);
    book.update(visitor, true, 7000, false);
    expect(calls).toContainEqual(['visible', true]);
    expect(calls.filter((call) => call[0] === 'rect').length).toBeGreaterThan(9);
    expect(calls).toContainEqual(['depth', 222]);
  });
  it('hides the book when the visitor starts moving or speaking', () => {
    const { scene, calls, graphics } = fakeScene();
    const book = createVisitorBook(scene);
    book.update(visitor, false, 0, false);
    expect(calls).toContainEqual(['visible', false]);
    book.destroy();
    expect(graphics.destroy).toHaveBeenCalledOnce();
  });
  it('keeps a still image for reduced motion', () => {
    const { scene, calls } = fakeScene();
    const book = createVisitorBook(scene);
    book.update(visitor, true, 7000, true);
    expect(calls).toContainEqual(['visible', true]);
  });
});

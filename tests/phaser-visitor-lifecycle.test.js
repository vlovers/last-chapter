import { describe, expect, it } from 'vitest';
import { pauseVisitor, resumeVisitor, shouldBrowse } from '../public/phaser-prototype/visitor-lifecycle.js';
describe('visitor dialogue and browsing lifecycle', () => {
  const walking = { engaged: false, path: [{ x: 10, y: 20 }], goal: { facing: 'up' }, step: 3, pause: 100 };
  it('halts an active route when the player starts interacting', () => {
    const stopped = pauseVisitor(walking);
    expect(stopped).toMatchObject({ engaged: true, path: [], goal: null, step: 3 });
    expect(shouldBrowse(stopped, 'explore', true, false)).toBe(false);
    expect(walking.path).toHaveLength(1);
  });
  it('resumes walking after dialogue closes without resetting the itinerary', () => {
    const resumed = resumeVisitor(pauseVisitor(walking));
    expect(resumed).toMatchObject({ engaged: false, path: [], goal: null, step: 3, pause: 2400 });
    expect(shouldBrowse(resumed, 'explore', true, false)).toBe(true);
  });
  it('does not wander while hidden, in dialogue or in reduced motion', () => {
    const roaming = resumeVisitor(walking);
    expect(shouldBrowse(roaming, 'dialogue', true, false)).toBe(false);
    expect(shouldBrowse(roaming, 'explore', false, false)).toBe(false);
    expect(shouldBrowse(roaming, 'explore', true, true)).toBe(false);
  });
});

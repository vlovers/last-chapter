import { describe, expect, it } from 'vitest';
import { BROWSE_ACTIONS } from '../public/phaser-prototype/visitor-roaming.js';
describe('book browsing visuals', () => {
  it('marks reading actions with a book prop and leaves other moments empty-handed', () => {
    const reading = BROWSE_ACTIONS.filter((action) => action.prop === 'book');
    const empty = BROWSE_ACTIONS.filter((action) => !action.prop);
    expect(reading.length).toBeGreaterThanOrEqual(2);
    expect(empty.length).toBeGreaterThanOrEqual(1);
    expect(reading.every((action) => ['up', 'left', 'right', 'down'].includes(action.facing))).toBe(true);
  });
});

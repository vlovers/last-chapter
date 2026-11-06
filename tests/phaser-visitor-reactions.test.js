import { describe, expect, it } from 'vitest';
import { facingToward, visitorReaction } from '../public/phaser-prototype/visitor-reactions.js';
describe('visitor proximity and dialogue reactions', () => {
  const visitor = { x: 100, y: 100, direction: 'up' };
  it('faces the player in four directions', () => {
    expect(facingToward(visitor, { x: 130, y: 100 })).toBe('right');
    expect(facingToward(visitor, { x: 70, y: 100 })).toBe('left');
    expect(facingToward(visitor, { x: 100, y: 130 })).toBe('down');
    expect(facingToward(visitor, { x: 100, y: 70 })).toBe('up');
  });
  it('responds to a nearby player but not a distant one', () => {
    expect(visitorReaction(visitor, { x: 130, y: 100 }, false, 0, false).facing).toBe('right');
    expect(visitorReaction(visitor, { x: 300, y: 100 }, false, 0, false).facing).toBe(null);
  });
  it('keeps conversation motion accessible', () => {
    const reaction = visitorReaction(visitor, { x: 130, y: 100 }, true, 300, true);
    expect(reaction.lift).toBe(0);
    expect(reaction.facing).toBe('right');
  });
});

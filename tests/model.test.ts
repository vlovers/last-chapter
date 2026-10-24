import { describe, expect, it } from 'vitest';
import { advance, choose, initialStory } from '../src/game/model';

describe('narrative foundation', () => {
  it('does not treat sharing a rumor as confirming it', () => {
    const next = choose(initialStory(), 'share');
    expect(next.knowledge).toBe('rumor');
    expect(next.reputation).toBe(-1);
  });
  it('separates daytime interactions from evening reflection', () => {
    const evening = advance(initialStory());
    expect(evening.phase).toBe('evening');
    expect(choose(evening, 'listen')).toBe(evening);
    expect(advance(evening)).toMatchObject({ day: 2, phase: 'day' });
  });
  it('makes evidence-seeking deterministic', () => {
    expect(choose(initialStory(), 'verify').knowledge).toBe('observation');
  });
});

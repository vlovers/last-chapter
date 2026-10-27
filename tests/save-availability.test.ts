import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY } from '../src/game/save';

afterEach(() => vi.unstubAllGlobals());

describe('narrative persistence availability', () => {
  it('reports a blocked save and recovers when storage becomes writable', () => {
    const saved = new Map<string, string>();
    let blocked = true;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (blocked) throw new Error('QuotaExceededError');
        saved.set(key, value);
      },
    });
    const story = new FiveDayStory();
    expect(story.isProgressSaved).toBe(true);
    story.choose('greet');
    expect(story.isProgressSaved).toBe(false);
    expect(saved.has(SAVE_KEY)).toBe(false);
    blocked = false;
    const next = story.open().choices[0];
    expect(next).toBeDefined();
    story.choose(next.id);
    expect(story.isProgressSaved).toBe(true);
    expect(saved.has(SAVE_KEY)).toBe(true);
    expect(new FiveDayStory().stage).toBe(story.stage);
  });
});

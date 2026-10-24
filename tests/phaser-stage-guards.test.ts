import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY } from '../src/game/save';

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
  },
});
afterEach(() => store.clear());

describe('story stage transition guards', () => {
  it('cannot skip the opening conversation through an internal action', () => {
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(() => story.choose('__advance')).toThrow('Finish the conversation');
    expect(story.stage).toBe('miller');
    expect(store.has(SAVE_KEY)).toBe(false);
  });
  it('does not persist invalid control actions', () => {
    const story = new FiveDayStory();
    expect(() => story.choose('__missing')).toThrow('Unknown story action');
    expect(story.stage).toBe('miller');
    expect(store.has(SAVE_KEY)).toBe(false);
  });
  it('keeps normal player dialogue choices and save continuity', () => {
    const story = new FiveDayStory();
    story.choose('greet');
    expect(story.stage).toBe('miller');
    expect(store.has(SAVE_KEY)).toBe(true);
    const restored = new FiveDayStory();
    expect(restored.open().text).toBe(story.open().text);
  });
});

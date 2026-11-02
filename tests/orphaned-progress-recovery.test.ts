import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY } from '../src/game/save';
import { SERVICE_KEY } from '../src/game/recommendation';
import { OPTIONAL_PROGRESS_KEYS } from '../src/phaser/optional-progress';

afterEach(() => vi.unstubAllGlobals());

describe('orphaned progress recovery', () => {
  it.each(['missing', 'corrupt'] as const)(
    'clears optional progress and service attempts after a %s chapter save',
    (damage) => {
      const saved = new Map<string, string>();
      if (damage === 'corrupt') saved.set(SAVE_KEY, '{broken');
      for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
        saved.set(key, 'previous playthrough');
      }
      saved.set(SERVICE_KEY, JSON.stringify({ attempts: [{ stale: true }] }));
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => saved.get(key) ?? null,
        setItem: (key: string, value: string) => { saved.set(key, value); },
        removeItem: (key: string) => { saved.delete(key); },
      });

      const story = new FiveDayStory();
      expect(story.stage).toBe('miller');
      for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
        expect(saved.has(key)).toBe(false);
      }
      const service = JSON.parse(saved.get(SERVICE_KEY) ?? '{}') as { attempts?: unknown[] };
      expect(service.attempts).toEqual([]);
      story.choose('greet');
      expect(saved.get(SAVE_KEY)).toBeTruthy();
      expect(new FiveDayStory().stage).toBe('miller');
    },
  );

  it('preserves a future-version save instead of overwriting it', () => {
    const future = JSON.stringify({ version: 999, stage: 'season-complete' });
    const saved = new Map([[SAVE_KEY, future]]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => { saved.set(key, value); },
      removeItem: (key: string) => { saved.delete(key); },
    });
    const story = new FiveDayStory();
    expect(story.isProgressSaved).toBe(false);
    story.choose('greet');
    expect(saved.get(SAVE_KEY)).toBe(future);
  });
});

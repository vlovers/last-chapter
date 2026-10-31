import { afterEach, describe, expect, it, vi } from 'vitest';
import { startChapter } from '../src/game/chapter';
import { SERVICE_KEY } from '../src/game/recommendation';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { OPTIONAL_PROGRESS_KEYS } from '../src/phaser/optional-progress';

const previousService = JSON.stringify({
  version: 1,
  asked: ['miller'],
  attempts: [{ stage: 'miller', book: 'orchard' }],
});
const emptyService = { version: 1, asked: [], attempts: [] };

function storageWith(save?: string) {
  const values = new Map<string, string>([[SERVICE_KEY, previousService]]);
  if (save !== undefined) values.set(SAVE_KEY, save);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  return values;
}

afterEach(() => vi.unstubAllGlobals());

describe('service memory follows the narrative save', () => {
  it('discards orphaned recommendation attempts when a new story starts', () => {
    const values = storageWith();
    const story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(JSON.parse(values.get(SERVICE_KEY)!)).toEqual(emptyService);

    story.choose('greet');
    expect(decodeSave(values.get(SAVE_KEY)!)).not.toBeNull();
    new FiveDayStory();
    expect(JSON.parse(values.get(SERVICE_KEY)!)).toEqual(emptyService);
  });

  it('discards service memory when the chapter save is corrupt', () => {
    const values = storageWith('{"version":999}');
    expect(new FiveDayStory().stage).toBe('miller');
    expect(JSON.parse(values.get(SERVICE_KEY)!)).toEqual(emptyService);
  });

  it('preserves recommendation attempts when the chapter save is valid', () => {
    const values = storageWith(encodeSave(startChapter()));
    expect(new FiveDayStory().stage).toBe('miller');
    expect(values.get(SERVICE_KEY)).toBe(previousService);
  });
});

function seedOptionalProgress(values: Map<string, string>) {
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) values.set(key, `stale:${key}`);
}

describe('optional progress follows the narrative save', () => {
  it.each([
    ['missing', undefined],
    ['corrupt', '{"version":999}'],
  ])('discards orphaned Mara conversations and notes with a %s chapter save', (_label, save) => {
    const values = storageWith(save);
    seedOptionalProgress(values);
    expect(new FiveDayStory().stage).toBe('miller');
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.has(key)).toBe(false);
    }
  });

  it('keeps optional conversations and notes when the chapter save is valid', () => {
    const values = storageWith(encodeSave(startChapter()));
    seedOptionalProgress(values);
    expect(new FiveDayStory().stage).toBe('miller');
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.get(key)).toBe(`stale:${key}`);
    }
  });

  it('falls back to clearing optional values when deletion is blocked', () => {
    const values = storageWith();
    seedOptionalProgress(values);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: () => {
        throw new Error('Deletion denied');
      },
    });
    const story = new FiveDayStory();
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.get(key)).toBe('');
    }
    story.choose('greet');
    expect(decodeSave(values.get(SAVE_KEY)!)).not.toBeNull();
  });
});

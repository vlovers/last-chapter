import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseChapterOption, startChapter } from '../src/game/chapter';
import { SERVICE_KEY } from '../src/game/recommendation';
import { encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { OPTIONAL_PROGRESS_KEYS } from '../src/phaser/optional-progress';

const previousService = JSON.stringify({
  version: 1,
  asked: ['miller'],
  attempts: [{ stage: 'miller', book: 'orchard' }],
});

function seededStorage(save?: string) {
  const values = new Map<string, string>([[SERVICE_KEY, previousService]]);
  if (save !== undefined) values.set(SAVE_KEY, save);
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    values.set(key, 'previous-run:' + key);
  }
  return values;
}

function mockStorage(values: Map<string, string>, denySaveReads: () => boolean) {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => {
      if (key === SAVE_KEY && denySaveReads()) throw new Error('SecurityError');
      return values.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
}

function expectOptionalUntouched(values: Map<string, string>) {
  expect(values.get(SERVICE_KEY)).toBe(previousService);
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    expect(values.get(key)).toBe('previous-run:' + key);
  }
}

afterEach(() => vi.unstubAllGlobals());

describe('chapter read failures never silently erase existing player progress', () => {
  it('preserves a valid older chapter, service history and optional conversations after a transient read error', () => {
    const oldSave = encodeSave(chooseChapterOption(startChapter(), 'greet'));
    const values = seededStorage(oldSave);
    let firstRead = true;
    mockStorage(values, () => {
      if (!firstRead) return false;
      firstRead = false;
      return true;
    });

    const fallback = new FiveDayStory();
    expect(fallback.isProgressSaved).toBe(false);
    expect(fallback.open().choices.some((choice) => choice.id === 'greet')).toBe(true);
    expectOptionalUntouched(values);

    fallback.choose('greet');
    expect(fallback.isProgressSaved).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(oldSave);
    expectOptionalUntouched(values);

    const recovered = new FiveDayStory();
    expect(recovered.open().choices.some((choice) => choice.id === 'greet')).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(oldSave);
  });

  it('does not overwrite an unreadable corrupt chapter or clear unrelated progress', () => {
    const oldSave = '{"version":999}';
    const values = seededStorage(oldSave);
    let firstRead = true;
    mockStorage(values, () => {
      if (!firstRead) return false;
      firstRead = false;
      return true;
    });

    const fallback = new FiveDayStory();
    fallback.choose('greet');
    expect(fallback.isProgressSaved).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(oldSave);
    expectOptionalUntouched(values);
  });

  it('does not write a new chapter while storage reads remain denied', () => {
    const values = seededStorage();
    mockStorage(values, () => true);

    const fallback = new FiveDayStory();
    fallback.choose('greet');
    expect(fallback.isProgressSaved).toBe(false);
    expect(values.has(SAVE_KEY)).toBe(false);
    expectOptionalUntouched(values);
  });

  it('persists a genuinely new chapter and clears orphans only after reads recover', () => {
    const values = seededStorage();
    let firstRead = true;
    mockStorage(values, () => {
      if (!firstRead) return false;
      firstRead = false;
      return true;
    });

    const fallback = new FiveDayStory();
    expectOptionalUntouched(values);
    fallback.choose('greet');
    expect(fallback.isProgressSaved).toBe(true);
    expect(values.has(SAVE_KEY)).toBe(true);
    expect(JSON.parse(values.get(SERVICE_KEY)!)).toEqual({
      version: 1,
      asked: [],
      attempts: [],
    });
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.has(key)).toBe(false);
    }
    expect(new FiveDayStory().open().choices.some((choice) => choice.id === 'greet')).toBe(false);
  });
});

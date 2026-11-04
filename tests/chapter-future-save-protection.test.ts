import { afterEach, describe, expect, it, vi } from 'vitest';
import { SERVICE_KEY } from '../src/game/recommendation';
import { decodeSave, isNewerSaveVersion, SAVE_KEY, SAVE_VERSION } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { OPTIONAL_PROGRESS_KEYS } from '../src/phaser/optional-progress';

const futureSave = JSON.stringify({
  version: SAVE_VERSION + 1,
  stage: 'miller',
  node: 'arrival',
  flags: ['future-only-progress'],
  history: [],
});
const previousService = JSON.stringify({
  version: 1,
  asked: ['miller'],
  attempts: [{ stage: 'miller', book: 'orchard' }],
});

function seededStorage() {
  const values = new Map<string, string>([
    [SAVE_KEY, futureSave],
    [SERVICE_KEY, previousService],
  ]);
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    values.set(key, 'future-run:' + key);
  }
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

function expectFutureProgress(values: Map<string, string>) {
  expect(values.get(SAVE_KEY)).toBe(futureSave);
  expect(values.get(SERVICE_KEY)).toBe(previousService);
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    expect(values.get(key)).toBe('future-run:' + key);
  }
}

afterEach(() => vi.unstubAllGlobals());

describe('newer-version chapter saves are protected from older builds', () => {
  it('recognizes only newer integer versions without accepting them as current saves', () => {
    expect(isNewerSaveVersion(futureSave)).toBe(true);
    expect(decodeSave(futureSave)).toBeNull();
    expect(isNewerSaveVersion(JSON.stringify({ version: SAVE_VERSION }))).toBe(false);
    expect(isNewerSaveVersion(JSON.stringify({ version: SAVE_VERSION + 0.5 }))).toBe(false);
    expect(isNewerSaveVersion(JSON.stringify({ version: String(SAVE_VERSION + 1) }))).toBe(false);
    expect(isNewerSaveVersion('not json')).toBe(false);
  });

  it('keeps a newer save, optional conversations and recommendations untouched', () => {
    const values = seededStorage();
    const fallback = new FiveDayStory();
    expect(fallback.stage).toBe('miller');
    expect(fallback.isProgressSaved).toBe(false);
    expectFutureProgress(values);

    fallback.choose('greet');
    expect(fallback.isProgressSaved).toBe(false);
    expectFutureProgress(values);
    expect(new FiveDayStory().isProgressSaved).toBe(false);
    expectFutureProgress(values);
  });

  it('can save a fresh run after the newer save is explicitly removed', () => {
    const values = seededStorage();
    const fallback = new FiveDayStory();
    values.delete(SAVE_KEY);

    fallback.choose('greet');

    expect(fallback.isProgressSaved).toBe(true);
    expect(decodeSave(values.get(SAVE_KEY)!)?.stage).toBe('miller');
    expect(values.get(SERVICE_KEY)).toBe(JSON.stringify({ version: 1, asked: [], attempts: [] }));
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.has(key)).toBe(false);
    }
    expect(new FiveDayStory().isProgressSaved).toBe(true);
  });

  it('keeps the existing corrupt-current-version recovery behavior', () => {
    const values = seededStorage();
    values.set(SAVE_KEY, '{"version":1,"stage":"missing"}');

    const fallback = new FiveDayStory();

    expect(fallback.isProgressSaved).toBe(true);
    expect(values.get(SERVICE_KEY)).toBe(JSON.stringify({ version: 1, asked: [], attempts: [] }));
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.has(key)).toBe(false);
    }
  });
});

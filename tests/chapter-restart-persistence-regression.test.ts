import { afterEach, describe, expect, it, vi } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { startDialogue } from '../src/game/dialogue';
import { SERVICE_KEY } from '../src/game/recommendation';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { OPTIONAL_PROGRESS_KEYS } from '../src/phaser/optional-progress';

const oldService = JSON.stringify({
  version: 1,
  asked: ['miller'],
  attempts: [{ stage: 'miller', book: 'orchard' }],
});

function setupRestart(failSaveWrite: () => boolean) {
  const oldSave = encodeSave({
    stage: 'season-complete',
    dialogue: startDialogue(finalReading),
    flags: [],
  });
  const values = new Map<string, string>([
    [SAVE_KEY, oldSave],
    [SERVICE_KEY, oldService],
  ]);
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    values.set(key, 'previous-run:' + key);
  }
  const dispatchEvent = vi.fn();
  vi.stubGlobal('window', { dispatchEvent });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === SAVE_KEY && failSaveWrite()) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  return { values, oldSave, dispatchEvent };
}

function expectOldProgress(values: Map<string, string>, oldSave: string) {
  expect(values.get(SAVE_KEY)).toBe(oldSave);
  expect(values.get(SERVICE_KEY)).toBe(oldService);
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    expect(values.get(key)).toBe('previous-run:' + key);
  }
}

afterEach(() => vi.unstubAllGlobals());

describe('season restart keeps the previous save until a replacement is durable', () => {
  it('does not delete optional conversations or emit a new-game event if saving fails', () => {
    const { values, oldSave, dispatchEvent } = setupRestart(() => true);
    const story = new FiveDayStory();
    expect(story.stage).toBe('season-complete');

    story.choose('__restart');

    expect(story.stage).toBe('season-complete');
    expect(story.isProgressSaved).toBe(false);
    expectOldProgress(values, oldSave);
    expect(dispatchEvent).not.toHaveBeenCalled();
    expect(new FiveDayStory().stage).toBe('season-complete');
  });

  it('can retry the restart after a transient storage failure', () => {
    let blocked = true;
    const { values, oldSave, dispatchEvent } = setupRestart(() => blocked);
    const story = new FiveDayStory();

    story.choose('__restart');
    expectOldProgress(values, oldSave);
    blocked = false;
    story.choose('__restart');

    expect(story.stage).toBe('miller');
    expect(story.isProgressSaved).toBe(true);
    expect(decodeSave(values.get(SAVE_KEY)!)?.stage).toBe('miller');
    expect(values.get(SERVICE_KEY)).toBe(JSON.stringify({ version: 1, asked: [], attempts: [] }));
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.has(key)).toBe(false);
    }
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    expect(new FiveDayStory().stage).toBe('miller');
  });

  it('clears the old run after a successful restart without a mounted journal', () => {
    const { values, oldSave, dispatchEvent } = setupRestart(() => false);
    const story = new FiveDayStory();

    story.choose('__restart');

    expect(story.stage).toBe('miller');
    expect(story.isProgressSaved).toBe(true);
    expect(values.get(SAVE_KEY)).not.toBe(oldSave);
    expect(values.get(SERVICE_KEY)).toBe(JSON.stringify({ version: 1, asked: [], attempts: [] }));
    for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
      expect(values.has(key)).toBe(false);
    }
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });
});

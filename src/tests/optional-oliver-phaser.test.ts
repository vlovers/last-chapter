import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../phaser/five-day-story';
import { irisVisit } from '../content/iris';
import { finalReading } from '../content/day-five';
import { startChapter, type ChapterState } from '../game/chapter';
import { startDialogue } from '../game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from '../game/save';
import { chooseOliver, OLIVER_COMPLETED } from '../game/optional-oliver';

afterEach(() => vi.unstubAllGlobals());

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
    clear: () => {
      values.clear();
    },
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  };
}

function dayTwo(): ChapterState {
  return { ...startChapter(), stage: 'iris', dialogue: startDialogue(irisVisit) };
}

describe('Phaser Oliver facade and persisted reload', () => {
  it('clears the completion marker on a durable new-game action', () => {
    const flags = [OLIVER_COMPLETED];
    const storage = memoryStorage({
      [SAVE_KEY]: encodeSave({
        stage: 'season-complete',
        flags,
        dialogue: { ...startDialogue(finalReading), flags },
      }),
    });
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    const story = new FiveDayStory();
    story.choose('__restart');
    expect(story.stage).toBe('miller');
    expect(decodeSave(storage.getItem(SAVE_KEY)!)?.flags).not.toContain(OLIVER_COMPLETED);
    storage.setItem(SAVE_KEY, encodeSave(dayTwo()));
    expect(new FiveDayStory().oliverAvailable).toBe(true);
  });
  it('restores the completion marker through the canonical FiveDayStory facade', () => {
    const storage = memoryStorage({ [SAVE_KEY]: encodeSave(dayTwo()) });
    vi.stubGlobal('localStorage', storage);
    const story = new FiveDayStory();
    expect(story.stage).toBe('iris');
    expect(story.oliverAvailable).toBe(true);
    const session = chooseOliver(story.beginOliver(), 'oliver-unread-decline');
    story.completeOliver(session);
    expect(story.oliverAvailable).toBe(false);
    const reloaded = new FiveDayStory();
    expect(reloaded.stage).toBe('iris');
    expect(reloaded.oliverAvailable).toBe(false);
  });

  it('does not offer Oliver on Day 1', () => {
    const storage = memoryStorage({ [SAVE_KEY]: encodeSave(startChapter()) });
    vi.stubGlobal('localStorage', storage);
    const story = new FiveDayStory();
    expect(story.oliverAvailable).toBe(false);
    expect(() => story.beginOliver()).toThrow();
  });

  it('does not offer Oliver while a future-version save is awaiting recovery', () => {
    const storage = memoryStorage({
      [SAVE_KEY]: JSON.stringify({ version: 999, chapter: dayTwo() }),
    });
    vi.stubGlobal('localStorage', storage);
    const story = new FiveDayStory();
    expect(story.oliverAvailable).toBe(false);
    expect(() => story.beginOliver()).toThrow('Oliver is unavailable');
  });

  it('does not offer Oliver when the narrative save cannot be read', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', {
      ...storage,
      getItem: () => {
        throw new Error('Storage access denied');
      },
    });
    const story = new FiveDayStory();
    expect(story.oliverAvailable).toBe(false);
    expect(() => story.beginOliver()).toThrow('Oliver is unavailable');
  });

  it('cannot finish an unfinished conversation', () => {
    const storage = memoryStorage({ [SAVE_KEY]: encodeSave(dayTwo()) });
    vi.stubGlobal('localStorage', storage);
    const story = new FiveDayStory();
    expect(() => story.completeOliver(story.beginOliver())).toThrow();
    expect(story.oliverAvailable).toBe(true);
  });
});

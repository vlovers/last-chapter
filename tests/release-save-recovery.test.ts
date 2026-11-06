import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';
import { chooseChapterOption, startChapter } from '../src/game/chapter';
import { SERVICE_KEY } from '../src/game/recommendation';
import { OPTIONAL_PROGRESS_KEYS } from '../src/phaser/optional-progress';
import { preserveUnreadableProgress } from '../src/phaser/save-recovery';

const recoveryKey = 'last-chapter:save:recovery:v1';
const sidecarKeys = [SERVICE_KEY, ...Object.values(OPTIONAL_PROGRESS_KEYS)];

function storage(raw: string, blockedKey?: string) {
  const values = new Map<string, string>([[SAVE_KEY, raw]]);
  for (const key of sidecarKeys) values.set(key, 'Попередні записи: ' + key);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === blockedKey) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    removeItem: (key: string) => values.delete(key),
  });
  return values;
}

afterEach(() => vi.unstubAllGlobals());

describe('unreadable saves retain recoverable player data', () => {
  it.each(['{broken', ''])('archives the exact unreadable payload and every sidecar: %s', (raw) => {
    const values = storage(raw);
    const original = Object.fromEntries(values);
    const game = new FiveDayStory();
    expect(JSON.parse(values.get(recoveryKey) ?? 'null')).toMatchObject({
      version: 1,
      snapshots: [{ entries: original }],
    });
    game.choose('greet');
    expect(decodeSave(values.get(SAVE_KEY)!)?.dialogue.node).toBe('hello');
    expect(JSON.parse(values.get(recoveryKey)!).snapshots[0].entries).toEqual(original);
    expect(new FiveDayStory().isProgressSaved).toBe(true);
  });

  it('preserves real progress when only its completion ledger is damaged', () => {
    const valid = JSON.parse(encodeSave(chooseChapterOption(startChapter(), 'greet')));
    valid.pending.push({ ...valid.pending[0] });
    const raw = JSON.stringify(valid);
    expect(decodeSave(raw)).toBeNull();
    const values = storage(raw);
    const game = new FiveDayStory();
    game.choose('greet');
    expect(JSON.parse(values.get(recoveryKey)!).snapshots[0].entries[SAVE_KEY]).toBe(raw);
    // Repairing the one damaged field recovers the original, source-defined progress.
    const archived = JSON.parse(
      JSON.parse(values.get(recoveryKey)!).snapshots[0].entries[SAVE_KEY],
    );
    archived.pending.pop();
    expect(decodeSave(JSON.stringify(archived))?.dialogue.node).toBe('hello');
  });

  it('keeps the original save and sidecars if the backup cannot be written', () => {
    const raw = '{broken';
    const values = storage(raw, recoveryKey);
    const original = new Map(values);
    const game = new FiveDayStory();
    expect(game.isProgressSaved).toBe(false);
    game.choose('greet');
    game.inspect('window');
    expect(game.isProgressSaved).toBe(false);
    expect(values).toEqual(original);
    expect(game.open().choices.length).toBeGreaterThan(0);
  });

  it('does not overwrite an earlier recovery snapshot after another corrupt save', () => {
    const values = storage('{first');
    new FiveDayStory();
    const first = JSON.parse(values.get(recoveryKey)!).snapshots[0];
    values.set(SAVE_KEY, '{second');
    values.set(OPTIONAL_PROGRESS_KEYS.notes, 'Нові записи');
    new FiveDayStory().choose('greet');
    const snapshots = JSON.parse(values.get(recoveryKey)!).snapshots;
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0]).toEqual(first);
    expect(snapshots[1].entries[SAVE_KEY]).toBe('{second');
    expect(snapshots[1].entries[OPTIONAL_PROGRESS_KEYS.notes]).toBe('Нові записи');
  });

  it('protects both records if the existing recovery archive is unreadable', () => {
    const values = storage('{broken');
    values.set(recoveryKey, '{previous-backup');
    const original = new Map(values);
    const game = new FiveDayStory();
    game.choose('greet');
    expect(game.isProgressSaved).toBe(false);
    expect(values).toEqual(original);
  });

  it('does not clear progress when a storage adapter silently ignores the backup write', () => {
    const values = storage('{broken');
    const original = new Map(values);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key !== recoveryKey) values.set(key, value);
      },
      removeItem: (key: string) => values.delete(key),
    });
    const game = new FiveDayStory();
    game.choose('greet');
    expect(game.isProgressSaved).toBe(false);
    expect(values).toEqual(original);
  });

  it('deduplicates an unchanged recovery snapshot without touching its source', () => {
    const values = storage('{broken');
    const first = preserveUnreadableProgress('{broken');
    expect(first).not.toBeNull();
    expect(preserveUnreadableProgress('{broken')).toBe(first);
    expect(JSON.parse(values.get(recoveryKey)!).snapshots).toHaveLength(1);
    expect(values.get(SAVE_KEY)).toBe('{broken');
  });

  it('does not overwrite valid recommendation history after its initial read fails', () => {
    const state = chooseChapterOption(chooseChapterOption(startChapter(), 'greet'), 'books');
    const values = storage(encodeSave(state));
    const original = JSON.stringify({
      version: 1,
      asked: ['miller'],
      attempts: [{ stage: 'miller', book: 'witnesses' }],
    });
    values.set(SERVICE_KEY, original);
    let denyRead = true;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => {
        if (key === SERVICE_KEY && denyRead) {
          denyRead = false;
          throw new Error('Transient read denial');
        }
        return values.get(key) ?? null;
      },
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const game = new FiveDayStory();
    game.clarifyRequest();
    expect(values.get(SERVICE_KEY)).toBe(original);
    expect(game.recommend('orchard')?.accepted).toBe(true);
    expect(values.get(SERVICE_KEY)).toBe(original);
    expect(decodeSave(values.get(SAVE_KEY)!)!.flags).toContain('sold_orchard');
    expect(game.isProgressSaved).toBe(true);
  });

  it.each(['legacy', 'current', 'future', 'missing'])('does not archive a %s save', (kind) => {
    const state = chooseChapterOption(startChapter(), 'greet');
    const raw = JSON.parse(encodeSave(state));
    if (kind === 'legacy') {
      delete raw.completed;
      delete raw.pending;
    }
    if (kind === 'future') raw.version = 999;
    const values = storage(JSON.stringify(raw));
    if (kind === 'missing') values.delete(SAVE_KEY);
    const game = new FiveDayStory();
    if (kind === 'current' || kind === 'legacy') expect(game.open().text).toContain('дзвіночок');
    expect(values.has(recoveryKey)).toBe(false);
    if (kind === 'future') expect(values.get(SAVE_KEY)).toBe(JSON.stringify(raw));
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { spokenChoice } from '../public/phaser-prototype/player-turn.js';
import { dialogueTabStops } from '../public/phaser-prototype/dialogue-ui.js';
import { frameDialogue, touchTarget } from '../public/phaser-prototype/viewport.js';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { journalEntries, unreadJournalIds } from '../src/phaser/journal-view';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';

afterEach(() => vi.unstubAllGlobals());
const storage = () => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  return data;
};

describe('spoken player turns are presentation, never another story choice', () => {
  it.each([
    '«Двері поки що перемагають»',
    '«Дякую! Це дуже мило»',
    '«Що він любить, окрім книжок?»',
  ])('retains authored speech verbatim: %s', (label) => {
    expect(spokenChoice({ id: 'reply', label })).toBe(label);
  });
  it.each([
    'Оглянути конверт',
    'Погладити Френка',
    'Привітатися',
    '«Скляна станція» — історичний роман',
    'Запитати про лист',
  ])('does not invent words for actions or book labels: %s', (label) => {
    expect(spokenChoice({ id: 'action', label })).toBeNull();
  });
  it('honors explicit editorial delivery and excludes paging and book choices', () => {
    expect(
      spokenChoice({
        id: 'ask',
        label: 'Запитати',
        delivery: 'speech',
        spokenText: 'Можна запитати?',
      }),
    ).toBe('Можна запитати?');
    expect(spokenChoice({ id: 'action', label: '«Конверт»', delivery: 'action' })).toBeNull();
    expect(spokenChoice({ id: '__advance', label: '«Далі»' })).toBeNull();
    expect(spokenChoice({ id: 'station', label: '«Скляна станція»', book: {} })).toBeNull();
  });
  it('reads a visible line repeatedly without changing flags or replaying the choice after restore', () => {
    const data = storage();
    data.set(
      SAVE_KEY,
      encodeSave({ stage: 'mara', flags: [], dialogue: { node: 'hello', flags: [], history: [] } }),
    );
    const story = new FiveDayStory();
    const choose = vi.spyOn(story, 'choose');
    const choice = story.open().choices.find((choice) => choice.id === 'joke')!;
    expect(spokenChoice(choice)).toBe('«Двері перемагають. Може, їм зарплату платити?»');
    story.choose(choice.id);
    const saved = data.get(SAVE_KEY)!;
    for (let i = 0; i < 10; i++) {
      spokenChoice(choice);
      story.open();
    }
    expect(choose).toHaveBeenCalledTimes(1);
    expect(
      decodeSave(saved)!.flags.filter((flag) => flag === 'mara_door_joke_shared'),
    ).toHaveLength(1);
    expect(new FiveDayStory().open()).toEqual(story.open());
    expect(data.get(SAVE_KEY)).toBe(saved);
    expect(saved).not.toContain('playerTurn');
  });
  it('includes prose and the catalog shortcut in the focus cycle, excluding hidden/disabled controls', () => {
    const make = (disabled = false, hidden = false) => ({
      disabled,
      closest: () => (hidden ? {} : null),
    });
    const prose = make(),
      catalog = make(),
      answer = make();
    const panel = {
      querySelectorAll: () => [prose, make(false, true), catalog, make(true), answer],
    };
    expect(dialogueTabStops(panel)).toEqual([prose, catalog, answer]);
  });
});

describe('knowledge-bound journal on old and new saves', () => {
  it('hides undiscovered evidence, rumors and future visitors', () => {
    storage();
    const story = new FiveDayStory();
    expect(journalEntries(story)).toEqual({ clues: [], events: [], rumors: [] });
    expect(unreadJournalIds(story, new Set())).toEqual([]);
  });
  it('keeps inferences distinct and never marks an uncollected clue as known', () => {
    storage();
    const story = new FiveDayStory();
    for (const id of ['window', 'counter', 'shelves']) story.inspect(id);
    expect(journalEntries(story).clues).toEqual([]);
    for (const id of ['bookmark', 'stamp', 'shelf', 'timeline']) story.gatherEvidence(id);
    const entries = journalEntries(story);
    expect(entries.clues.find((entry) => entry.id === 'clue:timeline')!.kind).toBe('inference');
    const seen = new Set(unreadJournalIds(story, new Set()));
    expect(unreadJournalIds(story, seen)).toEqual([]);
    expect(journalEntries(new FiveDayStory())).toEqual(entries);
  });
});

describe('portrait and landscape world framing', () => {
  it('keeps both speakers in the unobscured landscape area', () => {
    const player = { x: 180, y: 220 },
      npc = { x: 240, y: 235 };
    const frame = frameDialogue(player, npc, 844, 338, 2, { width: 472, height: 322 });
    for (const actor of [player, npc]) {
      expect((actor.x - frame.x) * 2).toBeGreaterThan(20);
      expect((actor.x - frame.x) * 2).toBeLessThan(844 - 472 - 24);
      expect((actor.y - frame.y) * 2).toBeLessThan(338);
    }
  });
  it.each([
    [320, 456],
    [360, 668],
    [375, 555],
    [375, 700],
    [390, 732],
    [430, 820],
    [768, 888],
  ])('keeps the player above a portrait reading dock at %ix%i', (width, height) => {
    const zoom = width < 360 ? 1 : 2;
    const dock = { width, height: Math.min(height * 0.53, 360) };
    const frame = frameDialogue({ x: 180, y: 220 }, null, width, height, zoom, dock);
    expect((220 - frame.y) * zoom).toBeLessThan(height - dock.height);
    expect(Number.isInteger(frame.y)).toBe(true);
  });
  it('keeps a partially visible small hotspot large enough to tap', () => {
    expect(touchTarget({ x: -10, y: 4, w: 30, h: 26 }, 320, 456)).toEqual({
      x: 0,
      y: 0,
      w: 44,
      h: 44,
    });
    const edge = touchTarget({ x: 310, y: 450, w: 30, h: 26 }, 320, 456);
    expect(edge.x + edge.w).toBe(320);
    expect(edge.y + edge.h).toBe(456);
  });
  it('does not shift a large offscreen shelf onto walkable floor', () => {
    const shelf = touchTarget({ x: 80, y: -160, w: 300, h: 274 }, 844, 338);
    expect(shelf.y + shelf.h).toBe(114);
    expect(shelf.y + shelf.h).toBeLessThan(216);
  });
  it('keeps a distant arriving speaker in the world bounds on a small phone', () => {
    const frame = frameDialogue({ x: 171, y: 204 }, { x: 590, y: 221 }, 320, 456, 1, {
      width: 320,
      height: 278,
    });
    expect(frame.x).toBeLessThanOrEqual(320);
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(590 - frame.x).toBeLessThan(320);
  });
});

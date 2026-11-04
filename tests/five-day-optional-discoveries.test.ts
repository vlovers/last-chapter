import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

function useStorage() {
  const values = new Map<string, string>();
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

describe('optional bookstore discoveries across the five-day story', () => {
  it('keeps Frank, shop discoveries and the completed clue chain through every day and clears them on restart', () => {
    const values = useStorage();
    let story = new FiveDayStory();
    expect(story.evidence).toEqual([]);
    expect(story.gatherEvidence.bind(story, 'bookmark')).toThrow('Clue is not accessible');
    expect(values.has(SAVE_KEY)).toBe(false);

    for (const spot of ['frank', 'window', 'counter', 'shelves'] as const) {
      expect(story.inspect(spot)).not.toBeNull();
    }
    expect(story.inspectedSpots).toEqual(['frank', 'shelves', 'window', 'counter']);
    expect(story.evidence.map((clue) => clue.id)).toEqual(['bookmark', 'stamp', 'shelf']);

    for (const id of ['bookmark', 'stamp', 'shelf', 'timeline']) {
      expect(story.gatherEvidence(id)?.collected).toBe(true);
    }
    const discoveries = [
      'met_frank',
      'explored_window',
      'explored_counter',
      'explored_shelves',
      'clue_bookmark',
      'clue_stamp',
      'clue_shelf',
      'clue_timeline',
    ];
    const firstSave = values.get(SAVE_KEY);
    expect(firstSave).toBeTruthy();
    expect(story.gatherEvidence('timeline')?.collected).toBe(true);
    expect(values.get(SAVE_KEY)).toBe(firstSave);

    const originalNotes = story.notes;
    const originalEvidence = story.evidence;
    story = new FiveDayStory();
    expect(story.notes).toEqual(originalNotes);
    expect(story.evidence).toEqual(originalEvidence);
    expect(story.evidence.every((clue) => clue.collected)).toBe(true);

    const visitedDays = new Set<number>([story.day]);
    let inspectedPlant = false;
    for (let step = 0; step < 1000 && story.stage !== 'season-complete'; step++) {
      const view = story.open();
      const choice =
        view.choices.find((option) => option.id === '__advance') ??
        view.choices.find((option) => option.id === 'finish') ??
        view.choices.find((option) => !option.id.startsWith('__'));
      if (!choice) throw new Error(`Story stuck at ${story.stage} after ${step} steps`);
      story.choose(choice.id);
      // Recreate the bridge after every dialogue choice, not only at day boundaries.
      story = new FiveDayStory();
      visitedDays.add(story.day);
      if (story.day === 3 && !inspectedPlant) {
        expect(story.inspect('plant')).not.toBeNull();
        inspectedPlant = true;
        story = new FiveDayStory();
      }
      const saved = decodeSave(values.get(SAVE_KEY) ?? '');
      expect(saved).not.toBeNull();
      for (const flag of discoveries) expect(saved?.flags).toContain(flag);
      expect(story.evidence.map((clue) => clue.id)).toEqual([
        'bookmark',
        'stamp',
        'shelf',
        'timeline',
      ]);
      expect(story.evidence.every((clue) => clue.collected)).toBe(true);
      expect(story.inspectedSpots).toContain('frank');
      if (inspectedPlant) expect(story.inspectedSpots).toContain('plant');
    }
    expect(story.stage).toBe('season-complete');
    expect([...visitedDays].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(inspectedPlant).toBe(true);

    story.choose('__restart');
    story = new FiveDayStory();
    expect(story.stage).toBe('miller');
    expect(story.inspectedSpots).toEqual([]);
    expect(story.evidence).toEqual([]);
    expect(story.notes).toEqual([]);
    expect(decodeSave(values.get(SAVE_KEY) ?? '')?.flags).toEqual([]);
  });

  it('does not write a save for unknown shop spots or inaccessible clues', () => {
    const values = useStorage();
    const story = new FiveDayStory();
    expect(story.inspect('unknown')).toBeNull();
    expect(() => story.gatherEvidence('timeline')).toThrow('Clue is not accessible');
    expect(values.has(SAVE_KEY)).toBe(false);
    expect(story.inspectedSpots).toEqual([]);
    expect(story.evidence).toEqual([]);
  });
});

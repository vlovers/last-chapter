import { describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { seasonEnding } from '../src/game/endings';

const nextDayStage: Partial<Record<string, string>> = {
  complete: 'iris',
  'day2-complete': 'eleanor',
  'day3-complete': 'day4-iris',
  'day4-complete': 'day5-reading',
};

const expectedStages = [
  'miller',
  'mara',
  'evening',
  'complete',
  'iris',
  'anna',
  'leo',
  'day2-complete',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'day3-complete',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day4-complete',
  'day5-reading',
  'season-complete',
];

function play(route: 'first' | 'last' | 'alternating') {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
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
  });
  try {
    let story = new FiveDayStory();
    const visited = [story.stage];
    const attempted = new Map<string, Set<string>>();
    for (let step = 0; step < 1000 && story.stage !== 'season-complete'; step++) {
      const before = decodeSave(values.get(SAVE_KEY) ?? '');
      const view = story.open();
      const advance = view.choices.find((choice) => choice.id === '__advance');
      const finish = view.choices.find((choice) => choice.id === 'finish');
      const dialogue = view.choices.filter((choice) => !choice.id.startsWith('__'));
      const sceneKey = `${story.stage}:${view.speaker}:${view.text}`;
      const tried = attempted.get(sceneKey) ?? new Set<string>();
      const untried = dialogue.filter((option) => !tried.has(option.id));
      const candidates = untried.length > 0 ? untried : dialogue;
      const choice =
        advance ??
        finish ??
        (route === 'first'
          ? candidates[0]
          : route === 'last'
            ? candidates[candidates.length - 1]
            : candidates[step % 2 === 0 ? 0 : candidates.length - 1]);
      if (choice && !choice.id.startsWith('__')) {
        tried.add(choice.id);
        attempted.set(sceneKey, tried);
      }
      if (!choice) throw new Error(`Route ${route} stuck at ${story.stage} after ${step} steps`);
      // The day button must never bypass an unfinished conversation or write
      // a partial save when tapped too early.
      if (dialogue.length > 0) {
        const untouchedSave = values.get(SAVE_KEY);
        const advanceEarly = () => story.choose('__advance');
        expect(advanceEarly).toThrow('Finish the conversation before advancing');
        expect(values.get(SAVE_KEY)).toBe(untouchedSave);
        expect(story.open()).toEqual(view);
      }
      const previous = story.stage;
      story.choose(choice.id);
      if (nextDayStage[previous]) {
        expect(choice.id).toBe('__advance');
        expect(story.stage).toBe(nextDayStage[previous]);
        expect(story.open().choices.some((option) => option.id === '__advance')).toBe(false);
      }
      const saved = decodeSave(values.get(SAVE_KEY) ?? '');
      expect(saved).not.toBeNull();
      expect(saved?.stage).toBe(story.stage);
      expect(saved?.flags).toEqual(expect.arrayContaining([...(before?.flags ?? [])]));
      expect(new Set(saved?.flags).size).toBe(saved?.flags.length);
      if (story.stage !== previous) visited.push(story.stage);

      // Compare the actual player-visible state, not just the stage identifier:
      // a save can restore the correct day but lose available choices or clues.
      const expectedView = story.open();
      const expectedNotes = story.notes;
      const expectedEvidence = story.evidence;
      const expectedOrders = story.orders;
      const expectedDay = story.day;
      story = new FiveDayStory();
      expect(story.stage).toBe(saved?.stage);
      expect(story.open()).toEqual(expectedView);
      expect(story.notes).toEqual(expectedNotes);
      expect(story.evidence).toEqual(expectedEvidence);
      expect(story.orders).toEqual(expectedOrders);
      expect(story.day).toBe(expectedDay);
    }
    expect(visited).toEqual(expectedStages);
    expect(story.stage).toBe('season-complete');
    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved).not.toBeNull();
    const ending = seasonEnding(saved!);
    expect(story.open().text).toBe([ending.letter, ending.community, ending.epilogue].join('\n\n'));

    // Starting over must not carry the previous season's decisions or receipts.
    const firstScene = story.choose('__restart');
    const fresh = new FiveDayStory();
    expect(fresh.stage).toBe('miller');
    expect(fresh.day).toBe(1);
    expect(fresh.open()).toEqual(firstScene);
    expect(fresh.orders).toEqual([]);
    const reset = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(reset?.flags).toEqual([]);
    expect(reset?.dialogue.history).toEqual([]);
    return { visited, flags: saved!.flags, ending };
  } finally {
    vi.unstubAllGlobals();
  }
}

describe('five-day alternative dialogue routes', () => {
  it('restores every choice and reaches the finale using the earliest option', () => {
    play('first');
  });

  it('restores every choice and reaches the finale using the latest option', () => {
    play('last');
  });

  it('restores every choice and reaches the finale when alternating options', () => {
    play('alternating');
  });
});

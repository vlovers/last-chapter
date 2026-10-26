import { describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { SAVE_KEY } from '../src/game/save';

function storage() {
  const values = new Map<string, string>();
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
  };
}

describe('five-day story stage progression', () => {
  it('reaches the finale through all stages, retaining progress across save reloads', () => {
    const local = storage();
    vi.stubGlobal('localStorage', local);
    try {
      let story = new FiveDayStory();
      const stages: string[] = [story.stage];
      const visited = new Set<string>();
      for (let step = 0; step < 500; step++) {
        const view = story.open();
        const advance = view.choices.find((choice) => choice.id === '__advance');
        const choice = advance ?? view.choices.find((option) => !option.id.startsWith('__'));
        if (!choice) throw new Error(`Story stuck at ${story.stage} after ${step} steps`);
        const previousStage = story.stage;
        story.choose(choice.id);
        if (story.stage !== previousStage) {
          stages.push(story.stage);
          expect(local.getItem(SAVE_KEY)).toBeTruthy();
          story = new FiveDayStory();
          expect(story.stage).toBe(stages[stages.length - 1]);
        }
        if (story.stage === 'season-complete') break;
        const key = JSON.stringify([story.stage, story.open().choices.map((option) => option.id)]);
        if (visited.has(key)) throw new Error(`Dialogue loop at ${story.stage}: ${key}`);
        visited.add(key);
      }
      expect(stages).toEqual([
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
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

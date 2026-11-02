import journeyFixture from './fixtures/production-v2-journeys.json';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { decodeSave, SAVE_KEY } from '../src/game/save';

interface Journeys {
  common: Record<string, string[]>;
  scenarios: {
    id: string;
    overrides: Partial<Record<string, string[]>>;
    expected: string[];
    absent: string[];
    summary: string;
  }[];
}
const journeys = journeyFixture as Journeys;

afterEach(() => vi.unstubAllGlobals());

describe('Release: ten complete journeys with restoration at every choice', () => {
  it.each(journeys.scenarios)(
    '$id reaches its own ending through actual earlier decisions',
    (scenario) => {
      const storage = new Map<string, string>();
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      });
      let story = new FiveDayStory();
      const visited = new Set<number>();
      const stages = new Set<string>();
      let steps = 0;
      while (story.stage !== 'season-complete') {
        const stage = story.stage;
        stages.add(stage);
        visited.add(story.day);
        const route = scenario.overrides[stage] ?? journeys.common[stage];
        expect(route, 'Missing stage ' + stage).toBeDefined();
        for (const id of route!) {
          let found = false;
          for (let page = 0; page < 40; page++) {
            const view = story.open();
            expect(view.choices.length).toBeLessThanOrEqual(4);
            if (view.choices.some((choice) => choice.id === id)) {
              found = true;
              break;
            }
            if (!view.choices.some((choice) => choice.id === '__more_choices')) break;
            story.choose('__more_choices');
          }
          expect(found, scenario.id + ' / ' + stage + ' / ' + id).toBe(true);
          story.choose(id);
          const raw = storage.get(SAVE_KEY)!;
          expect(decodeSave(raw), stage + ' / ' + id).not.toBeNull();
          const before = decodeSave(raw)!;
          story = new FiveDayStory();
          expect(storage.get(SAVE_KEY)).toBe(raw);
          expect(story.stage).toBe(before.stage);
          expect(story.isProgressSaved).toBe(true);
          if (++steps > 400) throw new Error('Unbounded journey');
        }
      }
      expect([...visited]).toEqual([1, 2, 3, 4, 5]);
      expect(stages.size).toBeGreaterThanOrEqual(18);
      expect(story.progress.every((day) => day.status === 'completed')).toBe(true);
      const final = decodeSave(storage.get(SAVE_KEY)!)!;
      expect(final.flags).toEqual(expect.arrayContaining(scenario.expected));
      for (const absent of scenario.absent) expect(final.flags).not.toContain(absent);
      expect(story.open().text).toContain(scenario.summary);
      expect(
        final.flags.filter((flag) => /^final_reading_(station|roads|letters)$/.test(flag)),
      ).toHaveLength(final.flags.includes('final_reading_program_done') ? 1 : 0);
      expect(
        final.flags.filter((flag) => /^final_school_chairs_(time_agreed|space_kept)$/.test(flag)),
      ).toHaveLength(final.flags.includes('final_school_chairs_followup_done') ? 1 : 0);
      story.choose('__restart');
      const clean = decodeSave(storage.get(SAVE_KEY)!)!;
      expect(clean.stage).toBe('miller');
      expect(clean.flags).toEqual([]);
      story = new FiveDayStory();
      expect(story.day).toBe(1);
      expect(story.progress.filter((day) => day.status === 'completed')).toHaveLength(0);
      expect(story.open().text).not.toContain(scenario.summary);
    },
  );
});

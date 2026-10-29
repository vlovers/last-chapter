import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { seasonEnding } from '../src/game/endings';
import { SAVE_KEY, decodeSave, encodeSave } from '../src/game/save';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  },
});

afterEach(() => values.clear());

function loadFinale(flags: string[]) {
  values.set(
    SAVE_KEY,
    encodeSave({
      stage: 'day5-reading',
      dialogue: { node: 'gathering', flags, history: [] },
      flags,
    }),
  );
  const story = new FiveDayStory();
  expect(story.stage).toBe('day5-reading');
  for (let page = 0; page < 40; page++) {
    const choices = story.open().choices;
    expect(choices.length).toBeLessThanOrEqual(4);
    if (choices.some((option) => option.id === 'case-closure')) return story;
    expect(choices.some((option) => option.id === '__more_choices')).toBe(true);
    story.choose('__more_choices');
  }
  throw new Error('Case closure was not reachable from the finale menu');
}

describe('Phaser Lost Pages case conclusion', () => {
  it('plays the three-topic mystery resolution and keeps the consent outcome after reload', () => {
    const flags = [
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_ledger_iris_told',
      'final_miller_ledger_rumor_seeded',
      'final_miller_rumor_corrected_publicly',
    ];
    const story = loadFinale(flags);
    const entry = story.choose('case-closure');
    expect(entry.choices.map((option) => option.id)).toEqual([
      'case-topic-timeline',
      'case-topic-authors',
      'case-topic-people',
    ]);
    expect(entry.choices.length).toBeLessThanOrEqual(4);

    story.choose('case-topic-timeline');
    story.choose('case-timeline-letter');
    story.choose('case-letter-back');
    story.choose('case-topic-authors');
    story.choose('case-authors-mara');
    story.choose('case-mara-back');
    story.choose('case-topic-people');
    story.choose('case-people-rumor');
    const ready = story.choose('case-rumor-back');
    expect(ready.choices.map((option) => option.id)).toEqual(['case-topic-finish']);

    story.choose('case-topic-finish');
    story.choose('case-decision-iris');
    story.choose('case-iris-boundaries');
    story.choose('case-result-finish');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_case_closure_complete');
    expect(saved?.flags).toContain('final_case_iris_boundaries');
    expect(saved?.flags).toContain('final_miller_ledger_rumor_seeded');
    expect(seasonEnding({ flags: saved!.flags }).community).toContain('не почув виправлення');

    const restored = new FiveDayStory();
    expect(restored.stage).toBe('day5-reading');
    for (let page = 0; page < 40; page++) {
      const choices = restored.open().choices;
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(choices.some((option) => option.id === 'case-closure')).toBe(false);
      if (!choices.some((option) => option.id === '__more_choices')) break;
      restored.choose('__more_choices');
    }
  });

  it('does not let a private ledger become an Iris consultation in the game UI', () => {
    const story = loadFinale([
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_ledger_record_private',
    ]);
    story.choose('case-closure');
    story.choose('case-topic-timeline');
    story.choose('case-timeline-back');
    story.choose('case-topic-authors');
    story.choose('case-authors-back');
    story.choose('case-topic-people');
    story.choose('case-people-back');
    const decision = story.choose('case-topic-finish');
    expect(decision.choices.map((option) => option.id)).toEqual([
      'case-decision-seal',
      'case-decision-later',
    ]);
    story.choose('case-decision-seal');
    story.choose('case-result-finish');
    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_case_sealed');
    expect(saved?.flags).not.toContain('final_ledger_iris_told');
  });
});

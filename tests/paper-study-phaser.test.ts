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

function openFinale(flags: string[]) {
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
  return story;
}

function choosePaged(story: FiveDayStory, id: string) {
  for (let page = 0; page < 80; page++) {
    const choices = story.open().choices;
    expect(choices.length).toBeLessThanOrEqual(4);
    if (choices.some((choice) => choice.id === id)) return story.choose(id);
    expect(choices.some((choice) => choice.id === '__more_choices')).toBe(true);
    story.choose('__more_choices');
  }
  throw new Error(`Missing paginated option: ${id}`);
}

describe('Phaser: under-the-lamp manuscript study', () => {
  it('reconstructs the pages without assigning authorship and persists the private record', () => {
    const story = openFinale(['final_chapter_evidence_reviewed', 'final_ledger_scene_complete']);
    choosePaged(story, 'paper-study');
    story.choose('paper-study-edges');
    story.choose('paper-edges-back');
    story.choose('paper-study-ink');
    story.choose('paper-ink-back');
    story.choose('paper-study-voices');
    story.choose('paper-voices-back');
    story.choose('paper-study-conclude');
    story.choose('paper-decision-private');
    story.choose('paper-study-return');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_paper_study_done');
    expect(saved?.flags).toContain('final_paper_private_notes');
    expect(saved?.flags).not.toContain('final_paper_neutral_report');
    expect(saved?.flags).not.toContain('final_paper_iris_questions');
    expect(seasonEnding({ flags: saved!.flags }).epilogue).toContain('приватному конверті');

    const restored = new FiveDayStory();
    expect(restored.stage).toBe('day5-reading');
    for (let page = 0; page < 80; page++) {
      const choices = restored.open().choices;
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(choices.some((choice) => choice.id === 'paper-study')).toBe(false);
      if (!choices.some((choice) => choice.id === '__more_choices')) break;
      restored.choose('__more_choices');
    }
  });

  it('does not show the scene before both manuscript and ledger evidence exist', () => {
    const story = openFinale(['final_chapter_evidence_reviewed']);
    for (let page = 0; page < 80; page++) {
      const choices = story.open().choices;
      expect(choices.some((choice) => choice.id === 'paper-study')).toBe(false);
      if (!choices.some((choice) => choice.id === '__more_choices')) break;
      story.choose('__more_choices');
    }
  });
});

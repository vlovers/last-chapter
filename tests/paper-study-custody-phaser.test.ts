import { afterEach, describe, expect, it } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
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
  return new FiveDayStory();
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

describe('Phaser: manuscript custody after the fifth-day resolution', () => {
  it('blocks physical examination when Iris declines, including after save reload', () => {
    const story = openFinale([
      'final_chapter_evidence_reviewed',
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_provenance_iris_custody',
      'final_letter_breach_disclosed',
    ]);
    choosePaged(story, 'paper-study-permission');
    expect(story.open().choices.map((choice) => choice.id)).not.toContain('paper-permission-lend');
    story.choose('paper-permission-respect');
    story.choose('paper-permission-return');
    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_paper_study_access_declined');
    expect(saved?.flags).not.toContain('final_paper_study_done');
    const restored = new FiveDayStory();
    for (let page = 0; page < 80; page++) {
      const choices = restored.open().choices;
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(choices.some((choice) => choice.id === 'paper-study-permission')).toBe(false);
      expect(choices.some((choice) => choice.id === 'paper-study')).toBe(false);
      if (!choices.some((choice) => choice.id === '__more_choices')) break;
      restored.choose('__more_choices');
    }
  });

  it('retains Iris permission after reload in the middle of the examination', () => {
    const story = openFinale([
      'final_chapter_evidence_reviewed',
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_provenance_consent_archive',
    ]);
    choosePaged(story, 'paper-study-permission');
    story.choose('paper-permission-lend');
    expect(story.open().text).toContain('фотографій');
    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_paper_iris_lent_originals');
    const restored = new FiveDayStory();
    expect(restored.open().text).toContain('фотографій');
    restored.choose('paper-study-edges');
    restored.choose('paper-edges-back');
    expect(restored.open().choices.map((choice) => choice.id)).toContain('paper-study-ink');
  });
});

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

describe('Phaser: empty recipient field in Eleanor ledger', () => {
  it('persists a private dated annotation and does not unlock Iris', () => {
    const story = openFinale(['final_ledger_scene_complete', 'final_ledger_record_private']);
    choosePaged(story, 'ledger-gap');
    const first = story.open();
    expect(first.choices.map((option) => option.id)).not.toContain('ledger-gap-iris');
    story.choose('ledger-gap-check');
    story.choose('ledger-gap-check-thomas');
    story.choose('ledger-gap-thomas-back');
    story.choose('ledger-gap-eleanor');
    story.choose('ledger-gap-listen');
    story.choose('ledger-gap-decide');
    story.choose('ledger-gap-annotate');
    story.choose('ledger-gap-finish');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_ledger_gap_done');
    expect(saved?.flags).toContain('final_ledger_gap_annotated');
    expect(saved?.flags).not.toContain('final_ledger_gap_iris_copy');
    expect(seasonEnding({ flags: saved!.flags }).epilogue).toContain('датовану примітку');

    const restored = new FiveDayStory();
    expect(restored.stage).toBe('day5-reading');
    for (let page = 0; page < 80; page++) {
      const choices = restored.open().choices;
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(choices.some((option) => option.id === 'ledger-gap')).toBe(false);
      if (!choices.some((option) => option.id === '__more_choices')) break;
      restored.choose('__more_choices');
    }
  });

  it('allows Iris to take a private copy only after disclosure', () => {
    const story = openFinale(['final_ledger_scene_complete', 'final_ledger_iris_told']);
    choosePaged(story, 'ledger-gap');
    story.choose('ledger-gap-check');
    story.choose('ledger-gap-check-back');
    story.choose('ledger-gap-eleanor');
    story.choose('ledger-gap-press');
    story.choose('ledger-gap-iris');
    story.choose('ledger-gap-iris-back');
    story.choose('ledger-gap-decide');
    story.choose('ledger-gap-copy');
    story.choose('ledger-gap-finish');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_ledger_gap_iris_copy');
    expect(saved?.flags).toContain('final_ledger_gap_eleanor_pressed');
    expect(seasonEnding({ flags: saved!.flags }).epilogue).toContain('приватну копію');
  });
});

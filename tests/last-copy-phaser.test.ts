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

function findLastCopy(story: FiveDayStory) {
  for (let page = 0; page < 50; page++) {
    const choices = story.open().choices;
    expect(choices.length).toBeLessThanOrEqual(4);
    if (choices.some((choice) => choice.id === 'last-copy')) return;
    expect(choices.some((choice) => choice.id === '__more_choices')).toBe(true);
    story.choose('__more_choices');
  }
  throw new Error('Last-copy scene missing from Phaser finale menu');
}

function startAtFinale() {
  values.set(
    SAVE_KEY,
    encodeSave({
      stage: 'day5-reading',
      dialogue: { node: 'gathering', flags: [], history: [] },
      flags: [],
    }),
  );
  const story = new FiveDayStory();
  expect(story.stage).toBe('day5-reading');
  findLastCopy(story);
  return story;
}

describe('Phaser: last copy is a playable optional subplot', () => {
  it('keeps the promise-breaking outcome after save and reload', () => {
    const story = startAtFinale();
    const first = story.choose('last-copy');
    expect(first.choices.length).toBeLessThanOrEqual(4);
    expect(first.choices.map((choice) => choice.id)).not.toContain('last-copy-choose');

    story.choose('last-copy-ask-anna');
    story.choose('last-copy-anna-back');
    story.choose('last-copy-ask-miller');
    story.choose('last-copy-miller-back');
    const decision = story.choose('last-copy-choose');
    expect(decision.choices.map((choice) => choice.id)).not.toContain('last-copy-delay');
    story.choose('last-copy-break');
    story.choose('last-copy-break-return');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_last_copy_done');
    expect(saved?.flags).toContain('final_last_copy_promise_broken');
    expect(seasonEnding({ flags: saved!.flags }).epilogue).toContain('Анна залишилася без');

    const restored = new FiveDayStory();
    expect(restored.stage).toBe('day5-reading');
    for (let page = 0; page < 50; page++) {
      const choices = restored.open().choices;
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(choices.some((choice) => choice.id === 'last-copy')).toBe(false);
      if (!choices.some((choice) => choice.id === '__more_choices')) break;
      restored.choose('__more_choices');
    }
  });

  it('supports a consent-based delayed gift without changing the manuscript case', () => {
    const story = startAtFinale();
    story.choose('last-copy');
    story.choose('last-copy-ask-anna');
    story.choose('last-copy-anna-share');
    story.choose('last-copy-anna-loan-back');
    story.choose('last-copy-ask-miller');
    story.choose('last-copy-miller-child');
    story.choose('last-copy-miller-child-back');
    const decision = story.choose('last-copy-choose');
    expect(decision.choices.map((choice) => choice.id)).toContain('last-copy-delay');
    story.choose('last-copy-delay');
    story.choose('last-copy-delay-return');

    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved?.flags).toContain('final_last_copy_delayed_gift');
    expect(saved?.flags).not.toContain('final_last_copy_promise_broken');
    expect(saved?.flags).not.toContain('final_ledger_iris_told');
    expect(saved?.flags).not.toContain('final_case_closure_complete');
  });
});

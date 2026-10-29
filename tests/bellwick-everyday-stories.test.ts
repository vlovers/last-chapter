import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { noraVisit } from '../src/content/nora';
import { selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Bellwick everyday stories', () => {
  it('keeps both new conversations linked', () => {
    expect(validateDialogue(annaVisit)).toEqual([]);
    expect(validateDialogue(noraVisit)).toEqual([]);
  });
  it('plays all three school theater endings', () => {
    for (const [choice, back, flag] of [
      ['anna-theater-parents', 'anna-theater-parents-back', 'anna_school_theater_parents_heard'],
      ['anna-theater-hero', 'anna-theater-hero-back', 'anna_school_theater_hero_heard'],
      ['anna-theater-mess', 'anna-theater-mess-back', 'anna_school_theater_ending_heard'],
    ] as const) {
      let state = startDialogue(annaVisit);
      for (const id of ['hello', 'anna-school-theater', choice, back]) state = selectOption(annaVisit, state, id);
      expect(state.node).toBe('hello');
      expect(state.flags).toContain(flag);
    }
  });
  it('plays all three umbrella mysteries without requiring a rumor', () => {
    for (const [choice, back, flag] of [
      ['nora-umbrella-label', 'nora-umbrella-label-back', 'nora_umbrella_label_story_heard'],
      ['nora-umbrella-exhibit', 'nora-umbrella-exhibit-back', 'nora_umbrella_exhibit_heard'],
      ['nora-umbrella-mystery', 'nora-umbrella-mystery-back', 'nora_umbrella_mystery_joked'],
    ] as const) {
      let state = startDialogue(noraVisit);
      for (const id of ['hello', 'nora-lost-umbrella', choice, back]) state = selectOption(noraVisit, state, id);
      expect(state.node).toBe('hello');
      expect(state.flags).toContain(flag);
    }
  });
});

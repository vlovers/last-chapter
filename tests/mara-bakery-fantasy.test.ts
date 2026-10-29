import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

const enterTopics = () => {
  let state = startDialogue(maraVisit);
  for (const id of ['greet', 'thank', 'talk']) {
    state = selectOption(maraVisit, state, id);
  }
  return state;
};

describe('Mara bakery rivalry and fantasy arguments', () => {
  it('keeps all new dialogue destinations valid', () => {
    expect(validateDialogue(maraVisit)).toEqual([]);
  });
  it('offers distinct consequences for bakery gossip', () => {
    for (const [choice, back, flag] of [
      ['mara-competition-gossip', 'mara-competition-gossip-back', 'mara_bakery_rivalry_secret_kept'],
      ['mara-competition-kind', 'mara-competition-kind-back', 'mara_bakery_rivalry_softened'],
      ['mara-competition-test', 'mara-competition-test-back', 'mara_bakery_rivalry_joked'],
    ] as const) {
      const scene = selectOption(maraVisit, enterTopics(), 'mara-bakery-competition');
      const reply = selectOption(maraVisit, scene, choice);
      const backState = selectOption(maraVisit, reply, back);
      expect(backState.node).toBe('topics');
      expect(backState.flags).toContain(flag);
    }
  });
  it('allows three independent opinions about the fantasy couple', () => {
    for (const [choice, back, flag] of [
      ['mara-couples-captain', 'mara-couples-captain-back', 'mara_fantasy_captain_supported'],
      ['mara-couples-traveler', 'mara-couples-traveler-back', 'mara_fantasy_traveler_supported'],
      ['mara-couples-heroine', 'mara-couples-heroine-back', 'mara_fantasy_independence_discussed'],
    ] as const) {
      const scene = selectOption(maraVisit, enterTopics(), 'mara-fantasy-couples');
      const reply = selectOption(maraVisit, scene, choice);
      const backState = selectOption(maraVisit, reply, back);
      expect(backState.node).toBe('topics');
      expect(backState.flags).toContain(flag);
    }
  });
});

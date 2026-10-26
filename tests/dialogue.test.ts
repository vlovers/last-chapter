import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { millerVisit } from '../src/content/first-day';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';

describe('Ukrainian dialogue slice', () => {
  it('has a valid, fully linked authored graph', () => {
    expect(validateDialogue(millerVisit)).toEqual([]);
  });

  it('allows customers to buy a book without hearing gossip', () => {
    let state = startDialogue(millerVisit);
    for (const choice of ['greet', 'books', 'orchard', 'leave-orchard']) {
      state = selectOption(millerVisit, state, choice);
    }
    expect(currentNode(millerVisit, state).id).toBe('end');
    expect(state.flags).toContain('sold_orchard');
    expect(state.flags).not.toContain('rumor_heard');
  });

  it('records a rumor as a rumor and allows challenging it', () => {
    let state = startDialogue(millerVisit);
    for (const choice of ['greet', 'town', 'gossip', 'what-saw', 'challenge']) {
      state = selectOption(millerVisit, state, choice);
    }
    expect(state.flags).toContain('rumor_heard');
    expect(state.flags).toContain('rumor_challenged');
    expect(currentNode(millerVisit, state).id).toBe('boundary');
  });


  it('distinguishes listening from amplifying a rumor', () => {
    let heard = startDialogue(millerVisit);
    for (const choice of ['greet', 'town', 'gossip', 'what-saw', 'acknowledge']) {
      heard = selectOption(millerVisit, heard, choice);
    }
    expect(heard.flags).toContain('rumor_heard');
    expect(heard.flags).not.toContain('rumor_amplified');

    let amplified = startDialogue(millerVisit);
    for (const choice of ['greet', 'town', 'gossip', 'what-saw', 'speculate']) {
      amplified = selectOption(millerVisit, amplified, choice);
    }
    expect(amplified.flags).toContain('rumor_amplified');
    amplified = selectOption(millerVisit, amplified, 'speculation-reconsider');
    expect(amplified.flags).toContain('rumor_amplification_reconsidered');
  });

  it('only offers Thomas a personal apology after the player amplified gossip', () => {
    let neutral = { ...startDialogue(thomasVisit), flags: ['rumor_heard'] };
    for (const choice of ['greet', 'rumor']) neutral = selectOption(thomasVisit, neutral, choice);
    expect(availableOptions(thomasVisit, neutral).map((option) => option.id)).not.toContain('rumor-own-words');

    let amplified = { ...startDialogue(thomasVisit), flags: ['rumor_heard', 'rumor_amplified'] };
    for (const choice of ['greet', 'rumor']) amplified = selectOption(thomasVisit, amplified, choice);
    expect(availableOptions(thomasVisit, amplified).map((option) => option.id)).toContain('rumor-own-words');
    amplified = selectOption(thomasVisit, amplified, 'rumor-own-words');
    expect(amplified.flags).toContain('thomas_heard_rumor_apology');
  });

  it('lets Anna respond to an admission without blocking her book order', () => {
    let state = { ...startDialogue(annaVisit), flags: ['rumor_heard', 'rumor_amplified'] };
    for (const choice of ['hello', 'rumor', 'rumor-own-amplification', 'rumor-own-amplification-books', 'maps', 'purchase-end']) {
      state = selectOption(annaVisit, state, choice);
    }
    expect(state.flags).toContain('anna_heard_rumor_admission');
    expect(state.flags).toContain('anna_chose_maps');
    expect(currentNode(annaVisit, state).id).toBe('end');
  });

  it('rejects options that are unavailable at the current node', () => {
    expect(() => selectOption(millerVisit, startDialogue(millerVisit), 'orchard')).toThrow();
  });

  it('uses Ukrainian prose and dialogue choices', () => {
    expect(currentNode(millerVisit, startDialogue(millerVisit)).text).toContain('Дзвіночок');
    expect(availableOptions(millerVisit, startDialogue(millerVisit))).toHaveLength(1);
  });
});

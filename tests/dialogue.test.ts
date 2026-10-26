import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
  validateDialogue,
} from '../src/game/dialogue';
import { millerVisit } from '../src/content/first-day';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { finalReading } from '../src/content/day-five';

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
    let neutral: DialogueState = { ...startDialogue(thomasVisit), flags: ['rumor_heard'] };
    for (const choice of ['greet', 'rumor']) neutral = selectOption(thomasVisit, neutral, choice);
    expect(availableOptions(thomasVisit, neutral).map((option) => option.id)).not.toContain(
      'rumor-own-words',
    );

    let amplified: DialogueState = {
      ...startDialogue(thomasVisit),
      flags: ['rumor_heard', 'rumor_amplified'],
    };
    for (const choice of ['greet', 'rumor'])
      amplified = selectOption(thomasVisit, amplified, choice);
    expect(availableOptions(thomasVisit, amplified).map((option) => option.id)).toContain(
      'rumor-own-words',
    );
    amplified = selectOption(thomasVisit, amplified, 'rumor-own-words');
    expect(amplified.flags).toContain('thomas_heard_rumor_apology');
  });

  it('lets Anna respond to an admission without blocking her book order', () => {
    let state: DialogueState = {
      ...startDialogue(annaVisit),
      flags: ['rumor_heard', 'rumor_amplified'],
    };
    for (const choice of [
      'hello',
      'rumor',
      'rumor-own-amplification',
      'rumor-own-amplification-books',
      'maps',
      'purchase-end',
    ]) {
      state = selectOption(annaVisit, state, choice);
    }
    expect(state.flags).toContain('anna_heard_rumor_admission');
    expect(state.flags).toContain('anna_chose_maps');
    expect(currentNode(annaVisit, state).id).toBe('end');
  });

  it('keeps the final gathering valid and closable with or without rumors', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    let neutral = startDialogue(finalReading);
    neutral = selectOption(finalReading, neutral, 'open');
    const neutralChoices = availableOptions(finalReading, neutral).map((o) => o.id);
    expect(neutralChoices).not.toContain('rumor-player-accountability');
    expect(neutralChoices).toContain('close');

    let amplified: DialogueState = {
      ...startDialogue(finalReading),
      flags: ['rumor_heard', 'rumor_amplified'],
    };
    amplified = selectOption(finalReading, amplified, 'open');
    const choices = availableOptions(finalReading, amplified).map((o) => o.id);
    expect(choices).toContain('rumor-player-accountability');
    expect(choices).toContain('rumor-miller-followup');
    expect(choices).toContain('close');
  });

  it('supports day-five accountability without forced forgiveness or a blocked ending', () => {
    let state: DialogueState = {
      ...startDialogue(finalReading),
      flags: ['rumor_heard', 'rumor_amplified'],
    };
    for (const choice of [
      'open',
      'rumor-player-accountability',
      'rumor-own-public',
      'rumor-player-own-return',
    ]) {
      state = selectOption(finalReading, state, choice);
    }
    expect(state.flags).toContain('final_player_rumor_owned');
    expect(state.flags).toContain('final_player_rumor_accountability');
    expect(availableOptions(finalReading, state).map((o) => o.id)).toContain('close');
  });

  it('lets Miller discuss an unidentified sighting without involving the couple', () => {
    let state: DialogueState = {
      ...startDialogue(finalReading),
      flags: ['rumor_heard', 'rumor_challenged'],
    };
    for (const choice of [
      'open',
      'rumor-miller-followup',
      'rumor-miller-listen',
      'rumor-miller-answer-return',
    ]) {
      state = selectOption(finalReading, state, choice);
    }
    expect(state.flags).toContain('final_miller_private_followup');
    expect(availableOptions(finalReading, state).map((o) => o.id)).toContain('close');
  });

  it('rejects options that are unavailable at the current node', () => {
    expect(() => selectOption(millerVisit, startDialogue(millerVisit), 'orchard')).toThrow();
  });

  it('uses Ukrainian prose and dialogue choices', () => {
    expect(currentNode(millerVisit, startDialogue(millerVisit)).text).toContain('Дзвіночок');
    expect(availableOptions(millerVisit, startDialogue(millerVisit))).toHaveLength(1);
  });
});

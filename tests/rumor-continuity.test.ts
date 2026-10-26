import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';
import { millerVisit } from '../src/content/first-day';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { finalReading } from '../src/content/day-five';

function walk(story: DialogueStory, ids: readonly string[], flags: readonly string[] = []) {
  let state: DialogueState = { ...startDialogue(story), flags };
  for (const id of ids) state = selectOption(story, state, id);
  return state;
}

function ids(story: DialogueStory, state: DialogueState) {
  return availableOptions(story, state).map((option) => option.id);
}

describe('Five-day rumor continuity: route matrix', () => {
  it.each([
    ['no gossip', ['greet', 'books', 'orchard', 'leave-orchard'], false, false],
    ['only heard', ['greet', 'town', 'gossip', 'what-saw', 'acknowledge'], true, false],
    ['challenged', ['greet', 'town', 'gossip', 'what-saw', 'challenge'], true, false],
    ['amplified', ['greet', 'town', 'gossip', 'what-saw', 'speculate'], true, true],
    [
      'reconsidered',
      ['greet', 'town', 'gossip', 'what-saw', 'speculate', 'speculation-reconsider'],
      true,
      true,
    ],
  ] as const)('%s: does not confuse hearing and amplification', (_name, path, heard, amplified) => {
    const state = walk(millerVisit, path);
    expect(state.flags.includes('rumor_heard')).toBe(heard);
    expect(state.flags.includes('rumor_amplified')).toBe(amplified);
  });

  it.each([
    ['heard', ['rumor_heard'], false],
    ['challenged', ['rumor_heard', 'rumor_challenged'], false],
    ['amplified', ['rumor_heard', 'rumor_amplified'], true],
    ['reconsidered', ['rumor_heard', 'rumor_amplified', 'rumor_amplification_reconsidered'], true],
  ] as const)(
    '%s: Anna only receives the personal admission choice when appropriate',
    (_name, flags, enabled) => {
      const state = walk(annaVisit, ['hello', 'rumor'], flags);
      expect(ids(annaVisit, state).includes('rumor-own-amplification')).toBe(enabled);
    },
  );

  it('Anna still sells either book after the player owns their rumor', () => {
    for (const [book, flag] of [
      ['maps', 'anna_chose_maps'],
      ['mystery', 'anna_chose_mystery'],
    ] as const) {
      const state = walk(
        annaVisit,
        [
          'hello',
          'rumor',
          'rumor-own-amplification',
          'rumor-own-amplification-books',
          book,
          'purchase-end',
        ],
        ['rumor_heard', 'rumor_amplified'],
      );
      expect(state.flags).toContain('anna_heard_rumor_admission');
      expect(state.flags).toContain(flag);
      expect(currentNode(annaVisit, state).id).toBe('end');
    }
  });

  it.each([
    ['only heard', ['rumor_heard'], false],
    ['challenged', ['rumor_heard', 'rumor_challenged'], false],
    ['amplified', ['rumor_heard', 'rumor_amplified'], true],
    ['already apologized', ['rumor_heard', 'rumor_amplified', 'thomas_heard_rumor_apology'], false],
  ] as const)('%s: Thomas apology has precise conditions', (_name, flags, enabled) => {
    const state = walk(thomasVisit, ['greet', 'rumor'], flags);
    expect(ids(thomasVisit, state).includes('rumor-own-words')).toBe(enabled);
  });

  it('Nora never grants an identity or a letter delivery by discussing gossip', () => {
    const state = walk(
      noraVisit,
      ['hello', 'rumor', 'rumor-respect'],
      ['rumor_heard', 'rumor_amplified'],
    );
    expect(state.flags).toContain('nora_confidentiality_respected');
    expect(state.flags).not.toContain('iris_private_delivery_consent');
    expect(state.flags).not.toContain('thomas_nora_affair_proven');
  });

  it.each([
    ['without rumor', [], false, false],
    ['heard only', ['rumor_heard'], false, true],
    ['challenged', ['rumor_heard', 'rumor_challenged'], false, true],
    ['amplified', ['rumor_heard', 'rumor_amplified'], true, true],
  ] as const)('%s: final choices are optional', (_name, flags, accountability, miller) => {
    const state = walk(finalReading, ['open'], flags);
    expect(ids(finalReading, state).includes('rumor-player-accountability')).toBe(accountability);
    expect(ids(finalReading, state).includes('rumor-miller-followup')).toBe(miller);
    expect(ids(finalReading, state)).toContain('close');
  });

  it.each([
    [
      'admit publicly',
      ['rumor-player-accountability', 'rumor-own-public', 'rumor-player-own-return'],
    ],
    [
      'respect their boundary',
      ['rumor-player-accountability', 'rumor-ask-boundary', 'rumor-player-boundary-return'],
    ],
    ['do not interrupt', ['rumor-player-accountability', 'rumor-player-step-away']],
  ] as const)('%s: every accountability path returns to the final gathering', (_name, route) => {
    const state = walk(finalReading, ['open', ...route], ['rumor_heard', 'rumor_amplified']);
    expect(currentNode(finalReading, state).id).toBe('gathering');
    expect(state.flags).toContain('final_player_rumor_accountability');
    expect(ids(finalReading, state)).toContain('close');
  });

  it.each([
    [
      'ask what happens next',
      ['rumor-miller-followup', 'rumor-miller-listen', 'rumor-miller-answer-return'],
    ],
    [
      'discuss books instead',
      ['rumor-miller-followup', 'rumor-miller-candy', 'rumor-miller-books-return'],
    ],
  ] as const)('%s: Miller follow-up returns to the final gathering', (_name, route) => {
    const state = walk(finalReading, ['open', ...route], ['rumor_heard']);
    expect(state.flags).toContain('final_miller_private_followup');
    expect(ids(finalReading, state)).toContain('close');
  });

  it('does not show a repeated personal accountability topic after completion', () => {
    const state = walk(
      finalReading,
      ['open', 'rumor-player-accountability', 'rumor-own-public', 'rumor-player-own-return'],
      ['rumor_heard', 'rumor_amplified'],
    );
    expect(ids(finalReading, state)).not.toContain('rumor-player-accountability');
  });

  it('keeps every modified dialogue graph structurally valid', () => {
    for (const story of [millerVisit, annaVisit, thomasVisit, noraVisit, finalReading]) {
      expect(validateDialogue(story)).toEqual([]);
    }
  });
});

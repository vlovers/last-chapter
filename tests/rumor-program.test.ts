import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const eligible = [
  'final_case_closure_complete',
  'final_ledger_iris_told',
  'final_miller_ledger_rumor_seeded',
];

describe('false printed finale: a consequence-driven rumor scene', () => {
  it.each([
    [
      'rumor-correct-card',
      'rumor-corrected-finish',
      'final_rumor_program_corrected',
      'коротке виправлення',
    ],
    [
      'rumor-remove-stack',
      'rumor-withdrawn-finish',
      'final_rumor_program_withdrawn',
      'нероздані програмки',
    ],
    [
      'rumor-miller-speaks',
      'rumor-miller-corrects-finish',
      'final_rumor_program_miller_spoke',
      'визнала власну помилку',
    ],
    [
      'rumor-ignore-stack',
      'rumor-unchecked-finish',
      'final_rumor_program_unchecked',
      'чутка отримала ще кілька',
    ],
  ])('plays the %s route and persists its epilogue', (choice, finish, flag, expected) => {
    let state = { ...startDialogue(finalReading), node: 'gathering', flags: eligible };
    for (const id of [
      'rumor-program',
      'rumor-decide-direct',
      choice,
      finish,
      'rumor-finish-back',
    ]) {
      expect(
        availableOptions(finalReading, state).map((option) => option.id),
        id,
      ).toContain(id);
      state = selectOption(finalReading, state, id);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(flag);
    expect(state.flags).toContain('final_rumor_program_done');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(expected);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'rumor-program',
    );
  });

  it('does not reveal ledger facts to Iris or revive a scene after she declined', () => {
    for (const flags of [
      [],
      ['final_case_closure_complete', 'final_miller_ledger_rumor_seeded'],
      [...eligible, 'final_case_iris_declined'],
      [...eligible, 'final_rumor_program_done'],
    ]) {
      const state = { ...startDialogue(finalReading), node: 'gathering', flags };
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'rumor-program',
      );
    }
  });

  it('lets Iris refuse to speak for the bookstore after a letter breach', () => {
    let state = {
      ...startDialogue(finalReading),
      node: 'gathering',
      flags: [...eligible, 'final_letter_breach_disclosed'],
    };
    for (const id of ['rumor-program', 'rumor-ask-iris', 'rumor-iris-space']) {
      expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(id);
      state = selectOption(finalReading, state, id);
    }
    expect(state.flags).toContain('final_rumor_iris_space');
    expect(state.node).toBe('rumor-decision');
  });

  it('caps each new node at four authored options', () => {
    for (const node of finalReading.nodes.filter((node) => node.id.startsWith('rumor-'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
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
    let state: DialogueState = { ...startDialogue(finalReading), node: 'gathering', flags: eligible };
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
    let state: DialogueState = {
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

  it.each([
    [
      'a financial dispute that leads Nora to separate facts from headlines',
      [
        'rumor-program',
        'rumor-ask-miller',
        'rumor-miller-money',
        'rumor-money-nora',
        'rumor-nora-why',
        'rumor-nora-questions-back',
        'rumor-correct-card',
        'rumor-corrected-finish',
        'rumor-finish-back',
      ],
    ],
    [
      'a personal confrontation that lets Iris set her own boundary',
      [
        'rumor-program',
        'rumor-ask-miller',
        'rumor-miller-people',
        'rumor-people-iris',
        'rumor-iris-respect',
        'rumor-remove-stack',
        'rumor-withdrawn-finish',
        'rumor-finish-back',
      ],
    ],
  ])('plays %s and survives save restoration', (_name, route) => {
    let state: DialogueState = { ...startDialogue(finalReading), node: 'gathering', flags: eligible };
    for (const id of route) {
      expect(
        availableOptions(finalReading, state).map((option) => option.id),
        id,
      ).toContain(id);
      state = JSON.parse(JSON.stringify(selectOption(finalReading, state, id)));
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_rumor_program_done');
  });

  it('acknowledges an earlier spoken correction without claiming trust was restored', () => {
    const state = {
      ...startDialogue(finalReading),
      node: 'rumor-program',
      flags: [...eligible, 'final_miller_rumor_corrected_publicly'],
    };
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('вже виправили це вголос');
    expect(text).toContain('старим заголовком');
  });

  it('keeps the printed correction independent of the private manuscript', () => {
    const state = { ...startDialogue(finalReading), node: 'rumor-corrected', flags: eligible };
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('ОСТАННЮ СТОРІНКУ НЕ ЗНАЙДЕНО');
    expect(text).not.toContain('коробка');
    expect(text).not.toContain('Айріс');
    expect(text).not.toContain('автор');
  });

  it('caps each new node at four authored options', () => {
    for (const node of finalReading.nodes.filter((node) => node.id.startsWith('rumor-'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

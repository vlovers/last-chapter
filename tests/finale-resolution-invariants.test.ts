import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';

const exclusiveOutcomes = [
  ['final_respected_privacy', 'final_repaired_rumor'],
  ['final_supported_iris', 'final_iris_exhibition'],
  ['final_mutual_conversation', 'final_accepted_consequences', 'final_letter_kept_private'],
] as const;

describe('Final gathering narrative invariants', () => {
  it('hides every resolved choice when loading a completed scene', () => {
    for (const [flags, hidden] of [
      [['final_respected_privacy'], 'rumor'],
      [['final_repaired_rumor'], 'rumor'],
      [['final_supported_iris'], 'iris'],
      [['final_iris_exhibition'], 'iris'],
      [['final_mutual_conversation', 'saw_envelope'], 'letter'],
      [['final_accepted_consequences', 'saw_envelope'], 'letter'],
      [['final_letter_kept_private', 'saw_envelope'], 'letter'],
    ] as const) {
      let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
      state = { ...state, flags };
      expect(availableOptions(finalReading, state).some((option) => option.id === hidden)).toBe(
        false,
      );
    }
  });

  it('does not grant contradictory flags during any of the resolved endings', () => {
    const routes = [
      ['rumor', 'rumor-respect'],
      ['rumor', 'rumor-apology'],
      ['iris', 'iris-choice'],
      ['iris', 'iris-exhibit', 'exhibit-back'],
      ['letter', 'mutual', 'mutual-back'],
      ['letter', 'repair-trust', 'repair-trust-back'],
      ['letter', 'wait', 'wait-back'],
    ];
    for (const route of routes) {
      let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
      state = {
        ...state,
        flags: [
          'saw_envelope',
          'iris_offered_exhibition',
          'iris_letter_choice_respected',
          'leo_open_to_conversation',
          'iris_letter_breach_admitted',
        ],
      };
      for (const option of route) state = selectOption(finalReading, state, option);
      expect(state.node).toBe('gathering');
      for (const group of exclusiveOutcomes) {
        expect(group.filter((flag) => state.flags.includes(flag)).length).toBeLessThanOrEqual(1);
      }
    }
  });
});

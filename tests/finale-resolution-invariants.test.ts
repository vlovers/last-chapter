import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const exclusiveOutcomes = [
  ['final_respected_privacy', 'final_repaired_rumor'],
  ['final_supported_iris', 'final_iris_exhibition'],
  ['final_mutual_conversation', 'final_accepted_consequences', 'final_letter_kept_private'],
] as const;

// Each route starts with a coherent set of decisions from earlier days.
// In particular, admitting a broken seal must not be combined with the
// intact-letter consent needed for the private meeting.
const resolvedRoutes = [
  {
    name: 'stop the rumor',
    flags: [],
    choices: ['rumor', 'rumor-respect', 'rumor-respect-back'],
    outcome: 'final_respected_privacy',
    hubChoice: 'rumor',
  },
  {
    name: 'correct the rumor',
    flags: [],
    choices: ['rumor', 'rumor-apology', 'rumor-apology-back'],
    outcome: 'final_repaired_rumor',
    hubChoice: 'rumor',
  },
  {
    name: 'support Iris without an exhibition',
    flags: [],
    choices: ['iris', 'iris-choice'],
    outcome: 'final_supported_iris',
    hubChoice: 'iris',
  },
  {
    name: 'hold an exhibition with Iris permission',
    flags: ['iris_offered_exhibition'],
    choices: ['iris', 'iris-exhibit', 'exhibit-back'],
    outcome: 'final_iris_exhibition',
    hubChoice: 'iris',
  },
  {
    name: 'arrange a consensual private conversation',
    flags: ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'],
    choices: ['letter', 'mutual', 'mutual-back'],
    outcome: 'final_mutual_conversation',
    hubChoice: 'letter',
  },
  {
    name: 'accept consequences after admitting the breach',
    flags: ['saw_envelope', 'opened_private_letter', 'iris_letter_breach_admitted'],
    choices: ['letter', 'repair-trust', 'repair-trust-back'],
    outcome: 'final_accepted_consequences',
    hubChoice: 'letter',
  },
  {
    name: 'disclose the breach at the gathering',
    flags: ['saw_envelope', 'opened_private_letter'],
    choices: ['letter', 'admit-breach-now', 'admit-breach-now-back'],
    outcome: 'final_accepted_consequences',
    hubChoice: 'letter',
  },
  {
    name: 'leave the letter private after Iris refused',
    flags: ['saw_envelope', 'iris_letter_pressured_day4'],
    choices: ['letter', 'wait', 'wait-back'],
    outcome: 'final_letter_kept_private',
    hubChoice: 'letter',
  },
] as const;

function gatheringWithFlags(flags: readonly string[]): DialogueState {
  const gathering = selectOption(finalReading, startDialogue(finalReading), 'open');
  return { ...gathering, flags: [...flags] };
}

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
      const state = gatheringWithFlags(flags);
      expect(availableOptions(finalReading, state).some((option) => option.id === hidden)).toBe(
        false,
      );
    }
  });

  for (const route of resolvedRoutes) {
    it(`resolves ${route.name} once without contradictory flags`, () => {
      let state = gatheringWithFlags(route.flags);
      for (const choice of route.choices) {
        const available = availableOptions(finalReading, state).map((option) => option.id);
        expect(available, `${route.name}: ${choice} at ${state.node}`).toContain(choice);
        state = selectOption(finalReading, state, choice);
      }

      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(route.outcome);
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        route.hubChoice,
      );
      for (const group of exclusiveOutcomes) {
        expect(group.filter((flag) => state.flags.includes(flag)).length).toBeLessThanOrEqual(1);
      }

      const restored = decodeSave(
        encodeSave({ stage: 'day5-reading', dialogue: state, flags: [...state.flags] }),
      );
      expect(restored).not.toBeNull();
      expect(
        availableOptions(finalReading, restored!.dialogue).map((option) => option.id),
      ).not.toContain(route.hubChoice);
    });
  }

  it('rejects a private meeting in a legacy save when consent was revoked', () => {
    const state = gatheringWithFlags([
      'saw_envelope',
      'iris_letter_choice_respected',
      'leo_open_to_conversation',
      'iris_letter_pressured_day4',
    ]);
    const letter = selectOption(finalReading, state, 'letter');
    const options = availableOptions(finalReading, letter).map((option) => option.id);
    expect(options).not.toContain('mutual');
    expect(options).toContain('wait');
    expect(options.length).toBeLessThanOrEqual(4);
    expect(() => selectOption(finalReading, letter, 'mutual')).toThrow('Option unavailable');
  });

  it('does not reopen an admitted breach after Iris asked to stop discussing the letter', () => {
    const letter = selectOption(
      finalReading,
      gatheringWithFlags([
        'saw_envelope',
        'opened_private_letter',
        'iris_letter_breach_admitted',
        'iris_letter_pressured_day4',
      ]),
      'letter',
    );
    const options = availableOptions(finalReading, letter).map((option) => option.id);
    expect(options).not.toContain('repair-trust');
    expect(options).not.toContain('mutual');
    expect(options).toContain('wait');
    expect(() => selectOption(finalReading, letter, 'repair-trust')).toThrow('Option unavailable');

    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: letter, flags: [...letter.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(
      availableOptions(finalReading, restored!.dialogue).map((option) => option.id),
    ).not.toContain('repair-trust');
    const waiting = selectOption(finalReading, restored!.dialogue, 'wait');
    const returned = selectOption(finalReading, waiting, 'wait-back');
    expect(returned.flags).toContain('final_letter_kept_private');
    expect(returned.flags).not.toContain('final_accepted_consequences');
  });

  it('never offers more than four letter choices across the consent and breach matrix', () => {
    const flags = [
      'iris_letter_choice_respected',
      'leo_open_to_conversation',
      'iris_letter_pressured_day4',
      'opened_private_letter',
      'iris_letter_breach_admitted',
      'leo_letter_pressured_day4',
    ];
    for (let mask = 0; mask < 1 << flags.length; mask += 1) {
      const active = flags.filter((_, index) => (mask & (1 << index)) !== 0);
      const letter = selectOption(
        finalReading,
        gatheringWithFlags(['saw_envelope', ...active]),
        'letter',
      );
      const options = availableOptions(finalReading, letter).map((option) => option.id);
      expect(options.length, `mask ${mask}: ${options.join(', ')}`).toBeLessThanOrEqual(4);
      expect(options.includes('repair-trust')).toBe(
        active.includes('iris_letter_breach_admitted') &&
          !active.includes('iris_letter_pressured_day4'),
      );
      const waiting = selectOption(finalReading, letter, 'wait');
      const returned = selectOption(finalReading, waiting, 'wait-back');
      expect(returned.flags).toContain('final_letter_kept_private');
      expect(returned.flags).not.toContain('final_mutual_conversation');
      expect(returned.flags).not.toContain('final_accepted_consequences');
      if (
        active.includes('opened_private_letter') ||
        active.includes('iris_letter_pressured_day4') ||
        active.includes('leo_letter_pressured_day4')
      ) {
        expect(options).not.toContain('mutual');
      }
    }
  });
});

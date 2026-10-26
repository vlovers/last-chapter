import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  type DialogueState,
} from '../src/game/dialogue';

function state(flags: readonly string[]): DialogueState {
  return { node: 'gathering', flags, history: [] };
}

describe('Final letter story routes', () => {
  it('does not offer the old letter without evidence that it was found', () => {
    expect(availableOptions(finalReading, state([])).some((option) => option.id === 'letter')).toBe(
      false,
    );
  });

  it('allows a privacy-respecting player to leave the letter with Iris', () => {
    const entered = selectOption(finalReading, state(['saw_envelope']), 'letter');
    expect(entered.node).toBe('letter');
    const options = availableOptions(finalReading, entered);
    expect(options.some((option) => option.id === 'mutual')).toBe(false);
    expect(options.some((option) => option.id === 'repair-trust')).toBe(false);
    expect(options.some((option) => option.id === 'wait')).toBe(true);
    const waiting = selectOption(finalReading, entered, 'wait');
    const exit = currentNode(finalReading, waiting).options.find(
      (option) => option.next === 'gathering',
    );
    expect(exit).toBeDefined();
    const finished = selectOption(finalReading, waiting, exit!.id);
    expect(finished.node).toBe('gathering');
    expect(availableOptions(finalReading, finished).some((option) => option.id === 'letter')).toBe(
      false,
    );
  });

  it('opens a mutual conversation only with both prerequisites', () => {
    const both = ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'];
    const entered = selectOption(finalReading, state(both), 'letter');
    expect(availableOptions(finalReading, entered).some((option) => option.id === 'mutual')).toBe(
      true,
    );
    for (const missing of ['iris_letter_choice_respected', 'leo_open_to_conversation']) {
      const reduced = both.filter((flag) => flag !== missing);
      const letter = selectOption(finalReading, state(reduced), 'letter');
      expect(availableOptions(finalReading, letter).some((option) => option.id === 'mutual')).toBe(
        false,
      );
    }
    const discussion = selectOption(finalReading, entered, 'mutual');
    const returnOption = currentNode(finalReading, discussion).options.find(
      (option) => option.next === 'gathering',
    );
    expect(returnOption).toBeDefined();
    const completed = selectOption(finalReading, discussion, returnOption!.id);
    expect(completed.flags).toContain('final_mutual_conversation');
    expect(availableOptions(finalReading, completed).some((option) => option.id === 'letter')).toBe(
      false,
    );
  });

  it('offers acknowledgement of breached trust only after admitting the breach', () => {
    const flags = ['saw_envelope', 'opened_private_letter', 'iris_letter_breach_admitted'];
    const entered = selectOption(finalReading, state(flags), 'letter');
    expect(
      availableOptions(finalReading, entered).some((option) => option.id === 'repair-trust'),
    ).toBe(true);
    const repaired = selectOption(finalReading, entered, 'repair-trust');
    const returnOption = currentNode(finalReading, repaired).options.find(
      (option) => option.next === 'gathering',
    );
    expect(returnOption).toBeDefined();
    const completed = selectOption(finalReading, repaired, returnOption!.id);
    expect(completed.flags).toContain('final_accepted_consequences');
    expect(availableOptions(finalReading, completed).some((option) => option.id === 'letter')).toBe(
      false,
    );
  });
});

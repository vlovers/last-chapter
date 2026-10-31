import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';

const gather = () => selectOption(finalReading, startDialogue(finalReading), 'open');

describe('Day-five human-scale conversations', () => {
  it('keeps the three bookseller reflections playable and independently recorded', () => {
    const routes = [
      ['bookseller-truth', 'bookseller-truth-back', 'bookseller_values_consent', 'Томас'],
      ['bookseller-care', 'bookseller-care-back', 'bookseller_values_agency', 'Мара'],
      ['bookseller-change', 'bookseller-change-back', 'bookseller_values_change', 'Елеонора'],
    ] as const;
    for (const [choice, back, flag, character] of routes) {
      const start = selectOption(finalReading, gather(), 'bookseller-reflection');
      const chosen = selectOption(finalReading, start, choice);
      expect(currentNode(finalReading, chosen).text).toContain(character);
      expect(currentNode(finalReading, chosen).text.length).toBeGreaterThan(300);
      const returned = selectOption(finalReading, chosen, back);
      expect(returned.node).toBe('gathering');
      expect(returned.flags).toContain(flag);
      expect(returned.flags).toContain('final_bookseller_reflection_heard');
      expect(availableOptions(finalReading, returned).map((option) => option.id)).not.toContain(
        'bookseller-reflection',
      );
      expect(availableOptions(finalReading, returned).map((option) => option.id)).toContain(
        'close',
      );
    }
  });

  it.each([
    ['shared-table-consent', 'final_shared_table_consent', 'не сьогодні'],
    ['shared-table-accountability', 'final_shared_table_accountability', 'помилилася'],
    ['shared-table-uncertainty', 'final_shared_table_uncertainty', 'афіші старого кінотеатру'],
  ] as const)('keeps the %s disagreement distinct and optional', (choice, flag, phrase) => {
    const opened = selectOption(finalReading, gather(), 'shared-table');
    expect(currentNode(finalReading, opened).text).toContain('книжку без обкладинки');
    const response = selectOption(finalReading, opened, choice);
    expect(response.flags).toContain(flag);
    expect(currentNode(finalReading, response).text).toContain(phrase);
    const returned = selectOption(finalReading, response, 'shared-table-return');
    expect(returned.node).toBe('gathering');
    expect(returned.flags).toContain('final_shared_table_heard');
    expect(availableOptions(finalReading, returned).map((option) => option.id)).toContain('close');
  });

  it('does not claim a conversation or consent that the player has not earned', () => {
    const opening = selectOption(finalReading, gather(), 'bookseller-reflection');
    const care = selectOption(finalReading, opening, 'bookseller-care');
    expect(currentNode(finalReading, care).text).toContain('Ти не знаєш, чи вони вже домовилися');
    const truth = selectOption(finalReading, opening, 'bookseller-truth');
    expect(currentNode(finalReading, truth).text).toContain('не збираюся переповідати');
  });

  it('retains private-letter outcome priority when closing the evening', () => {
    for (const [flag, phrase] of [
      ['final_mutual_conversation', 'Ніхто не питає'],
      ['final_letter_kept_private', 'не розгортаючи його'],
      ['final_accepted_consequences', 'не обіцяючи пробачення'],
    ] as const) {
      const state: DialogueState = { ...gather(), flags: [flag, 'final_shared_table_heard'] };
      const end = selectOption(finalReading, state, 'close');
      expect(currentNode(finalReading, end).text).toContain(phrase);
    }
  });

  it('does not break the fifth-day dialogue graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

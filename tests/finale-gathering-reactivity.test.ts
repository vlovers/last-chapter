import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('The final gathering reacts to completed conversations', () => {
  it.each([
    ['final_repaired_rumor', 'сама розповіла, як помилилася'],
    ['final_respected_privacy', 'залишати людям їхні власні історії'],
    ['final_iris_exhibition', 'На стіні з’явилися малюнки Айріс'],
    ['final_anna_club_heard', 'Тут можна передумати'],
  ] as const)('shows a visible consequence of %s', (flag, phrase) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: [flag] };
    expect(currentNode(finalReading, state).text).toContain(phrase);
  });

  it('shows the original gathering before the player makes any decisions', () => {
    const state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(currentNode(finalReading, state).text).toContain('Колись я боялася');
  });

  it('uses the first matching reaction when multiple stories have resolved', () => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: ['final_anna_club_heard', 'final_repaired_rumor'] };
    expect(currentNode(finalReading, state).text).toContain('сама розповіла, як помилилася');
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('Combined final consequences', () => {
  it.each([
    [['final_repaired_rumor', 'final_iris_exhibition'], 'Пані Міллер першою вибачається'],
    [['final_respected_privacy', 'final_supported_iris'], 'Айріс забирає малюнки додому'],
  ] as const)('reflects both decisions when the player closes the shop', (flags, phrase) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags };
    state = selectOption(finalReading, state, 'close');
    expect(currentNode(finalReading, state).text).toContain(phrase);
  });

  it('keeps letter consequences when no combined ending applies', () => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: ['final_mutual_conversation'] };
    state = selectOption(finalReading, state, 'close');
    expect(currentNode(finalReading, state).text).toContain('Ніхто не питає');
  });
});

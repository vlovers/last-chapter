import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('The final gathering reacts to completed conversations', () => {
  it.each([
    ['final_repaired_rumor', 'вибачилася перед Томасом'],
    ['final_respected_privacy', 'А ви що читаєте?'],
    ['final_iris_exhibition', 'Вікна Беллвіка'],
    ['final_anna_club_heard', 'кіт у короні'],
  ] as const)('shows a visible consequence of %s', (flag, phrase) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: [flag] };
    expect(currentNode(finalReading, state).text).toContain(phrase);
  });

  it('shows the original gathering before the player makes any decisions', () => {
    const state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(currentNode(finalReading, state).text).toContain('Френк вкрав закладку');
    expect(currentNode(finalReading, state).text).not.toContain('вибачилася перед Томасом');
  });

  it('uses the first matching reaction when multiple stories have resolved', () => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: ['final_anna_club_heard', 'final_repaired_rumor'] };
    expect(currentNode(finalReading, state).text).toContain('вибачилася перед Томасом');
  });
});

import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../game/dialogue';
import { oliverUnreadBook } from '../content/optional/oliver';

function play(...choices: string[]) {
  let state = startDialogue(oliverUnreadBook);
  for (const choice of choices) state = selectOption(oliverUnreadBook, state, choice);
  return state;
}

describe('optional Oliver dialogue', () => {
  it('has no invalid or unreachable nodes', () => {
    expect(validateDialogue(oliverUnreadBook)).toEqual([]);
  });

  it.each([
    ['oliver-unread-sun', 'oliver-unread-sun-finish'],
    ['oliver-unread-mail', 'oliver-unread-mail-finish'],
    ['oliver-unread-accountant', 'oliver-unread-accountant-finish'],
  ])('finishes the %s route', (choice, finish) => {
    const state = play('oliver-unread-play', choice, finish);
    expect(currentNode(oliverUnreadBook, state).options).toHaveLength(0);
    expect(availableOptions(oliverUnreadBook, state)).toHaveLength(0);
    expect(state.flags).toEqual([]);
  });

  it('can decline without adding flags', () => {
    const state = play('oliver-unread-decline');
    expect(currentNode(oliverUnreadBook, state).id).toBe('oliver-unread-bye');
    expect(state.flags).toEqual([]);
  });

  it('can enter through the joke response', () => {
    const state = play('oliver-unread-joke', 'oliver-unread-joke-continue');
    expect(currentNode(oliverUnreadBook, state).id).toBe('oliver-unread-game');
  });
});

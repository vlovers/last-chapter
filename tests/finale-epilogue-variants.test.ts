import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('Private letter epilogues', () => {
  it.each([
    ['final_mutual_conversation', 'Ніхто не питає'],
    ['final_accepted_consequences', 'не обіцяючи пробачення'],
    ['final_letter_kept_private', 'не розгортаючи його'],
  ] as const)('reflects %s in the last scene', (flag, phrase) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: [flag] };
    state = selectOption(finalReading, state, 'close');
    expect(state.node).toBe('end');
    expect(currentNode(finalReading, state).text).toContain(phrase);
  });

  it('keeps the neutral epilogue when the letter is unresolved', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = selectOption(finalReading, state, 'close');
    expect(currentNode(finalReading, state).text).toContain('датою наступної зустрічі');
    expect(state.flags).not.toContain('final_mutual_conversation');
    expect(state.flags).not.toContain('final_letter_kept_private');
  });
});

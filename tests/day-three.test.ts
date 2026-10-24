import { describe, expect, it } from 'vitest';
import { eleanorVisit } from '../src/content/eleanor';
import { finishThirdDay, startThirdDay, type ChapterState } from '../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Eleanor and Day 3', () => {
  it('validates the conversation', () => expect(validateDialogue(eleanorVisit)).toEqual([]));
  it('does not reveal old records without discoveries', () => {
    const state = selectOption(eleanorVisit, startDialogue(eleanorVisit), 'greet');
    const ids = availableOptions(eleanorVisit, state).map((option) => option.id);
    expect(ids).not.toContain('ledger');
    expect(ids).not.toContain('reservation');
    expect(ids).not.toContain('letter');
  });
  it('retains evidence and saves across days', () => {
    const previous: ChapterState = {
      stage: 'day2-complete',
      dialogue: startDialogue(eleanorVisit),
      flags: ['saw_receipt', 'saw_envelope', 'saw_repair_note', 'iris_requested_privacy'],
    };
    let state = startThirdDay(previous);
    for (const id of ['greet', 'ledger', 'ledger-follow', 'notifications-note', 'finish'])
      state = { ...state, dialogue: selectOption(eleanorVisit, state.dialogue, id) };
    expect(currentNode(eleanorVisit, state.dialogue).id).toBe('end');
    state = { ...state, flags: [...new Set([...state.flags, ...state.dialogue.flags])] };
    expect(state.flags).toContain('eleanor_confirmed_missing_notification');
    expect(decodeSave(encodeSave(state))).toEqual(state);
    expect(finishThirdDay(state).stage).toBe('day3-complete');
  });
  it('does not start early', () => {
    expect(() =>
      startThirdDay({ stage: 'miller', dialogue: startDialogue(eleanorVisit), flags: [] }),
    ).toThrow();
  });
});

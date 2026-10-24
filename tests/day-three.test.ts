import { noraVisit } from '../src/content/nora';
import { thomasVisit } from '../src/content/thomas';
import { describe, expect, it } from 'vitest';
import { eleanorVisit } from '../src/content/eleanor';
import {
  advanceToNora,
  advanceToThomas,
  finishThirdDay,
  startThirdDay,
  startBookClub,
  type ChapterState,
  stageStory,
} from '../src/game/chapter';
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
    state = advanceToThomas(state);
    for (const id of ['greet', 'repair', 'repair-follow', 'work-back', 'finish']) {
      state = { ...state, dialogue: selectOption(thomasVisit, state.dialogue, id) };
    }
    state = { ...state, flags: [...new Set([...state.flags, ...state.dialogue.flags])] };
    expect(state.flags).toContain('thomas_shared_work_stress');
    state = advanceToNora(state);
    for (const id of ['hello', 'books', 'books-ask', 'letters-back', 'end']) {
      state = { ...state, dialogue: selectOption(noraVisit, state.dialogue, id) };
    }
    state = { ...state, flags: [...new Set([...state.flags, ...state.dialogue.flags])] };
    expect(state.flags).toContain('nora_interested_in_letters');
    state = startBookClub(state);
    for (const id of ['welcome', 'discuss-books', 'books-general', 'stories-back', 'close']) {
      state = { ...state, dialogue: selectOption(stageStory(state.stage), state.dialogue, id) };
    }
    state = { ...state, flags: [...new Set([...state.flags, ...state.dialogue.flags])] };
    expect(state.flags).toContain('club_made_space');
    state = finishThirdDay(state);
    expect(state.stage).toBe('day3-complete');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('does not start early', () => {
    expect(() =>
      startThirdDay({ stage: 'miller', dialogue: startDialogue(eleanorVisit), flags: [] }),
    ).toThrow();
  });
});

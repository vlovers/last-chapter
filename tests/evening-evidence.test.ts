import { describe, expect, it } from 'vitest';
import { firstEvening } from '../src/content/evening';
import { currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('evening evidence and Eleanor notes', () => {
  it('keeps the dialogue graph valid', () => {
    expect(validateDialogue(firstEvening)).toEqual([]);
  });

  it('lets players verify the repair without opening the letter', () => {
    let state = startDialogue(firstEvening);
    for (const id of [
      'eleanor-notes',
      'eleanor-history',
      'repair-question',
      'eleanor-memory-back',
      'receipt',
      'receipt-back',
      'letter',
      'letter-conclude',
      'keep-and-ask',
    ]) {
      state = selectOption(firstEvening, state, id);
    }
    expect(currentNode(firstEvening, state).id).toBe('end');
    expect(state.flags).toContain('saw_repair_note');
    expect(state.flags).toContain('letter_secured');
    expect(state.flags).toContain('ask_eleanor_next_day');
    expect(state.flags).not.toContain('opened_private_letter');
  });

  it('records a privacy violation when the envelope is opened', () => {
    let state = startDialogue(firstEvening);
    for (const id of ['letter', 'letter-open', 'opened-conclude', 'keep-safe']) {
      state = selectOption(firstEvening, state, id);
    }
    expect(state.flags).toContain('opened_private_letter');
  });
});

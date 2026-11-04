import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  type DialogueState,
} from '../src/game/dialogue';

function roundTrip(state: DialogueState): DialogueState {
  return JSON.parse(JSON.stringify(state)) as DialogueState;
}

describe('Final evening dialogue state serialization', () => {
  it('resumes a shared scene without losing the current node or earlier flags', () => {
    const initial: DialogueState = {
      node: 'gathering',
      flags: ['mara_own_morning_heard', 'leo_honesty_discussed', 'mara_discussed_change'],
      history: [],
    };
    const entered = selectOption(finalReading, initial, 'final-couple-conversation-option');
    const resumed = roundTrip(entered);
    expect(resumed).toEqual(entered);
    expect(currentNode(finalReading, resumed).id).toBe('final-couple-conversation');
    const respected = selectOption(finalReading, resumed, 'final-couple-respect');
    const back = selectOption(finalReading, respected, 'final-couple-close-back');
    expect(back.flags).toContain('final_couple_conversation_heard');
    expect(back.flags).toContain('mara_discussed_change');
    expect(
      availableOptions(finalReading, roundTrip(back)).some(
        (option) => option.id === 'final-couple-conversation-option',
      ),
    ).toBe(false);
  });

  it('restores a selected shared-table answer and preserves its unique narration', () => {
    const entered: DialogueState = { node: 'shared-table', flags: [], history: [] };
    const selected = selectOption(finalReading, entered, 'shared-table-accountability');
    const saved = roundTrip(selected);
    expect(saved.flags).toContain('final_shared_table_accountability');
    const answer = finalReading.nodes.find((node) => node.id === 'shared-table-answer');
    const expected = answer?.textWhen?.find((variant) =>
      variant.requires.includes('final_shared_table_accountability'),
    );
    expect(currentNode(finalReading, saved).text).toBe(expected?.text);
    const finished = selectOption(finalReading, saved, 'shared-table-return');
    expect(finished.flags).toContain('final_shared_table_heard');
    expect(
      availableOptions(finalReading, roundTrip(finished)).some(
        (option) => option.id === 'shared-table',
      ),
    ).toBe(false);
  });

  it('keeps optional finale callbacks hidden after a state round-trip', () => {
    const completed: DialogueState = {
      node: 'gathering',
      flags: ['mara_own_morning_heard', 'final_v3_mara_heard'],
      history: ['final-v3-mara-option'],
    };
    const restored = roundTrip(completed);
    expect(
      availableOptions(finalReading, restored).some(
        (option) => option.id === 'final-v3-mara-option',
      ),
    ).toBe(false);
    expect(availableOptions(finalReading, restored).some((option) => option.id === 'close')).toBe(
      true,
    );
  });
});

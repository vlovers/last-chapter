import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, type DialogueState } from '../src/game/dialogue';

type JourneyStep = { option: string; destination: string };

function travel(state: DialogueState, steps: readonly JourneyStep[]): DialogueState {
  let cursor = state;
  for (const step of steps) {
    expect(availableOptions(finalReading, cursor).some((entry) => entry.id === step.option)).toBe(true);
    cursor = selectOption(finalReading, cursor, step.option);
    expect(cursor.node).toBe(step.destination);
  }
  return cursor;
}

describe('Final day journey integration', () => {
  it('allows a player to finish the evening without optional conversations', () => {
    const gathering: DialogueState = { node: 'gathering', flags: [], history: [] };
    const ending = travel(gathering, [{ option: 'close', destination: 'end' }]);
    expect(currentNode(finalReading, ending).options).toHaveLength(0);
  });

  it('supports all three shared conversations in one playthrough, without replay', () => {
    const unlocked: DialogueState = {
      node: 'gathering',
      flags: [
        'mara_own_morning_heard',
        'leo_honesty_discussed',
        'anna_uncertainty_discussed',
        'thomas_listening_discussed',
        'iris_art_boundaries_discussed',
        'eleanor_change_discussed',
      ],
      history: [],
    };
    const routes: readonly [string, readonly JourneyStep[], string][] = [
      ['final-couple-conversation-option', [
        { option: 'final-couple-conversation-option', destination: 'final-couple-conversation' },
        { option: 'final-couple-ask', destination: 'final-couple-leo' },
        { option: 'final-couple-mara', destination: 'final-couple-mara' },
        { option: 'final-couple-finish', destination: 'gathering' },
      ], 'final_couple_conversation_heard'],
      ['final-couple-anna-thomas-option', [
        { option: 'final-couple-anna-thomas-option', destination: 'final-couple-anna-thomas' },
        { option: 'final-at-listen', destination: 'final-couple-thomas' },
        { option: 'final-at-more', destination: 'final-couple-at-book' },
        { option: 'final-at-book-back', destination: 'gathering' },
      ], 'final_anna_thomas_heard'],
      ['final-iris-eleanor-option', [
        { option: 'final-iris-eleanor-option', destination: 'final-iris-eleanor' },
        { option: 'final-ie-ask', destination: 'final-iris-eleanor-answer' },
        { option: 'final-ie-iris', destination: 'final-iris-eleanor-iris' },
        { option: 'final-ie-done', destination: 'gathering' },
      ], 'final_iris_eleanor_heard'],
    ];

    let state = unlocked;
    for (const [entry, steps, completed] of routes) {
      state = travel(state, steps);
      expect(state.flags).toContain(completed);
      expect(availableOptions(finalReading, state).some((option) => option.id === entry)).toBe(false);
    }
    expect(travel(state, [{ option: 'close', destination: 'end' }]).node).toBe('end');
  });

  it('lets players respectfully exit shared conversations without seeing every line', () => {
    const cases: readonly [readonly string[], readonly JourneyStep[], string][] = [
      [['mara_own_morning_heard', 'leo_honesty_discussed'], [
        { option: 'final-couple-conversation-option', destination: 'final-couple-conversation' },
        { option: 'final-couple-respect', destination: 'final-couple-close' },
        { option: 'final-couple-close-back', destination: 'gathering' },
      ], 'final_couple_conversation_heard'],
      [['anna_uncertainty_discussed', 'thomas_listening_discussed'], [
        { option: 'final-couple-anna-thomas-option', destination: 'final-couple-anna-thomas' },
        { option: 'final-at-leave', destination: 'final-couple-at-close' },
        { option: 'final-at-close-back', destination: 'gathering' },
      ], 'final_anna_thomas_heard'],
      [['iris_art_boundaries_discussed', 'eleanor_change_discussed'], [
        { option: 'final-iris-eleanor-option', destination: 'final-iris-eleanor' },
        { option: 'final-ie-space', destination: 'final-ie-close' },
        { option: 'final-ie-close-back', destination: 'gathering' },
      ], 'final_iris_eleanor_heard'],
    ];
    for (const [flags, steps, completion] of cases) {
      const end = travel({ node: 'gathering', flags, history: [] }, steps);
      expect(end.flags).toContain(completion);
    }
  });
});

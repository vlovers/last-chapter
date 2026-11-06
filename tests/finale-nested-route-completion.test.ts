import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const initialFlags = ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'];

const begin = (topic: string, flags: string[]) => {
  let state = selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
  state = selectOption(finalReading, state, topic);
  return state;
};

const partialRoutes = [
  {
    group: 'tomorrow-books-group',
    choices: [
      'tomorrow-window-new',
      'tomorrow-window-letters-new',
      'tomorrow-window-letters-back-new',
    ],
    outcome: 'final_tomorrow_window_done',
    hidden: 'tomorrow-window-new',
  },
  {
    group: 'tomorrow-neighbors-group',
    choices: ['tomorrow-miller-new', 'tomorrow-miller-soft-new', 'tomorrow-miller-soft-back-new'],
    outcome: 'final_tomorrow_miller_done',
    hidden: 'tomorrow-miller-new',
  },
  {
    group: 'tomorrow-neighbors-group',
    choices: ['tomorrow-iris-new', 'tomorrow-iris-leave-new', 'tomorrow-iris-leave-back-new'],
    outcome: 'final_tomorrow_iris_done',
    hidden: 'tomorrow-iris-new',
  },
  {
    group: 'tomorrow-neighbors-group',
    choices: [
      'tomorrow-neighbors-new',
      'tomorrow-neighbors-swap-new',
      'tomorrow-neighbors-swap-back-new',
    ],
    outcome: 'final_tomorrow_neighbors_done',
    hidden: 'tomorrow-neighbors-new',
  },
  {
    group: 'tomorrow-room-group',
    choices: ['tomorrow-frank-new', 'tomorrow-frank-box-new', 'tomorrow-frank-box-back-new'],
    outcome: 'final_tomorrow_frank_done',
    hidden: 'tomorrow-frank-new',
  },
] as const;

describe('Finale nested route completion boundaries', () => {
  it.each(partialRoutes)(
    'allows re-entry after $outcome without repeating the completed subtopic',
    ({ group, choices, outcome, hidden }) => {
      let state = begin('bookshop-tomorrow', initialFlags);
      state = selectOption(finalReading, state, group);
      for (const choice of choices) {
        state = selectOption(finalReading, state, choice);
      }

      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(outcome);
      expect(state.flags).not.toContain('final_bookshop_tomorrow_done');
      expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(
        'bookshop-tomorrow',
      );

      const saved = decodeSave(
        encodeSave({ stage: 'day5-reading', dialogue: state, flags: state.flags }),
      );
      expect(saved).not.toBeNull();
      if (!saved) throw new Error('Expected a valid fifth-day save');

      state = selectOption(finalReading, saved.dialogue, 'bookshop-tomorrow');
      state = selectOption(finalReading, state, group);
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        hidden,
      );
    },
  );

  it('consumes the bookshop preparation topic only after a full closing route', () => {
    let state = begin('bookshop-tomorrow', initialFlags);
    for (const choice of [
      'tomorrow-books-group',
      'tomorrow-shelf',
      'tomorrow-shelf-argue',
      'tomorrow-shelf-finish',
    ]) {
      state = selectOption(finalReading, state, choice);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_bookshop_tomorrow_done');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'bookshop-tomorrow',
    );
  });

  it('consumes the tea topic after a finished character conversation', () => {
    let state = begin('after-case-tea', ['final_case_closure_complete']);
    for (const choice of [
      'after-tea-help-group',
      'after-tea-nora',
      'after-nora-facts',
      'after-tea-return',
    ]) {
      state = selectOption(finalReading, state, choice);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_after_case_tea_done');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'after-case-tea',
    );
  });
});

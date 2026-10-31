import { describe, expect, it } from 'vitest';
import { counterEncountersNodes } from '../src/content/counter-encounters';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const routes = [
  [
    'counter-ruth',
    'ruth-ask',
    'ruth-ask-back',
    'final_counter_ruth_preferences',
    'final_counter_ruth_done',
  ],
  [
    'counter-ruth',
    'ruth-print',
    'ruth-print-back',
    'final_counter_ruth_large_print_checked',
    'final_counter_ruth_done',
  ],
  [
    'counter-ruth',
    'ruth-short',
    'ruth-short-back',
    'final_counter_ruth_shortlist',
    'final_counter_ruth_done',
  ],
  [
    'counter-sam',
    'sam-dough',
    'sam-dough-back',
    'final_counter_sam_dough',
    'final_counter_sam_done',
  ],
  [
    'counter-sam',
    'sam-memoir',
    'sam-memoir-back',
    'final_counter_sam_memoir',
    'final_counter_sam_done',
  ],
  [
    'counter-sam',
    'sam-ask-mara',
    'sam-ask-back',
    'final_counter_sam_asked_first',
    'final_counter_sam_done',
  ],
  [
    'counter-reed',
    'reed-envelope',
    'reed-envelope-back',
    'final_counter_reed_note',
    'final_counter_reed_done',
  ],
  [
    'counter-reed',
    'reed-book',
    'reed-book-back',
    'final_counter_reed_book_kept',
    'final_counter_reed_done',
  ],
  [
    'counter-reed',
    'reed-wait',
    'reed-wait-back',
    'final_counter_reed_deferred',
    'final_counter_reed_done',
  ],
] as const;

describe('final evening ordinary counter encounters', () => {
  it('is connected to the final reading and has no dangling scenes', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    expect(counterEncountersNodes).toHaveLength(13);
    expect(counterEncountersNodes.every((node) => node.options.length <= 4)).toBe(true);
  });

  it.each(routes)(
    'completes %s / %s and remembers the outcome',
    (entry, choice, back, outcome, done) => {
      let state = startDialogue(finalReading);
      for (const id of ['open', 'final-counter-encounters', entry, choice, back]) {
        state = selectOption(finalReading, state, id);
      }
      expect(state.node).toBe('final-counter-hub');
      expect(state.flags).toContain(outcome);
      expect(state.flags).toContain(done);
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(entry);
      expect(seasonEnding({ flags: state.flags }).epilogue.length).toBeGreaterThan(0);
    },
  );

  it('supports all three visitors in any order and returns to the reading', () => {
    let state = startDialogue(finalReading);
    for (const id of [
      'open',
      'final-counter-encounters',
      'counter-reed',
      'reed-envelope',
      'reed-envelope-back',
      'counter-ruth',
      'ruth-print',
      'ruth-print-back',
      'counter-sam',
      'sam-ask-mara',
      'sam-ask-back',
      'counter-close',
    ]) {
      state = selectOption(finalReading, state, id);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_counter_evening_done');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-counter-encounters',
    );
    const epilogue = seasonEnding({ flags: state.flags }).epilogue;
    expect(epilogue).toContain('великим шрифтом');
    expect(epilogue).toContain('дріжджі');
    expect(epilogue).toContain('конверт');
  });

  it('does not turn an optional bookshop encounter into manuscript evidence', () => {
    let state = startDialogue(finalReading);
    for (const id of [
      'open',
      'final-counter-encounters',
      'counter-reed',
      'reed-envelope',
      'reed-envelope-back',
      'counter-close',
    ]) {
      state = selectOption(finalReading, state, id);
    }
    expect(
      state.flags.some((flag) => flag.includes('ledger') || flag.includes('paper_study')),
    ).toBe(false);
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('конверт');
  });
});

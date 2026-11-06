import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';

const visitors = [
  [
    ['counter-ruth', 'ruth-ask', 'ruth-ask-back'],
    ['counter-ruth', 'ruth-print', 'ruth-print-back'],
    ['counter-ruth', 'ruth-short', 'ruth-short-back'],
  ],
  [
    ['counter-sam', 'sam-dough', 'sam-dough-back'],
    ['counter-sam', 'sam-memoir', 'sam-memoir-back'],
    ['counter-sam', 'sam-ask-mara', 'sam-ask-back'],
  ],
] as const;

const reedOutcomes = [
  {
    route: ['counter-reed', 'reed-envelope', 'reed-envelope-back'],
    flag: 'final_counter_reed_note',
    text: 'Запечатаний конверт пана Ріда лежить там',
  },
  {
    route: ['counter-reed', 'reed-book', 'reed-book-back'],
    flag: 'final_counter_reed_book_kept',
    text: 'забрав свою книжку разом із нерозгорнутою запискою',
  },
  {
    route: ['counter-reed', 'reed-wait', 'reed-wait-back'],
    flag: 'final_counter_reed_deferred',
    text: 'вирішить удома, що робити із запискою',
  },
] as const;

function play(state: DialogueState, route: readonly string[]): DialogueState {
  for (const id of route) state = selectOption(finalReading, state, id);
  return state;
}

function enterCounter(): DialogueState {
  return play(startDialogue(finalReading), ['open', 'final-counter-encounters']);
}

describe('Final evening: Reed letter custody follows the chosen counter route', () => {
  it('does not invent a Reed outcome when the player leaves before meeting him', () => {
    const state = play(enterCounter(), ['counter-close']);
    const text = currentNode(finalReading, state).text;
    for (const outcome of reedOutcomes) expect(text).not.toContain(outcome.text);
  });

  it.each(reedOutcomes)('acknowledges only the actual Reed choice: $flag', (outcome) => {
    let state = play(enterCounter(), outcome.route);
    expect(currentNode(finalReading, state).text).not.toContain('звичайні покупці');
    state = selectOption(finalReading, state, 'counter-close');
    const text = currentNode(finalReading, state).text;
    expect(state.flags).toContain(outcome.flag);
    expect(text).toContain(outcome.text);
    for (const other of reedOutcomes) {
      if (other.flag !== outcome.flag) expect(text).not.toContain(other.text);
    }
  });

  it('preserves the right callback across 54 route/order combinations and saved states', () => {
    for (const outcome of reedOutcomes) {
      for (let ruth = 0; ruth < 3; ruth++) {
        for (let sam = 0; sam < 3; sam++) {
          for (const reedFirst of [false, true]) {
            let state = enterCounter();
            if (reedFirst) state = play(state, outcome.route);
            state = play(state, visitors[0][ruth]!);
            state = play(state, visitors[1][sam]!);
            if (!reedFirst) state = play(state, outcome.route);
            state = selectOption(finalReading, state, 'counter-close');
            const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
            const text = currentNode(finalReading, restored).text;
            expect(text.split(outcome.text)).toHaveLength(2);
            for (const other of reedOutcomes) {
              if (other.flag !== outcome.flag) expect(text).not.toContain(other.text);
            }
          }
        }
      }
    }
  });

  it('does not narrate incompatible custody outcomes from a corrupted legacy save', () => {
    const state = play(enterCounter(), [
      'counter-reed',
      'reed-envelope',
      'reed-envelope-back',
      'counter-close',
    ]);
    const corrupted = {
      ...state,
      flags: [...state.flags, 'final_counter_reed_book_kept'],
    };
    const text = currentNode(finalReading, corrupted).text;
    for (const outcome of reedOutcomes) expect(text).not.toContain(outcome.text);
  });

  it('keeps the final dialogue graph structurally valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

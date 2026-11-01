import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';

const readerRoutes = [
  [
    ['reader-romance', 'romance-two-books', 'romance-two-back'],
    ['reader-romance', 'romance-defend', 'romance-defend-back'],
    ['reader-romance', 'romance-furniture', 'romance-furniture-back'],
  ],
  [
    ['reader-audio', 'audio-choices', 'audio-choices-back'],
    ['reader-audio', 'audio-ask-ruth', 'audio-ruth-back'],
    ['reader-audio', 'audio-ask-anna', 'audio-anna-back'],
  ],
  [
    ['reader-villain', 'villain-no-spoilers', 'villain-spoilers-back'],
    ['reader-villain', 'villain-nora', 'villain-nora-back'],
    ['reader-villain', 'villain-iris', 'villain-iris-back'],
  ],
] as const;

const counterRoutes = [
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
  [
    ['counter-reed', 'reed-envelope', 'reed-envelope-back'],
    ['counter-reed', 'reed-book', 'reed-book-back'],
    ['counter-reed', 'reed-wait', 'reed-wait-back'],
  ],
] as const;

type Routes = readonly (readonly (readonly string[])[])[];

const readerCallback = 'Мара відсуває книжки, звільняючи місце для чаю.';
const counterCallback = 'Елеонора залишає блокнот біля каси.';

function gathering(): DialogueState {
  return selectOption(finalReading, startDialogue(finalReading), 'open');
}

function finishHub(
  state: DialogueState,
  entry: string,
  routes: Routes,
  choices: readonly number[],
  exit: string,
): DialogueState {
  state = selectOption(finalReading, state, entry);
  for (let topic = 0; topic < routes.length; topic++) {
    const route = routes[topic]![choices[topic]!]!;
    for (const option of route) state = selectOption(finalReading, state, option);
  }
  return selectOption(finalReading, state, exit);
}

describe('Final gathering: callbacks after ordinary conversations', () => {
  it('does not claim either optional hub was visited before the player goes there', () => {
    const text = currentNode(finalReading, gathering()).text;
    expect(text).not.toContain(readerCallback);
    expect(text).not.toContain(counterCallback);
  });

  it('acknowledges an early exit without claiming that any topic was completed', () => {
    let state = selectOption(finalReading, gathering(), 'final-reader-debates');
    state = selectOption(finalReading, state, 'reader-debates-close');
    expect(state.flags).toContain('final_reader_debates_done');
    expect(state.flags).not.toContain('final_reader_romance_done');
    expect(currentNode(finalReading, state).text).toContain(readerCallback);
    expect(currentNode(finalReading, state).text).not.toContain(counterCallback);

    state = JSON.parse(JSON.stringify(state)) as DialogueState;
    state = selectOption(finalReading, state, 'final-counter-encounters');
    state = selectOption(finalReading, state, 'counter-close');
    const text = currentNode(finalReading, state).text;
    expect(text).toContain(readerCallback);
    expect(text).toContain(counterCallback);
    expect(state.flags).not.toContain('final_counter_ruth_done');
  });

  for (const order of ['reader-first', 'counter-first'] as const) {
    it(`preserves both hubs and save/restore across 27 endings (${order})`, () => {
      for (let index = 0; index < 27; index++) {
        const readerChoices = [index % 3, Math.floor(index / 3) % 3, Math.floor(index / 9)];
        const counterChoices = [Math.floor(index / 9), index % 3, Math.floor(index / 3) % 3];
        let state = gathering();
        if (order === 'reader-first') {
          state = finishHub(
            state,
            'final-reader-debates',
            readerRoutes,
            readerChoices,
            'reader-debates-close',
          );
        } else {
          state = finishHub(
            state,
            'final-counter-encounters',
            counterRoutes,
            counterChoices,
            'counter-close',
          );
        }
        state = JSON.parse(JSON.stringify(state)) as DialogueState;
        if (order === 'reader-first') {
          state = finishHub(
            state,
            'final-counter-encounters',
            counterRoutes,
            counterChoices,
            'counter-close',
          );
        } else {
          state = finishHub(
            state,
            'final-reader-debates',
            readerRoutes,
            readerChoices,
            'reader-debates-close',
          );
        }
        const text = currentNode(finalReading, state).text;
        expect(text.split(readerCallback)).toHaveLength(2);
        expect(text.split(counterCallback)).toHaveLength(2);
        expect(state.flags).toEqual(
          expect.arrayContaining([
            'final_reader_debates_done',
            'final_counter_evening_done',
            'final_reader_romance_done',
            'final_reader_audio_done',
            'final_reader_villain_done',
            'final_counter_ruth_done',
            'final_counter_sam_done',
            'final_counter_reed_done',
          ]),
        );
        expect(state.flags.includes('final_reader_romance_two_books')).toBe(readerChoices[0] === 0);
        expect(state.flags.includes('final_counter_ruth_preferences')).toBe(
          counterChoices[0] === 0,
        );
        const options = availableOptions(finalReading, state).map((option) => option.id);
        expect(options).not.toContain('final-reader-debates');
        expect(options).not.toContain('final-counter-encounters');
        const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
        expect(currentNode(finalReading, restored).text).toBe(text);
      }
    });
  }

  it('keeps both callbacks even when a more specific main-plot narration wins', () => {
    let state = finishHub(
      gathering(),
      'final-reader-debates',
      readerRoutes,
      [1, 2, 1],
      'reader-debates-close',
    );
    state = finishHub(state, 'final-counter-encounters', counterRoutes, [2, 1, 0], 'counter-close');
    state = {
      ...state,
      flags: [...state.flags, 'final_repaired_rumor', 'final_iris_exhibition'],
    };
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Пані Міллер зупиняється біля малюнків Айріс.');
    expect(text).toContain(readerCallback);
    expect(text).toContain(counterCallback);
  });
});

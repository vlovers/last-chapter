import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
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

type Route = readonly string[];

function openHub(option: string): DialogueState {
  let state = startDialogue(finalReading);
  state = selectOption(finalReading, state, 'open');
  return selectOption(finalReading, state, option);
}

function play(state: DialogueState, route: Route): DialogueState {
  for (const choice of route) state = selectOption(finalReading, state, choice);
  return state;
}

const cases = [
  {
    name: 'reader debates',
    entry: 'final-reader-debates',
    hub: 'final-reader-debates-hub',
    routes: readerRoutes,
    done: [
      'final_reader_romance_done',
      'final_reader_audio_done',
      'final_reader_villain_done',
    ],
    markers: ['Мара повертає роман', 'Рут прибирає навушники', 'Міллер закриває детектив'],
    genericEnd: 'За столом стихли три суперечки',
    specificEnd: 'Без спойлерів',
  },
  {
    name: 'counter visitors',
    entry: 'final-counter-encounters',
    hub: 'final-counter-hub',
    routes: counterRoutes,
    done: ['final_counter_ruth_done', 'final_counter_sam_done', 'final_counter_reed_done'],
    markers: ['Рут ховає записку', 'Сем відходить', 'Пан Рід обережно прибирає'],
    genericEnd: 'На прилавку більше немає черги',
    specificEnd: 'Черга розійшлася, але',
  },
] as const;

describe('Final gathering: returning to ordinary conversations', () => {
  it('keeps both complete authored graphs valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  for (const group of cases) {
    it(`${group.name}: the opening scene changes after each completed topic`, () => {
      const initial = openHub(group.entry);
      const opening = currentNode(finalReading, initial).text;
      for (let i = 0; i < 3; i++) {
        const returned = play(openHub(group.entry), group.routes[i][1]);
        expect(returned.node).toBe(group.hub);
        expect(returned.flags).toContain(group.done[i]);
        expect(currentNode(finalReading, returned).text).not.toBe(opening);
        expect(currentNode(finalReading, returned).text).toContain(group.markers[i]);
        expect(availableOptions(finalReading, returned).map((option) => option.id)).not.toContain(
          group.routes[i][0][0],
        );
      }
    });

    it(`${group.name}: partial returns acknowledge exactly the topics played`, () => {
      for (const [first, second] of [[0, 1], [0, 2], [1, 2]] as const) {
        let state = openHub(group.entry);
        state = play(state, group.routes[first][1]);
        state = play(state, group.routes[second][2]);
        const narration = currentNode(finalReading, state).text;
        expect(state.node).toBe(group.hub);
        expect(state.flags).toContain(group.done[first]);
        expect(state.flags).toContain(group.done[second]);
        expect(state.flags).not.toContain(group.done[3 - first - second]);
        expect(narration).not.toContain(group.genericEnd);
        expect(narration).not.toContain(group.specificEnd);
        const remaining = availableOptions(finalReading, state).map((option) => option.id);
        expect(remaining).toContain(group.routes[3 - first - second][0][0]);
      }
    });

    it(`${group.name}: all 27 outcome combinations have an earned closing narration`, () => {
      for (let first = 0; first < 3; first++) {
        for (let second = 0; second < 3; second++) {
          for (let third = 0; third < 3; third++) {
            let state = openHub(group.entry);
            state = play(state, group.routes[0][first]);
            state = play(state, group.routes[1][second]);
            state = play(state, group.routes[2][third]);
            const text = currentNode(finalReading, state).text;
            const canonical = first === 0 && second === 0 && third === 0;
            expect(state.node).toBe(group.hub);
            expect(group.done.every((flag) => state.flags.includes(flag))).toBe(true);
            expect(text).toContain(canonical ? group.specificEnd : group.genericEnd);
            expect(availableOptions(finalReading, state).map((option) => option.id)).toEqual([
              group.name === 'reader debates' ? 'reader-debates-close' : 'counter-close',
            ]);
          }
        }
      }
    });

    it(`${group.name}: a restored partial conversation can finish and leave`, () => {
      let state = play(openHub(group.entry), group.routes[0][2]);
      const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
      expect(currentNode(finalReading, restored).text).toContain(group.markers[0]);
      state = play(restored, group.routes[1][1]);
      state = play(state, group.routes[2][2]);
      const exit = group.name === 'reader debates' ? 'reader-debates-close' : 'counter-close';
      state = selectOption(finalReading, state, exit);
      expect(state.node).toBe('gathering');
      expect(group.done.every((flag) => state.flags.includes(flag))).toBe(true);
    });
  }
});

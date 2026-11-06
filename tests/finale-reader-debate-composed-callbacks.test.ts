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

const routes = [
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

const markers = [
  ['перегортає другий роман', 'згадує Артура й поїзди', 'жарт про зниклий диван'],
  [
    'Рут дописує до картки',
    'Рут фотографує назву морської збірки',
    'Анна занотовує ідею для наступного уроку',
  ],
  ['лежить чистим боком догори', 'серветку з порожнім кріслом', 'виставка лиходіїв лишилася'],
] as const;

const orders = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
] as const;

function play(state: DialogueState, route: readonly string[]): DialogueState {
  for (const id of route) state = selectOption(finalReading, state, id);
  return state;
}

function hub(): DialogueState {
  return play(startDialogue(finalReading), ['open', 'final-reader-debates']);
}

function assertOutcomes(text: string, selected: readonly number[]) {
  for (let topic = 0; topic < routes.length; topic++) {
    for (let choice = 0; choice < 3; choice++) {
      const marker = markers[topic]![choice]!;
      if (selected[topic] === choice) expect(text).toContain(marker);
      else expect(text).not.toContain(marker);
    }
  }
}

describe('Final reader debates: independent outcomes survive composed narration', () => {
  it('preserves exactly the three chosen outcomes across 162 route/order combinations', () => {
    for (let romance = 0; romance < 3; romance++) {
      for (let audio = 0; audio < 3; audio++) {
        for (let villain = 0; villain < 3; villain++) {
          const choices = [romance, audio, villain];
          for (const order of orders) {
            let state = hub();
            for (const topic of order) state = play(state, routes[topic]![choices[topic]!]!);
            expect(state.node).toBe('final-reader-debates-hub');
            assertOutcomes(currentNode(finalReading, state).text, choices);
            expect(availableOptions(finalReading, state).map((option) => option.id)).toEqual([
              'reader-debates-close',
            ]);
            const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
            expect(currentNode(finalReading, restored).text).toBe(
              currentNode(finalReading, state).text,
            );
            state = selectOption(finalReading, restored, 'reader-debates-close');
            expect(state.flags).toContain('final_reader_debates_done');
            expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
              'final-reader-debates',
            );
          }
        }
      }
    }
  });

  it('mentions only the chosen consequence after a single finished debate', () => {
    for (let topic = 0; topic < routes.length; topic++) {
      for (let choice = 0; choice < 3; choice++) {
        const state = play(hub(), routes[topic]![choice]!);
        const text = currentNode(finalReading, state).text;
        expect(text).toContain(markers[topic]![choice]);
        for (let otherTopic = 0; otherTopic < routes.length; otherTopic++) {
          for (let otherChoice = 0; otherChoice < 3; otherChoice++) {
            if (otherTopic !== topic || otherChoice !== choice) {
              expect(text).not.toContain(markers[otherTopic]![otherChoice]);
            }
          }
        }
      }
    }
  });

  it('does not claim any route outcome before a choice or after an early exit', () => {
    const state = hub();
    const texts = [
      currentNode(finalReading, state).text,
      currentNode(finalReading, selectOption(finalReading, state, 'reader-debates-close')).text,
    ];
    for (const text of texts) {
      for (const group of markers) {
        for (const marker of group) expect(text).not.toContain(marker);
      }
    }
  });

  it('does not invent two exclusive outcomes when a damaged save has conflicting flags', () => {
    const state: DialogueState = {
      node: 'final-reader-debates-hub',
      history: [],
      flags: [
        'final_reader_audio_done',
        'final_reader_audio_choices',
        'final_reader_audio_ruth_story',
        'final_reader_romance_done',
        'final_reader_romance_two_books',
        'final_reader_romance_side_character',
        'final_reader_villain_done',
        'final_reader_villain_no_spoilers',
        'final_reader_villain_iris_sketch',
      ],
    };
    const text = currentNode(finalReading, state).text;
    for (const group of markers) {
      for (const marker of group) expect(text).not.toContain(marker);
    }
  });

  it('keeps the full five-day graph structurally valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

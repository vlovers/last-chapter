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

const audioCallbacks = [
  'Рут дописує до картки',
  'Рут фотографує назву морської збірки',
  'Анна занотовує ідею для наступного уроку',
] as const;

function play(state: DialogueState, route: readonly string[]): DialogueState {
  for (const option of route) state = selectOption(finalReading, state, option);
  return state;
}

function readerHub(): DialogueState {
  return play(startDialogue(finalReading), ['open', 'final-reader-debates']);
}

describe('Final reader debates: Ukrainian continuity follows actual choices', () => {
  it.each([0, 1, 2] as const)(
    'describes only the chosen audio outcome when it is the sole completed topic (%i)',
    (choice) => {
      const state = play(readerHub(), routes[1][choice]);
      const text = currentNode(finalReading, state).text;
      expect(text).toContain(audioCallbacks[choice]);
      for (let other = 0; other < audioCallbacks.length; other++) {
        if (other !== choice) expect(text).not.toContain(audioCallbacks[other]);
      }
      expect(text).not.toContain('записує назву книжки, яку хоче перевірити вдома');
      const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
      expect(currentNode(finalReading, restored).text).toBe(text);
    },
  );

  it('does not invent a format card, book title or spoiler bookmark after an early exit', () => {
    const state = readerHub();
    const text = currentNode(finalReading, state).text;
    for (const callback of audioCallbacks) expect(text).not.toContain(callback);
    expect(text).not.toContain('закладка «Спершу спитай»');
    expect(state.flags).not.toContain('final_reader_audio_done');
  });

  it('keeps the real bookmark and no invented audio result across 27 complete routes', () => {
    for (let romance = 0; romance < 3; romance++) {
      for (let audio = 0; audio < 3; audio++) {
        for (let villain = 0; villain < 3; villain++) {
          let state = readerHub();
          state = play(state, routes[0][romance]!);
          state = play(state, routes[1][audio]!);
          state = play(state, routes[2][villain]!);
          const text = currentNode(finalReading, state).text;
          const specific = romance === 0 && audio === 0 && villain === 0;
          expect(text.includes('закладка «Спершу спитай»')).toBe(specific);
          expect(text).not.toContain('перевернута закладка «Без спойлерів»');
          expect(text).not.toContain('записує назву книжки, яку хоче перевірити вдома');
          expect(availableOptions(finalReading, state).map((option) => option.id)).toEqual([
            'reader-debates-close',
          ]);
          const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
          expect(currentNode(finalReading, restored).text).toBe(text);
          state = selectOption(finalReading, restored, 'reader-debates-close');
          expect(state.flags).toContain('final_reader_debates_done');
          expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
            'final-reader-debates',
          );
        }
      }
    }
  });

  it('preserves the structural validity of the complete fifth-day graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

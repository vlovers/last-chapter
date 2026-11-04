import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, type DialogueState } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const romanceRoutes = [
  { entry: 'reader-romance', choice: 'romance-two-books', back: 'romance-two-back' },
  { entry: 'reader-romance', choice: 'romance-defend', back: 'romance-defend-back' },
  { entry: 'reader-romance', choice: 'romance-furniture', back: 'romance-furniture-back' },
] as const;

const audioRoutes = [
  {
    entry: 'reader-audio',
    choice: 'audio-choices',
    back: 'audio-choices-back',
    consequence: 'Рут дописує до картки',
  },
  {
    entry: 'reader-audio',
    choice: 'audio-ask-ruth',
    back: 'audio-ruth-back',
    consequence: 'Рут фотографує назву морської збірки',
  },
  {
    entry: 'reader-audio',
    choice: 'audio-ask-anna',
    back: 'audio-anna-back',
    consequence: 'Анна занотовує ідею для наступного уроку',
  },
] as const;

const villainRoutes = [
  { entry: 'reader-villain', choice: 'villain-no-spoilers', back: 'villain-spoilers-back' },
  { entry: 'reader-villain', choice: 'villain-nora', back: 'villain-nora-back' },
  { entry: 'reader-villain', choice: 'villain-iris', back: 'villain-iris-back' },
] as const;

const orders = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
] as const;

const routes = romanceRoutes.flatMap((romance) =>
  audioRoutes.flatMap((audio) =>
    villainRoutes.flatMap((villain) =>
      orders.map((order) => ({
        name: `${romance.choice} / ${audio.choice} / ${villain.choice} / ${order.join('-')}`,
        choices: [romance, audio, villain] as const,
        order,
        audioConsequence: audio.consequence,
      })),
    ),
  ),
);

describe('Final reader debates: Frank stays in one place', () => {
  it.each(routes)('$name', ({ choices, order, audioConsequence }) => {
    let state: DialogueState = { node: 'gathering', flags: [], history: [] };

    const chooseAndRestore = (id: string) => {
      state = selectOption(finalReading, state, id);
      const restored = decodeSave(
        encodeSave({
          stage: 'day5-reading',
          flags: [...state.flags],
          dialogue: state,
        }),
      );
      expect(restored, `Save failed after ${id}`).not.toBeNull();
      state = restored!.dialogue;
    };

    chooseAndRestore('final-reader-debates');
    for (const index of order) {
      const route = choices[index];
      chooseAndRestore(route.entry);
      chooseAndRestore(route.choice);
      chooseAndRestore(route.back);
    }

    expect(state.node).toBe('final-reader-debates-hub');
    const narration = currentNode(finalReading, state).text;
    // The main hub narration already locates Frank. Independent afterwords
    // must not move him beneath the table in the very same scene.
    expect(narration.match(/Френк/g) ?? []).toHaveLength(1);
    expect(narration).toContain(audioConsequence);

    chooseAndRestore('reader-debates-close');
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_reader_debates_done');
  });
});

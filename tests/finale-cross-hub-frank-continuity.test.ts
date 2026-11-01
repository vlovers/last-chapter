import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const readerRoutes = [
  ['audio-choices', 'audio-choices-back'],
  ['audio-ask-ruth', 'audio-ruth-back'],
  ['audio-ask-anna', 'audio-anna-back'],
] as const;

const counterRoutes = [
  ['sam-dough', 'sam-dough-back'],
  ['sam-memoir', 'sam-memoir-back'],
  ['sam-ask-mara', 'sam-ask-back'],
] as const;

const combinations = readerRoutes.flatMap((reader) =>
  counterRoutes.flatMap((counter) =>
    (['reader-first', 'counter-first'] as const).map((order) => ({
      reader,
      counter,
      order,
      name: `${reader[0]} / ${counter[0]} / ${order}`,
    })),
  ),
);

describe('Final evening: Frank and counter callbacks agree across hubs', () => {
  it.each(combinations)('$name', ({ reader, counter, order }) => {
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

    const visitReader = () => {
      chooseAndRestore('final-reader-debates');
      chooseAndRestore('reader-audio');
      chooseAndRestore(reader[0]);
      chooseAndRestore(reader[1]);
      const hubText = currentNode(finalReading, state).text;
      expect(hubText).not.toContain('Френк дрімає під столом');
      chooseAndRestore('reader-debates-close');
    };

    const visitCounter = () => {
      chooseAndRestore('final-counter-encounters');
      chooseAndRestore('counter-sam');
      chooseAndRestore(counter[0]);
      chooseAndRestore(counter[1]);
      chooseAndRestore('counter-close');
    };

    if (order === 'reader-first') {
      visitReader();
      visitCounter();
    } else {
      visitCounter();
      visitReader();
    }

    expect(state.node).toBe('gathering');
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Френк не ворушиться зі свого стільця');
    expect(text).toContain('Порожній пакет лежить поряд із блокнотом');
    expect(text).not.toContain('Френк уже заглядає в порожній пакет');
    expect(text).not.toContain('Френк дрімає під столом');
    expect(state.flags).toContain('final_reader_debates_done');
    expect(state.flags).toContain('final_counter_evening_done');
    const ids = availableOptions(finalReading, state).map((option) => option.id);
    expect(ids).not.toContain('final-reader-debates');
    expect(ids).not.toContain('final-counter-encounters');
  });

  it('does not invent a counter interaction when only the reader hub was completed', () => {
    let state: DialogueState = { node: 'gathering', flags: [], history: [] };
    state = selectOption(finalReading, state, 'final-reader-debates');
    state = selectOption(finalReading, state, 'reader-debates-close');
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Френк не ворушиться зі свого стільця');
    expect(text).not.toContain('Порожній пакет лежить поряд із блокнотом');
  });
});

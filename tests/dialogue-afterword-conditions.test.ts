import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  currentNode,
  validateDialogue,
  type DialogueNode,
  type DialogueStory,
} from '../src/game/dialogue';

type Afterword = NonNullable<DialogueNode['afterwordWhen']>[number];

function storyWith(
  afterwordWhen: readonly Afterword[],
  textWhen?: DialogueNode['textWhen'],
): DialogueStory {
  return {
    start: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Оповідач',
        text: 'Гості збираються в книгарні.',
        ...(textWhen ? { textWhen } : {}),
        afterwordWhen,
        options: [{ id: 'close', label: 'Завершити вечір', next: 'end' }],
      },
      { id: 'end', speaker: 'Оповідач', text: 'До зустрічі.', options: [] },
    ],
  };
}

function narration(story: DialogueStory, flags: readonly string[]): string {
  return currentNode(story, { node: 'start', flags, history: [] }).text;
}

describe('Conditional finale afterwords: authoring and runtime', () => {
  it.each([
    {
      name: 'identical conditions',
      first: { requires: ['mara'], text: 'Мара лишилася.' },
      second: { requires: ['mara'], text: 'Мара лишилася ще раз.' },
    },
    {
      name: 'reordered required flags',
      first: { requires: ['mara', 'leo'], text: 'Мара й Лео.' },
      second: { requires: ['leo', 'mara'], text: 'Повторна розмова.' },
    },
    {
      name: 'reordered exclusions',
      first: {
        requires: ['mara'],
        unless: ['closed', 'cancelled'],
        text: 'Перша розмова.',
      },
      second: {
        requires: ['mara'],
        unless: ['cancelled', 'closed'],
        text: 'Друга розмова.',
      },
    },
    {
      name: 'implicit and explicit empty exclusions',
      first: { requires: ['mara'], text: 'Перша розмова.' },
      second: { requires: ['mara'], unless: [], text: 'Друга розмова.' },
    },
  ])('rejects $name so a callback cannot appear twice', ({ first, second }) => {
    expect(validateDialogue(storyWith([first, second]))).toContain(
      'Duplicate afterword condition: start',
    );
  });

  it('allows the same prerequisite with different exclusions', () => {
    const story = storyWith([
      { requires: ['mara'], unless: ['private'], text: 'Відкрита розмова.' },
      { requires: ['mara'], unless: ['public'], text: 'Тиха розмова.' },
    ]);
    expect(validateDialogue(story)).toEqual([]);
    expect(narration(story, ['mara', 'private'])).toContain('Тиха розмова.');
    expect(narration(story, ['mara', 'private'])).not.toContain('Відкрита розмова.');
  });

  it('allows independent prerequisites and preserves authored callback order', () => {
    const story = storyWith([
      { requires: ['mara'], text: 'Мара прибрала чашки.' },
      { requires: ['leo'], text: 'Лео зачинив вікно.' },
    ]);
    expect(validateDialogue(story)).toEqual([]);
    expect(narration(story, ['leo', 'mara'])).toBe(
      'Гості збираються в книгарні.\n\nМара прибрала чашки.\n\nЛео зачинив вікно.',
    );
  });

  it('does not append callbacks when prerequisites are absent', () => {
    const story = storyWith([{ requires: ['mara'], text: 'Мара прибрала чашки.' }]);
    expect(narration(story, [])).toBe('Гості збираються в книгарні.');
  });

  it('keeps specific narration separate from independent afterwords', () => {
    const story = storyWith(
      [{ requires: ['leo'], text: 'Лео зачинив вікно.' }],
      [
        { requires: ['mara'], text: 'Мара лишилася.' },
        { requires: ['mara', 'leo'], text: 'Мара й Лео лишилися.' },
      ],
    );
    expect(validateDialogue(story)).toEqual([]);
    expect(narration(story, ['mara', 'leo'])).toBe('Мара й Лео лишилися.\n\nЛео зачинив вікно.');
  });

  it('still rejects impossible and malformed afterword conditions', () => {
    const story = storyWith([
      { requires: ['mara'], unless: ['mara'], text: 'Неможлива розмова.' },
      { requires: [' '], text: 'Порожня умова.' },
      { requires: ['leo'], unless: [' '], text: 'Порожній виняток.' },
    ]);
    expect(validateDialogue(story)).toEqual(
      expect.arrayContaining([
        'Impossible afterword condition: start',
        'Blank afterword requires: start',
        'Blank afterword unless: start',
      ]),
    );
  });

  it('accepts the complete authored fifth-day graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it('renders the sealed-case final afterword exactly once', () => {
    const ending = finalReading.nodes.find((node) => node.id === 'end');
    const callback = ending?.afterwordWhen?.find((entry) =>
      entry.requires.includes('final_case_sealed'),
    );
    expect(callback).toBeDefined();
    const without = currentNode(finalReading, {
      node: 'end',
      flags: [],
      history: [],
    }).text;
    const withCase = currentNode(finalReading, {
      node: 'end',
      flags: ['final_case_sealed'],
      history: [],
    }).text;
    expect(without).not.toContain(callback!.text);
    expect(withCase.split(callback!.text)).toHaveLength(2);
  });
});

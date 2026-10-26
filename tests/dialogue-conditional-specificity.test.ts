import { describe, expect, it } from 'vitest';
import { currentNode, startDialogue, type DialogueStory } from '../src/game/dialogue';

const story: DialogueStory = {
  start: 'scene',
  nodes: [
    {
      id: 'scene',
      speaker: 'Оповідач',
      text: 'Звичайна розмова.',
      textWhen: [
        { requires: ['mara_heard'], text: 'Мара пам’ятає вашу розмову.' },
        {
          requires: ['mara_heard', 'leo_heard'],
          text: 'Мара й Лео пам’ятають спільну розмову.',
        },
        { requires: ['leo_heard'], text: 'Лео пам’ятає вашу розмову.' },
      ],
      options: [],
    },
  ],
};

describe('Conditional dialogue specificity', () => {
  it('uses the default narration when no condition matches', () => {
    expect(currentNode(story, startDialogue(story)).text).toBe('Звичайна розмова.');
  });

  it('uses a single-character variant when only its flag is present', () => {
    expect(currentNode(story, { node: 'scene', flags: ['mara_heard'], history: [] }).text).toBe(
      'Мара пам’ятає вашу розмову.',
    );
  });

  it('prefers the two-character variant over earlier generic matches', () => {
    expect(
      currentNode(story, {
        node: 'scene',
        flags: ['mara_heard', 'leo_heard'],
        history: [],
      }).text,
    ).toBe('Мара й Лео пам’ятають спільну розмову.');
  });

  it('does not mutate the source order of conditional variants', () => {
    currentNode(story, { node: 'scene', flags: ['mara_heard', 'leo_heard'], history: [] });
    expect(story.nodes[0].textWhen?.map((entry) => entry.requires.length)).toEqual([1, 2, 1]);
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, validateDialogue, type DialogueStory } from '../src/game/dialogue';

function storyWith(overrides: Partial<DialogueStory['nodes'][number]>): DialogueStory {
  return {
    start: 'begin',
    nodes: [
      {
        id: 'begin',
        speaker: 'Оповідач',
        text: 'Звичайний вечір.',
        options: [{ id: 'continue', label: 'Далі', next: 'end' }],
        ...overrides,
      },
      { id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] },
    ],
  };
}

describe('Dialogue conditional authoring guards', () => {
  it('rejects two narration variants with the same prerequisites in reverse order', () => {
    const story = storyWith({
      textWhen: [
        { requires: ['mara_heard', 'leo_heard'], text: 'Перша версія.' },
        { requires: ['leo_heard', 'mara_heard'], text: 'Недосяжна версія.' },
      ],
    });
    expect(validateDialogue(story)).toContain('Duplicate conditional variant: begin');
  });

  it('rejects a repeated one-flag narration variant', () => {
    const story = storyWith({
      textWhen: [
        { requires: ['letter_seen'], text: 'Перша версія.' },
        { requires: ['letter_seen'], text: 'Недосяжна версія.' },
      ],
    });
    expect(validateDialogue(story)).toContain('Duplicate conditional variant: begin');
  });

  it('accepts overlapping but distinct narration conditions', () => {
    const story = storyWith({
      textWhen: [
        { requires: ['mara_heard'], text: 'Мара.' },
        { requires: ['mara_heard', 'leo_heard'], text: 'Мара і Лео.' },
        { requires: ['leo_heard'], text: 'Лео.' },
      ],
    });
    expect(validateDialogue(story)).toEqual([]);
    expect(
      currentNode(story, {
        node: 'begin',
        flags: ['mara_heard', 'leo_heard'],
        history: [],
      }).text,
    ).toBe('Мара і Лео.');
  });

  it('keeps independent scene conditions separate', () => {
    const story = storyWith({
      textWhen: [{ requires: ['letter_seen'], text: 'Початок.' }],
    });
    const end = story.nodes[1]!;
    const extended: DialogueStory = {
      ...story,
      nodes: [
        story.nodes[0]!,
        { ...end, textWhen: [{ requires: ['letter_seen'], text: 'Кінець.' }] },
      ],
    };
    expect(validateDialogue(extended)).toEqual([]);
  });

  it.each([
    ['blank', [' '], 'Blank reopensWhen flag: begin/continue'],
    ['duplicate', ['new_fact', 'new_fact'], 'Duplicate reopensWhen flag: begin/continue'],
  ] as const)('rejects %s reopening prerequisites', (_label, flags, expected) => {
    const story = storyWith({
      options: [
        { id: 'continue', label: 'Далі', next: 'end', reopensWhen: flags },
      ],
    });
    expect(validateDialogue(story)).toContain(expected);
  });

  it('accepts distinct non-empty reopening prerequisites', () => {
    const story = storyWith({
      options: [
        {
          id: 'continue',
          label: 'Далі',
          next: 'end',
          reopensWhen: ['mara_heard', 'leo_heard'],
        },
      ],
    });
    expect(validateDialogue(story)).toEqual([]);
  });

  it('keeps the day-five letter scene reachable with the joint Mara/Leo callback', () => {
    const letter = finalReading.nodes.find((node) => node.id === 'letter');
    expect(letter).toBeDefined();
    const flags = ['leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'];
    const matching = letter?.textWhen?.filter(
      (variant) =>
        variant.requires.length === flags.length &&
        flags.every((flag) => variant.requires.includes(flag)),
    );
    expect(matching).toHaveLength(1);
    expect(currentNode(finalReading, { node: 'letter', flags, history: [] }).text).toBe(
      matching?.[0]?.text,
    );
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

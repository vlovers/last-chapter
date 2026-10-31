import { describe, expect, it, vi } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { validateDialogue, type DialogueNode, type DialogueStory } from '../src/game/dialogue';

const ending: DialogueNode = {
  id: 'end',
  speaker: 'Оповідач',
  text: 'Книгарня зачиняється.',
  options: [],
};

describe('dialogue graph validation at narrative scale', () => {
  it('validates a ten-thousand-scene route without repeated linear node searches', () => {
    const length = 10_000;
    const nodes: DialogueNode[] = Array.from({ length }, (_, index) => ({
      id: `scene-${index}`,
      speaker: 'Оповідач',
      text: 'Ще одна сторінка.',
      options: [
        {
          id: 'continue',
          label: 'Далі',
          next: index === length - 1 ? 'end' : `scene-${index + 1}`,
        },
      ],
    }));
    nodes.push(ending);
    const find = vi.spyOn(nodes, 'find');

    expect(validateDialogue({ start: 'scene-0', nodes })).toEqual([]);
    expect(find).not.toHaveBeenCalled();
    find.mockRestore();
  });

  it('checks every branch of a wide gathering and reports disconnected content', () => {
    const options = Array.from({ length: 2_048 }, (_, index) => ({
      id: `guest-${index}`,
      label: `Поговорити з гостем ${index}`,
      next: `guest-${index}`,
    }));
    const nodes: DialogueNode[] = [
      { id: 'gathering', speaker: 'Мара', text: 'Усі зібралися.', options },
      ...options.map((option) => ({
        id: option.next,
        speaker: 'Гість',
        text: 'Дякую за розмову.',
        options: [{ id: 'leave', label: 'До зустрічі', next: 'end' }],
      })),
      ending,
      {
        id: 'orphan',
        speaker: 'Оповідач',
        text: 'Цю сцену забули.',
        options: [{ id: 'lost', label: 'Далі', next: 'missing' }],
      },
    ];

    expect(validateDialogue({ start: 'gathering', nodes })).toEqual([
      'Missing destination: missing',
      'Unreachable node: orphan',
    ]);
  });

  it('retains the first definition for reachability when duplicate IDs are invalid', () => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Мара',
          text: 'Перша сцена.',
          options: [{ id: 'go', label: 'Далі', next: 'end' }],
        },
        {
          id: 'start',
          speaker: 'Мара',
          text: 'Повторна сцена.',
          options: [],
        },
        ending,
      ],
    };

    expect(validateDialogue(story)).toEqual(['Duplicate node: start']);
  });

  it('keeps missing starts and isolated nodes visible to authors', () => {
    expect(validateDialogue({ start: 'missing', nodes: [ending] })).toEqual([
      'Missing start',
      'Unreachable node: end',
    ]);
  });

  it('accepts an intentional hub loop with a reachable ending', () => {
    const story: DialogueStory = {
      start: 'hub',
      nodes: [
        {
          id: 'hub',
          speaker: 'Мара',
          text: 'Про що поговоримо?',
          options: [
            { id: 'again', label: 'Ще раз', next: 'hub', repeatability: 'repeatable' },
            { id: 'leave', label: 'До зустрічі', next: 'end' },
          ],
        },
        ending,
      ],
    };
    expect(validateDialogue(story)).toEqual([]);
  });

  it('preserves reachability of the authored day-five finale', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

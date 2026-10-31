import { describe, expect, it, vi } from 'vitest';
import {
  availableOptions,
  currentNode,
  restoreDialogueProgress,
  selectOption,
  startDialogue,
  type DialogueNode,
  type DialogueStory,
} from '../src/game/dialogue';

function longStory(length: number): DialogueStory {
  const nodes: DialogueNode[] = Array.from({ length }, (_, index) => ({
    id: `scene-${index}`,
    speaker: 'Оповідач',
    text: `Сторінка ${index}.`,
    options: [
      {
        id: 'next',
        label: 'Далі',
        next: index === length - 1 ? 'end' : `scene-${index + 1}`,
      },
    ],
  }));
  nodes.push({ id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] });
  return { start: 'scene-0', nodes };
}

describe('dialogue runtime indexing and save replay', () => {
  it('navigates hundreds of scenes in a ten-thousand-node graph without rescanning nodes', () => {
    const story = longStory(10_000);
    const find = vi.spyOn(story.nodes, 'find');
    const some = vi.spyOn(story.nodes, 'some');

    let state = startDialogue(story);
    for (let index = 0; index < 600; index++) {
      expect(currentNode(story, state).id).toBe(`scene-${index}`);
      expect(availableOptions(story, state).map((option) => option.id)).toEqual(['next']);
      state = selectOption(story, state, 'next');
    }
    expect(state.node).toBe('scene-600');
    expect(state.history).toHaveLength(600);
    expect(find).not.toHaveBeenCalled();
    expect(some).not.toHaveBeenCalled();
    find.mockRestore();
    some.mockRestore();
  });

  it('replays a long legacy save without scanning the authored node array per edge', () => {
    const story = longStory(10_000);
    const find = vi.spyOn(story.nodes, 'find');
    const some = vi.spyOn(story.nodes, 'some');
    const legacy = {
      node: 'scene-800',
      flags: [] as string[],
      history: Array<string>(800).fill('next'),
    };

    const restored = restoreDialogueProgress(story, legacy);
    expect(restored.node).toBe('scene-800');
    expect(restored.history).toBe(legacy.history);
    expect(restored.pending).toHaveLength(800);
    expect(availableOptions(story, legacy).map((option) => option.id)).toEqual(['next']);
    expect(restoreDialogueProgress(story, legacy)).toBe(restored);
    expect(find).not.toHaveBeenCalled();
    expect(some).not.toHaveBeenCalled();
    find.mockRestore();
    some.mockRestore();
  });

  it('keeps the first authored definition when a graph contains duplicate IDs', () => {
    const story: DialogueStory = {
      start: 'hub',
      nodes: [
        {
          id: 'hub',
          speaker: 'Мара',
          text: 'Перший варіант.',
          options: [{ id: 'continue', label: 'Далі', next: 'end' }],
        },
        {
          id: 'hub',
          speaker: 'Мара',
          text: 'Другий варіант.',
          options: [{ id: 'wrong', label: 'Ні', next: 'end' }],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] },
      ],
    };
    const initial = startDialogue(story);
    expect(currentNode(story, initial).text).toBe('Перший варіант.');
    expect(availableOptions(story, initial).map((option) => option.id)).toEqual(['continue']);
    expect(selectOption(story, initial, 'continue').node).toBe('end');
    expect(() => selectOption(story, initial, 'wrong')).toThrow('Option unavailable');
  });

  it('does not share indexes between independent story definitions', () => {
    const first = longStory(3);
    const second: DialogueStory = {
      start: 'scene-0',
      nodes: [
        { id: 'scene-0', speaker: 'Мара', text: 'Інша розмова.', options: [] },
      ],
    };
    expect(currentNode(first, startDialogue(first)).text).toBe('Сторінка 0.');
    expect(currentNode(second, startDialogue(second)).text).toBe('Інша розмова.');
    expect(currentNode(first, startDialogue(first)).text).toBe('Сторінка 0.');
  });

  it('still rejects a missing start and a missing destination at runtime', () => {
    const missingStart: DialogueStory = {
      start: 'missing',
      nodes: [{ id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] }],
    };
    expect(() => startDialogue(missingStart)).toThrow('Missing start node');

    const missingDestination: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Мара',
          text: 'Поговорімо.',
          options: [{ id: 'continue', label: 'Далі', next: 'missing' }],
        },
      ],
    };
    expect(() => selectOption(missingDestination, startDialogue(missingDestination), 'continue')).toThrow(
      'Missing destination node',
    );
  });
});

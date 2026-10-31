import { describe, expect, it } from 'vitest';
import { validateDialogue, type DialogueStory } from '../src/game/dialogue';

describe('Dialogue scene reachability', () => {
  it('reports scenes that cannot be reached from the opening', () => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Оповідач',
          text: 'Початок',
          options: [{ id: 'finish', label: 'Завершити', next: 'end' }],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець', options: [] },
        { id: 'orphan', speaker: 'Оповідач', text: 'Забута сцена', options: [] },
      ],
    };
    expect(validateDialogue(story)).toContain('Unreachable node: orphan');
    expect(validateDialogue(story)).not.toContain('Unreachable node: end');
  });

  it('accepts a loop when all scenes are reachable', () => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Оповідач',
          text: 'Початок',
          options: [{ id: 'forward', label: 'Далі', next: 'middle' }],
        },
        {
          id: 'middle',
          speaker: 'Оповідач',
          text: 'Середина',
          options: [{ id: 'again', label: 'Повернутися', next: 'start' }],
        },
      ],
    };
    expect(validateDialogue(story)).toEqual([]);
  });

  it('does not loop forever when unreachable scenes form a cycle', () => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        { id: 'start', speaker: 'Оповідач', text: 'Початок', options: [] },
        {
          id: 'a',
          speaker: 'Оповідач',
          text: 'А',
          options: [{ id: 'to-b', label: 'Далі', next: 'b' }],
        },
        {
          id: 'b',
          speaker: 'Оповідач',
          text: 'Б',
          options: [{ id: 'to-a', label: 'Назад', next: 'a' }],
        },
      ],
    };
    expect(validateDialogue(story)).toEqual(['Unreachable node: a', 'Unreachable node: b']);
  });
});

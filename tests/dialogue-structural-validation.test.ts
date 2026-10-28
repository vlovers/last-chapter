import { describe, expect, it } from 'vitest';
import { validateDialogue, type DialogueStory } from '../src/game/dialogue';

describe('Dialogue structural validation', () => {
  it.each([
    ['empty scene id', { id: ' ' }, 'Empty node id'],
    ['empty speaker', { speaker: ' ' }, 'Empty speaker: start'],
    ['empty choice id', { optionId: ' ' }, 'Empty option id: start'],
    ['empty destination', { next: ' ' }, 'Empty destination: start/continue'],
  ] as const)('rejects %s', (_label, mutation, expected) => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'id' in mutation ? mutation.id : 'start',
          speaker: 'speaker' in mutation ? mutation.speaker : 'Оповідач',
          text: 'Початок',
          options: [
            {
              id: 'optionId' in mutation ? mutation.optionId : 'continue',
              label: 'Далі',
              next: 'next' in mutation ? mutation.next : 'end',
            },
          ],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець', options: [] },
      ],
    };
    expect(validateDialogue(story)).toContain(expected);
  });
});

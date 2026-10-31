import { describe, expect, it } from 'vitest';
import { validateDialogue, type DialogueStory } from '../src/game/dialogue';

describe('Dialogue flag validation', () => {
  it.each([
    ['requires', 'Duplicate required flag'],
    ['unless', 'Duplicate excluded flag'],
    ['grants', 'Duplicate granted flag'],
  ] as const)('rejects duplicate %s entries', (field, message) => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Оповідач',
          text: 'Початок',
          options: [
            {
              id: 'continue',
              label: 'Далі',
              next: 'end',
              [field]: ['same_flag', 'same_flag'],
            },
          ],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець', options: [] },
      ],
    };
    expect(validateDialogue(story)).toContain(`${message}: start/continue`);
  });

  it('accepts distinct flags in all option conditions', () => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Оповідач',
          text: 'Початок',
          options: [
            {
              id: 'continue',
              label: 'Далі',
              next: 'end',
              requires: ['ready'],
              unless: ['done'],
              grants: ['visited'],
            },
          ],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець', options: [] },
      ],
    };
    expect(validateDialogue(story)).toEqual([]);
  });
});

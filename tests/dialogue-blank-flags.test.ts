import { describe, expect, it } from 'vitest';
import { validateDialogue, type DialogueStory } from '../src/game/dialogue';

function storyWithOption(field: 'requires' | 'unless' | 'grants'): DialogueStory {
  return {
    start: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Оповідач',
        text: 'Початок',
        options: [{ id: 'continue', label: 'Далі', next: 'end', [field]: ['  '] }],
      },
      { id: 'end', speaker: 'Оповідач', text: 'Кінець', options: [] },
    ],
  };
}

describe('Dialogue rejects blank state flags', () => {
  it.each(['requires', 'unless', 'grants'] as const)('rejects a blank %s flag', (field) => {
    expect(validateDialogue(storyWithOption(field))).toContain(
      `Blank ${field} flag: start/continue`,
    );
  });

  it('rejects blank conditional narration flags', () => {
    const story: DialogueStory = {
      start: 'start',
      nodes: [
        {
          id: 'start',
          speaker: 'Оповідач',
          text: 'Початок',
          textWhen: [{ requires: [' '], text: 'Варіант' }],
          options: [],
        },
      ],
    };
    expect(validateDialogue(story)).toContain('Blank conditional flag: start');
  });
});

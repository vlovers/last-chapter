import { describe, expect, it } from 'vitest';
import { validateDialogue, type DialogueStory } from '../src/game/dialogue';

function storyWith(overrides: Partial<DialogueStory['nodes'][number]>): DialogueStory {
  return {
    start: 'begin',
    nodes: [
      {
        id: 'begin',
        speaker: 'Оповідач',
        text: 'Початок розмови.',
        options: [{ id: 'continue', label: 'Продовжити', next: 'end' }],
        ...overrides,
      },
      { id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] },
    ],
  };
}

describe('Dialogue authoring validation', () => {
  it('rejects empty conditional narration', () => {
    const errors = validateDialogue(
      storyWith({ textWhen: [{ requires: ['heard_secret'], text: '  ' }] }),
    );
    expect(errors).toContain('Empty conditional text: begin');
  });

  it('rejects unconditional narration overrides', () => {
    const errors = validateDialogue(storyWith({ textWhen: [{ requires: [], text: 'Без умов.' }] }));
    expect(errors).toContain('Unconditional text variant: begin');
  });

  it('rejects unnamed dialogue options', () => {
    const errors = validateDialogue(
      storyWith({ options: [{ id: 'continue', label: ' ', next: 'end' }] }),
    );
    expect(errors).toContain('Empty option label: begin/continue');
  });

  it('rejects impossible choices with conflicting flags', () => {
    const errors = validateDialogue(
      storyWith({
        options: [
          {
            id: 'continue',
            label: 'Продовжити',
            next: 'end',
            requires: ['heard_secret'],
            unless: ['heard_secret'],
          },
        ],
      }),
    );
    expect(errors).toContain('Impossible option condition: begin/continue');
  });

  it('accepts conditional narration and valid gated choices', () => {
    expect(
      validateDialogue(
        storyWith({
          textWhen: [{ requires: ['heard_secret'], text: 'Тепер ти знаєш.' }],
          options: [
            {
              id: 'continue',
              label: 'Продовжити',
              next: 'end',
              requires: ['heard_secret'],
              unless: ['already_left'],
            },
          ],
        }),
      ),
    ).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  restoreDialogueProgress,
  selectOption,
  startDialogue,
  type DialogueNode,
  type DialogueStory,
} from '../src/game/dialogue';

describe('Dialogue options do not resolve narration unnecessarily', () => {
  function guardedStory() {
    let narrationReads = 0;
    const opening: DialogueNode = {
      id: 'start',
      speaker: 'Оповідач',
      text: 'Гості зібралися.',
      get textWhen() {
        narrationReads++;
        return [{ requires: ['visited'], text: 'Гості повернулися.' }];
      },
      get afterwordWhen() {
        narrationReads++;
        return [{ requires: ['visited'], text: 'Френк уже спить.' }];
      },
      options: [{ id: 'go', label: 'Повернутися до гостей', next: 'end' }],
    };
    const story: DialogueStory = {
      start: 'start',
      nodes: [opening, { id: 'end', speaker: 'Мара', text: 'До зустрічі.', options: [] }],
    };
    return { story, getReads: () => narrationReads };
  }

  it('does not read conditional narration when listing or selecting choices', () => {
    const { story, getReads } = guardedStory();
    const state = startDialogue(story);
    for (let index = 0; index < 200; index++) {
      expect(availableOptions(story, state).map((option) => option.id)).toEqual(['go']);
    }
    expect(selectOption(story, state, 'go').node).toBe('end');
    expect(getReads()).toBe(0);
  });

  it('does not render narration when replaying legacy save history', () => {
    const { story, getReads } = guardedStory();
    const legacy = { node: 'end', flags: ['visited'], history: ['go'] };
    const restored = restoreDialogueProgress(story, legacy);
    expect(restored.node).toBe('end');
    expect(restored.completed).toBeDefined();
    expect(getReads()).toBe(0);
  });

  it('still composes authored narration when the current scene is displayed', () => {
    const { story, getReads } = guardedStory();
    const text = currentNode(story, {
      node: 'start',
      flags: ['visited'],
      history: [],
    }).text;
    expect(text).toBe('Гості повернулися.\n\nФренк уже спить.');
    expect(getReads()).toBeGreaterThan(0);
  });

  it('still rejects missing scene IDs for option queries', () => {
    const { story } = guardedStory();
    expect(() =>
      availableOptions(story, { node: 'missing', flags: [], history: [], completed: [] }),
    ).toThrow('Missing dialogue node');
  });
});

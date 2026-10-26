import { describe, expect, it } from 'vitest';
import { bellwickEncounters } from '../content/optional/bellwick-encounters';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../game/dialogue';

describe('Bellwick optional encounters: complete ten-scene batch', () => {
  it('contains exactly ten distinct scenes with valid dialogue graphs', () => {
    expect(Object.keys(bellwickEncounters)).toHaveLength(10);
    for (const [name, story] of Object.entries(bellwickEncounters)) {
      expect(validateDialogue(story), name).toEqual([]);
      expect(story.nodes.length, name).toBeGreaterThanOrEqual(8);
    }
  });

  it.each(Object.keys(bellwickEncounters))('%s supports three distinct complete routes', (name) => {
    const story = bellwickEncounters[name];
    if (!story) throw new Error('Missing scene: ' + name);
    for (const route of ['a', 'b', 'c']) {
      let state = startDialogue(story);
      for (const id of ['talk', 'choice-' + route, 'follow-' + route, 'afterthought-end']) {
        expect(
          availableOptions(story, state).some((option) => option.id === id),
          name + '/' + id,
        ).toBe(true);
        state = selectOption(story, state, id);
      }
      expect(currentNode(story, state).id).toBe('end');
      expect(availableOptions(story, state)).toHaveLength(0);
      expect(state.flags).toEqual([]);
    }
  });

  it.each(Object.keys(bellwickEncounters))('%s supports a respectful early exit', (name) => {
    const story = bellwickEncounters[name];
    if (!story) throw new Error('Missing scene: ' + name);
    const state = selectOption(story, startDialogue(story), 'leave');
    expect(currentNode(story, state).id).toBe('exit');
    expect(state.flags).toEqual([]);
  });
});

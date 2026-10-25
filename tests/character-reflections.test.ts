import { describe, expect, it } from 'vitest';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { eleanorVisit } from '../src/content/eleanor';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

const arcs = [
  ['leo', leoVisit, 'leo_reflected_on_uncertainty'],
  ['iris', irisVisit, 'iris_reflected_on_identity'],
  ['anna', annaVisit, 'anna_reflected_on_care'],
  ['thomas', thomasVisit, 'thomas_reflected_on_responsibility'],
  ['nora', noraVisit, 'nora_reflected_on_uncertainty'],
  ['eleanor', eleanorVisit, 'eleanor_reflected_on_legacy'],
] as const;

describe('Optional character reflection arcs', () => {
  it.each(arcs)('%s supports a deep and a short reflection without trapping the player', (prefix, story, flag) => {
    expect(validateDialogue(story)).toEqual([]);
    for (const deep of [false, true]) {
      let state = startDialogue(story);
      const option = availableOptions(story, state).find((item) => item.id === `${prefix}-reflection`);
      expect(option).toBeDefined();
      state = selectOption(story, state, `${prefix}-reflection`);
      if (deep) {
        state = selectOption(story, state, `${prefix}-reflect-question`);
        state = selectOption(story, state, `${prefix}-reflect-continue`);
      } else {
        state = selectOption(story, state, `${prefix}-reflect-return`);
      }
      state = selectOption(story, state, `${prefix}-reflect-finish`);
      expect(state.node).toBe(story.start);
      expect(state.flags).toContain(flag);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { eleanorVisit } from '../src/content/eleanor';
import { validateDialogue } from '../src/game/dialogue';

const visits = [
  ['Mara', maraVisit, 'mara_own_morning_heard'],
  ['Leo', leoVisit, 'leo_honesty_discussed'],
  ['Iris', irisVisit, 'iris_art_boundaries_discussed'],
  ['Anna', annaVisit, 'anna_uncertainty_discussed'],
  ['Thomas', thomasVisit, 'thomas_listening_discussed'],
  ['Nora', noraVisit, 'nora_archive_ethics_discussed'],
  ['Eleanor', eleanorVisit, 'eleanor_change_discussed'],
] as const;

describe('Narrative V3 character conversation integrity', () => {
  for (const [name, story, completion] of visits) {
    it(`${name} has a valid graph and a one-time completion route`, () => {
      expect(validateDialogue(story)).toEqual([]);
      const completed = story.nodes.flatMap((node) => node.options)
        .filter((option) => option.grants?.includes(completion));
      expect(completed.length).toBeGreaterThan(0);
      const gated = story.nodes.flatMap((node) => node.options)
        .filter((option) => option.unless?.includes(completion));
      expect(gated.length).toBeGreaterThan(0);
    });
  }
});

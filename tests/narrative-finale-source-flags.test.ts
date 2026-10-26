import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { eleanorVisit } from '../src/content/eleanor';
import { finalReading } from '../src/content/day-five';
import type { DialogueStory } from '../src/game/dialogue';

const links: readonly [string, DialogueStory, string, string][] = [
  ['mara', maraVisit, 'mara_discussed_forgiveness', 'mara_discussed_change'],
  ['leo', leoVisit, 'leo_chose_listening', 'leo_accepted_silence'],
  ['iris', irisVisit, 'iris_chose_open_art', 'iris_chose_private_art'],
  ['anna', annaVisit, 'anna_will_apologize_to_student', 'anna_will_invite_disagreement'],
  ['thomas', thomasVisit, 'thomas_will_ask_before_helping', 'thomas_admitted_fear_of_rejection'],
  ['nora', noraVisit, 'nora_will_preserve_uncertainty', 'nora_will_seek_consent'],
  ['eleanor', eleanorVisit, 'eleanor_will_keep_shared_memory', 'eleanor_will_allow_change'],
];

describe('Finale narrative choices are backed by real player decisions', () => {
  for (const [character, visit, first, second] of links) {
    it(`${character}: both finale variants are earned through dialogue options`, () => {
      const grants = visit.nodes.flatMap((node) =>
        node.options.flatMap((option) => option.grants ?? []),
      );
      expect(grants).toContain(first);
      expect(grants).toContain(second);
      expect(first).not.toBe(second);

      const ending = finalReading.nodes.find((node) => node.id === `final-v3-${character}`);
      expect(ending).toBeDefined();
      expect(ending?.textWhen?.map((variant) => variant.requires)).toContainEqual([first]);
      expect(ending?.textWhen?.map((variant) => variant.requires)).toContainEqual([second]);
    });
  }

  it('does not use an unavailable source conversation for shared scenes', () => {
    const shared: readonly [string, DialogueStory, string, DialogueStory, string][] = [
      [
        'final-couple-conversation',
        maraVisit,
        'mara_own_morning_heard',
        leoVisit,
        'leo_honesty_discussed',
      ],
      [
        'final-couple-anna-thomas',
        annaVisit,
        'anna_uncertainty_discussed',
        thomasVisit,
        'thomas_listening_discussed',
      ],
      [
        'final-iris-eleanor',
        irisVisit,
        'iris_art_boundaries_discussed',
        eleanorVisit,
        'eleanor_change_discussed',
      ],
    ];
    for (const [scene, firstStory, firstFlag, secondStory, secondFlag] of shared) {
      const grants = (story: DialogueStory) =>
        story.nodes.flatMap((node) => node.options.flatMap((option) => option.grants ?? []));
      expect(grants(firstStory)).toContain(firstFlag);
      expect(grants(secondStory)).toContain(secondFlag);
      const entry = finalReading.nodes
        .find((node) => node.id === 'gathering')
        ?.options.find((option) => option.next === scene);
      expect(entry?.requires).toEqual([firstFlag, secondFlag]);
    }
  });
});

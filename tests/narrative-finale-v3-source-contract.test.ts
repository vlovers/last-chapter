import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { maraVisit } from '../src/content/mara';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { eleanorVisit } from '../src/content/eleanor';
import type { DialogueStory } from '../src/game/dialogue';

const characters: readonly [string, DialogueStory, string, string][] = [
  ['Mara', maraVisit, 'final-v3-mara-option', 'mara_own_morning_heard'],
  ['Leo', leoVisit, 'final-v3-leo-option', 'leo_honesty_discussed'],
  ['Iris', irisVisit, 'final-v3-iris-option', 'iris_art_boundaries_discussed'],
  ['Anna', annaVisit, 'final-v3-anna-option', 'anna_uncertainty_discussed'],
  ['Thomas', thomasVisit, 'final-v3-thomas-option', 'thomas_listening_discussed'],
  ['Nora', noraVisit, 'final-v3-nora-option', 'nora_archive_ethics_discussed'],
  ['Eleanor', eleanorVisit, 'final-v3-eleanor-option', 'eleanor_change_discussed'],
];

describe('Finale V3 callbacks are backed by earlier character conversations', () => {
  const gathering = finalReading.nodes.find((node) => node.id === 'gathering');
  if (!gathering) throw new Error('Missing finale gathering');

  for (const [name, story, callbackId, prerequisite] of characters) {
    it(`${name}: the callback is unlockable through a character choice`, () => {
      const callback = gathering.options.find((option) => option.id === callbackId);
      expect(callback).toBeDefined();
      expect(callback?.requires).toContain(prerequisite);
      const sources = story.nodes.flatMap((node) =>
        node.options.filter((option) => option.grants?.includes(prerequisite)),
      );
      expect(sources.length, `No source for ${prerequisite}`).toBeGreaterThan(0);
      expect(story.nodes.some((node) => node.id === callback?.next)).toBe(false);
    });
  }

  it('joint callbacks require two distinct earlier character completion flags', () => {
    for (const id of [
      'final-couple-conversation-option',
      'final-couple-anna-thomas-option',
      'final-iris-eleanor-option',
    ]) {
      const option = gathering.options.find((entry) => entry.id === id);
      expect(option?.requires).toHaveLength(2);
      expect(new Set(option?.requires).size).toBe(2);
      for (const flag of option?.requires ?? []) {
        expect(
          characters.some(([, story]) =>
            story.nodes.some((node) => node.options.some((choice) => choice.grants?.includes(flag))),
          ),
          `No earlier character source for ${id}: ${flag}`,
        ).toBe(true);
      }
    }
  });
});

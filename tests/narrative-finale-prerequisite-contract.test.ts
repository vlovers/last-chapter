import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';

const gathering = finalReading.nodes.find((node) => node.id === 'gathering');
if (!gathering) throw new Error('Missing gathering');

describe('Finale prerequisites and scene completion contracts', () => {
  it('never gates a finale scene on a flag granted only inside that same scene', () => {
    for (const entry of gathering.options) {
      if (!entry.requires?.length) continue;
      const destination = finalReading.nodes.find((node) => node.id === entry.next);
      expect(destination, `Missing destination for ${entry.id}`).toBeDefined();
      const ownGrants = new Set(
        (destination?.options ?? []).flatMap((option) => option.grants ?? []),
      );
      for (const required of entry.requires) {
        expect(
          ownGrants.has(required),
          `${entry.id} requires a flag granted inside its own entry scene: ${required}`,
        ).toBe(false);
      }
    }
  });

  it('requires distinct prerequisites for each shared relationship scene', () => {
    const expected: Record<string, readonly string[]> = {
      'final-couple-conversation-option': ['mara_own_morning_heard', 'leo_honesty_discussed'],
      'final-couple-anna-thomas-option': [
        'anna_uncertainty_discussed',
        'thomas_listening_discussed',
      ],
      'final-iris-eleanor-option': ['iris_art_boundaries_discussed', 'eleanor_change_discussed'],
    };
    for (const [id, required] of Object.entries(expected)) {
      const option = gathering.options.find((entry) => entry.id === id);
      expect(option, `Missing shared scene ${id}`).toBeDefined();
      expect(new Set(option?.requires)).toEqual(new Set(required));
      expect(option?.unless?.length).toBeGreaterThan(0);
    }
  });

  it('does not contain impossible options with both required and excluded flags', () => {
    for (const node of finalReading.nodes) {
      for (const option of node.options) {
        const impossible = (option.requires ?? []).filter((flag) => option.unless?.includes(flag));
        expect(impossible, `Impossible conditions in ${node.id}/${option.id}`).toEqual([]);
      }
    }
  });
});

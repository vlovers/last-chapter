import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, type DialogueState } from '../src/game/dialogue';

const gathering = finalReading.nodes.find((node) => node.id === 'gathering');
if (!gathering) throw new Error('Missing final gathering');

describe('Finale optional scene lifecycle', () => {
  it('provides a completion flag for every gated optional scene', () => {
    const grants = new Set(
      finalReading.nodes.flatMap((node) => node.options.flatMap((option) => option.grants ?? [])),
    );
    for (const option of gathering.options) {
      if (!option.unless?.length) continue;
      for (const flag of option.unless) {
        expect(grants.has(flag), `${option.id} is hidden by a flag no choice can grant: ${flag}`).toBe(true);
      }
    }
  });

  it('keeps all unlocked options visible before completion and hides them afterward', () => {
    for (const option of gathering.options) {
      if (!option.unless?.length) continue;
      const initial: DialogueState = {
        node: 'gathering',
        flags: [...(option.requires ?? [])],
        history: [],
      };
      expect(
        availableOptions(finalReading, initial).some((candidate) => candidate.id === option.id),
        `${option.id} is unavailable before completion`,
      ).toBe(true);
      const completed: DialogueState = {
        ...initial,
        flags: [...new Set([...initial.flags, ...option.unless])],
      };
      expect(
        availableOptions(finalReading, completed).some((candidate) => candidate.id === option.id),
        `${option.id} remains available after completion`,
      ).toBe(false);
    }
  });

  it('allows the player to finish the day regardless of completed optional scenes', () => {
    const allFlags = new Set(
      gathering.options.flatMap((option) => [...(option.requires ?? []), ...(option.unless ?? [])]),
    );
    const state: DialogueState = { node: 'gathering', flags: [...allFlags], history: [] };
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain('close');
    expect(selectOption(finalReading, state, 'close').node).toBe('end');
  });
});

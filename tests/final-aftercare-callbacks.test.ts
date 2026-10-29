import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('After-case choices unlock five final-night callbacks', () => {
  const routes = [
    {
      person: 'anna',
      earlier: 'final_after_anna_class_books_reserved',
      endings: ['vote', 'read', 'lend'],
    },
    { person: 'leo', earlier: 'final_after_leo_mara_walk', endings: ['wish', 'umbrella', 'space'] },
    {
      person: 'eleanor',
      earlier: 'final_after_eleanor_orders_planned',
      endings: ['sort', 'call', 'close'],
    },
    {
      person: 'miller',
      earlier: 'final_after_miller_restraint_acknowledged',
      endings: ['rules', 'questions', 'cohost'],
    },
    {
      person: 'iris',
      earlier: 'final_after_iris_light_book_chosen',
      endings: ['no-spoiler', 'return', 'quiet'],
    },
  ] as const;

  it('keeps the final-day graph valid', () => expect(validateDialogue(finalReading)).toEqual([]));

  for (const route of routes) {
    for (const ending of route.endings) {
      it(`plays ${route.person} / ${ending} and closes the callback`, () => {
        const entry = `final-aftercare-${route.person}-option`;
        const base = { ...startDialogue(finalReading), node: 'gathering' };
        expect(availableOptions(finalReading, base).map((option) => option.id)).not.toContain(
          entry,
        );
        let state = { ...base, flags: [route.earlier] };
        expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(entry);
        state = selectOption(finalReading, state, entry);
        state = selectOption(finalReading, state, `final-aftercare-${route.person}-${ending}`);
        state = selectOption(finalReading, state, `final-aftercare-${route.person}-${ending}-back`);
        expect(state.node).toBe('gathering');
        expect(state.flags).toContain(`final_aftercare_${route.person}_done`);
        expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
          entry,
        );
      });
    }
  }
});

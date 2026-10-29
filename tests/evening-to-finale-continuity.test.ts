import { describe, expect, it } from 'vitest';
import { quietEvening } from '../src/content/quiet-evening';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

describe('Evening decisions unlock the correct day-five callbacks', () => {
  const routes = [
    { evening: 'closing-frank-night', choice: 'play', dayFive: 'frank', flag: 'closing_frank_extra_playtime', outcomes: ['rest', 'toy', 'joke'] },
    { evening: 'closing-late-visitors', choice: 'ask', dayFive: 'leo', flag: 'closing_late_visitors_walk_heard', outcomes: ['tease', 'privacy', 'invite'], requirement: 'book_club_started' },
    { evening: 'closing-book-exchange', choice: 'note', dayFive: 'notes', flag: 'closing_exchange_reader_note_left', outcomes: ['reply', 'open', 'quiet'] },
    { evening: 'closing-town-notice', choice: 'dinner', dayFive: 'town', flag: 'closing_town_dinner_noticed', outcomes: ['salad', 'dessert', 'invite'] },
  ] as const;

  for (const route of routes) {
    it(`carries the actual ${route.evening} choice into day five`, () => {
      let evening = startDialogue(quietEvening);
      if ('requirement' in route) {
        evening = { ...evening, flags: [...evening.flags, route.requirement] };
      }
      evening = selectOption(quietEvening, evening, route.evening);
      evening = selectOption(quietEvening, evening, `${route.evening}-${route.choice}`);
      evening = selectOption(quietEvening, evening, `${route.evening}-${route.choice}-back`);
      expect(evening.flags).toContain(route.flag);
      const final = { ...startDialogue(finalReading), node: 'gathering', flags: [...evening.flags] };
      expect(availableOptions(finalReading, final).map((item) => item.id)).toContain(
        `final-town-${route.dayFive}-option`,
      );
    });
    for (const outcome of route.outcomes) {
      it(`finishes ${route.dayFive}/${outcome} without leaking another choice`, () => {
        let state = {
          ...startDialogue(finalReading),
          node: 'gathering',
          flags: [route.flag],
        };
        state = selectOption(finalReading, state, `final-town-${route.dayFive}-option`);
        state = selectOption(finalReading, state, `final-town-${route.dayFive}-${outcome}`);
        state = selectOption(finalReading, state, `final-town-${route.dayFive}-${outcome}-back`);
        expect(state.flags).toContain(`final_town_${route.dayFive}_done`);
        expect(state.flags.filter((flag) => flag.startsWith(`final_town_${route.dayFive}_`) && flag !== `final_town_${route.dayFive}_done`)).toHaveLength(0);
        expect(availableOptions(finalReading, state).map((item) => item.id)).not.toContain(
          `final-town-${route.dayFive}-option`,
        );
      });
    }
  }

  it('does not unlock callbacks from unrelated evening flags', () => {
    const state = {
      ...startDialogue(finalReading),
      node: 'gathering',
      flags: ['closing_frank_basket_moved', 'closing_town_chess_invited'],
    };
    for (const callback of ['frank', 'leo', 'notes', 'town']) {
      expect(availableOptions(finalReading, state).map((item) => item.id)).not.toContain(
        `final-town-${callback}-option`,
      );
    }
  });
});

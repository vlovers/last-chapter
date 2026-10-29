import type { DialogueState } from '../src/game/dialogue';
import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Final day remembers decisions from earlier Bellwick evenings', () => {
  const scenes = [
    { id: 'frank', flag: 'closing_frank_extra_playtime', endings: ['rest', 'toy', 'joke'] },
    {
      id: 'leo',
      flag: 'closing_late_visitors_walk_heard',
      endings: ['tease', 'privacy', 'invite'],
    },
    { id: 'notes', flag: 'closing_exchange_reader_note_left', endings: ['reply', 'open', 'quiet'] },
    { id: 'anna', flag: 'club_anna_stage_box_prepared', endings: ['build', 'kids', 'cat'] },
    { id: 'town', flag: 'closing_town_dinner_noticed', endings: ['salad', 'dessert', 'invite'] },
  ] as const;
  it('validates the entire final day', () => expect(validateDialogue(finalReading)).toEqual([]));
  for (const scene of scenes) {
    for (const ending of scene.endings) {
      it(`unlocks ${scene.id} and completes ${ending} exactly once`, () => {
        const initial = { ...startDialogue(finalReading), node: 'gathering' };
        const option = `final-town-${scene.id}-option`;
        expect(availableOptions(finalReading, initial).map((item) => item.id)).not.toContain(
          option,
        );
        let state: DialogueState = { ...initial, flags: [scene.flag] };
        expect(availableOptions(finalReading, state).map((item) => item.id)).toContain(option);
        state = selectOption(finalReading, state, option);
        state = selectOption(finalReading, state, `final-town-${scene.id}-${ending}`);
        state = selectOption(finalReading, state, `final-town-${scene.id}-${ending}-back`);
        expect(state.node).toBe('gathering');
        expect(state.flags).toContain(`final_town_${scene.id}_done`);
        expect(availableOptions(finalReading, state).map((item) => item.id)).not.toContain(option);
      });
    }
  }
});

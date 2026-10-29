import { describe, expect, it } from 'vitest';
import { quietEvening } from '../src/content/quiet-evening';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Four new Bellwick closing-time activities', () => {
  const activities = [
    { id: 'closing-late-visitors', required: 'book_club_started', endings: ['book', 'pie', 'ask'] },
    { id: 'closing-town-notice', endings: ['chess', 'dinner', 'glove'] },
    { id: 'closing-frank-night', endings: ['carry', 'inspect', 'play'] },
    { id: 'closing-book-exchange', endings: ['mystery', 'roses', 'note'] },
  ] as const;
  it('validates the complete evening graph', () =>
    expect(validateDialogue(quietEvening)).toEqual([]));
  for (const activity of activities) {
    for (const ending of activity.endings) {
      it(`plays ${activity.id} / ${ending} and prevents repeating the completed activity`, () => {
        let state = startDialogue(quietEvening);
        if ('required' in activity)
          state = { ...state, flags: [...state.flags, activity.required] };
        expect(availableOptions(quietEvening, state).map((option) => option.id)).toContain(
          activity.id,
        );
        state = selectOption(quietEvening, state, activity.id);
        state = selectOption(quietEvening, state, `${activity.id}-${ending}`);
        state = selectOption(quietEvening, state, `${activity.id}-${ending}-back`);
        expect(state.node).toBe('closing');
        expect(state.flags).toContain(`${activity.id.replaceAll('-', '_')}_done`);
        expect(availableOptions(quietEvening, state).map((option) => option.id)).not.toContain(
          activity.id,
        );
      });
    }
  }
});

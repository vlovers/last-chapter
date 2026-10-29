import { describe, expect, it } from 'vitest';
import { quietEvening } from '../src/content/quiet-evening';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Quiet evening reacts to the book club', () => {
  it('keeps all new nodes linked', () => expect(validateDialogue(quietEvening)).toEqual([]));
  const routes = [
    { flag: 'club_nora_trust_deepened', choice: 'closing-followups-nora', back: 'closing-followups-nora-back', consequence: 'club_nora_bookmark_left' },
    { flag: 'club_mara_leo_concert_supported', choice: 'closing-followups-leo', back: 'closing-followups-leo-back', consequence: 'club_mara_leo_window_seats_ready' },
    { flag: 'club_school_play_sequel_invited', choice: 'closing-followups-anna', back: 'closing-followups-anna-back', consequence: 'club_anna_stage_box_prepared' },
  ] as const;
  for (const { flag, choice, back, consequence } of routes) {
    it(`opens ${choice} only when ${flag} is remembered`, () => {
      const initial = startDialogue(quietEvening);
      const state = { ...initial, flags: [...initial.flags, 'book_club_started', flag] };
      const hub = selectOption(quietEvening, state, 'closing-club-followups');
      expect(availableOptions(quietEvening, hub).map((option) => option.id)).toContain(choice);
      const result = selectOption(quietEvening, selectOption(quietEvening, hub, choice), back);
      expect(result.node).toBe('closing');
      expect(result.flags).toContain(consequence);
    });
  }
});

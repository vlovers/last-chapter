import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

describe('Day five: real dialogue traversal and consequence gating', () => {
  const branches = {
    window: ['letters', 'questions', 'quiet'],
    miller: ['soft', 'fun', 'privacy'],
    iris: ['choose', 'tea', 'leave'],
    frank: ['box', 'pillow', 'chair'],
    neighbors: ['anonymous', 'swap', 'notes'],
  } as const;

  for (const [activity, endings] of Object.entries(branches)) {
    for (const ending of endings) {
      it(`plays ${activity} / ${ending} through the real dialogue engine`, () => {
        const base = startDialogue(finalReading);
        let state = {
          ...base,
          node: 'bookshop-tomorrow',
          flags: [
            'final_ledger_scene_complete',
            'final_manuscript_provenance_decided',
          ],
        };
        const entry = `tomorrow-${activity}-new`;
        expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(entry);
        state = selectOption(finalReading, state, entry);
        state = selectOption(finalReading, state, `tomorrow-${activity}-${ending}-new`);
        const finish = availableOptions(finalReading, state)[0];
        expect(finish?.grants).toContain(`final_tomorrow_${activity}_done`);
        state = selectOption(finalReading, state, finish.id);
        expect(state.node).toBe('gathering');
        expect(state.flags).toContain(`final_tomorrow_${activity}_done`);
        const revisit = { ...state, node: 'bookshop-tomorrow' };
        expect(availableOptions(finalReading, revisit).map((option) => option.id)).not.toContain(entry);
      });
    }
  }

  for (const activity of Object.keys(branches)) {
    it(`does not offer completed ${activity} again`, () => {
      const state = {
        ...startDialogue(finalReading),
        node: 'bookshop-tomorrow',
        flags: [`final_tomorrow_${activity}_done`],
      };
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        `tomorrow-${activity}-new`,
      );
    });
  }
});

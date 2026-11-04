import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const routes = [
  {
    entry: 'after-case-tea',
    group: 'after-tea-help-group',
    node: 'after-case-tea-help',
    back: 'after-tea-help-back',
    flags: ['final_case_closure_complete'],
    completed: 'final_after_case_tea_done',
  },
  {
    entry: 'after-case-tea',
    group: 'after-tea-talk-group',
    node: 'after-case-tea-talk',
    back: 'after-tea-talk-back',
    flags: ['final_case_closure_complete'],
    completed: 'final_after_case_tea_done',
  },
  {
    entry: 'after-case-tea',
    group: 'after-tea-corner-group',
    node: 'after-case-tea-corner',
    back: 'after-tea-corner-back',
    flags: ['final_case_closure_complete'],
    completed: 'final_after_case_tea_done',
  },
  {
    entry: 'bookshop-tomorrow',
    group: 'tomorrow-books-group',
    node: 'bookshop-tomorrow-books',
    back: 'tomorrow-books-back',
    flags: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
    completed: 'final_bookshop_tomorrow_done',
  },
  {
    entry: 'bookshop-tomorrow',
    group: 'tomorrow-neighbors-group',
    node: 'bookshop-tomorrow-neighbors',
    back: 'tomorrow-neighbors-back',
    flags: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
    completed: 'final_bookshop_tomorrow_done',
  },
  {
    entry: 'bookshop-tomorrow',
    group: 'tomorrow-room-group',
    node: 'bookshop-tomorrow-room',
    back: 'tomorrow-room-back',
    flags: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
    completed: 'final_bookshop_tomorrow_done',
  },
] as const;

describe('Finale nested conversation save and suspend', () => {
  it.each(routes)(
    'restores $node without consuming $entry when returning from a topic group',
    ({ entry, group, node, back, flags, completed }) => {
      let state = selectOption(
        finalReading,
        { ...startDialogue(finalReading), flags: [...flags] },
        'open',
      );
      state = selectOption(finalReading, state, entry);
      state = selectOption(finalReading, state, group);
      expect(state.node).toBe(node);

      const saved = decodeSave(
        encodeSave({ stage: 'day5-reading', dialogue: state, flags: state.flags }),
      );
      expect(saved).not.toBeNull();
      if (!saved) throw new Error('Expected a valid fifth-day save');

      const groupOptions = availableOptions(finalReading, saved.dialogue).map(
        (option) => option.id,
      );
      expect(groupOptions).toContain(back);
      const returned = selectOption(finalReading, saved.dialogue, back);
      expect(returned.node).toBe(entry);
      expect(returned.flags).not.toContain(completed);
      expect(availableOptions(finalReading, returned).map((option) => option.id)).toContain(group);
    },
  );
});

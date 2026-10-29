import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const entryFlags = [
  'final_case_closure_complete',
  'final_ledger_scene_complete',
  'final_manuscript_provenance_decided',
];

describe('after-case tea: quiet consequences', () => {
  it.each([
    ['after-tea-nora', 'after-nora-facts', 'final_after_case_notes_separated'],
    ['after-tea-nora', 'after-nora-close', 'final_after_case_nora_owns_notes'],
    ['after-tea-mara', 'after-mara-invite', 'final_after_case_mara_book_reserved'],
    ['after-tea-mara', 'after-mara-space', 'final_after_case_mara_space'],
    ['after-tea-quiet', 'after-quiet-finish', 'final_after_case_quiet_shared'],
  ])('keeps the %s / %s route reachable and persistent', (first, second, flag) => {
    let state = { ...startDialogue(finalReading), node: 'gathering', flags: entryFlags };
    for (const id of ['after-case-tea', first, second, 'after-tea-return']) {
      expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(id);
      state = selectOption(finalReading, state, id);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(flag);
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(
      (
        {
          final_after_case_notes_separated: 'різні картки',
          final_after_case_nora_owns_notes: 'власні нотатки',
          final_after_case_mara_book_reserved: 'роман без детективної загадки',
          final_after_case_mara_space: 'не складав за неї розклад',
          final_after_case_quiet_shared: 'вимили чашки',
        } as Record<string, string>
      )[flag],
    );
    expect(state.flags).toContain('final_after_case_tea_done');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'after-case-tea',
    );
  });

  it('does not expose the aftermath before the investigation is concluded', () => {
    const state = { ...startDialogue(finalReading), node: 'gathering', flags: [] };
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'after-case-tea',
    );
  });

  it('never displays more than four choices in the new dialogue nodes', () => {
    for (const node of finalReading.nodes.filter((node) => node.id.startsWith('after-case-'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

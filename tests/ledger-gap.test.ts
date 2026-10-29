import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const entryFlags = ['final_ledger_scene_complete'];

function play(flags: string[], route: string[]): DialogueState {
  let state: DialogueState = {
    ...startDialogue(finalReading),
    node: 'gathering',
    flags,
  };
  for (const id of route) {
    expect(
      availableOptions(finalReading, state).map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(finalReading, state, id);
  }
  return state;
}

describe('Lost Pages: the empty ledger recipient field', () => {
  it.each([
    ['ledger-gap-keep', 'final_ledger_gap_kept_blank', 'оригінал журналу'],
    ['ledger-gap-annotate', 'final_ledger_gap_annotated', 'датовану примітку'],
    ['ledger-gap-publish', 'final_ledger_gap_speculation_printed', 'припущення'],
  ])('persists %s without inventing a recipient', (choice, flag, epilogue) => {
    const state = play(entryFlags, [
      'ledger-gap',
      'ledger-gap-check',
      'ledger-gap-check-thomas',
      'ledger-gap-thomas-back',
      'ledger-gap-eleanor',
      'ledger-gap-listen',
      'ledger-gap-decide',
      choice,
      'ledger-gap-finish',
    ]);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(flag);
    expect(state.flags).toContain('final_ledger_gap_done');
    expect(state.flags).toContain('final_ledger_gap_thomas_limit');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(epilogue);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'ledger-gap',
    );
  });

  it('lets Iris inspect and receive a private copy only when already informed', () => {
    const state = play([...entryFlags, 'final_ledger_iris_told'], [
      'ledger-gap',
      'ledger-gap-check',
      'ledger-gap-check-back',
      'ledger-gap-eleanor',
      'ledger-gap-press',
      'ledger-gap-iris',
      'ledger-gap-iris-back',
      'ledger-gap-decide',
      'ledger-gap-copy',
      'ledger-gap-finish',
    ]);
    expect(state.flags).toContain('final_ledger_gap_iris_copy');
    expect(state.flags).toContain('final_ledger_gap_iris_heard');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('приватну копію');
  });

  it('does not disclose a private ledger or consult Iris after she declined', () => {
    const privateState = play([...entryFlags, 'final_ledger_record_private'], ['ledger-gap']);
    expect(availableOptions(finalReading, privateState).map((o) => o.id)).not.toContain(
      'ledger-gap-iris',
    );
    const declined = play(
      [...entryFlags, 'final_ledger_iris_told', 'final_case_iris_declined'],
      [
        'ledger-gap',
        'ledger-gap-check',
        'ledger-gap-check-back',
        'ledger-gap-eleanor',
        'ledger-gap-listen',
        'ledger-gap-decide',
      ],
    );
    expect(availableOptions(finalReading, declined).map((o) => o.id)).not.toContain(
      'ledger-gap-copy',
    );
  });

  it('does not unlock before the ledger and respects the four-choice UI', () => {
    const state = { ...startDialogue(finalReading), node: 'gathering', flags: [] };
    expect(availableOptions(finalReading, state).map((o) => o.id)).not.toContain('ledger-gap');
    for (const node of finalReading.nodes.filter((n) => n.id.startsWith('ledger-gap'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

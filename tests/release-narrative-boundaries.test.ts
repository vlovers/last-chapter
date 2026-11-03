import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const evidence = ['final_chapter_evidence_reviewed', 'final_ledger_scene_complete'];
const at = (flags: string[], node = 'gathering'): DialogueState => ({
  ...startDialogue(finalReading),
  node,
  flags,
});
function restore(state: DialogueState) {
  return decodeSave(encodeSave({ stage: 'day5-reading', flags: state.flags, dialogue: state }))!
    .dialogue;
}
const options = (state: DialogueState) => availableOptions(finalReading, state).map((o) => o.id);

describe('release: paper access respects already heard refusals', () => {
  it.each([
    ['iris_letter_breach_admitted', false],
    ['iris_letter_breach_admitted', true],
    ['iris_letter_pressured_day4', false],
    ['iris_letter_pressured_day4', true],
  ] as const)('%s cannot be bypassed with private ledger=%s', (boundary, privateLedger) => {
    const flags = [
      ...evidence,
      boundary,
      ...(privateLedger ? ['final_ledger_record_private'] : []),
    ];
    expect(options(restore(at(flags)))).not.toContain('paper-study');
    expect(
      options(restore(at([...flags, 'final_manuscript_provenance_decided']))),
    ).not.toContain('paper-study-permission');
    // Old saves can already be inside this node even when the entry is now gated.
    // Keep their safe exit, without re-opening access to the manuscripts.
    let state = restore(at([...flags, 'final_manuscript_provenance_decided'], 'paper-study-permission'));
    expect(options(state)).toEqual(['paper-permission-respect']);
    expect(currentNode(finalReading, state).text).not.toContain('Аркуші можу показати');
    expect(() => selectOption(finalReading, state, 'paper-permission-lend')).toThrow();
    state = selectOption(finalReading, state, 'paper-permission-respect');
    state = restore(selectOption(finalReading, state, 'paper-permission-return'));
    expect(state.flags).toContain('final_paper_study_access_declined');
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    expect(options(state)).not.toContain('paper-study-permission');
    expect(options(state)).toContain('close');
  });

  it('a concealed breach does not give Iris knowledge of it', () => {
    const state = selectOption(
      finalReading,
      at([...evidence, 'opened_private_letter', 'final_manuscript_provenance_decided']),
      'paper-study-permission',
    );
    expect(options(state)).toContain('paper-permission-lend');
    expect(currentNode(finalReading, state).text).not.toContain('Ти вже сказав');
  });

  it('an old in-progress comparison remains completable after restoration', () => {
    let state = restore(at([...evidence, 'iris_letter_breach_admitted'], 'paper-study'));
    for (const id of [
      'paper-study-edges',
      'paper-edges-back',
      'paper-study-ink',
      'paper-ink-back',
      'paper-study-voices',
      'paper-voices-back',
      'paper-study-conclude',
      'paper-decision-private',
      'paper-study-return',
    ]) {
      expect(options(state)).toContain(id);
      state = restore(selectOption(finalReading, state, id));
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_paper_study_done');
  });

  it('both physical observations describe a straight edge and an irregular edge', () => {
    for (const node of ['paper-study-edges', 'case-closure-authors']) {
      const text = currentNode(finalReading, at(evidence, node)).text;
      expect(text).toContain('нерівний');
      expect(text).toContain('ножиць');
    }
  });

  it.each([{ extra: [] }, { extra: ['final_letter_breach_disclosed'] }])(
    'Iris gives her own observation, without claiming Eleanor’s journal %j',
    ({ extra }) => {
      let state = selectOption(
        finalReading,
        at(['final_ledger_scene_complete', 'final_ledger_iris_told', ...extra]),
        'ledger-gap',
      );
      state = selectOption(finalReading, state, 'ledger-gap-iris');
      expect(currentNode(finalReading, state).text).toContain('не бачила, кому переда');
      expect(currentNode(finalReading, state).text).not.toContain(
        'не готова віддавати вам і цей запис',
      );
      state = restore(selectOption(finalReading, state, 'ledger-gap-iris-back'));
      expect(state.flags).toContain('final_ledger_gap_iris_heard');
    },
  );
});

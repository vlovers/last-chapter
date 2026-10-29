import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const evidence = ['final_chapter_evidence_reviewed', 'final_ledger_scene_complete'];

function play(flags: string[], route: readonly string[]): DialogueState {
  let state: DialogueState = { ...startDialogue(finalReading), node: 'gathering', flags };
  for (const id of route) {
    expect(
      availableOptions(finalReading, state).map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(finalReading, state, id);
  }
  return state;
}

describe('paper study: manuscript custody and consent', () => {
  it.each([
    'final_provenance_iris_custody',
    'final_provenance_consent_archive',
    'final_provenance_wait_for_evidence',
  ])('requires fresh permission after %s', (custody) => {
    const flags = [...evidence, 'final_manuscript_provenance_decided', custody];
    const state = play(flags, []);
    const options = availableOptions(finalReading, state).map((option) => option.id);
    expect(options).not.toContain('paper-study');
    expect(options).toContain('paper-study-permission');

    const allowed = play(flags, ['paper-study-permission', 'paper-permission-lend']);
    expect(allowed.node).toBe('paper-study');
    expect(allowed.flags).toContain('final_paper_iris_lent_originals');
    expect(currentNode(finalReading, allowed).text).toContain('фотографій');
  });

  it('allows the original comparison before Iris decides manuscript custody', () => {
    const state = play(evidence, ['paper-study']);
    expect(state.node).toBe('paper-study');
    expect(currentNode(finalReading, state).text).toContain('Айріс дозволяє');
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
  });

  it.each(['final_letter_breach_disclosed', 'final_case_iris_declined'])(
    'does not grant access after %s',
    (boundary) => {
      const state = play(
        [...evidence, 'final_manuscript_provenance_decided', boundary],
        ['paper-study-permission'],
      );
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'paper-permission-lend',
      );
      const finished = selectOption(
        finalReading,
        selectOption(finalReading, state, 'paper-permission-respect'),
        'paper-permission-return',
      );
      expect(finished.flags).toContain('final_paper_study_access_declined');
      expect(finished.flags).not.toContain('final_paper_study_done');
      expect(finished.flags).not.toContain('final_paper_iris_lent_originals');
      expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('без її дозволу');
      expect(availableOptions(finalReading, finished).map((option) => option.id)).not.toContain(
        'paper-study-permission',
      );
    },
  );

  it('keeps a private ledger private even when Iris lends the originals', () => {
    const state = play(
      [
        ...evidence,
        'final_manuscript_provenance_decided',
        'final_provenance_iris_custody',
        'final_ledger_record_private',
      ],
      ['paper-study-permission', 'paper-permission-lend'],
    );
    expect(currentNode(finalReading, state).text).toContain('приватний журнал');
    expect(currentNode(finalReading, state).text).not.toContain('номер сімнадцять');
  });

  it('does not disclose Eleanor private ledger when requesting Iris permission', () => {
    const state = play(
      [
        ...evidence,
        'final_manuscript_provenance_decided',
        'final_provenance_iris_custody',
        'final_ledger_record_private',
      ],
      ['paper-study-permission'],
    );
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('не дістає приватний журнал');
    expect(text).not.toContain('про журнал, який Елеонора');
    expect(text).not.toContain('номер сімнадцять');
  });

  it('persists consent through the entire examination and records it in the epilogue', () => {
    const state = play(
      [...evidence, 'final_manuscript_provenance_decided', 'final_provenance_iris_custody'],
      [
        'paper-study-permission',
        'paper-permission-lend',
        'paper-study-edges',
        'paper-edges-back',
        'paper-study-ink',
        'paper-ink-back',
        'paper-study-voices',
        'paper-voices-back',
        'paper-study-conclude',
        'paper-decision-private',
        'paper-study-return',
      ],
    );
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_paper_study_done');
    expect(state.flags).toContain('final_paper_iris_lent_originals');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('п’ять хвилин');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'paper-study-permission',
    );
  });

  it('limits all consent nodes to four choices and resolves their destinations', () => {
    const nodes = finalReading.nodes.filter(
      (node) =>
        node.id.startsWith('paper-study-permission') || node.id === 'paper-study-no-consent',
    );
    expect(nodes).toHaveLength(2);
    for (const node of nodes) {
      expect(node.options.length).toBeLessThanOrEqual(4);
      for (const option of node.options) {
        expect(finalReading.nodes.some((destination) => destination.id === option.next)).toBe(true);
      }
    }
  });
});

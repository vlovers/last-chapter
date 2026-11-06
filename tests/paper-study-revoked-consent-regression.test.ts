import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const evidence = ['final_chapter_evidence_reviewed', 'final_ledger_scene_complete'];
const boundaries = [
  'final_case_iris_declined',
  'final_letter_breach_disclosed',
  'iris_letter_breach_admitted',
  'iris_letter_pressured_day4',
] as const;

function at(node: string, flags: readonly string[]): DialogueState {
  return { ...startDialogue(finalReading), node, flags: [...flags] };
}

function choices(node: string, flags: readonly string[]) {
  return availableOptions(finalReading, at(node, flags)).map((option) => option.id);
}

describe('Paper study: revoked consent across legacy saves', () => {
  it.each(boundaries)('does not offer either examination route after %s', (boundary) => {
    expect(choices('gathering', [...evidence, boundary])).not.toContain('paper-study');
    expect(
      choices('gathering', [...evidence, 'final_manuscript_provenance_decided', boundary]),
    ).not.toContain('paper-study-permission');
  });

  it.each([
    ['final_case_iris_declined', 'iris_letter_pressured_day4'],
    ['final_letter_breach_disclosed', 'iris_letter_breach_admitted'],
    ['final_case_iris_declined', 'final_letter_breach_disclosed', 'iris_letter_pressured_day4'],
  ])('honours every boundary when old saves combine %s with other flags', (...boundaries) => {
    const flags = [...evidence, 'final_manuscript_provenance_decided', ...boundaries];
    expect(choices('gathering', flags)).not.toContain('paper-study-permission');
    expect(choices('paper-study-permission', flags)).toEqual(['paper-permission-respect']);
  });

  it.each(boundaries)('keeps a safe exit from an old permission scene after %s', (boundary) => {
    const flags = [...evidence, 'final_manuscript_provenance_decided', boundary];
    const state = at('paper-study-permission', flags);
    expect(choices(state.node, state.flags)).toEqual(['paper-permission-respect']);
    const refusal = selectOption(finalReading, state, 'paper-permission-respect');
    expect(refusal.node).toBe('paper-study-no-consent');
    const returned = selectOption(finalReading, refusal, 'paper-permission-return');
    expect(returned.node).toBe('gathering');
    expect(returned.flags).toContain('final_paper_study_access_declined');
    expect(returned.flags).not.toContain('final_paper_iris_lent_originals');
    expect(returned.flags).not.toContain('final_paper_study_done');
  });

  it.each(boundaries)('does not invite Iris into a restored study after %s', (boundary) => {
    const flags = [...evidence, 'final_ledger_iris_told', boundary];
    const options = choices('paper-study-voices', flags);
    expect(options).not.toContain('paper-voices-iris');
    expect(options).toContain('paper-voices-back');
    expect(options.length).toBeLessThanOrEqual(4);
  });

  it.each(boundaries)('does not hand Iris a question list after %s', (boundary) => {
    const flags = [...evidence, 'final_ledger_iris_told', boundary];
    const options = choices('paper-study-decision', flags);
    expect(options).not.toContain('paper-decision-iris');
    expect(options).toContain('paper-decision-private');
    expect(options).toContain('paper-decision-defer');
    expect(options.length).toBeLessThanOrEqual(4);
  });

  it('still allows a fresh five-minute comparison with intact consent', () => {
    const flags = [...evidence, 'final_manuscript_provenance_decided'];
    expect(choices('gathering', flags)).toContain('paper-study-permission');
    const permission = selectOption(finalReading, at('gathering', flags), 'paper-study-permission');
    expect(currentNode(finalReading, permission).text).toContain('П’ять хвилин');
    const allowed = selectOption(finalReading, permission, 'paper-permission-lend');
    expect(allowed.node).toBe('paper-study');
    expect(allowed.flags).toContain('final_paper_iris_lent_originals');
  });

  it('preserves a refused legacy scene across save and restore', () => {
    const flags = [
      ...evidence,
      'final_manuscript_provenance_decided',
      'iris_letter_breach_admitted',
    ];
    const state = at('paper-study-permission', flags);
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: state, flags: [...state.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(availableOptions(finalReading, restored!.dialogue).map((option) => option.id)).toEqual([
      'paper-permission-respect',
    ]);
    const returned = selectOption(
      finalReading,
      selectOption(finalReading, restored!.dialogue, 'paper-permission-respect'),
      'paper-permission-return',
    );
    expect(returned.flags).toContain('final_paper_study_access_declined');
  });

  it('keeps destinations valid and permission-related scenes within four choices', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const nodeId of [
      'paper-study-permission',
      'paper-study-no-consent',
      'paper-study-voices',
      'paper-study-decision',
    ]) {
      const node = finalReading.nodes.find((entry) => entry.id === nodeId);
      expect(node, nodeId).toBeDefined();
      expect(node!.options.length, nodeId).toBeLessThanOrEqual(4);
      for (const option of node!.options) {
        expect(finalReading.nodes.some((candidate) => candidate.id === option.next)).toBe(true);
      }
    }
  });
});

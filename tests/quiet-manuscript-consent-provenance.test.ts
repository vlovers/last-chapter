import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';
import {
  evidenceKindLabels,
  journalEvidence,
  journalFacts,
  journalFlagVisible,
} from '../src/phaser/journal-facts';

const facts = new Map(journalFacts);
const provenance = new Map(journalEvidence.map((entry) => [entry.flag, entry]));

function followup(extra: readonly string[] = []) {
  const gathering = selectOption(finalReading, startDialogue(finalReading), 'open');
  return selectOption(
    finalReading,
    { ...gathering, flags: ['iris_quiet_page_discussed', ...extra] },
    'quiet-manuscript-followup',
  );
}

describe('Quiet manuscript: consent, provenance and custody continuity', () => {
  it.each([
    ['iris_quiet_page_privacy_respected', 'testimony'],
    ['iris_quiet_page_identity_questioned', 'testimony'],
    ['final_quiet_manuscript_returned', 'custody'],
    ['final_quiet_manuscript_archived', 'custody'],
  ] as const)('records %s as %s with a named source', (flag, kind) => {
    const entry = provenance.get(flag);
    expect(facts.get(flag)?.length).toBeGreaterThan(20);
    expect(entry?.kind).toBe(kind);
    expect(entry?.source).toContain('Айріс');
    expect(entry?.title.length).toBeGreaterThan(10);
  });

  it('labels custody as a decision, not evidence of manuscript authorship', () => {
    expect(evidenceKindLabels.custody).toContain('не доказ авторства');
    expect(facts.get('final_quiet_manuscript_returned')).not.toContain('авторство доведено');
    expect(facts.get('final_quiet_manuscript_archived')).not.toContain('авторство доведено');
  });

  it.each([
    ['quiet-page-respect', 'iris_quiet_page_privacy_respected'],
    ['quiet-page-ask', 'iris_quiet_page_identity_questioned'],
  ] as const)('records only the chosen day-four boundary: %s', (choice, flag) => {
    const state = {
      ...startDialogue(irisDecision),
      node: 'quiet-page-choice',
      flags: ['quiet_evening_page_found'],
    };
    const chosen = selectOption(irisDecision, state, choice);
    const other =
      flag === 'iris_quiet_page_privacy_respected'
        ? 'iris_quiet_page_identity_questioned'
        : 'iris_quiet_page_privacy_respected';
    expect(chosen.flags).toContain(flag);
    expect(chosen.flags).not.toContain(other);
    expect(provenance.get(flag)?.kind).toBe('testimony');
    expect(journalFlagVisible(flag, new Set(chosen.flags))).toBe(true);
    expect(journalFlagVisible(other, new Set(chosen.flags))).toBe(false);
  });

  it('asks Iris rather than unilaterally archiving her page', () => {
    const state = followup();
    const options = availableOptions(finalReading, state);
    expect(options.map((option) => option.id)).toEqual([
      'quiet-manuscript-archive',
      'quiet-manuscript-return',
    ]);
    expect(options[0]?.label).toContain('Якщо ти згодна');
    expect(options[1]?.label).toContain('сама вирішила');
    expect(options.length).toBeLessThanOrEqual(4);
  });

  it.each([
    [
      'quiet-manuscript-archive',
      'final_quiet_manuscript_archived',
      'final_quiet_manuscript_returned',
      'Так, я згодна',
      'спершу зберегли у книгарні',
    ],
    [
      'quiet-manuscript-return',
      'final_quiet_manuscript_returned',
      'final_quiet_manuscript_archived',
      'Заберу його',
      'Айріс забрала сторінку додому',
    ],
  ] as const)('keeps the %s custody choice distinct after save/restore', (
    choice,
    granted,
    excluded,
    reply,
    epilogue,
  ) => {
    const state = selectOption(finalReading, followup(), choice);
    expect(state.flags).toContain(granted);
    expect(state.flags).not.toContain(excluded);
    expect(currentNode(finalReading, state).text).toContain(reply);
    const returned = selectOption(finalReading, state, 'quiet-manuscript-result-back');
    expect(returned.node).toBe('gathering');
    expect(returned.flags).toContain('final_quiet_manuscript_followup');
    expect(seasonEnding({ flags: returned.flags }).epilogue).toContain(epilogue);
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: returned, flags: [...returned.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(restored!.flags).toContain(granted);
    expect(
      availableOptions(finalReading, restored!.dialogue).map((option) => option.id),
    ).not.toContain('quiet-manuscript-followup');
  });

  it('resolves conflicting legacy custody flags consistently across story and journal', () => {
    const flags = [
      'iris_quiet_page_discussed',
      'final_quiet_manuscript_archived',
      'final_quiet_manuscript_returned',
    ];
    const state = { ...followup(), node: 'quiet-manuscript-result', flags };
    expect(currentNode(finalReading, state).text).toContain('Заберу його');
    expect(currentNode(finalReading, state).text).not.toContain('Так, я згодна');
    expect(seasonEnding({ flags }).epilogue).toContain('Айріс забрала сторінку додому');
    const visible = new Set(flags.filter((flag) => journalFlagVisible(flag, new Set(flags))));
    expect(visible).toContain('final_quiet_manuscript_returned');
    expect(visible).not.toContain('final_quiet_manuscript_archived');
  });

  it('does not expose future custody or permission decisions before they occur', () => {
    const flags = new Set(['quiet_evening_page_found', 'iris_quiet_page_discussed']);
    for (const flag of [
      'iris_quiet_page_privacy_respected',
      'iris_quiet_page_identity_questioned',
      'final_quiet_manuscript_returned',
      'final_quiet_manuscript_archived',
    ]) {
      expect(journalFlagVisible(flag, flags)).toBe(false);
    }
    expect(new Set(journalEvidence.map((entry) => entry.flag)).size).toBe(
      journalEvidence.length,
    );
  });

  it('preserves valid dialogue graphs and stable legacy choice IDs', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
    const node = finalReading.nodes.find((entry) => entry.id === 'quiet-manuscript-followup');
    expect(node?.options.map((option) => option.id)).toEqual([
      'quiet-manuscript-archive',
      'quiet-manuscript-return',
    ]);
    expect(node?.options.every((option) => option.next === 'quiet-manuscript-result')).toBe(true);
  });
});

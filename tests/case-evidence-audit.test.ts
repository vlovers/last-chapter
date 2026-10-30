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
import { seasonEnding } from '../src/game/endings';

const prerequisites = ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'];

function options(state: DialogueState): string[] {
  return availableOptions(finalReading, state).map((option) => option.id);
}

function enter(extra: readonly string[] = []): DialogueState {
  let state: DialogueState = {
    ...startDialogue(finalReading),
    node: 'gathering',
    flags: [...prerequisites, ...extra],
  };
  for (const id of ['case-closure', 'case-topic-authors', 'case-authors-crosscheck']) {
    expect(options(state), `Missing ${id} at ${state.node}`).toContain(id);
    state = selectOption(finalReading, state, id);
  }
  return state;
}

function play(extra: readonly string[], route: readonly string[]): DialogueState {
  let state = enter(extra);
  for (const id of route) {
    expect(options(state), `Missing ${id} at ${state.node}`).toContain(id);
    state = selectOption(finalReading, state, id);
  }
  return state;
}

describe('case evidence audit: distinct sources, consent and consequences', () => {
  it('is available only inside the case review and can be completed once', () => {
    const state = enter();
    expect(state.node).toBe('case-evidence-audit');
    expect(options(state)).toContain('case-audit-box');
    expect(options(state)).not.toContain('case-audit-stars');
    expect(options(state)).not.toContain('case-audit-recipient');
    expect(options(state)).not.toContain('case-audit-decide');
    const finished = play([], [
      'case-audit-box',
      'case-audit-box-back',
      'case-audit-decide',
      'case-audit-private',
      'case-audit-finish',
    ]);
    expect(finished.node).toBe('case-closure-authors');
    expect(finished.flags).toContain('final_case_evidence_audit_done');
    expect(options(finished)).not.toContain('case-authors-crosscheck');
    expect(options(finished)).toContain('case-authors-back');
  });

  it('distinguishes the confirmed bookshop box from the manuscript pencil mark', () => {
    const state = play([], ['case-audit-box']);
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('журнал');
    expect(text).toContain('не можу пригадати');
    expect(text).not.toContain('авторство доведено');
  });

  it('separates the workshop shelf number seven from box seventeen', () => {
    const state = play(['final_workshop_photo_reviewed'], ['case-audit-box']);
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('сімка');
    expect(text).toContain('сімнадцять');
    expect(text).toContain('не довели');
  });

  it('keeps star comparison unavailable without both earlier observations', () => {
    for (const flags of [[], ['iris_quiet_page_discussed'], ['iris_margin_note_discussed']]) {
      expect(options(enter(flags))).not.toContain('case-audit-stars');
    }
    const state = enter(['iris_quiet_page_discussed', 'iris_margin_note_discussed']);
    expect(options(state)).toContain('case-audit-stars');
  });

  it.each(['opened_private_letter', 'iris_letter_breach_admitted'])(
    'does not turn a breached Iris letter into permission to inspect originals: %s',
    (breach) => {
      const state = play(
        ['iris_quiet_page_discussed', 'iris_margin_note_discussed', breach],
        ['case-audit-stars'],
      );
      expect(currentNode(finalReading, state).text).toContain('не');
      const returned = selectOption(finalReading, state, 'case-audit-stars-back');
      expect(returned.flags).toContain('final_case_audit_stars_checked');
      expect(returned.flags).not.toContain('final_paper_iris_lent_originals');
      expect(returned.flags).not.toContain('final_iris_evidence_public_catalog_requested');
    },
  );

  it('treats a blank recipient field as missing information, not theft', () => {
    const state = play(['final_ledger_gap_done'], ['case-audit-recipient']);
    expect(currentNode(finalReading, state).text).toContain('порожня');
    expect(currentNode(finalReading, state).text).toContain('не можна');
    const returned = selectOption(finalReading, state, 'case-audit-recipient-back');
    expect(returned.flags).toContain('final_case_audit_recipient_checked');
  });

  it('preserves a previously seeded false headline and permits a correction request', () => {
    const state = play(['final_ledger_gap_done', 'final_ledger_gap_speculation_printed'], [
      'case-audit-box',
      'case-audit-box-back',
      'case-audit-recipient',
      'case-audit-recipient-back',
      'case-audit-decide',
    ]);
    expect(options(state)).toContain('case-audit-correct');
    const requested = selectOption(finalReading, state, 'case-audit-correct');
    expect(requested.flags).toContain('final_case_audit_correction_requested');
    expect(requested.flags).toContain('final_ledger_gap_speculation_printed');
    expect(currentNode(finalReading, requested).text).toContain('редакторові');
    const done = selectOption(finalReading, requested, 'case-audit-finish');
    expect(seasonEnding({ flags: done.flags }).epilogue).toContain('зупинити');
    expect(seasonEnding({ flags: done.flags }).epilogue).toContain('Відповіді ще не було');
  });

  it('never offers the correction for a headline that was not published', () => {
    const state = play([], ['case-audit-box', 'case-audit-box-back', 'case-audit-decide']);
    expect(options(state)).not.toContain('case-audit-correct');
  });

  it.each([
    ['case-audit-private', 'final_case_audit_private_summary', 'приватній теці'],
    ['case-audit-accuse', 'final_case_audit_accusation_attempted', 'відмовилася друкувати'],
  ])('carries %s into the epilogue without inventing an author', (choice, flag, excerpt) => {
    const state = play([], [
      'case-audit-box',
      'case-audit-box-back',
      'case-audit-decide',
      choice,
      'case-audit-finish',
    ]);
    expect(state.flags).toContain(flag);
    expect(state.flags).toContain('final_case_evidence_audit_done');
    const ending = seasonEnding({ flags: state.flags });
    expect(ending.epilogue).toContain(excerpt);
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
  });

  it('leaves the manuscript source unknown even when all three checks are completed', () => {
    const state = play(
      ['iris_quiet_page_discussed', 'iris_margin_note_discussed', 'final_ledger_gap_done'],
      [
        'case-audit-box',
        'case-audit-box-back',
        'case-audit-stars',
        'case-audit-stars-back',
        'case-audit-recipient',
        'case-audit-recipient-back',
        'case-audit-decide',
        'case-audit-private',
        'case-audit-finish',
      ],
    );
    for (const flag of [
      'final_case_audit_box_checked',
      'final_case_audit_stars_checked',
      'final_case_audit_recipient_checked',
    ]) {
      expect(state.flags).toContain(flag);
    }
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    expect(state.flags).not.toContain('final_manuscript_author_identified');
  });

  it('corrects the case-closure wording to distinguish journal record and inference', () => {
    const state = {
      ...startDialogue(finalReading),
      node: 'case-closure-timeline',
      flags: prerequisites,
    };
    expect(currentNode(finalReading, state).text).toContain('не пам’ятаю');
    const decision = { ...state, node: 'case-closure-decision' };
    expect(currentNode(finalReading, decision).text).toContain('Не знаємо');
  });

  it('validates all audit destinations and keeps each node at four choices or fewer', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of finalReading.nodes.filter((entry) => entry.id.startsWith('case-evidence-'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
      for (const option of node.options) {
        expect(finalReading.nodes.some((destination) => destination.id === option.next)).toBe(true);
      }
    }
  });
});

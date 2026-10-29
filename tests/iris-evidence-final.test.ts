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

const discovered = ['iris_quiet_page_discussed', 'iris_margin_note_discussed'];

function enter(flags: string[] = discovered): DialogueState {
  const state = { ...startDialogue(finalReading), node: 'gathering', flags };
  return selectOption(finalReading, state, 'final-iris-evidence-topic');
}

function follow(flags: string[], route: string[]): DialogueState {
  let state = enter(flags);
  for (const id of route) {
    expect(
      availableOptions(finalReading, state).map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(finalReading, state, id);
  }
  return state;
}

describe('Iris evidence follow-up: trust, consent and uncertain clues', () => {
  it('requires both earlier discoveries and disappears after completion', () => {
    for (const flags of [[], [discovered[0]], [discovered[1]]]) {
      const state = { ...startDialogue(finalReading), node: 'gathering', flags };
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'final-iris-evidence-topic',
      );
    }
    const state = { ...startDialogue(finalReading), node: 'gathering', flags: discovered };
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(
      'final-iris-evidence-topic',
    );
    const completed = follow(discovered, [
      'final-iris-evidence-private',
      'final-iris-evidence-private-back',
    ]);
    expect(completed.flags).toContain('final_iris_evidence_conversation_done');
    expect(availableOptions(finalReading, completed).map((option) => option.id)).not.toContain(
      'final-iris-evidence-topic',
    );
  });

  it.each([
    'opened_private_letter',
    'iris_letter_breach_admitted',
    'iris_letter_pressured_day4',
    'final_letter_breach_disclosed',
    'final_case_iris_declined',
  ])('never offers new evidence access after %s', (boundary) => {
    const state = enter([...discovered, boundary]);
    const ids = availableOptions(finalReading, state).map((option) => option.id);
    expect(ids).not.toContain('final-iris-evidence-ask');
    expect(ids).toContain('final-iris-evidence-private');
    expect(ids).toContain('final-iris-evidence-private');
    expect(currentNode(finalReading, state).text).not.toContain('Можна спитати Нору');
  });

  it.each([
    ['final-iris-evidence-catalog', 'final_iris_evidence_public_catalog_requested', 'Адреса є'],
    ['final-iris-evidence-uncertain', 'final_iris_evidence_uncertainty_recorded', 'дві зірки'],
    ['final-iris-evidence-wait', 'final_iris_evidence_check_deferred', 'Я не програю!'],
  ])('keeps the chosen evidence treatment distinct: %s', (option, flag, text) => {
    const state = follow(discovered, ['final-iris-evidence-ask', option]);
    expect(state.flags).toContain(flag);
    expect(currentNode(finalReading, state).text).toContain(text);
    const returned = selectOption(finalReading, state, 'final-iris-evidence-result-back');
    expect(returned.node).toBe('gathering');
    expect(returned.flags).toContain('final_iris_evidence_conversation_done');
    expect(seasonEnding({ flags: returned.flags }).epilogue).toContain(
      flag === 'final_iris_evidence_public_catalog_requested'
        ? 'каталог'
        : flag === 'final_iris_evidence_uncertainty_recorded'
          ? 'дві зірки'
          : 'відклали',
    );
  });

  it('records the privacy choice without granting manuscript custody', () => {
    const state = follow(
      [...discovered, 'iris_letter_breach_admitted'],
      ['final-iris-evidence-private', 'final-iris-evidence-private-back'],
    );
    expect(state.flags).toContain('final_iris_evidence_private_notes');
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    expect(state.flags).not.toContain('final_iris_evidence_public_catalog_requested');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('особистому блокноті');
  });

  it.each([
    ['final-iris-evidence-rumor-own', 'final_iris_evidence_rumor_withdrawn', 'зупинив'],
    ['final-iris-evidence-rumor-deflect', 'final_iris_evidence_rumor_defended', 'відмовилася'],
  ])('does not treat speculative gossip as evidence: %s', (option, flag, epilogue) => {
    const state = follow(discovered, [
      'final-iris-evidence-rumor',
      option,
      'final-iris-evidence-rumor-back',
    ]);
    expect(state.flags).toContain('final_iris_evidence_rumor_seeded');
    expect(state.flags).toContain(flag);
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(epilogue);
  });

  it.each([
    [
      'final-iris-evidence-own-to-nora',
      'final_iris_evidence_breach_owned_with_nora',
      'не використовувати нотатки',
    ],
    [
      'final-iris-evidence-stop-asking',
      'final_iris_evidence_breach_boundary_kept',
      'перестав просити',
    ],
  ])('lets the player own a breach without restoring access: %s', (option, flag, epilogue) => {
    const state = follow(
      [...discovered, 'iris_letter_breach_admitted'],
      ['final-iris-evidence-accountability', option, 'final-iris-evidence-accountability-back'],
    );
    expect(state.flags).toContain(flag);
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    expect(state.flags).not.toContain('final_iris_evidence_public_catalog_requested');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(epilogue);
  });

  it('does not create more than four choices in any new dialogue node', () => {
    const ids = [
      'final-iris-evidence',
      'final-iris-evidence-accountability',
      'final-iris-evidence-accountability-result',
      'final-iris-evidence-source',
      'final-iris-evidence-private',
      'final-iris-evidence-rumor',
      'final-iris-evidence-rumor-result',
      'final-iris-evidence-result',
    ];
    for (const id of ids) {
      const node = finalReading.nodes.find((item) => item.id === id);
      expect(node, `Missing ${id}`).toBeDefined();
      expect(node!.options.length).toBeLessThanOrEqual(4);
      for (const option of node!.options) {
        expect(finalReading.nodes.some((item) => item.id === option.next)).toBe(true);
      }
    }
  });
});

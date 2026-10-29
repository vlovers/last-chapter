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

const gate = 'eleanor_timeline_checked';
const topic = 'final-eleanor-memory-topic';

function gathering(flags: string[] = []): DialogueState {
  return { ...startDialogue(finalReading), node: 'gathering', flags };
}

function play(flags: string[], route: readonly string[]): DialogueState {
  let state = gathering(flags);
  for (const id of route) {
    expect(
      availableOptions(finalReading, state).map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(finalReading, state, id);
  }
  return state;
}

describe('Eleanor: flood memory and unresolved evidence', () => {
  it('is gated on the day-three timeline, not on Iris granting manuscript access', () => {
    expect(availableOptions(finalReading, gathering()).map((option) => option.id)).not.toContain(
      topic,
    );
    expect(availableOptions(finalReading, gathering([gate])).map((option) => option.id)).toContain(
      topic,
    );
    expect(
      availableOptions(finalReading, gathering([gate, 'final_case_iris_declined'])).map(
        (option) => option.id,
      ),
    ).toContain(topic);
  });

  it.each([
    ['eleanor_timeline_kept_uncertainty', 'двома колонками'],
    ['eleanor_timeline_assumed_guilt', 'навмисно сховала'],
  ])('reacts to the earlier timeline conversation: %s', (flag, expected) => {
    const state = play([gate, flag], [topic]);
    expect(currentNode(finalReading, state).text).toContain(expected);
  });

  it.each([
    [
      'final-eleanor-memory-dates',
      'final-eleanor-memory-record-gap',
      'final-eleanor-memory-dates-back',
      'final_eleanor_memory_gap_recorded',
      'Дзвінок — не підтверджено',
      'порожній рядок',
    ],
    [
      'final-eleanor-memory-dates',
      'final-eleanor-memory-accuse',
      'final-eleanor-memory-dates-back',
      'final_eleanor_memory_public_accusation',
      'Ти можеш так сказати',
      'пригрозив',
    ],
    [
      'final-eleanor-memory-box',
      'final-eleanor-memory-box-private',
      'final-eleanor-memory-box-back',
      'final_eleanor_memory_privacy_kept',
      'Домовилися',
      'Приватні папери',
    ],
    [
      'final-eleanor-memory-box',
      'final-eleanor-memory-box-ask',
      'final-eleanor-memory-box-back',
      'final_eleanor_memory_permission_suggested',
      'Я можу запитати',
      'Згоди на перегляд',
    ],
    [
      'final-eleanor-memory-people',
      'final-eleanor-memory-witness',
      'final-eleanor-memory-people-back',
      'final_eleanor_memory_witness_lead',
      'стару адресу',
      'можливий свідок',
    ],
    [
      'final-eleanor-memory-people',
      'final-eleanor-memory-tea',
      'final-eleanor-memory-people-back',
      'final_eleanor_memory_pie_story',
      'Грушевий',
      'грушевий пиріг',
    ],
  ])(
    'carries a distinct Eleanor decision into the epilogue: %s / %s',
    (entry, choice, back, flag, sceneText, endingText) => {
      const beforeReturn = play([gate], [topic, entry, choice]);
      expect(currentNode(finalReading, beforeReturn).text).toContain(sceneText);
      const afterReturn = selectOption(finalReading, beforeReturn, back);
      expect(afterReturn.node).toBe('gathering');
      expect(afterReturn.flags).toContain(flag);
      expect(afterReturn.flags).toContain('final_eleanor_memory_done');
      expect(seasonEnding({ flags: afterReturn.flags }).epilogue).toContain(endingText);
      expect(availableOptions(finalReading, afterReturn).map((option) => option.id)).not.toContain(
        topic,
      );
    },
  );

  it('can leave the papers alone without forcing a detective conclusion', () => {
    const state = play(
      [gate],
      [topic, 'final-eleanor-memory-leave', 'final-eleanor-memory-leave-back'],
    );
    expect(state.flags).toContain('final_eleanor_memory_evening_respected');
    expect(state.flags).toContain('final_eleanor_memory_done');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('Френк');
  });

  it('does not turn an offer to ask Iris into permission or manuscript custody', () => {
    const state = play(
      [gate, 'final_case_iris_declined', 'final_letter_breach_disclosed'],
      [topic, 'final-eleanor-memory-box', 'final-eleanor-memory-box-ask', 'final-eleanor-memory-box-back'],
    );
    expect(state.flags).toContain('final_eleanor_memory_permission_suggested');
    expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    expect(state.flags).not.toContain('final_paper_study_done');
    expect(state.flags).not.toContain('final_iris_evidence_public_catalog_requested');
  });

  it('keeps the confirmed box number separate from the uncertain manuscript marking', () => {
    const state = play([gate], [topic, 'final-eleanor-memory-box']);
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Сімнадцять була однією з них');
    expect(text).toContain('чи стосується її число на знайденому аркуші — я не знаю');
  });

  it('limits each new node to four choices with valid destinations', () => {
    const ids = [
      'final-eleanor-memory',
      'final-eleanor-memory-dates',
      'final-eleanor-memory-dates-result',
      'final-eleanor-memory-box',
      'final-eleanor-memory-box-result',
      'final-eleanor-memory-people',
      'final-eleanor-memory-people-result',
      'final-eleanor-memory-leave',
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

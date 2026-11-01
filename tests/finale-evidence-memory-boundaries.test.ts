import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';

const gathering = (flags: string[]) => ({
  ...startDialogue(finalReading),
  node: 'gathering',
  flags,
});

describe('Final evening evidence and memory boundaries', () => {
  it('does not expose mutually exclusive Reed outcomes together', () => {
    const outcomes = [
      'final_counter_reed_note',
      'final_counter_reed_book_kept',
      'final_counter_reed_deferred',
    ];
    for (const chosen of outcomes) {
      const state = gathering(['final_counter_evening_done', chosen]);
      const text = currentNode(finalReading, state).text;
      const signatures = [
        'Запечатаний конверт пана Ріда',
        'Пан Рід забрав свою книжку',
        'Пан Рід забрав книжку й вирішить удома',
      ];
      expect(signatures.filter((signature) => text.includes(signature))).toHaveLength(1);
    }
  });

  it('keeps each character conversation within four choices', () => {
    // The gathering is a topic catalogue, not a dialogue choice screen.
    for (const node of finalReading.nodes.filter((node) => node.id !== 'gathering')) {
      expect(node.options.length, `Too many options at ${node.id}`).toBeLessThanOrEqual(4);
    }
  });

  it('keeps final-evening dialogue option IDs unique within each scene', () => {
    for (const node of finalReading.nodes) {
      const ids = node.options.map((option) => option.id);
      expect(new Set(ids).size, `Duplicate options at ${node.id}`).toBe(ids.length);
    }
  });

  it('ensures final-evening dialogue destinations exist', () => {
    const ids = new Set(finalReading.nodes.map((node) => node.id));
    for (const node of finalReading.nodes) {
      for (const option of node.options) {
        expect(ids.has(option.next), `Missing destination ${node.id} -> ${option.next}`).toBe(true);
      }
    }
  });

  it('does not offer Iris public-record research after a private-letter breach', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'opened_private_letter',
      ]),
      'final-iris-evidence-topic',
    );
    const choices = availableOptions(finalReading, state).map((option) => option.id);
    expect(choices).not.toContain('final-iris-evidence-ask');
    expect(choices).toContain('final-iris-evidence-private');
    expect(currentNode(finalReading, state).text).toContain('Айріс досі не знає');
    expect(choices).not.toContain('final-iris-evidence-accountability');
  });

  it('lets Iris refer to a breach only after the player admits it', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'opened_private_letter',
        'iris_letter_breach_admitted',
      ]),
      'final-iris-evidence-topic',
    );
    expect(currentNode(finalReading, state).text).toContain('відкрив його без дозволу');
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(
      'final-iris-evidence-accountability',
    );
  });

  it('acknowledges a disclosed letter breach instead of treating it as a secret', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'opened_private_letter',
        'final_letter_breach_disclosed',
      ]),
      'final-iris-evidence-topic',
    );
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Ми вже з’ясували');
    expect(text).not.toContain('досі не знає');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-iris-evidence-ask',
    );
  });

  it('respects Iris day-four refusal even when a private letter remains undisclosed', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'opened_private_letter',
        'iris_letter_pressured_day4',
      ]),
      'final-iris-evidence-topic',
    );
    expect(currentNode(finalReading, state).text).toContain(
      'Сьогодні про рукопис більше не говоритиму',
    );
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-iris-evidence-ask',
    );
  });

  it('keeps Iris refusal to investigate above competing letter-history flags', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'opened_private_letter',
        'iris_letter_breach_admitted',
        'final_case_iris_declined',
      ]),
      'final-iris-evidence-topic',
    );
    expect(currentNode(finalReading, state).text).toContain('сьогодні не шукатиму нових доказів');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-iris-evidence-ask',
    );
  });

  it('does not offer rumor escalation after Iris declines the investigation', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'final_case_iris_declined',
      ]),
      'final-iris-evidence-topic',
    );
    const choices = availableOptions(finalReading, state).map((option) => option.id);
    expect(choices).not.toContain('final-iris-evidence-rumor');
    expect(choices).not.toContain('final-iris-evidence-ask');
    expect(choices).toContain('final-iris-evidence-private');
  });

  it('lets Iris reject an invented box discovery without endorsing the rumor', () => {
    let state = selectOption(
      finalReading,
      gathering(['iris_quiet_page_discussed', 'iris_margin_note_discussed']),
      'final-iris-evidence-topic',
    );
    state = selectOption(finalReading, state, 'final-iris-evidence-rumor');
    expect(currentNode(finalReading, state).text).toContain('Ніхто її не знаходив');
    state = selectOption(finalReading, state, 'final-iris-evidence-rumor-own');
    expect(currentNode(finalReading, state).text).toContain('зупинилися');
    state = selectOption(finalReading, state, 'final-iris-evidence-rumor-back');
    expect(state.node).toBe('gathering');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-iris-evidence-topic',
    );
  });

  it('keeps public catalogue research separate from Iris private originals', () => {
    let state = selectOption(
      finalReading,
      gathering(['iris_quiet_page_discussed', 'iris_margin_note_discussed']),
      'final-iris-evidence-topic',
    );
    state = selectOption(finalReading, state, 'final-iris-evidence-ask');
    expect(currentNode(finalReading, state).text).toContain('відкритий для всіх');
    state = selectOption(finalReading, state, 'final-iris-evidence-catalog');
    expect(currentNode(finalReading, state).text).toContain('Адреса є');
    expect(currentNode(finalReading, state).text).toContain('жодного слова');
  });

  it('prioritizes Iris refusal even with multiple letter flags set', () => {
    const state = selectOption(
      finalReading,
      gathering([
        'iris_quiet_page_discussed',
        'iris_margin_note_discussed',
        'final_case_iris_declined',
        'iris_letter_breach_admitted',
        'final_letter_breach_disclosed',
        'iris_letter_pressured_day4',
      ]),
      'final-iris-evidence-topic',
    );
    expect(currentNode(finalReading, state).text).toContain('сьогодні не шукатиму нових доказів');
  });

  it('keeps Iris illustration work separate from the investigation and respects her shelf choice', () => {
    let state = selectOption(
      finalReading,
      gathering(['iris_cover_day_four_followup', 'iris_cover_independent_chosen']),
      'final-iris-cover-topic',
    );
    expect(currentNode(finalReading, state).text).toContain('чотири сторінки');
    state = selectOption(finalReading, state, 'final-iris-cover-offer-shelf');
    expect(currentNode(finalReading, state).text).toContain('без цінника');
    state = selectOption(finalReading, state, 'final-iris-cover-shelf-back');
    expect(state.node).toBe('gathering');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-iris-cover-topic',
    );
  });

  it('lets Leo defer the course without inventing an application or a confirmed shift', () => {
    let state = selectOption(
      finalReading,
      gathering(['leo_night_course_discussed', 'leo_night_course_deferred']),
      'final-leo-night-course',
    );
    expect(currentNode(finalReading, state).text).toContain('Я не подав заявку');
    state = selectOption(finalReading, state, 'final-leo-course-ask-jun');
    expect(currentNode(finalReading, state).text).toContain('листівку');
    state = selectOption(finalReading, state, 'final-leo-course-jun-back');
    expect(state.node).toBe('gathering');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-leo-night-course',
    );
  });

  it('keeps all three Iris public-catalogue outcomes distinct', () => {
    for (const [choice, expected] of [
      ['final-iris-evidence-catalog', 'Адреса є'],
      ['final-iris-evidence-uncertain', 'авторство не встановлено'],
      ['final-iris-evidence-wait', 'Я не програю'],
    ]) {
      let state = selectOption(
        finalReading,
        gathering(['iris_quiet_page_discussed', 'iris_margin_note_discussed']),
        'final-iris-evidence-topic',
      );
      state = selectOption(finalReading, state, 'final-iris-evidence-ask');
      state = selectOption(finalReading, state, choice);
      expect(currentNode(finalReading, state).text).toContain(expected);
      state = selectOption(finalReading, state, 'final-iris-evidence-result-back');
      expect(state.node).toBe('gathering');
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'final-iris-evidence-topic',
      );
    }
  });

  it('resolves both accountability choices without revealing Iris private letter', () => {
    for (const [choice, expected] of [
      ['final-iris-evidence-own-to-nora', 'Нора підходить'],
      ['final-iris-evidence-stop-asking', 'на сьогодні досить'],
    ]) {
      let state = selectOption(
        finalReading,
        gathering([
          'iris_quiet_page_discussed',
          'iris_margin_note_discussed',
          'opened_private_letter',
          'iris_letter_breach_admitted',
        ]),
        'final-iris-evidence-topic',
      );
      state = selectOption(finalReading, state, 'final-iris-evidence-accountability');
      state = selectOption(finalReading, state, choice);
      expect(currentNode(finalReading, state).text).toContain(expected);
      state = selectOption(finalReading, state, 'final-iris-evidence-accountability-back');
      expect(state.node).toBe('gathering');
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'final-iris-evidence-topic',
      );
    }
  });

  it('keeps Eleanor flood-box permission and privacy routes separate', () => {
    for (const [choice, expected] of [
      ['final-eleanor-memory-box-private', 'Домовилися'],
      ['final-eleanor-memory-box-ask', 'не сьогодні при всіх'],
    ]) {
      let state = selectOption(
        finalReading,
        gathering(['eleanor_timeline_checked', 'final_ledger_record_private']),
        'final-eleanor-memory-topic',
      );
      state = selectOption(finalReading, state, 'final-eleanor-memory-box');
      expect(currentNode(finalReading, state).text).toContain('приватні записи');
      state = selectOption(finalReading, state, choice);
      expect(currentNode(finalReading, state).text).toContain(expected);
      state = selectOption(finalReading, state, 'final-eleanor-memory-box-back');
      expect(state.node).toBe('gathering');
    }
  });

  it('keeps Leo application and shift-request outcomes unconfirmed', () => {
    for (const [flag, expected] of [
      ['leo_night_course_application_planned', 'Відповіді поки немає'],
      ['leo_night_course_shift_request_planned', 'Це ще не згода'],
    ]) {
      let state = selectOption(
        finalReading,
        gathering(['leo_night_course_discussed', flag]),
        'final-leo-night-course',
      );
      expect(currentNode(finalReading, state).text).toContain(expected);
      state = selectOption(finalReading, state, 'final-leo-course-ask-book');
      state = selectOption(finalReading, state, 'final-leo-course-book-next');
      state = selectOption(finalReading, state, 'final-leo-course-notebook');
      expect(currentNode(finalReading, state).text).toContain('без напису');
      state = selectOption(finalReading, state, 'final-leo-course-return');
      expect(state.node).toBe('gathering');
    }
  });

  it('preserves Eleanor witnesses and pie story as different memories', () => {
    for (const [choice, expected] of [
      ['final-eleanor-memory-witness', 'стару адресу майстра'],
      ['final-eleanor-memory-tea', 'Грушевий'],
    ]) {
      let state = selectOption(
        finalReading,
        gathering(['eleanor_timeline_checked']),
        'final-eleanor-memory-topic',
      );
      state = selectOption(finalReading, state, 'final-eleanor-memory-people');
      state = selectOption(finalReading, state, choice);
      expect(currentNode(finalReading, state).text).toContain(expected);
      state = selectOption(finalReading, state, 'final-eleanor-memory-people-back');
      expect(state.node).toBe('gathering');
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'final-eleanor-memory-topic',
      );
    }
  });

  it('does not treat an unverified phone call as proof when accused publicly', () => {
    let state = selectOption(
      finalReading,
      gathering(['eleanor_timeline_checked', 'eleanor_timeline_assumed_guilt']),
      'final-eleanor-memory-topic',
    );
    expect(currentNode(finalReading, state).text).toContain('нібито наміри');
    state = selectOption(finalReading, state, 'final-eleanor-memory-dates');
    state = selectOption(finalReading, state, 'final-eleanor-memory-accuse');
    expect(currentNode(finalReading, state).text).toContain('ми не знаємо, чи був дзвінок');
    state = selectOption(finalReading, state, 'final-eleanor-memory-dates-back');
    expect(state.node).toBe('gathering');
  });

  it('keeps Iris rumor correction and defense outcomes distinct', () => {
    for (const [choice, expected] of [
      ['final-iris-evidence-rumor-own', 'зупинилися'],
      ['final-iris-evidence-rumor-deflect', 'Нехай цікавляться книжкою'],
    ]) {
      let state = selectOption(
        finalReading,
        gathering(['iris_quiet_page_discussed', 'iris_margin_note_discussed']),
        'final-iris-evidence-topic',
      );
      state = selectOption(finalReading, state, 'final-iris-evidence-rumor');
      state = selectOption(finalReading, state, choice);
      expect(currentNode(finalReading, state).text).toContain(expected);
      state = selectOption(finalReading, state, 'final-iris-evidence-rumor-back');
      expect(state.node).toBe('gathering');
    }
  });

  it('lets Leo keep his own space without a notebook purchase', () => {
    let state = selectOption(
      finalReading,
      gathering(['leo_night_course_discussed', 'leo_night_course_deferred']),
      'final-leo-night-course',
    );
    state = selectOption(finalReading, state, 'final-leo-course-ask-book');
    expect(currentNode(finalReading, state).text).toContain('морський маяк');
    state = selectOption(finalReading, state, 'final-leo-course-book-next');
    state = selectOption(finalReading, state, 'final-leo-course-space');
    expect(currentNode(finalReading, state).text).toContain('Піду допоможу Елеонорі');
    state = selectOption(finalReading, state, 'final-leo-course-return');
    expect(state.node).toBe('gathering');
  });

  it('does not mistake Eleanor missing phone records for proof of a call', () => {
    let state = selectOption(
      finalReading,
      gathering(['eleanor_timeline_checked']),
      'final-eleanor-memory-topic',
    );
    state = selectOption(finalReading, state, 'final-eleanor-memory-dates');
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('не скажу, що йому телефонували');
    expect(text).toContain('не телефонували');
    state = selectOption(finalReading, state, 'final-eleanor-memory-record-gap');
    expect(currentNode(finalReading, state).text).toContain('не підтверджено');
  });

  it('respects Eleanor declining further document discussion and closes the topic', () => {
    let state = selectOption(
      finalReading,
      gathering(['eleanor_timeline_checked']),
      'final-eleanor-memory-topic',
    );
    state = selectOption(finalReading, state, 'final-eleanor-memory-leave');
    expect(currentNode(finalReading, state).text).toContain('Френк');
    state = selectOption(finalReading, state, 'final-eleanor-memory-leave-back');
    expect(state.node).toBe('gathering');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-eleanor-memory-topic',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';

const gathering = (flags: string[]) => ({ ...startDialogue(finalReading), node: 'gathering', flags });

describe('Final evening evidence and memory boundaries', () => {
  it('does not offer Iris public-record research after a private-letter breach', () => {
    const state = selectOption(
      finalReading,
      gathering(['iris_quiet_page_discussed', 'iris_margin_note_discussed', 'opened_private_letter']),
      'final-iris-evidence-topic',
    );
    const choices = availableOptions(finalReading, state).map((option) => option.id);
    expect(choices).not.toContain('final-iris-evidence-ask');
    expect(choices).toContain('final-iris-evidence-private');
    expect(currentNode(finalReading, state).text).toContain('не мав читати');
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

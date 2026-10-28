import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const openGathering = (flags: readonly string[]) =>
  selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');

describe('lost pages: Eleanor ledger resolution', () => {
  it('does not reveal the ledger before reconstruction', () => {
    const opening = openGathering(['final_chapter_evidence_reviewed']);
    expect(availableOptions(finalReading, opening).map((choice) => choice.id)).not.toContain(
      'ledger-resolution',
    );
    const ready = openGathering(['final_chapter_reconstruction_done']);
    expect(availableOptions(finalReading, ready).map((choice) => choice.id)).toContain(
      'ledger-resolution',
    );
  });

  it('distinguishes the shop salvage box from the bindery photograph', () => {
    const gathering = openGathering(['final_chapter_reconstruction_done']);
    const ledger = selectOption(finalReading, gathering, 'ledger-resolution');
    expect(currentNode(finalReading, ledger).text).toContain('Коробка сімнадцять');
    expect(currentNode(finalReading, ledger).text).toContain('Не майстерня');
    expect(ledger.flags).toContain('final_ledger_resolved_17');
    const question = selectOption(finalReading, ledger, 'ledger-ask-warning');
    expect(currentNode(finalReading, question).text).toContain('не мій почерк');
    expect(currentNode(finalReading, question).text).toContain('Можливо');
  });

  it('keeps three disclosure outcomes exclusive and remembers them in the ending', () => {
    const outcomes = [
      ['ledger-tell-iris', 'final_ledger_iris_told', 'Айріс побачила запис'],
      ['ledger-ask-eleanor', 'final_ledger_eleanor_to_tell', 'Елеонора пообіцяла'],
      ['ledger-private', 'final_ledger_record_private', 'Журнал залишився'],
    ] as const;
    for (const [choice, flag, expected] of outcomes) {
      const gathering = openGathering(['final_chapter_reconstruction_done']);
      const ledger = selectOption(finalReading, gathering, 'ledger-resolution');
      const evidence = selectOption(finalReading, ledger, 'ledger-ask-missing');
      const outcome = selectOption(finalReading, evidence, choice);
      const finished = selectOption(finalReading, outcome, 'ledger-finish');
      expect(finished.flags).toContain(flag);
      expect(finished.flags.filter((item) => item.startsWith('final_ledger_iris_') ||
        item === 'final_ledger_eleanor_to_tell' ||
        item === 'final_ledger_record_private')).toEqual([flag]);
      expect(availableOptions(finalReading, finished).map((item) => item.id)).not.toContain(
        'ledger-resolution',
      );
      const ending = seasonEnding({ flags: finished.flags }).epilogue;
      expect(ending).toContain(expected);
      expect(ending).toContain('номер коробки');
      expect(ending).not.toContain('Цифра сімнадцять поки лишилася загадкою');
    }
  });

  it('links the two losses only when the player knows about the envelope', () => {
    const plain = selectOption(
      finalReading,
      openGathering(['final_chapter_reconstruction_done']),
      'ledger-resolution',
    );
    const plainEvidence = selectOption(finalReading, plain, 'ledger-ask-warning');
    expect(availableOptions(finalReading, plainEvidence).map((item) => item.id)).not.toContain(
      'ledger-letter-connection',
    );
    const known = selectOption(
      finalReading,
      openGathering(['final_chapter_reconstruction_done', 'saw_envelope']),
      'ledger-resolution',
    );
    const evidence = selectOption(finalReading, known, 'ledger-ask-warning');
    const connection = selectOption(finalReading, evidence, 'ledger-letter-connection');
    expect(currentNode(finalReading, connection).text).toContain('Те саме');
    const returned = selectOption(finalReading, connection, 'ledger-letter-connection-back');
    expect(returned.flags).toContain('final_ledger_letter_connection_heard');
    expect(availableOptions(finalReading, returned).map((item) => item.id)).not.toContain(
      'ledger-letter-connection',
    );
    expect(seasonEnding({ flags: returned.flags }).epilogue).toContain('того самого затоплення');
  });

  it('keeps each new scene within four visible choices', () => {
    for (const id of ['ledger-resolution', 'ledger-evidence', 'ledger-letter-connection', 'ledger-outcome']) {
      const node = finalReading.nodes.find((item) => item.id === id);
      expect(node).toBeDefined();
      expect(node!.options.length).toBeLessThanOrEqual(4);
    }
  });
});

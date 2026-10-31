import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';

const begin = (flags: string[]) =>
  selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');

describe('chapter reconstruction and ledger continuity', () => {
  it('requires evidence from both investigations before reconstruction', () => {
    expect(availableOptions(finalReading, begin([])).map((o) => o.id)).not.toContain(
      'chapter-reconstruction',
    );
    const flags = ['final_chapter_evidence_reviewed', 'final_workshop_evidence_reviewed'];
    expect(availableOptions(finalReading, begin(flags)).map((o) => o.id)).toContain(
      'chapter-reconstruction',
    );
  });

  it.each([
    ['reconstruction-same', 'final_reconstruction_alternative_claim', 'різний папір'],
    ['reconstruction-order', 'final_reconstruction_sequence_claim', 'бракує переходу'],
    ['reconstruction-unknown', 'final_reconstruction_authorship_open', 'авторство другого'],
  ])('tracks reconstruction choice %s', (choice, flag, excerpt) => {
    const flags = ['final_chapter_evidence_reviewed', 'final_workshop_evidence_reviewed'];
    const scene = selectOption(finalReading, begin(flags), 'chapter-reconstruction');
    const response = selectOption(finalReading, scene, choice);
    expect(response.flags).toContain(flag);
    expect(currentNode(finalReading, response).text).toContain(excerpt);
    const privateNotes = selectOption(finalReading, response, 'reconstruction-keep-note');
    const done = selectOption(finalReading, privateNotes, 'reconstruction-back');
    expect(done.flags).toContain('final_reconstruction_notes_private');
    expect(done.flags).toContain('final_chapter_reconstruction_done');
    expect(availableOptions(finalReading, done).map((o) => o.id)).not.toContain(
      'chapter-reconstruction',
    );
    expect(availableOptions(finalReading, done).map((o) => o.id)).toContain('ledger-resolution');
  });

  it.each([
    ['ledger-ask-warning', 'final_ledger_warning_questioned', 'не мій почерк'],
    ['ledger-ask-missing', 'final_ledger_misfiling_questioned', 'між романами'],
    ['ledger-ask-iris', 'final_ledger_eleanor_accountability', 'сім років'],
  ])('preserves the player question about box seventeen: %s', (choice, flag, expected) => {
    const gathering = begin(['final_chapter_reconstruction_done']);
    const ledger = selectOption(finalReading, gathering, 'ledger-resolution');
    expect(currentNode(finalReading, ledger).text).toContain('Коробка сімнадцять');
    const answer = selectOption(finalReading, ledger, choice);
    expect(answer.flags).toContain(flag);
    expect(currentNode(finalReading, answer).text).toContain(expected);
    expect(availableOptions(finalReading, answer).map((o) => o.id)).toContain('ledger-tell-iris');
    expect(availableOptions(finalReading, answer).map((o) => o.id)).toContain('ledger-private');
  });

  it.each([
    ['ledger-tell-iris', 'final_ledger_iris_told'],
    ['ledger-ask-eleanor', 'final_ledger_eleanor_to_tell'],
    ['ledger-private', 'final_ledger_record_private'],
  ])('remembers the journal disclosure route %s', (choice, expected) => {
    const ledger = selectOption(
      finalReading,
      begin(['final_chapter_reconstruction_done']),
      'ledger-resolution',
    );
    const evidence = selectOption(finalReading, ledger, 'ledger-ask-warning');
    const outcome = selectOption(finalReading, evidence, choice);
    expect(outcome.flags).toContain(expected);
    expect(
      outcome.flags.filter((flag) =>
        [
          'final_ledger_iris_told',
          'final_ledger_eleanor_to_tell',
          'final_ledger_record_private',
        ].includes(flag),
      ),
    ).toEqual([expected]);
  });

  it('does not reveal the ledger before reconstruction is finished', () => {
    const scene = begin(['final_chapter_evidence_reviewed', 'final_workshop_evidence_reviewed']);
    expect(availableOptions(finalReading, scene).map((o) => o.id)).not.toContain(
      'ledger-resolution',
    );
  });
});

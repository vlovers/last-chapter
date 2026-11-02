import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue } from '../src/game/dialogue';

const enterEveningTopic = (topic: string, flags: string[]) => {
  const evening = selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
  return selectOption(finalReading, evening, topic);
};

describe('Final evening rumor correction continuity', () => {
  it('acknowledges the public correction in both optional closing conversations', () => {
    const flags = [
      'final_case_closure_complete',
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_miller_ledger_rumor_seeded',
      'final_miller_rumor_corrected_publicly',
    ];

    const tea = currentNode(finalReading, enterEveningTopic('after-case-tea', flags)).text;
    expect(tea).toContain('вже пояснила гостям');
    expect(tea).not.toContain('Слова Міллер досі ходять');

    const tomorrow = currentNode(finalReading, enterEveningTopic('bookshop-tomorrow', flags)).text;
    expect(tomorrow).toContain('вже виправила свою вигадку');
    expect(tomorrow).not.toContain('Після чутки біля каси ніяково тихо');
  });

  it('does not invent a correction when the rumor remains unaddressed', () => {
    const flags = [
      'final_case_closure_complete',
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_miller_ledger_rumor_seeded',
    ];

    expect(
      currentNode(finalReading, enterEveningTopic('after-case-tea', flags)).text,
    ).toContain('Слова Міллер досі ходять');
    expect(
      currentNode(finalReading, enterEveningTopic('bookshop-tomorrow', flags)).text,
    ).toContain('Після чутки біля каси ніяково тихо');
  });

  it('keeps a private ledger separate from an unseeded rumor', () => {
    const flags = ['final_case_closure_complete', 'final_ledger_record_private'];
    const tea = currentNode(finalReading, enterEveningTopic('after-case-tea', flags)).text;

    expect(tea).toContain('Елеонора ховає журнал під прилавок');
    expect(tea).not.toContain('Слова Міллер досі ходять');
    expect(tea).not.toContain('вже пояснила гостям');
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

describe('lost pages: complete evidence route', () => {
  it('connects manuscript, workshop, Eleanor ledger, consent and closing', () => {
    let state = {
      ...startDialogue(finalReading),
      flags: [
        'iris_margin_note_discussed',
        'iris_quiet_page_discussed',
        'iris_margin_box_theory',
        'saw_envelope',
      ],
    };
    const route = [
      'open',
      'missing-chapter-choice',
      'missing-chapter-read-leave',
      'missing-chapter-leave-ask',
      'missing-chapter-back',
      'chapter-evidence',
      'chapter-evidence-alternative',
      'chapter-evidence-alternative-back',
      'chapter-evidence-result-back',
      'margin-followup',
      'margin-followup-compare',
      'margin-followup-back',
      'workshop-evidence',
      'workshop-evidence-ask',
      'workshop-evidence-owner-back',
      'workshop-evidence-finish',
      'chapter-reconstruction',
      'reconstruction-unknown',
      'reconstruction-tell-iris',
      'reconstruction-back',
      'ledger-resolution',
      'ledger-ask-missing',
      'ledger-letter-connection',
      'ledger-letter-connection-back',
      'ledger-tell-iris',
      'ledger-finish',
      'manuscript-provenance',
      'provenance-archive',
      'provenance-finish',
      'close',
    ];
    for (const id of route) {
      expect(
        availableOptions(finalReading, state).map((option) => option.id),
        `Unavailable choice: ${id} at ${state.node}`,
      ).toContain(id);
      state = selectOption(finalReading, state, id);
    }
    expect(state.node).toBe('end');
    expect(state.flags).toContain('final_ledger_resolved_17');
    expect(state.flags).toContain('final_ledger_letter_connection_heard');
    expect(state.flags).toContain('final_ledger_iris_told');
    expect(state.flags).toContain('final_provenance_consent_archive');
    const epilogue = seasonEnding({ flags: state.flags }).epilogue;
    expect(epilogue).toContain('номер коробки');
    expect(epilogue).toContain('того самого затоплення');
    expect(epilogue).toContain('лише копії');
    expect(epilogue).not.toContain('Цифра сімнадцять поки лишилася загадкою');
  });
});

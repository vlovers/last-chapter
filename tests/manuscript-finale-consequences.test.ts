import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const options = (story: typeof finalReading, state: ReturnType<typeof startDialogue>) =>
  availableOptions(story, state).map((option) => option.id);

describe('manuscript finale continuity', () => {
  const clueFlags = ['iris_margin_note_discussed', 'iris_quiet_page_discussed'];

  it('hides the manuscript reading without both Iris conversations', () => {
    for (const flags of [[], ['iris_margin_note_discussed'], ['iris_quiet_page_discussed']]) {
      const gathering = selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
      expect(options(finalReading, gathering)).not.toContain('missing-chapter-choice');
    }
  });

  it('keeps the two readings mutually exclusive and remembers the chosen excerpt', () => {
    const gathering = selectOption(finalReading, { ...startDialogue(finalReading), flags: clueFlags }, 'open');
    expect(options(finalReading, gathering)).toContain('missing-chapter-choice');
    const choice = selectOption(finalReading, gathering, 'missing-chapter-choice');
    const departure = selectOption(finalReading, choice, 'missing-chapter-read-leave');
    const after = selectOption(finalReading, departure, 'missing-chapter-leave-ask');
    const returned = selectOption(finalReading, after, 'missing-chapter-back');
    expect(returned.flags).toContain('final_chapter_departure_version_read');
    expect(returned.flags).not.toContain('final_chapter_home_version_read');
    expect(returned.flags).toContain('final_chapter_sequence_theory');
    expect(options(finalReading, returned)).not.toContain('missing-chapter-choice');
    expect(options(finalReading, returned)).toContain('chapter-argument');
    expect(seasonEnding({ flags: returned.flags }).epilogue).toContain('ранкову пекарню');
  });

  it('changes Mara and Iris dialogue according to the player's position', () => {
    const opening = selectOption(finalReading, { ...startDialogue(finalReading), flags: [...clueFlags, 'final_missing_chapter_discussed'] }, 'open');
    const argument = selectOption(finalReading, opening, 'chapter-argument');
    for (const [choice, flag, expected] of [
      ['chapter-argument-mara', 'final_chapter_mara_supported', 'команда сніданку'],
      ['chapter-argument-iris', 'final_chapter_iris_supported', 'От бачиш'],
      ['chapter-argument-neither', 'final_chapter_versions_questioned', 'не фінал'],
    ]) {
      const response = selectOption(finalReading, argument, choice);
      expect(response.flags).toContain(flag);
      expect(currentNode(finalReading, response).text).toContain(expected);
      const finished = selectOption(finalReading, response, 'chapter-argument-back');
      expect(options(finalReading, finished)).not.toContain('chapter-argument');
    }
  });

  it('compares paper without claiming the manuscript is authenticated', () => {
    const gathering = selectOption(finalReading, {
      ...startDialogue(finalReading),
      flags: ['final_margin_followup_heard', 'final_missing_chapter_discussed'],
    }, 'open');
    expect(options(finalReading, gathering)).toContain('workshop-evidence');
    const evidence = selectOption(finalReading, gathering, 'workshop-evidence');
    const compared = selectOption(finalReading, evidence, 'workshop-evidence-compare');
    expect(currentNode(finalReading, compared).text).toContain('обрізаний вручну');
    const result = selectOption(finalReading, compared, 'workshop-evidence-paper-back');
    const finished = selectOption(finalReading, result, 'workshop-evidence-finish');
    expect(finished.flags).toContain('final_workshop_paper_compared');
    expect(options(finalReading, finished)).not.toContain('workshop-evidence');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('різні краї паперу');
  });

  it('keeps permission and deferral as distinct outcomes', () => {
    const flags = ['final_margin_followup_heard', 'final_missing_chapter_discussed'];
    for (const [choice, returnChoice, expectedFlag, epilogueText] of [
      ['workshop-evidence-ask', 'workshop-evidence-owner-back', 'final_workshop_permission_requested', 'попросити дозволу'],
      ['workshop-evidence-keep', 'workshop-evidence-rest-back', 'final_workshop_search_deferred', 'почекає'],
    ]) {
      const gathering = selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
      const evidence = selectOption(finalReading, gathering, 'workshop-evidence');
      const response = selectOption(finalReading, evidence, choice);
      const result = selectOption(finalReading, response, returnChoice);
      const finished = selectOption(finalReading, result, 'workshop-evidence-finish');
      expect(finished.flags).toContain(expectedFlag);
      expect(seasonEnding({ flags: finished.flags }).epilogue).toContain(epilogueText);
    }
  });

  it('offers custody only after the evidence discussion', () => {
    const base = ['final_margin_followup_heard', 'final_missing_chapter_discussed'];
    const gathering = selectOption(finalReading, {
      ...startDialogue(finalReading),
      flags: base,
    }, 'open');
    expect(options(finalReading, gathering)).not.toContain('manuscript-provenance');
    const ready = selectOption(finalReading, {
      ...startDialogue(finalReading),
      flags: [...base, 'final_workshop_evidence_reviewed'],
    }, 'open');
    expect(options(finalReading, ready)).toContain('manuscript-provenance');
  });

  it('keeps custody decisions exclusive and visible in the epilogue', () => {
    const cases = [
      ['provenance-return', 'final_provenance_iris_custody', 'забрала оригінали'],
      ['provenance-archive', 'final_provenance_consent_archive', 'лише копії'],
      ['provenance-wait', 'final_provenance_wait_for_evidence', 'відклали'],
    ] as const;
    for (const [choice, flag, epilogue] of cases) {
      const gathering = selectOption(finalReading, {
        ...startDialogue(finalReading),
        flags: ['final_workshop_evidence_reviewed'],
      }, 'open');
      const discussion = selectOption(finalReading, gathering, 'manuscript-provenance');
      const result = selectOption(finalReading, discussion, choice);
      const finished = selectOption(finalReading, result, 'provenance-finish');
      expect(finished.flags).toContain(flag);
      expect(finished.flags.filter((entry) => entry.startsWith('final_provenance_'))).toEqual([flag]);
      expect(options(finalReading, finished)).not.toContain('manuscript-provenance');
      expect(seasonEnding({ flags: finished.flags }).epilogue).toContain(epilogue);
    }
  });

  it('lets the player pause the investigation without resolving the number', () => {
    const opening = selectOption(finalReading, { ...startDialogue(finalReading), flags: ['iris_margin_note_discussed', 'iris_margin_date_theory'] }, 'open');
    const followup = selectOption(finalReading, opening, 'margin-followup');
    expect(currentNode(finalReading, followup).text).toContain('календар');
    const paused = selectOption(finalReading, followup, 'margin-followup-rest');
    const finished = selectOption(finalReading, paused, 'margin-followup-back');
    expect(finished.flags).toContain('final_margin_inquiry_paused');
    expect(options(finalReading, finished)).not.toContain('margin-followup');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('Сьогодні вона хотіла');
  });
});

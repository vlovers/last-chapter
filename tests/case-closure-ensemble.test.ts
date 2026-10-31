import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

const prerequisites = ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'];

function atCase(flags: string[] = prerequisites) {
  const start = { ...startDialogue(finalReading), flags };
  const gathering = selectOption(finalReading, start, 'open');
  return selectOption(finalReading, gathering, 'case-closure');
}

function choices(state: ReturnType<typeof startDialogue>) {
  return availableOptions(finalReading, state).map((option) => option.id);
}

describe('three bookmarks: witnesses, readers and privacy', () => {
  it('lets Thomas distinguish helping after the flood from seeing the page', () => {
    const timeline = selectOption(finalReading, atCase(), 'case-topic-timeline');
    const thomas = selectOption(finalReading, timeline, 'case-timeline-thomas');
    expect(currentNode(finalReading, thomas).text).toContain('не з тієї ночі');
    const asked = selectOption(finalReading, thomas, 'case-thomas-ask');
    expect(currentNode(finalReading, asked).text).toContain('Не записуй');
    const done = selectOption(finalReading, asked, 'case-thomas-answer-back');
    expect(done.flags).toContain('final_case_timeline_heard');
    expect(done.flags).toContain('final_case_thomas_limit_recorded');
    expect(choices(done)).not.toContain('case-topic-timeline');
    expect(seasonEnding({ flags: done.flags }).epilogue).toContain('не бачив');
  });

  it('allows a shorter Thomas route without inventing an eyewitness', () => {
    const timeline = selectOption(finalReading, atCase(), 'case-topic-timeline');
    const thomas = selectOption(finalReading, timeline, 'case-timeline-thomas');
    const done = selectOption(finalReading, thomas, 'case-thomas-back');
    expect(done.flags).toContain('final_case_thomas_limit_recorded');
    expect(choices(done)).toContain('case-topic-authors');
  });

  for (const [choice, flag, phrase] of [
    ['case-nora-annotate', 'final_case_nora_uncertainty_labeled', 'невідоме авторство'],
    ['case-nora-private', 'final_case_nora_claim_withheld', 'вигаданим заголовком'],
  ] as const) {
    it('preserves Nora’s choice ' + choice + ' without declaring an author', () => {
      const authors = selectOption(finalReading, atCase(), 'case-topic-authors');
      const nora = selectOption(finalReading, authors, 'case-authors-nora');
      const done = selectOption(finalReading, nora, choice);
      expect(done.flags).toContain(flag);
      expect(done.flags).toContain('final_case_authors_heard');
      expect(choices(done)).not.toContain('case-topic-authors');
      expect(seasonEnding({ flags: done.flags }).epilogue).toContain(phrase);
      expect(done.flags).not.toContain(
        choice === 'case-nora-annotate'
          ? 'final_case_nora_claim_withheld'
          : 'final_case_nora_uncertainty_labeled',
      );
    });
  }

  for (const [choice, flag, phrase] of [
    ['case-anna-bookmark', 'final_case_anna_story_question', 'дракона'],
    ['case-anna-privacy', 'final_case_anna_private_classroom', 'не перетворила'],
  ] as const) {
    it('keeps Anna’s classroom separate from private papers: ' + choice, () => {
      const people = selectOption(finalReading, atCase(), 'case-topic-people');
      const anna = selectOption(finalReading, people, 'case-people-anna');
      const done = selectOption(finalReading, anna, choice);
      expect(done.flags).toContain(flag);
      expect(done.flags).toContain('final_case_people_heard');
      expect(choices(done)).not.toContain('case-topic-people');
      expect(seasonEnding({ flags: done.flags }).epilogue).toContain(phrase);
    });
  }

  it('does not treat a deferred photograph as an examined clue', () => {
    const deferred = atCase([
      ...prerequisites,
      'final_workshop_photo_complete',
      'final_workshop_photo_deferred',
    ]);
    const timeline = selectOption(finalReading, deferred, 'case-topic-timeline');
    expect(currentNode(finalReading, timeline).text).not.toContain('подряпиною');

    const examined = atCase([
      ...prerequisites,
      'final_workshop_photo_complete',
      'final_workshop_photo_reviewed',
    ]);
    const compared = selectOption(finalReading, examined, 'case-topic-timeline');
    expect(currentNode(finalReading, compared).text).toContain('подряпиною');
  });

  it('does not forgive an opened letter during the evidence discussion', () => {
    const state = atCase([
      ...prerequisites,
      'final_ledger_iris_told',
      'final_letter_breach_disclosed',
      'final_miller_ledger_rumor_seeded',
    ]);
    const timeline = selectOption(finalReading, state, 'case-topic-timeline');
    const afterTimeline = selectOption(finalReading, timeline, 'case-timeline-back');
    const authors = selectOption(finalReading, afterTimeline, 'case-topic-authors');
    const afterAuthors = selectOption(finalReading, authors, 'case-authors-back');
    const people = selectOption(finalReading, afterAuthors, 'case-topic-people');
    const afterPeople = selectOption(finalReading, people, 'case-people-back');
    const decision = selectOption(finalReading, afterPeople, 'case-topic-finish');
    const iris = selectOption(finalReading, decision, 'case-decision-iris');
    expect(currentNode(finalReading, iris).text).toContain('Після листа й чутки');
    const declined = selectOption(finalReading, iris, 'case-iris-decline');
    expect(declined.flags).toContain('final_case_iris_declined');
    expect(declined.flags).toContain('final_letter_breach_disclosed');
  });

  it('keeps ensemble progress across saves and completes the case', () => {
    const timeline = selectOption(finalReading, atCase(), 'case-topic-timeline');
    const thomas = selectOption(finalReading, timeline, 'case-timeline-thomas');
    const done = selectOption(finalReading, thomas, 'case-thomas-back');
    const saved = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: done, flags: done.flags }),
    );
    expect(saved).not.toBeNull();
    expect(saved!.flags).toContain('final_case_thomas_limit_recorded');
    expect(choices(saved!.dialogue)).not.toContain('case-topic-timeline');

    const authors = selectOption(finalReading, saved!.dialogue, 'case-topic-authors');
    const nora = selectOption(finalReading, authors, 'case-authors-nora');
    const afterAuthors = selectOption(finalReading, nora, 'case-nora-annotate');
    const people = selectOption(finalReading, afterAuthors, 'case-topic-people');
    const anna = selectOption(finalReading, people, 'case-people-anna');
    const afterPeople = selectOption(finalReading, anna, 'case-anna-bookmark');
    expect(choices(afterPeople)).toEqual(['case-topic-finish']);
    const decision = selectOption(finalReading, afterPeople, 'case-topic-finish');
    const sealed = selectOption(finalReading, decision, 'case-decision-seal');
    const completed = selectOption(finalReading, sealed, 'case-result-finish');
    expect(completed.flags).toContain('final_case_closure_complete');
    expect(completed.flags).toContain('final_case_nora_uncertainty_labeled');
    expect(completed.flags).toContain('final_case_anna_story_question');
  });

  it('validates all dialogue edges and caps every case scene at four choices', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of finalReading.nodes.filter((node) => node.id.startsWith('case-closure'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { paperStudyNodes } from '../src/content/paper-study';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const evidence = [
  'final_chapter_evidence_reviewed',
  'final_ledger_scene_complete',
];

function atGathering(flags: string[]): DialogueState {
  return { ...startDialogue(finalReading), node: 'gathering', flags };
}

function play(route: readonly string[], flags: string[] = evidence): DialogueState {
  let state = atGathering(flags);
  for (const id of route) {
    expect(
      availableOptions(finalReading, state).map((option) => option.id),
      `Unavailable ${id} at ${state.node}`,
    ).toContain(id);
    state = JSON.parse(JSON.stringify(selectOption(finalReading, state, id))) as DialogueState;
  }
  return state;
}

const investigation = [
  'paper-study',
  'paper-study-edges',
  'paper-edges-fit',
  'paper-fit-back',
  'paper-study-ink',
  'paper-ink-mara',
  'paper-mara-back',
  'paper-study-voices',
  'paper-voices-miller',
  'paper-miller-back',
  'paper-study-conclude',
] as const;

describe('under the lamp: manuscript comparison', () => {
  it.each([
    ['paper-decision-private', 'final_paper_private_notes', 'приватному конверті'],
    ['paper-decision-neutral', 'final_paper_neutral_report', 'короткий опис'],
    ['paper-decision-defer', 'final_paper_deferred', 'до появи нового свідчення'],
  ])('keeps %s playable and persists its ending', (choice, flag, text) => {
    const state = play([...investigation, choice, 'paper-study-return']);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_paper_study_done');
    expect(state.flags).toContain(flag);
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(text);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'paper-study',
    );
  });

  it('lets Iris receive questions only after she was told about the ledger', () => {
    const state = play(
      [...investigation, 'paper-decision-iris', 'paper-study-return'],
      [...evidence, 'final_ledger_iris_told'],
    );
    expect(state.flags).toContain('final_paper_iris_questions');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('не давала дозволу');
  });

  it('does not ask Iris to guess an author after she declined the case discussion', () => {
    const state = play(
      ['paper-study', 'paper-study-voices'],
      [...evidence, 'final_ledger_iris_told', 'final_case_iris_declined'],
    );
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'paper-voices-iris',
    );
  });

  it('lets Iris refuse to participate after a letter breach', () => {
    const state = play(
      ['paper-study', 'paper-study-voices', 'paper-voices-iris'],
      [...evidence, 'final_ledger_iris_told', 'final_letter_breach_disclosed'],
    );
    expect(currentNode(finalReading, state).text).toContain('відкрив мій лист');
    expect(currentNode(finalReading, state).text).not.toContain('пробач');
  });

  it('does not reveal a private ledger while examining the pages', () => {
    const state = play(['paper-study'], [...evidence, 'final_ledger_record_private']);
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('журнал у шухляді');
    expect(text).not.toContain('Айріс');
  });

  it('requires earlier evidence and the ledger before the examination unlocks', () => {
    for (const flags of [[], ['final_chapter_evidence_reviewed'], ['final_ledger_scene_complete']]) {
      const state = { ...startDialogue(finalReading), node: 'gathering', flags };
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'paper-study',
      );
    }
  });

  it('keeps authored nodes within four choices and all destinations valid', () => {
    expect(paperStudyNodes.length).toBeGreaterThanOrEqual(12);
    for (const node of paperStudyNodes) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
      for (const option of node.options) {
        expect(
          finalReading.nodes.some((candidate) => candidate.id === option.next),
          `Missing destination for ${node.id}/${option.id}`,
        ).toBe(true);
      }
    }
  });

  it('does not present a guessed author or a discovered last page as a fact', () => {
    const text = paperStudyNodes.map((node) => node.text).join(' ');
    expect(text).toContain('не довели');
    expect(text).toContain('не дає імені');
    expect(text).not.toContain('автором виявився');
    expect(text).not.toContain('знайшли останню сторінку');
  });
});

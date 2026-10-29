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

const prerequisites = [
  'final_ledger_scene_complete',
  'final_manuscript_provenance_decided',
] as const;

function gathering(flags: string[] = [...prerequisites]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

function options(state: ReturnType<typeof startDialogue>) {
  return availableOptions(finalReading, state).map((option) => option.id);
}

function reviewed(flags: string[] = [...prerequisites]) {
  let state = selectOption(finalReading, gathering(flags), 'case-closure');
  state = selectOption(finalReading, state, 'case-topic-timeline');
  state = selectOption(finalReading, state, 'case-timeline-letter');
  state = selectOption(finalReading, state, 'case-letter-back');
  state = selectOption(finalReading, state, 'case-topic-authors');
  state = selectOption(finalReading, state, 'case-authors-mara');
  state = selectOption(finalReading, state, 'case-mara-back');
  state = selectOption(finalReading, state, 'case-topic-people');
  state = selectOption(finalReading, state, 'case-people-leo');
  state = selectOption(finalReading, state, 'case-leo-back');
  return state;
}

describe('five-day case closure: proof, uncertainty and consent', () => {
  it('requires the ledger resolution and the manuscript custody decision', () => {
    for (const flags of [[], [prerequisites[0]], [prerequisites[1]]]) {
      expect(options(gathering(flags))).not.toContain('case-closure');
    }
    expect(options(gathering())).toContain('case-closure');
  });

  it('does not offer a premature verdict before all three topics are heard', () => {
    let state = selectOption(finalReading, gathering(), 'case-closure');
    expect(options(state)).not.toContain('case-topic-finish');
    state = selectOption(finalReading, state, 'case-topic-authors');
    state = selectOption(finalReading, state, 'case-authors-back');
    expect(options(state)).not.toContain('case-topic-authors');
    expect(options(state)).not.toContain('case-topic-finish');
    state = selectOption(finalReading, state, 'case-topic-people');
    state = selectOption(finalReading, state, 'case-people-back');
    expect(options(state)).not.toContain('case-topic-finish');
    state = selectOption(finalReading, state, 'case-topic-timeline');
    state = selectOption(finalReading, state, 'case-timeline-back');
    expect(options(state)).toEqual(['case-topic-finish']);
  });

  it('does not turn the workshop photograph into proven evidence before review', () => {
    const state = selectOption(finalReading, gathering(), 'case-closure');
    const timeline = selectOption(finalReading, state, 'case-topic-timeline');
    expect(currentNode(finalReading, timeline).text).toContain('не бачила');
    expect(currentNode(finalReading, timeline).text).not.toContain('подряпиною');
    const checked = selectOption(
      finalReading,
      gathering([...prerequisites, 'final_workshop_photo_complete']),
      'case-closure',
    );
    const checkedTimeline = selectOption(finalReading, checked, 'case-topic-timeline');
    expect(currentNode(finalReading, checkedTimeline).text).toContain('сімка з подряпиною');
  });

  it('separates the flood, the letter and the authorship of the two excerpts', () => {
    const state = reviewed();
    expect(state.flags).toContain('final_case_timeline_heard');
    expect(state.flags).toContain('final_case_authors_heard');
    expect(state.flags).toContain('final_case_people_heard');
    const decision = selectOption(finalReading, state, 'case-topic-finish');
    expect(currentNode(finalReading, decision).text).toContain('Не знаємо');
    expect(options(decision)).not.toContain('case-decision-iris');
  });

  it('keeps the ledger private when Iris was not told', () => {
    const state = selectOption(
      finalReading,
      reviewed([...prerequisites, 'final_ledger_record_private']),
      'case-topic-finish',
    );
    expect(currentNode(finalReading, state).text).toContain('Айріс ще не бачила');
    expect(options(state)).not.toContain('case-decision-iris');
  });

  it('also honors Eleanor’s promise to tell Iris later', () => {
    const state = selectOption(
      finalReading,
      reviewed([...prerequisites, 'final_ledger_eleanor_to_tell']),
      'case-topic-finish',
    );
    expect(currentNode(finalReading, state).text).toContain('після свята');
    expect(options(state)).not.toContain('case-decision-iris');
  });

  const outcomes = [
    {
      flags: [] as string[],
      first: 'case-decision-seal',
      second: '',
      outcome: 'final_case_sealed',
      epilogue: 'закритому конверті',
    },
    {
      flags: ['final_ledger_iris_told'],
      first: 'case-decision-iris',
      second: 'case-iris-boundaries',
      outcome: 'final_case_iris_boundaries',
      epilogue: 'сама вирішує',
    },
    {
      flags: ['final_ledger_iris_told'],
      first: 'case-decision-iris',
      second: 'case-iris-decline',
      outcome: 'final_case_iris_declined',
      epilogue: 'відмовилася',
    },
    {
      flags: [] as string[],
      first: 'case-decision-later',
      second: '',
      outcome: 'final_case_deferred',
      epilogue: 'відклали',
    },
  ] as const;

  for (const { flags, first, second, outcome, epilogue } of outcomes) {
    it(`persists exclusive ending ${outcome} and closes the topic`, () => {
      let state = selectOption(
        finalReading,
        reviewed([...prerequisites, ...flags]),
        'case-topic-finish',
      );
      state = selectOption(finalReading, state, first);
      if (second) state = selectOption(finalReading, state, second);
      state = selectOption(finalReading, state, 'case-result-finish');
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(outcome);
      expect(state.flags).toContain('final_case_closure_complete');
      expect(options(state)).not.toContain('case-closure');
      expect(seasonEnding({ flags: state.flags }).epilogue).toContain(epilogue);
      expect(outcomes.filter(({ outcome: other }) => state.flags.includes(other))).toHaveLength(1);
    });
  }

  it('never erases the rumor or restores Iris’s trust by summarizing evidence', () => {
    const flags = [
      ...prerequisites,
      'final_ledger_iris_told',
      'final_miller_ledger_rumor_seeded',
      'final_miller_rumor_corrected_publicly',
    ];
    let state = selectOption(finalReading, reviewed(flags), 'case-topic-finish');
    state = selectOption(finalReading, state, 'case-decision-iris');
    expect(currentNode(finalReading, state).text).toContain('Міллер');
    state = selectOption(finalReading, state, 'case-iris-boundaries');
    expect(currentNode(finalReading, state).text).toContain('Сьогодні — нікому');
    state = selectOption(finalReading, state, 'case-result-finish');
    const ending = seasonEnding({ flags: state.flags });
    expect(ending.community).toContain('не почув виправлення');
    expect(state.flags).not.toContain('final_archive_iris_boundaries');
    expect(state.flags).not.toContain('final_miller_rumor_iris_choice');
  });

  it('restores mid-investigation progress and completed choices from a save', () => {
    let state = selectOption(finalReading, gathering(), 'case-closure');
    state = selectOption(finalReading, state, 'case-topic-timeline');
    state = selectOption(finalReading, state, 'case-timeline-back');
    const saved = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: state, flags: state.flags }),
    );
    expect(saved).not.toBeNull();
    expect(options(saved!.dialogue)).not.toContain('case-topic-timeline');
    expect(options(saved!.dialogue)).toContain('case-topic-authors');
    const finished = selectOption(finalReading, reviewed(), 'case-topic-finish');
    const sealed = selectOption(finalReading, finished, 'case-decision-seal');
    const done = selectOption(finalReading, sealed, 'case-result-finish');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: done, flags: done.flags }),
    );
    expect(options(restored!.dialogue)).not.toContain('case-closure');
  });

  it('validates the graph and never shows more than four options in a case node', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of finalReading.nodes.filter((node) => node.id.startsWith('case-closure'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
    const visited = reviewed();
    expect(options(visited)).toEqual(['case-topic-finish']);
  });
});

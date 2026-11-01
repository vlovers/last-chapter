import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';

const leoOutcomes = [
  ['leo_night_course_application_planned', 'відповідь із Грейфорда'],
  ['leo_night_course_shift_request_planned', 'Джун може підмінити'],
  ['leo_night_course_deferred', 'З курсом зачекаю'],
] as const;

const irisOutcomes = [
  ['iris_cover_revisions_chosen', 'Веселка поки лишається'],
  ['iris_cover_negotiation_chosen', 'Версію з човном ще розглядають'],
  ['iris_cover_independent_chosen', 'Хочу ще домалювати берег'],
] as const;

function gathering(flags: string[]): DialogueState {
  return { ...startDialogue(finalReading), node: 'gathering', flags };
}

describe('Independent character callbacks at the final gathering', () => {
  it.each(leoOutcomes)('remembers Leo career outcome %s after his conversation', (flag, text) => {
    const state = gathering(['final_leo_night_course_done', flag]);
    const narration = currentNode(finalReading, state).text;
    expect(narration).toContain(text);
    for (const [otherFlag, otherText] of leoOutcomes) {
      if (otherFlag !== flag) expect(narration).not.toContain(otherText);
    }
    expect(currentNode(finalReading, gathering([flag])).text).not.toContain(text);
  });

  it.each(irisOutcomes)(
    'remembers Iris illustration outcome %s after her conversation',
    (flag, text) => {
      const state = gathering(['final_iris_cover_done', flag]);
      const narration = currentNode(finalReading, state).text;
      expect(narration).toContain(text);
      for (const [otherFlag, otherText] of irisOutcomes) {
        if (otherFlag !== flag) expect(narration).not.toContain(otherText);
      }
      expect(currentNode(finalReading, gathering([flag])).text).not.toContain(text);
    },
  );

  it('composes all nine Leo/Iris outcome pairs without replacing either character', () => {
    for (const [leoFlag, leoText] of leoOutcomes) {
      for (const [irisFlag, irisText] of irisOutcomes) {
        const narration = currentNode(
          finalReading,
          gathering(['final_leo_night_course_done', leoFlag, 'final_iris_cover_done', irisFlag]),
        ).text;
        expect(narration).toContain(leoText);
        expect(narration).toContain(irisText);
      }
    }
  });

  it('does not narrate mutually exclusive outcomes from corrupted saves', () => {
    const narration = currentNode(
      finalReading,
      gathering([
        'final_leo_night_course_done',
        ...leoOutcomes.map(([flag]) => flag),
        'final_iris_cover_done',
        ...irisOutcomes.map(([flag]) => flag),
      ]),
    ).text;
    for (const [, text] of [...leoOutcomes, ...irisOutcomes]) {
      expect(narration).not.toContain(text);
    }
  });

  it('shows the bought notebook only after returning from Leo conversation', () => {
    let state = gathering(['leo_night_course_application_planned', 'leo_night_course_discussed']);
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(
      'final-leo-night-course',
    );
    state = selectOption(finalReading, state, 'final-leo-night-course');
    state = selectOption(finalReading, state, 'final-leo-course-ask-book');
    state = selectOption(finalReading, state, 'final-leo-course-book-next');
    state = selectOption(finalReading, state, 'final-leo-course-notebook');
    expect(currentNode(finalReading, state).text).toContain('синій блокнот');
    state = selectOption(finalReading, state, 'final-leo-course-return');
    expect(state.node).toBe('gathering');
    expect(currentNode(finalReading, state).text).toContain('куплений синій блокнот');
    expect(currentNode(finalReading, state).text).toContain('відповідь із Грейфорда');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-leo-night-course',
    );
  });

  it('keeps Iris permission to show work separate from the manuscript investigation', () => {
    let state = gathering(['iris_cover_day_four_followup', 'iris_cover_independent_chosen']);
    state = selectOption(finalReading, state, 'final-iris-cover-topic');
    state = selectOption(finalReading, state, 'final-iris-cover-offer-shelf');
    state = selectOption(finalReading, state, 'final-iris-cover-shelf-back');
    expect(state.node).toBe('gathering');
    expect(currentNode(finalReading, state).text).toContain('Хочу ще домалювати берег');
    expect(currentNode(finalReading, state).text).toContain('оберу сама');
    expect(currentNode(finalReading, state).text).toContain('Полиця почекає');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-iris-cover-topic',
    );
  });

  it('keeps Leo deferred reading consistent with the finale follow-up', () => {
    const state = gathering(['leo_night_course_discussed', 'leo_night_course_deferred']);
    const opening = selectOption(finalReading, state, 'final-leo-night-course');
    expect(currentNode(finalReading, opening).text).toContain('роман про морський маяк');
    const book = selectOption(finalReading, opening, 'final-leo-course-ask-book');
    expect(currentNode(finalReading, book).text).toContain('Роман про морський маяк');
  });

  it.each(irisOutcomes)(
    'introduces the separate book before Iris reserves it on both routes: %s',
    (flag) => {
      const opening = selectOption(
        finalReading,
        gathering(['iris_cover_day_four_followup', flag]),
        'final-iris-cover-topic',
      );
      const directShelf = selectOption(finalReading, opening, 'final-iris-cover-offer-shelf');
      const next = selectOption(finalReading, opening, 'final-iris-cover-ask-next');
      expect(currentNode(finalReading, next).text).toContain('потерту книжку');
      const laterShelf = selectOption(finalReading, next, 'final-iris-cover-next-offer');
      for (const shelf of [directShelf, laterShelf]) {
        const narration = currentNode(finalReading, shelf).text;
        expect(narration).toContain('тонкий роман у синій обкладинці');
        expect(narration).toMatch(/відклад(?:и|сти)/);
      }
    },
  );

  it('keeps the complete final dialogue graph valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { leoVisit } from '../src/content/leo';
import { leoNightCourseNodes } from '../src/content/leo-night-course';
import { leoNightCourseFinalNodes } from '../src/content/leo-night-course-final';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const routes = [
  {
    label: 'application',
    route: [
      'leo-course-ask-why',
      'leo-course-why-continue',
      'leo-course-apply',
      'leo-course-apply-colleague',
    ],
    decision: 'leo_night_course_application_planned',
    final: 'Я надіслав заявку',
    epilogue: 'надіслав заявку',
  },
  {
    label: 'shift negotiation',
    route: [
      'leo-course-ask-boss',
      'leo-course-boss-continue',
      'leo-course-negotiate',
      'leo-course-negotiate-colleague',
    ],
    decision: 'leo_night_course_shift_request_planned',
    final: 'Я поговорив із Джун',
    epilogue: 'поговорив із Джун',
  },
  {
    label: 'deferral',
    route: [
      'leo-course-ask-commute',
      'leo-course-commute-continue',
      'leo-course-pause',
      'leo-course-pause-colleague',
    ],
    decision: 'leo_night_course_deferred',
    final: 'Я не подав заявку',
    epilogue: 'вирішив не подавати',
  },
] as const;

function leoRoute(route: readonly string[]): DialogueState {
  let state = startDialogue(leoVisit);
  for (const option of [
    'greet',
    'leo-schedule',
    'leo-night-course-topic',
    ...route,
    'leo-course-colleague-finish',
    'leo-course-return',
  ]) {
    expect(
      availableOptions(leoVisit, state).map((item) => item.id),
      `Leo option ${option} missing at ${state.node}`,
    ).toContain(option);
    state = selectOption(leoVisit, state, option);
  }
  return state;
}

function finale(flags: readonly string[]): DialogueState {
  return {
    ...startDialogue(finalReading),
    node: 'gathering',
    flags: [...flags],
  };
}

describe('Leo independent railway course', () => {
  it('connects the new story through his work conversation without exposing it after completion', () => {
    let state = selectOption(leoVisit, startDialogue(leoVisit), 'greet');
    expect(availableOptions(leoVisit, state).map((option) => option.id)).not.toContain(
      'leo-night-course-topic',
    );
    state = selectOption(leoVisit, state, 'leo-schedule');
    expect(availableOptions(leoVisit, state).map((option) => option.id)).toContain(
      'leo-night-course-topic',
    );
    const finished = leoRoute(routes[0].route);
    expect(finished.flags).toContain('leo_night_course_discussed');
    expect(finished.node).toBe('greet');
  });

  it.each(routes)('persists the $label choice into day five and the epilogue', (choice) => {
    const dayTwo = leoRoute(choice.route);
    expect(dayTwo.flags).toContain(choice.decision);
    expect(
      dayTwo.flags.filter((flag) =>
        [
          'leo_night_course_application_planned',
          'leo_night_course_shift_request_planned',
          'leo_night_course_deferred',
        ].includes(flag),
      ),
    ).toHaveLength(1);
    const dayFive = finale(dayTwo.flags);
    expect(availableOptions(finalReading, dayFive).map((option) => option.id)).toContain(
      'final-leo-night-course',
    );
    const callback = selectOption(finalReading, dayFive, 'final-leo-night-course');
    expect(currentNode(finalReading, callback).text).toContain(choice.final);
    expect(seasonEnding({ flags: dayTwo.flags }).epilogue).toContain(choice.epilogue);
  });

  it('offers an optional notebook without claiming the training application was accepted', () => {
    const dayTwo = leoRoute(routes[0].route);
    let state = selectOption(finalReading, finale(dayTwo.flags), 'final-leo-night-course');
    state = selectOption(finalReading, state, 'final-leo-course-ask-jun');
    state = selectOption(finalReading, state, 'final-leo-course-jun-next');
    state = selectOption(finalReading, state, 'final-leo-course-notebook');
    expect(currentNode(finalReading, state).text).toContain('синій блокнот');
    state = selectOption(finalReading, state, 'final-leo-course-return');
    expect(state.flags).toContain('final_leo_course_notebook_offered');
    expect(state.flags).toContain('final_leo_night_course_done');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-leo-night-course',
    );
    const ending = seasonEnding({ flags: state.flags }).epilogue;
    expect(ending).toContain('синій блокнот');
    expect(ending).toContain('Відповіді поки немає');
  });

  it('respects a decision not to discuss the course further', () => {
    const dayTwo = leoRoute(routes[2].route);
    const callback = selectOption(finalReading, finale(dayTwo.flags), 'final-leo-night-course');
    const returned = selectOption(finalReading, callback, 'final-leo-course-no-questions');
    expect(returned.node).toBe('gathering');
    expect(returned.flags).toContain('final_leo_course_space_respected');
    expect(returned.flags).not.toContain('final_leo_course_notebook_offered');
    expect(availableOptions(finalReading, returned).map((option) => option.id)).not.toContain(
      'final-leo-night-course',
    );
  });

  it.each(routes)('keeps the $label ending intact when Leo wants privacy', (choice) => {
    const dayTwo = leoRoute(choice.route);
    let state = selectOption(finalReading, finale(dayTwo.flags), 'final-leo-night-course');
    state = selectOption(finalReading, state, 'final-leo-course-ask-book');
    state = selectOption(finalReading, state, 'final-leo-course-book-next');
    state = selectOption(finalReading, state, 'final-leo-course-space');
    state = selectOption(finalReading, state, 'final-leo-course-return');
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_leo_course_space_respected');
    expect(state.flags).not.toContain('final_leo_course_notebook_offered');
    const ending = seasonEnding({ flags: state.flags }).epilogue;
    expect(ending).toContain(choice.epilogue);
    expect(ending).toContain('розповість сам');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-leo-night-course',
    );
  });

  it('keeps the independent career story out of unrelated endings', () => {
    const epilogue = seasonEnding({ flags: [] }).epilogue;
    expect(epilogue).not.toContain('Грейфорді');
    expect(epilogue).not.toContain('синій блокнот');
    expect(availableOptions(finalReading, finale([])).map((option) => option.id)).not.toContain(
      'final-leo-night-course',
    );
  });

  it('has valid dialogue links and no more than four options in each new node', () => {
    expect(validateDialogue(leoVisit)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of [...leoNightCourseNodes, ...leoNightCourseFinalNodes]) {
      expect(node.options.length).toBeLessThanOrEqual(4);
    }
  });
});

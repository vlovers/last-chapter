import { describe, expect, it } from 'vitest';
import { availableOptions, selectOption, startDialogue, currentNode } from '../src/game/dialogue';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { leoVisit } from '../src/content/leo';
import { leoDecision } from '../src/content/day-four-leo';
import { decodeSave, encodeSave } from '../src/game/save';
import { storyEnvironment } from '../src/game/story-environment';
import { storyProgress } from '../src/game/progress';
import type { ChapterStage } from '../src/game/chapter';

describe('topic aliases and the Leo vertical slice', () => {
  it.each([
    {
      stage: 'anna' as const,
      story: annaVisit,
      route: ['hello', 'anna-reading-children', 'school-back'],
      hidden: ['anna-reading-children', 'school'],
    },
    {
      stage: 'thomas' as const,
      story: thomasVisit,
      route: ['greet', 'repair', 'repair-back'],
      hidden: ['repair', 'thomas-lamp-first', 'thomas-lamp-joke'],
    },
  ])(
    'consumes alternate phrasings once, including old ledgers: $stage',
    ({ stage, story, route, hidden }) => {
      let dialogue = startDialogue(story);
      for (const id of route) dialogue = selectOption(story, dialogue, id);
      for (const legacy of [false, true]) {
        const saved = JSON.parse(encodeSave({ stage, dialogue, flags: dialogue.flags }));
        if (legacy) {
          delete saved.completed;
          delete saved.pending;
        }
        const restored = decodeSave(JSON.stringify(saved))!;
        expect(restored).not.toBeNull();
        const visible = availableOptions(story, restored.dialogue).map((o) => o.id);
        for (const id of hidden) expect(visible).not.toContain(id);
        expect(visible.length).toBeGreaterThan(0);
      }
    },
  );
  it.each([
    ['leo-course-apply', 'leo_night_course_application_planned', 'Анкету вже відкрив'],
    ['leo-course-negotiate', 'leo_night_course_shift_request_planned', 'два варіанти змін'],
    ['leo-course-pause', 'leo_night_course_deferred', 'не ставитиму будильник'],
  ])('carries a distinct career decision into day four: %s', (choice, flag, callback) => {
    let dialogue = startDialogue(leoVisit);
    for (const id of [
      'greet',
      'leo-course-now',
      'leo-course-ask-boss',
      'leo-course-boss-continue',
      choice,
    ])
      dialogue = selectOption(leoVisit, dialogue, id);
    const restored = decodeSave(encodeSave({ stage: 'leo', flags: dialogue.flags, dialogue }))!;
    expect(restored.flags).toContain(flag);
    const otherPlans = [
      'leo_night_course_application_planned',
      'leo_night_course_shift_request_planned',
      'leo_night_course_deferred',
    ].filter((f) => f !== flag);
    expect(otherPlans.some((f) => restored.flags.includes(f))).toBe(false);
    const followup = currentNode(leoDecision, {
      ...startDialogue(leoDecision),
      node: 'welcome',
      flags: restored.flags,
    });
    expect(followup.text).toContain(callback);
    expect(restored.flags).not.toContain('leo_letter_consent_respected');
  });
});

describe('authored weather and time', () => {
  const stages: ChapterStage[] = [
    'miller',
    'mara',
    'evening',
    'complete',
    'iris',
    'anna',
    'leo',
    'day2-complete',
    'eleanor',
    'thomas',
    'nora',
    'book-club',
    'quiet-evening',
    'day3-complete',
    'day4-iris',
    'day4-mara',
    'day4-leo',
    'day4-complete',
    'day5-reading',
    'season-complete',
  ];
  it('covers all five days and every saved stage without wall-clock randomness', () => {
    expect(
      new Set(
        stages.map(
          (stage) => storyProgress(stage).find((day) => day.status === 'current')?.day ?? 5,
        ),
      ).size,
    ).toBe(5);
    expect(new Set(stages.map((stage) => storyEnvironment(stage).time))).toEqual(
      new Set(['morning', 'day', 'dusk', 'night']),
    );
    expect(new Set(stages.map((stage) => storyEnvironment(stage).weather))).toEqual(
      new Set(['clear', 'cloudy', 'rain']),
    );
    for (const stage of stages) expect(storyEnvironment(stage)).toEqual(storyEnvironment(stage));
    expect(storyEnvironment('leo')).toMatchObject({ time: 'dusk', weather: 'clear' });
    expect(storyEnvironment('day5-reading', 'end').time).toBe('night');
  });
});

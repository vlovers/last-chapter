import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  chooseChapterOption,
  finishSeason,
  startFifthDay,
  type ChapterState,
} from '../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

const maraPaths = [
  ['mara_window_bookshop_suggested', 'saturday-mara-tasting', 'final_saturday_mara_tasting_discussed'],
  ['mara_window_credit_encouraged', 'saturday-mara-credit', 'final_saturday_mara_credit_respected'],
  ['mara_window_private_suggested', 'saturday-mara-private', 'final_saturday_mara_private_respected'],
] as const;

const leoPaths = [
  ['leo_night_course_application_planned', 'saturday-leo-application', 'final_saturday_leo_wait_respected'],
  ['leo_night_course_shift_request_planned', 'saturday-leo-shifts', 'final_saturday_leo_shifts_unconfirmed'],
  ['leo_night_course_deferred', 'saturday-leo-rest', 'final_saturday_leo_rest_respected'],
] as const;

const earlier = ['mara_window_plan_discussed', 'leo_night_course_discussed'];

function optionIds(state: DialogueState): string[] {
  return availableOptions(finalReading, state).map((option) => option.id);
}

function gathering(flags: readonly string[]): DialogueState {
  return { ...startDialogue(finalReading), node: 'gathering', flags };
}

function choose(state: DialogueState, ...route: string[]): DialogueState {
  return route.reduce((current, id) => {
    expect(optionIds(current), `Missing ${id} at ${current.node}`).toContain(id);
    return selectOption(finalReading, current, id);
  }, state);
}

describe('Saturday plans: cross-day consequences without involuntary commitments', () => {
  it('unlocks only after both independent conversations and does not replace existing callbacks', () => {
    const topic = 'final-saturday-plans-topic';
    for (const flags of [
      [],
      ['mara_window_plan_discussed'],
      ['leo_night_course_discussed'],
    ]) {
      expect(optionIds(gathering(flags))).not.toContain(topic);
    }
    const flags = [...earlier, 'mara_own_morning_heard'];
    const state = gathering(flags);
    expect(optionIds(state)).toContain(topic);
    expect(optionIds(state)).toContain('final-leo-night-course');
    expect(optionIds(state)).toContain('final-v3-mara-option');
    const finished = choose(state, topic, 'saturday-finish');
    expect(finished.flags).toContain('final_saturday_plans_done');
    expect(optionIds(finished)).not.toContain(topic);
    expect(optionIds(finished)).toContain('final-leo-night-course');
    expect(optionIds(finished)).toContain('final-v3-mara-option');
  });

  it('has nine distinct combinations of Mara and Leo choices without inventing a confirmed schedule', () => {
    const scenes = new Set<string>();
    for (const [mara] of maraPaths) {
      for (const [leo] of leoPaths) {
        const state = choose(gathering([...earlier, mara, leo]), 'final-saturday-plans-topic');
        const text = currentNode(finalReading, state).text;
        scenes.add(text);
        expect(text.length).toBeGreaterThan(140);
        expect(optionIds(state)).toEqual([
          'saturday-talk-mara',
          'saturday-talk-leo',
          'saturday-talk-calendar',
          'saturday-finish',
        ]);
      }
    }
    expect(scenes.size).toBe(9);
  });

  it.each(maraPaths)('honors Mara route %s without exposing a private recipe', (flag, choice, outcome) => {
    const state = choose(
      gathering([...earlier, flag, 'leo_night_course_deferred']),
      'final-saturday-plans-topic',
      'saturday-talk-mara',
    );
    const allowed = optionIds(state);
    expect(allowed).toContain(choice);
    for (const [, other] of maraPaths) {
      if (other !== choice) expect(allowed).not.toContain(other);
    }
    const done = choose(state, choice, 'saturday-mara-result-back', 'saturday-finish');
    expect(done.flags).toContain(outcome);
    expect(done.flags).toContain('final_saturday_plans_done');
    const ending = seasonEnding({ flags: done.flags }).epilogue;
    if (flag === 'mara_window_private_suggested') {
      expect(ending).toContain('Ні фотографій, ні оголошення');
      expect(ending).not.toContain('Мара не відкинула маленьку дегустацію');
    }
    if (flag === 'mara_window_bookshop_suggested') {
      expect(ending).toContain('спершу має сама домовитися');
    }
  });

  it.each(leoPaths)('honors Leo route %s without assigning June a shift', (flag, choice, outcome) => {
    const state = choose(
      gathering([...earlier, 'mara_window_bookshop_suggested', flag]),
      'final-saturday-plans-topic',
      'saturday-talk-leo',
    );
    const allowed = optionIds(state);
    expect(allowed).toContain(choice);
    for (const [, other] of leoPaths) {
      if (other !== choice) expect(allowed).not.toContain(other);
    }
    const done = choose(state, choice, 'saturday-leo-result-back', 'saturday-finish');
    expect(done.flags).toContain(outcome);
    const ending = seasonEnding({ flags: done.flags }).epilogue;
    expect(ending).toContain('Лео');
    expect(ending).not.toContain('Джун погодилася на другу');
  });

  it('keeps a proposed calendar separate from a confirmed event', () => {
    const flags = [...earlier, 'mara_window_bookshop_suggested', 'leo_night_course_shift_request_planned'];
    const offered = choose(
      gathering(flags),
      'final-saturday-plans-topic',
      'saturday-talk-calendar',
      'saturday-calendar-offer',
      'saturday-calendar-result-back',
      'saturday-finish',
    );
    expect(offered.flags).toContain('final_saturday_calendar_offered');
    expect(seasonEnding({ flags: offered.flags }).epilogue).toContain('жодної зустрічі ще не призначили');
    const separate = choose(
      gathering(flags),
      'final-saturday-plans-topic',
      'saturday-talk-calendar',
      'saturday-calendar-separate',
      'saturday-calendar-result-back',
      'saturday-finish',
    );
    expect(separate.flags).toContain('final_saturday_plans_separate');
    expect(seasonEnding({ flags: separate.flags }).epilogue).toContain('залишився порожнім');
  });

  it('persists the entire cross-day callback through a real day-five checkpoint and save/load', () => {
    const flags = [
      ...earlier,
      'mara_window_private_suggested',
      'leo_night_course_shift_request_planned',
    ];
    const previous: ChapterState = {
      stage: 'day4-complete',
      flags,
      dialogue: { ...startDialogue(finalReading), flags },
    };
    let chapter = startFifthDay(previous);
    chapter = chooseChapterOption(chapter, 'open');
    chapter = chooseChapterOption(chapter, 'final-saturday-plans-topic');
    chapter = chooseChapterOption(chapter, 'saturday-talk-mara');
    chapter = chooseChapterOption(chapter, 'saturday-mara-private');
    chapter = chooseChapterOption(chapter, 'saturday-mara-result-back');
    const restored = decodeSave(encodeSave(chapter));
    expect(restored).not.toBeNull();
    expect(restored?.flags).toContain('final_saturday_mara_private_respected');
    chapter = chooseChapterOption(restored!, 'saturday-talk-leo');
    chapter = chooseChapterOption(chapter, 'saturday-leo-shifts');
    chapter = chooseChapterOption(chapter, 'saturday-leo-result-back');
    chapter = chooseChapterOption(chapter, 'saturday-finish');
    expect(optionIds(chapter.dialogue)).not.toContain('final-saturday-plans-topic');
    chapter = chooseChapterOption(chapter, 'close');
    chapter = finishSeason(chapter);
    expect(chapter.stage).toBe('season-complete');
    expect(chapter.flags).toContain('final_saturday_leo_shifts_unconfirmed');
    expect(chapter.flags).toContain('final_saturday_plans_done');
  });

  it('validates the new scene graph and limits every new node to four choices', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    const nodes = finalReading.nodes.filter((node) => node.id.startsWith('final-saturday-'));
    expect(nodes).toHaveLength(7);
    for (const node of nodes) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
      for (const option of node.options) {
        expect(finalReading.nodes.some((destination) => destination.id === option.next)).toBe(true);
      }
    }
  });
});

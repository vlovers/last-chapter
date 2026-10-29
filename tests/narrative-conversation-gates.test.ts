import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { bookClub } from '../src/content/book-club';
import { millerVisit } from '../src/content/first-day';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { thomasVisit } from '../src/content/thomas';
import { eleanorVisit } from '../src/content/eleanor';
import { irisDecision } from '../src/content/day-four-iris';
import { noraVisit } from '../src/content/nora';
import { maraDecision } from '../src/content/day-four-mara';
import { leoDecision } from '../src/content/day-four-leo';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';

function at(story: DialogueStory, node: string, flags: readonly string[] = []): DialogueState {
  return { ...startDialogue(story), node, flags };
}

function options(story: DialogueStory, node: string, flags: readonly string[] = []) {
  return availableOptions(story, at(story, node, flags)).map((choice) => choice.id);
}

describe('conversational pacing and continuity', () => {
  it('Nora does not discuss archives before sitting down for tea', () => {
    expect(options(noraVisit, 'hello')).not.toContain('nora-reflection');
    expect(options(noraVisit, 'hello')).not.toContain('nora-v3-conversation');
    let state = selectOption(noraVisit, startDialogue(noraVisit), 'hello');
    state = selectOption(noraVisit, state, 'nora-tea');
    state = selectOption(noraVisit, state, 'nora-tea-back');
    expect(state.flags).toContain('nora_tea_pause_heard');
    expect(availableOptions(noraVisit, state).map((choice) => choice.id)).toContain(
      'nora-reflection',
    );
    expect(availableOptions(noraVisit, state).map((choice) => choice.id)).toContain(
      'nora-v3-conversation',
    );
    expect(currentNode(noraVisit, state).text).toContain('чашку');
  });

  it('Anna earns reflective classroom questions by discussing actual students', () => {
    expect(options(annaVisit, 'hello')).not.toContain('anna-reflection');
    expect(options(annaVisit, 'hello')).not.toContain('anna-v3-conversation');
    let state = selectOption(annaVisit, startDialogue(annaVisit), 'hello');
    state = selectOption(annaVisit, state, 'anna-book-disagreement');
    state = selectOption(annaVisit, state, 'anna-disagreement-debate');
    state = selectOption(annaVisit, state, 'anna-disagreement-back');
    expect(state.flags).toContain('anna_book_disagreement_discussed');
    expect(availableOptions(annaVisit, state).map((choice) => choice.id)).toContain(
      'anna-reflection',
    );
    expect(availableOptions(annaVisit, state).map((choice) => choice.id)).toContain(
      'anna-v3-conversation',
    );
    expect(currentNode(annaVisit, state).text).toContain('Емма');
  });

  it('Mara talks about her own future after the bakery anecdote, not immediately', () => {
    expect(options(maraDecision, 'greet')).not.toContain('future');
    expect(options(maraDecision, 'greet', ['mara_day_four_own_story_heard'])).toContain('future');
    expect(options(maraDecision, 'greet', ['mara_day_four_rest_heard'])).toContain('book');
    expect(options(maraDecision, 'greet')).not.toContain('book');
  });

  it('Leo does not jump from a ticket confession directly to Iris', () => {
    expect(options(leoDecision, 'welcome')).not.toContain('past');
    expect(options(leoDecision, 'welcome', ['leo_day_four_ticket_feeling_heard'])).toContain(
      'mara',
    );
    expect(options(leoDecision, 'welcome', ['leo_day_four_future_heard'])).toContain('past');
    expect(
      currentNode(leoDecision, at(leoDecision, 'welcome', ['leo_day_four_future_heard'])).text,
    ).toContain('пекарні');
  });

  it('contextual hub lines do not repeat the opening after a subject is discussed', () => {
    const pairs: readonly [DialogueStory, string, string][] = [
      [noraVisit, 'hello', 'nora_tea_pause_heard'],
      [annaVisit, 'hello', 'anna_book_disagreement_discussed'],
      [maraDecision, 'greet', 'mara_day_four_rest_heard'],
      [leoDecision, 'welcome', 'leo_day_four_ticket_feeling_heard'],
    ];
    for (const [story, hub, flag] of pairs) {
      expect(currentNode(story, at(story, hub, [flag])).text).not.toBe(
        currentNode(story, at(story, hub)).text,
      );
    }
  });
  it.each([
    ['Mara pressured', maraDecision, 'greet', 'mara_letter_pressured', 'не проси'],
    ['Mara respected', maraDecision, 'greet', 'mara_letter_privacy_respected', 'Дякую'],
    ['Leo pressured', leoDecision, 'welcome', 'leo_letter_pressured_day4', 'не передавай'],
    ['Leo respected', leoDecision, 'welcome', 'leo_letter_consent_respected', 'Дякую'],
    ['Iris breach', irisDecision, 'welcome', 'iris_letter_breach_admitted', 'не розповідати'],
    ['Anna pressured', annaVisit, 'hello', 'anna_rumor_pressed', 'Томаса'],
    ['Nora pressured', noraVisit, 'hello', 'nora_confidentiality_pressed', 'не розповідатиму'],
  ] as const)('%s changes the next everyday conversation', (_name, story, hub, flag, phrase) => {
    expect(currentNode(story, at(story, hub, [flag])).text).toContain(phrase);
    expect(currentNode(story, at(story, hub, [flag])).text).not.toBe(
      currentNode(story, at(story, hub)).text,
    );
  });
  it.each([
    [
      'Mara',
      maraDecision,
      'greet',
      'mara_letter_pressured',
      'mara_letter_privacy_respected',
      'спочатку обіцяв',
    ],
    [
      'Leo',
      leoDecision,
      'welcome',
      'leo_letter_pressured_day4',
      'leo_letter_consent_respected',
      'спершу сказав',
    ],
    [
      'Iris',
      irisDecision,
      'welcome',
      'iris_letter_pressured_day4',
      'iris_letter_choice_respected',
      'знову почав',
    ],
    [
      'Anna',
      annaVisit,
      'hello',
      'anna_rumor_pressed',
      'anna_rumor_boundary',
      'все одно повернувся',
    ],
    [
      'Nora',
      noraVisit,
      'hello',
      'nora_confidentiality_pressed',
      'nora_confidentiality_respected',
      'потім передумав',
    ],
  ] as const)(
    '%s notices conflicting player choices rather than forgetting them',
    (_name, story, hub, pressure, respect, phrase) => {
      const pressured = currentNode(story, at(story, hub, [pressure])).text;
      const mixed = currentNode(story, at(story, hub, [pressure, respect])).text;
      expect(mixed).toContain(phrase);
      expect(mixed).not.toBe(pressured);
    },
  );

  it.each([
    ['Mara', maraDecision, 'greet'],
    ['Leo', leoDecision, 'welcome'],
    ['Iris', irisDecision, 'welcome'],
    ['Anna', annaVisit, 'hello'],
    ['Nora', noraVisit, 'hello'],
  ] as const)('%s has no duplicate condition sets for the same hub', (_name, story, hub) => {
    const node = story.nodes.find((entry) => entry.id === hub);
    expect(node).toBeDefined();
    const conditions = (node!.textWhen ?? []).map((entry) => [...entry.requires].sort().join('|'));
    expect(new Set(conditions).size).toBe(conditions.length);
  });

  it('combined trust history overrides generic single-fact responses', () => {
    const story = noraVisit;
    const pressured = currentNode(story, at(story, 'hello', ['nora_confidentiality_pressed']));
    const mixed = currentNode(
      story,
      at(story, 'hello', ['nora_confidentiality_pressed', 'nora_confidentiality_respected']),
    );
    expect(pressured.text).toContain('не розповідатиму');
    expect(mixed.text).toContain('потім передумав');
  });

  it.each([
    ['Leo', leoVisit, 'greet', 'leo-books', 'town'],
    ['Iris', irisVisit, 'welcome', 'iris-unprinted', 'art'],
    ['Thomas', thomasVisit, 'greet', 'thomas-lamp-first', 'repair'],
    ['Eleanor', eleanorVisit, 'greet', 'eleanor-shelf', 'shop'],
  ] as const)(
    '%s opens the scene promised by the first conversation option',
    (_name, story, hub, option, destination) => {
      const chosen = availableOptions(story, at(story, hub)).find((entry) => entry.id === option);
      expect(chosen?.next).toBe(destination);
      const next = selectOption(story, at(story, hub), option);
      expect(next.node).toBe(destination);
    },
  );

  it.each([
    ['Leo remembers honesty', leoVisit, 'greet', 'leo_honesty_discussed', 'Марі'],
    ['Leo remembers uncertainty', leoVisit, 'greet', 'leo_reflected_on_uncertainty', 'потяги'],
    ['Iris remembers privacy', irisVisit, 'welcome', 'iris_boundary_respected', 'Дякую'],
    ['Iris remembers sketches', irisVisit, 'welcome', 'iris_reflected_on_identity', 'ескізи'],
    ['Thomas remembers listening', thomasVisit, 'greet', 'thomas_listening_discussed', 'думаю'],
    [
      'Thomas remembers responsibility',
      thomasVisit,
      'greet',
      'thomas_reflected_on_responsibility',
      'лампочку',
    ],
    ['Eleanor allows changes', eleanorVisit, 'greet', 'eleanor_will_allow_change', 'інакше'],
    [
      'Eleanor remembers the old sign',
      eleanorVisit,
      'greet',
      'eleanor_reflected_on_legacy',
      'таблички',
    ],
  ] as const)('%s changes the returning greeting', (_name, story, hub, flag, phrase) => {
    const original = currentNode(story, at(story, hub)).text;
    const returning = currentNode(story, at(story, hub, [flag])).text;
    expect(returning).toContain(phrase);
    expect(returning).not.toBe(original);
  });
  it('Leo does not claim to have spoken with Mara merely because honesty was discussed', () => {
    const line = currentNode(leoVisit, at(leoVisit, 'greet', ['leo_honesty_discussed'])).text;
    expect(line).toContain('ще думаю');
    expect(line).not.toContain('все-таки сказав Марі');
  });

  it("Thomas does not invent Anna's approval or a completed repair", () => {
    const line = currentNode(
      thomasVisit,
      at(thomasVisit, 'greet', ['thomas_listening_discussed']),
    ).text;
    expect(line).toContain('думаю над тим');
    expect(line).not.toContain('Анна сказала');
    expect(line).not.toContain('лампа тепер працює');
  });

  it('returning character greetings are selected from facts without inventing offscreen outcomes', () => {
    const cases: readonly [DialogueStory, string, string][] = [
      [leoVisit, 'greet', 'leo_honesty_discussed'],
      [irisVisit, 'welcome', 'iris_boundary_respected'],
      [thomasVisit, 'greet', 'thomas_listening_discussed'],
      [eleanorVisit, 'greet', 'eleanor_will_allow_change'],
    ];
    for (const [story, hub, flag] of cases) {
      const node = currentNode(story, at(story, hub, [flag]));
      expect(node.text.length).toBeGreaterThan(40);
      expect(node.text).not.toBe(currentNode(story, at(story, hub)).text);
      expect(availableOptions(story, at(story, hub, [flag])).length).toBeGreaterThan(0);
    }
  });
  it.each([
    ['books', 'books-argument', 'argument'],
    ['argument', 'argument-anna', 'argument-anna'],
    ['argument', 'argument-miller', 'argument-miller'],
    ['mara', 'mara-change', 'mara-buns'],
    ['mara', 'mara-disagree', 'mara-disagree'],
    ['mara-disagree', 'mara-disagree-push', 'mara-disagree-more'],
  ] as const)('book club %s -> %s reaches its authored conversation', (hub, option, target) => {
    const state = at(bookClub, hub);
    expect(options(bookClub, hub)).toContain(option);
    expect(selectOption(bookClub, state, option).node).toBe(target);
    expect(currentNode(bookClub, at(bookClub, target)).text.length).toBeGreaterThan(60);
  });

  it.each([
    ['argument-anna', 'argument-anna-back', 'club_argued_about_characters'],
    ['argument-miller', 'argument-miller-back', 'club_argued_about_characters'],
    ['mara-buns', 'mara-buns-back', 'club_shared_bakery_joke'],
    ['mara-disagree', 'mara-disagree-back', 'club_mara_disagreed'],
    ['mara-disagree-more', 'mara-disagree-more-back', 'club_mara_disagreed'],
  ] as const)('book club %s remembers its optional conversation', (hub, option, flag) => {
    const state = selectOption(bookClub, at(bookClub, hub), option);
    expect(state.node).toBe('welcome');
    expect(state.flags).toContain(flag);
  });

  it('Miller can talk about ordinary town life without unlocking case clues', () => {
    const state = selectOption(millerVisit, at(millerVisit, 'topics'), 'miller-neighbors');
    expect(state.node).toBe('miller-neighbors');
    expect(options(millerVisit, 'miller-neighbors')).toEqual(
      expect.arrayContaining(['miller-neighbors-mara', 'miller-neighbors-thomas']),
    );
    for (const [choice, returnChoice, flag] of [
      ['miller-neighbors-mara', 'miller-neighbors-mara-back', 'miller_bakery_story_heard'],
      [
        'miller-neighbors-thomas',
        'miller-neighbors-thomas-back',
        'miller_thomas_baking_story_heard',
      ],
    ] as const) {
      const branch = selectOption(millerVisit, state, choice);
      const back = selectOption(millerVisit, branch, returnChoice);
      expect(back.node).toBe('topics');
      expect(back.flags).toContain(flag);
      expect(back.flags).not.toContain('rumor_amplified');
    }
  });
  it.each([
    ['Anna', annaVisit, 'hello', 'anna-school-funny', 'anna-school-funny', 'anna-school-funny-work', 'anna-school-funny-work-back', 'anna_classroom_joke_heard'],
    ['Leo', leoVisit, 'greet', 'leo-station-funny', 'leo-station-funny', 'leo-station-funny-boss', 'leo-station-funny-boss-return', 'leo_station_moon_story_heard'],
  ] as const)('%s has a complete optional everyday story', (_name, story, hub, option, scene, followup, finish, flag) => {
    const start = at(story, hub);
    const entered = selectOption(story, start, option);
    expect(entered.node).toBe(scene);
    const detail = selectOption(story, entered, followup);
    const returned = selectOption(story, detail, finish);
    expect(returned.node).toBe(hub);
    expect(returned.flags).toContain(flag);
  });

  it.each([
    ['Iris', irisVisit, 'welcome', 'iris-sketch-mishap', 'iris-sketch-mishap-fix', 'iris-sketch-mishap-fix-back', 'iris_fox_story_heard'],
    ['Nora', noraVisit, 'hello', 'nora-newspaper', 'nora-newspaper-letter', 'nora-newspaper-letter-back', 'nora_newspaper_story_heard'],
    ['Thomas', thomasVisit, 'greet', 'thomas-repair-funny', 'thomas-repair-funny-note', 'thomas-repair-funny-note-back', 'thomas_music_box_story_heard'],
  ] as const)('%s has a complete optional personal story', (_name, story, hub, option, followup, finish, flag) => {
    const entered = selectOption(story, at(story, hub), option);
    const detail = selectOption(story, entered, followup);
    const returned = selectOption(story, detail, finish);
    expect(returned.node).toBe(hub);
    expect(returned.flags).toContain(flag);
  });

});

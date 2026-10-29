import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
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
});

import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
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
    expect(availableOptions(noraVisit, state).map((choice) => choice.id)).toContain('nora-reflection');
    expect(availableOptions(noraVisit, state).map((choice) => choice.id)).toContain('nora-v3-conversation');
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
    expect(availableOptions(annaVisit, state).map((choice) => choice.id)).toContain('anna-reflection');
    expect(availableOptions(annaVisit, state).map((choice) => choice.id)).toContain('anna-v3-conversation');
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
    expect(options(leoDecision, 'welcome', ['leo_day_four_ticket_feeling_heard'])).toContain('mara');
    expect(options(leoDecision, 'welcome', ['leo_day_four_future_heard'])).toContain('past');
    expect(currentNode(leoDecision, at(leoDecision, 'welcome', ['leo_day_four_future_heard'])).text).toContain('пекарні');
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
});

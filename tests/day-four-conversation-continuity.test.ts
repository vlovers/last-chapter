import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import { maraDecision } from '../src/content/day-four-mara';
import { leoDecision } from '../src/content/day-four-leo';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueStory,
} from '../src/game/dialogue';

function follow(story: DialogueStory, ids: string[]) {
  return ids.reduce((state, id) => selectOption(story, state, id), startDialogue(story));
}

describe('day-four conversation continuity', () => {
  it('lets Iris respond to a direct question before returning to the topic menu', () => {
    const state = follow(irisDecision, [
      'welcome',
      'iris-boundaries',
      'iris-boundaries-belong',
      'iris-boundaries-followup-joke',
    ]);
    expect(currentNode(irisDecision, state).id).toBe('iris-boundaries-followup');
    expect(state.flags).toContain('iris_day_four_boundary_joked');
    expect(availableOptions(irisDecision, state).map((option) => option.id)).toContain(
      'iris-boundaries-back',
    );
    const done = selectOption(irisDecision, state, 'iris-boundaries-back');
    expect(done.flags).toContain('iris_day_four_boundary_heard');
    expect(availableOptions(irisDecision, done).map((option) => option.id)).not.toContain(
      'iris-boundaries',
    );
  });

  it('keeps Mara on her bakery story through two meaningful responses', () => {
    const state = follow(maraDecision, [
      'greet',
      'mara-own-story',
      'mara-own-story-work',
      'mara-own-story-followup-joke',
    ]);
    expect(currentNode(maraDecision, state).id).toBe('mara-own-story-followup');
    expect(state.flags).toContain('mara_day_four_chose_own_time');
    expect(state.flags).toContain('mara_day_four_followup_joke');
    const done = selectOption(maraDecision, state, 'mara-own-story-back');
    expect(done.flags).toContain('mara_day_four_own_story_heard');
  });

  it('keeps Leo on the ticket story until he decides what to say to Mara', () => {
    const state = follow(leoDecision, [
      'welcome',
      'leo-future',
      'leo-future-honest',
      'leo-future-followup-direct',
    ]);
    expect(currentNode(leoDecision, state).id).toBe('leo-future-followup');
    expect(state.flags).toContain('leo_day_four_chose_honesty');
    expect(state.flags).toContain('leo_day_four_followup_direct');
    const done = selectOption(leoDecision, state, 'leo-future-back');
    expect(done.flags).toContain('leo_day_four_future_heard');
  });
});

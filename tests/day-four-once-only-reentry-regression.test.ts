import { describe, expect, it } from 'vitest';
import { leoDecision } from '../src/content/day-four-leo';
import { maraDecision } from '../src/content/day-four-mara';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueStory,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function follow(story: DialogueStory, ids: readonly string[]) {
  return ids.reduce((state, id) => selectOption(story, state, id), startDialogue(story));
}

describe('day-four once-only story re-entry after an alternate entry point', () => {
  it('does not make Mara repeat her bakery story after a belated break', () => {
    const rested = follow(maraDecision, [
      'greet',
      'mara-own-story',
      'mara-own-story-work',
      'mara-own-story-followup-direct',
      'mara-own-story-back',
      'mara-rest',
    ]);

    expect(availableOptions(maraDecision, rested).map((option) => option.id)).toEqual([
      'mara-rest-return',
    ]);
    const returned = selectOption(maraDecision, rested, 'mara-rest-return');
    expect(returned.node).toBe('greet');
    expect(returned.flags).toContain('mara_day_four_rest_heard');
    expect(returned.flags).toContain('mara_day_four_own_story_heard');
    expect(returned.flags).toContain('mara_day_four_chose_own_time');
    expect(returned.flags).not.toContain('mara_day_four_named_own_needs');
    expect(availableOptions(maraDecision, returned).map((option) => option.id)).toContain('book');
    expect(availableOptions(maraDecision, returned).map((option) => option.id)).not.toContain(
      'mara-own-story',
    );
  });

  it('does not let Leo contradict his ticket answer after the delayed feeling topic', () => {
    const feeling = follow(leoDecision, [
      'welcome',
      'leo-future',
      'leo-future-honest',
      'leo-future-followup-direct',
      'leo-future-back',
      'leo-ticket-feeling',
    ]);

    expect(availableOptions(leoDecision, feeling).map((option) => option.id)).toEqual([
      'leo-ticket-feeling-return',
    ]);
    const returned = selectOption(leoDecision, feeling, 'leo-ticket-feeling-return');
    expect(returned.node).toBe('welcome');
    expect(returned.flags).toContain('leo_day_four_ticket_feeling_heard');
    expect(returned.flags).toContain('leo_day_four_future_heard');
    expect(returned.flags).toContain('leo_day_four_chose_honesty');
    expect(returned.flags).not.toContain('leo_day_four_respected_privacy');
    expect(availableOptions(leoDecision, returned).map((option) => option.id)).toContain('mara');
    expect(availableOptions(leoDecision, returned).map((option) => option.id)).not.toContain(
      'leo-future',
    );
  });

  it('preserves both conditional returns and choices through save/restore', () => {
    const cases = [
      {
        stage: 'day4-mara' as const,
        story: maraDecision,
        path: [
          'greet',
          'mara-own-story',
          'mara-own-story-love',
          'mara-own-story-followup-joke',
          'mara-own-story-back',
          'mara-rest',
        ],
        expectedOption: 'mara-rest-return',
        completedFlag: 'mara_day_four_rest_heard',
      },
      {
        stage: 'day4-leo' as const,
        story: leoDecision,
        path: [
          'welcome',
          'leo-future',
          'leo-future-private',
          'leo-future-followup-humor',
          'leo-future-back',
          'leo-ticket-feeling',
        ],
        expectedOption: 'leo-ticket-feeling-return',
        completedFlag: 'leo_day_four_ticket_feeling_heard',
      },
    ];

    for (const { stage, story, path, expectedOption, completedFlag } of cases) {
      const dialogue = follow(story, path);
      const restored = decodeSave(encodeSave({ stage, dialogue, flags: [...dialogue.flags] }));
      expect(restored).not.toBeNull();
      const options = availableOptions(story, restored!.dialogue);
      expect(options.map((option) => option.id)).toEqual([expectedOption]);
      expect(options.length).toBeLessThanOrEqual(4);
      const returned = selectOption(story, restored!.dialogue, expectedOption);
      expect(returned.flags).toContain(completedFlag);
      expect(returned.node).toBe(stage === 'day4-mara' ? 'greet' : 'welcome');
    }
  });

  it('keeps original edge IDs for old saves and validates both graphs', () => {
    const leoEdge = leoDecision.nodes
      .find((node) => node.id === 'leo-ticket-feeling')
      ?.options.find((option) => option.id === 'leo-ticket-feeling-back');
    const maraEdge = maraDecision.nodes
      .find((node) => node.id === 'mara-rest')
      ?.options.find((option) => option.id === 'mara-rest-back');
    expect(leoEdge?.next).toBe('leo-future');
    expect(maraEdge?.next).toBe('mara-own-story');
    expect(leoEdge?.unless).toContain('leo_day_four_future_heard');
    expect(maraEdge?.unless).toContain('mara_day_four_own_story_heard');
    expect(validateDialogue(leoDecision)).toEqual([]);
    expect(validateDialogue(maraDecision)).toEqual([]);
  });
});

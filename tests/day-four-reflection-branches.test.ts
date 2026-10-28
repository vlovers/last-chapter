import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import { maraDecision } from '../src/content/day-four-mara';
import { leoDecision } from '../src/content/day-four-leo';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Day four character choices', () => {
  it.each([
    [
      irisDecision,
      'welcome',
      'iris-boundaries',
      'iris-boundaries-stay',
      'iris_day_four_respected_freedom',
      'iris-boundaries-back',
    ],
    [
      maraDecision,
      'greet',
      'mara-own-story',
      'mara-own-story-work',
      'mara_day_four_chose_own_time',
      'mara-own-story-back',
    ],
    [
      leoDecision,
      'welcome',
      'leo-future',
      'leo-future-honest',
      'leo_day_four_chose_honesty',
      'leo-future-back',
    ],
    [
      irisDecision,
      'welcome',
      'iris-boundaries',
      'iris-boundaries-belong',
      'iris_day_four_supported_belonging',
      'iris-boundaries-back',
    ],
    [
      maraDecision,
      'greet',
      'mara-own-story',
      'mara-own-story-love',
      'mara_day_four_named_own_needs',
      'mara-own-story-back',
    ],
    [
      leoDecision,
      'welcome',
      'leo-future',
      'leo-future-private',
      'leo_day_four_respected_privacy',
      'leo-future-back',
    ],
  ] as const)(
    'returns to conversation with a recorded choice',
    (story, entry, choice, decision, flag, back) => {
      expect(validateDialogue(story)).toEqual([]);
      let state = selectOption(story, startDialogue(story), entry);
      state = selectOption(story, state, choice);
      state = selectOption(story, state, decision);
      expect(state.flags).toContain(flag);
      expect(currentNode(story, state).text.length).toBeGreaterThan(20);
      const followup = availableOptions(story, state)[0];
      expect(followup).toBeDefined();
      state = selectOption(story, state, followup.id);
      state = selectOption(story, state, back);
      expect(state.node).toBe(entry);
      expect(availableOptions(story, state).some((option) => option.id === choice)).toBe(false);
    },
  );
});

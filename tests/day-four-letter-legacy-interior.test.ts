import { describe, expect, it } from 'vitest';
import { leoDecision } from '../src/content/day-four-leo';
import { maraDecision } from '../src/content/day-four-mara';
import type { ChapterStage } from '../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueStory,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const cases: readonly {
  name: string;
  story: DialogueStory;
  stage: ChapterStage;
  hub: string;
  entry: string;
  pressure: string;
  refusal: string;
  blocked: readonly string[];
  safe: readonly string[];
  narration: string;
  extraFlags: readonly string[];
}[] = [
  {
    name: 'Leo after pressure',
    story: leoDecision,
    stage: 'day4-leo',
    hub: 'welcome',
    entry: 'welcome',
    pressure: 'letter-push',
    refusal: 'leo_letter_pressured_day4',
    blocked: ['letter-push', 'letter-ask'],
    safe: ['letter-wait', 'letter-back'],
    narration: 'Я вже просив не тиснути',
    extraFlags: [],
  },
  {
    name: 'Leo after pressure and Iris refusal',
    story: leoDecision,
    stage: 'day4-leo',
    hub: 'welcome',
    entry: 'welcome',
    pressure: 'letter-push',
    refusal: 'leo_letter_pressured_day4',
    blocked: ['letter-push', 'letter-ask'],
    safe: ['letter-wait', 'letter-back'],
    narration: 'Я вже просив не тиснути',
    extraFlags: ['iris_letter_pressured_day4', 'iris_letter_choice_respected'],
  },
  {
    name: 'Mara after pressure',
    story: maraDecision,
    stage: 'day4-mara',
    hub: 'greet',
    entry: 'greet',
    pressure: 'push',
    refusal: 'mara_letter_pressured',
    blocked: ['push'],
    safe: ['privacy', 'truth', 'letter-back'],
    narration: 'Ми вже говорили про лист',
    extraFlags: [],
  },
  {
    name: 'Mara after respecting privacy and then pressuring',
    story: maraDecision,
    stage: 'day4-mara',
    hub: 'greet',
    entry: 'greet',
    pressure: 'push',
    refusal: 'mara_letter_pressured',
    blocked: ['push'],
    safe: ['privacy', 'truth', 'letter-back'],
    narration: 'Ти обіцяв не втручатися',
    extraFlags: ['mara_letter_privacy_respected'],
  },
];

function optionIds(story: DialogueStory, state: DialogueState) {
  return availableOptions(story, state).map((option) => option.id);
}

describe('day-four legacy saves inside a refused letter conversation', () => {
  it.each(cases)('$name: cannot repeat pressure after loading an interior save', (scenario) => {
    const legacy: DialogueState = {
      ...startDialogue(scenario.story),
      node: 'letter',
      flags: ['saw_envelope', scenario.refusal, ...scenario.extraFlags],
    };
    const restored = decodeSave(
      encodeSave({ stage: scenario.stage, dialogue: legacy, flags: legacy.flags }),
    );
    expect(restored).not.toBeNull();
    expect(restored?.dialogue.node).toBe('letter');
    const state = restored!.dialogue;
    expect(currentNode(scenario.story, state).text).toContain(scenario.narration);
    const options = optionIds(scenario.story, state);
    expect(options.length).toBeLessThanOrEqual(4);
    for (const blocked of scenario.blocked) {
      expect(options).not.toContain(blocked);
      expect(() => selectOption(scenario.story, state, blocked)).toThrow('Option unavailable');
    }
    for (const safe of scenario.safe) expect(options).toContain(safe);

    const returned = selectOption(scenario.story, state, 'letter-back');
    expect(returned.node).toBe(scenario.hub);
    expect(returned.flags).toContain(scenario.refusal);
    expect(optionIds(scenario.story, returned)).not.toContain('letter');
  });

  it.each(cases)('$name: initial encounter still permits the consequential choice', (scenario) => {
    let state: DialogueState = {
      ...startDialogue(scenario.story),
      flags: ['saw_envelope', ...scenario.extraFlags],
    };
    state = selectOption(scenario.story, state, scenario.entry);
    state = selectOption(scenario.story, state, 'letter');
    expect(optionIds(scenario.story, state)).toContain(scenario.pressure);
    expect(optionIds(scenario.story, state)).toContain('letter-back');
    expect(optionIds(scenario.story, state).length).toBeLessThanOrEqual(4);

    const deferred = selectOption(scenario.story, state, 'letter-back');
    expect(deferred.node).toBe(scenario.hub);
    expect(deferred.flags).not.toContain(scenario.refusal);
    expect(optionIds(scenario.story, deferred)).toContain('letter');
  });

  it.each(cases)('$name: actual refusal blocks the topic at the hub', (scenario) => {
    let state: DialogueState = {
      ...startDialogue(scenario.story),
      flags: ['saw_envelope', ...scenario.extraFlags],
    };
    for (const id of [scenario.entry, 'letter', scenario.pressure]) {
      state = selectOption(scenario.story, state, id);
    }
    expect(state.flags).toContain(scenario.refusal);
    const back = optionIds(scenario.story, state)[0]!;
    state = selectOption(scenario.story, state, back);
    expect(state.node).toBe(scenario.hub);
    expect(optionIds(scenario.story, state)).not.toContain('letter');
  });

  it('keeps both edited dialogue graphs valid', () => {
    expect(validateDialogue(leoDecision)).toEqual([]);
    expect(validateDialogue(maraDecision)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
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

const scenarios: readonly {
  name: string;
  story: DialogueStory;
  stage: ChapterStage;
  hub: string;
  flags: readonly string[];
  path: readonly string[];
  refusal: string;
  blocked: readonly string[];
  safe: string;
  response: string;
}[] = [
  {
    name: 'Iris refuses pressure',
    story: irisDecision,
    stage: 'day4-iris',
    hub: 'welcome',
    flags: ['saw_envelope'],
    path: ['welcome', 'letter', 'pressure', 'pressure-back'],
    refusal: 'iris_letter_pressured_day4',
    blocked: ['iris-letter-feeling', 'iris-letter-ask', 'letter'],
    safe: 'art',
    response: 'Я чула твої аргументи',
  },
  {
    name: 'Iris refuses further discussion after an admitted breach',
    story: irisDecision,
    stage: 'day4-iris',
    hub: 'welcome',
    flags: ['saw_envelope', 'opened_private_letter'],
    path: ['welcome', 'letter', 'admit-opened', 'breach-back'],
    refusal: 'iris_letter_breach_admitted',
    blocked: ['iris-letter-feeling', 'iris-letter-ask', 'letter'],
    safe: 'art',
    response: 'не хочу знову це обговорювати',
  },
  {
    name: 'Leo refuses pressure',
    story: leoDecision,
    stage: 'day4-leo',
    hub: 'welcome',
    flags: ['saw_envelope'],
    path: ['welcome', 'letter', 'letter-push', 'push-back'],
    refusal: 'leo_letter_pressured_day4',
    blocked: ['letter'],
    safe: 'trains',
    response: 'не передавай мені листа',
  },
  {
    name: 'Mara refuses pressure',
    story: maraDecision,
    stage: 'day4-mara',
    hub: 'greet',
    flags: ['saw_envelope'],
    path: ['greet', 'letter', 'push', 'push-back'],
    refusal: 'mara_letter_pressured',
    blocked: ['letter'],
    safe: 'work',
    response: 'Про чужий лист я вже сказала',
  },
];

function choices(story: DialogueStory, state: ReturnType<typeof startDialogue>) {
  return availableOptions(story, state).map((option) => option.id);
}

describe('day-four letter refusals remain respected', () => {
  it.each(scenarios)('$name through play, save and reload', (scenario) => {
    let state: DialogueState = { ...startDialogue(scenario.story), flags: [...scenario.flags] };
    for (const id of scenario.path) state = selectOption(scenario.story, state, id);
    expect(state.node).toBe(scenario.hub);
    expect(state.flags).toContain(scenario.refusal);
    expect(currentNode(scenario.story, state).text).toContain(scenario.response);
    for (const id of scenario.blocked) {
      expect(choices(scenario.story, state)).not.toContain(id);
      expect(() => selectOption(scenario.story, state, id)).toThrow('Option unavailable');
    }
    expect(choices(scenario.story, state)).toContain(scenario.safe);

    const restored = decodeSave(
      encodeSave({ stage: scenario.stage, dialogue: state, flags: state.flags }),
    );
    expect(restored).not.toBeNull();
    expect(restored?.dialogue.node).toBe(scenario.hub);
    for (const id of scenario.blocked) {
      expect(choices(scenario.story, restored!.dialogue)).not.toContain(id);
    }
    expect(choices(scenario.story, restored!.dialogue)).toContain(scenario.safe);
  });

  it.each(scenarios)('$name in legacy progress without completed-topic metadata', (scenario) => {
    const legacy = {
      ...startDialogue(scenario.story),
      node: scenario.hub,
      flags: [...scenario.flags, scenario.refusal],
    };
    for (const id of scenario.blocked) {
      expect(choices(scenario.story, legacy)).not.toContain(id);
      expect(() => selectOption(scenario.story, legacy, id)).toThrow('Option unavailable');
    }
    expect(choices(scenario.story, legacy)).toContain(scenario.safe);
  });

  it('keeps all three day-four conversation graphs valid', () => {
    for (const story of [irisDecision, leoDecision, maraDecision]) {
      expect(validateDialogue(story)).toEqual([]);
    }
  });
});

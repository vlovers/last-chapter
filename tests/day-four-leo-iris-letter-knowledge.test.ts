import journeyFixture from './fixtures/production-v2-journeys.json';
import { describe, expect, it } from 'vitest';
import { leoDecision } from '../src/content/day-four-leo';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const scenarios = [
  {
    name: 'unseen by Iris',
    flags: ['saw_envelope'],
    letter: 'Чи вона знає, що він знайшовся?',
    wait: 'черзі за хлібом',
    ask: 'Скажи їй, що я можу зустрітися',
  },
  {
    name: 'Iris chose not to deliver the letter',
    flags: ['saw_envelope', 'iris_letter_choice_respected'],
    letter: 'не давала згоди передавати його',
    wait: 'не давала згоди передавати його',
    ask: 'Скажи їй, що я можу зустрітися',
  },
  {
    name: 'Iris asked to stop discussing the letter',
    flags: ['saw_envelope', 'iris_letter_pressured_day4'],
    letter: 'попросила більше не порушувати цю тему',
    wait: 'Вона попросила не чіпати цю тему',
    ask: 'нічого їй від мене не передавай',
  },
  {
    name: 'Iris learned about the broken seal',
    flags: ['saw_envelope', 'iris_letter_breach_admitted'],
    letter: 'не переказуєш Лео приватну розмову',
    wait: 'не треба її переконувати',
    ask: 'Не треба знову питати її про лист',
  },
  {
    name: 'pressure takes precedence over earlier respect',
    flags: ['saw_envelope', 'iris_letter_choice_respected', 'iris_letter_pressured_day4'],
    letter: 'попросила більше не порушувати цю тему',
    wait: 'Вона попросила не чіпати цю тему',
    ask: 'нічого їй від мене не передавай',
  },
  {
    name: 'admitted breach takes precedence over earlier respect',
    flags: ['saw_envelope', 'iris_letter_choice_respected', 'iris_letter_breach_admitted'],
    letter: 'не переказуєш Лео приватну розмову',
    wait: 'не треба її переконувати',
    ask: 'Не треба знову питати її про лист',
  },
  {
    name: 'pressure and admitted breach both suppress the invitation',
    flags: ['saw_envelope', 'iris_letter_pressured_day4', 'iris_letter_breach_admitted'],
    letter: 'попросила більше не порушувати цю тему',
    wait: 'Вона попросила не чіпати цю тему',
    ask: 'нічого їй від мене не передавай',
  },
] as const;

function reachLetter(flags: readonly string[]) {
  const initial = { ...startDialogue(leoDecision), flags: [...flags] };
  const welcome = selectOption(leoDecision, initial, 'welcome');
  return selectOption(leoDecision, welcome, 'letter');
}

describe('Leo respects Iris letter knowledge across day-four conversations', () => {
  for (const scenario of scenarios) {
    it(scenario.name, () => {
      const letter = reachLetter(scenario.flags);
      expect(currentNode(leoDecision, letter).text).toContain(scenario.letter);
      const blocked = scenario.flags.some(
        (flag) => flag === 'iris_letter_pressured_day4' || flag === 'iris_letter_breach_admitted',
      );
      const options = availableOptions(leoDecision, letter).map((option) => option.id);
      expect(options).toEqual(
        blocked ? ['letter-wait', 'letter-push'] : ['letter-wait', 'letter-ask', 'letter-push'],
      );
      expect(options.length).toBeLessThanOrEqual(4);
      const wait = selectOption(leoDecision, letter, 'letter-wait');
      expect(currentNode(leoDecision, wait).text).toContain(scenario.wait);
      if (blocked) {
        expect(() => selectOption(leoDecision, letter, 'letter-ask')).toThrow('Option unavailable');
      } else {
        const ask = selectOption(leoDecision, letter, 'letter-ask');
        expect(currentNode(leoDecision, ask).text).toContain(scenario.ask);
      }
      const returned = selectOption(leoDecision, wait, 'wait-back');
      expect(returned.node).toBe('welcome');
      expect(returned.flags).toContain('leo_letter_consent_respected');
      if (blocked) expect(returned.flags).not.toContain('leo_open_to_conversation');
    });
  }

  it('preserves the correct knowledge-dependent narration after save restoration', () => {
    const letter = reachLetter([
      'saw_envelope',
      'iris_letter_choice_respected',
      'iris_letter_pressured_day4',
    ]);
    const restored = decodeSave(
      encodeSave({ stage: 'day4-leo', dialogue: letter, flags: [...letter.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(leoDecision, restored!.dialogue).text).toContain(
      'попросила більше не порушувати цю тему',
    );
    expect(availableOptions(leoDecision, restored!.dialogue).length).toBeLessThanOrEqual(4);
  });

  it('keeps old option IDs, return edges and graph structure valid', () => {
    expect(validateDialogue(leoDecision)).toEqual([]);
    for (const id of ['letter-wait', 'letter-ask', 'letter-push']) {
      expect(leoDecision.nodes.find((node) => node.id === 'letter')?.options).toEqual(
        expect.arrayContaining([expect.objectContaining({ id })]),
      );
    }
    expect(leoDecision.nodes.find((node) => node.id === 'letter-wait')?.options[0]?.next).toBe(
      'welcome',
    );
    expect(leoDecision.nodes.find((node) => node.id === 'letter-ask')?.options[0]?.next).toBe(
      'welcome',
    );
  });

  it.each([
    {
      name: 'explicit refusal',
      flag: 'iris_letter_pressured_day4',
      response: 'нічого їй від мене не передавай',
    },
    {
      name: 'admitted breach',
      flag: 'iris_letter_breach_admitted',
      response: 'Не треба знову питати її про лист',
    },
  ])('keeps a legacy letter-ask save playable after $name', ({ flag, response }) => {
    const letter = reachLetter(['saw_envelope', flag]);
    const legacy = { ...letter, node: 'letter-ask' };
    const restored = decodeSave(
      encodeSave({ stage: 'day4-leo', dialogue: legacy, flags: [...legacy.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(leoDecision, restored!.dialogue).text).toContain(response);
    const options = availableOptions(leoDecision, restored!.dialogue);
    expect(options.map((option) => option.id)).toEqual(['ask-back']);
    expect(options[0]?.label).toBe('«Зрозумів, рішення за Айріс»');
    expect(selectOption(leoDecision, restored!.dialogue, 'ask-back').node).toBe('welcome');
  });

  it('keeps the full admitted-breach journey on the consent-respecting route', () => {
    const admitted = journeyFixture.scenarios.find((scenario) => scenario.id === 'admitted');
    const route =
      admitted && 'day4-leo' in admitted.overrides ? admitted.overrides['day4-leo'] : undefined;
    expect(route).toEqual(['welcome', 'letter', 'letter-wait', 'wait-back', 'finish', '__advance']);
    let state = reachLetter(['saw_envelope', 'iris_letter_breach_admitted']);
    state = selectOption(leoDecision, state, 'letter-wait');
    state = selectOption(leoDecision, state, 'wait-back');
    expect(state.node).toBe('welcome');
    expect(state.flags).toContain('leo_letter_consent_respected');
    expect(state.flags).not.toContain('leo_open_to_conversation');
  });
});

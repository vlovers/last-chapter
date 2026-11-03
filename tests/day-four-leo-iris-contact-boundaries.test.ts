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
    name: 'letter found, Iris not consulted',
    flags: [],
    photo: 'Напишу їй спочатку',
    pressure: 'навіть не знаю, чи Айріс хоче',
  },
  {
    name: 'Iris chose to keep the letter',
    flags: ['iris_letter_choice_respected'],
    photo: 'Напишу їй спочатку',
    pressure: 'не давала згоди передавати лист',
  },
  {
    name: 'Iris explicitly rejected further pressure',
    flags: ['iris_letter_pressured_day4'],
    photo: 'попросила не повертатися до цієї теми',
    pressure: 'попросила залишити цю тему',
  },
  {
    name: 'Iris learned the seal was broken',
    flags: ['iris_letter_breach_admitted'],
    photo: 'не надсилатиму їй старе фото',
    pressure: 'не стану її підганяти',
  },
  {
    name: 'later pressure overrides earlier respect',
    flags: ['iris_letter_choice_respected', 'iris_letter_pressured_day4'],
    photo: 'попросила не повертатися до цієї теми',
    pressure: 'попросила залишити цю тему',
  },
  {
    name: 'pressure takes priority over admitted breach',
    flags: ['iris_letter_pressured_day4', 'iris_letter_breach_admitted'],
    photo: 'попросила не повертатися до цієї теми',
    pressure: 'попросила залишити цю тему',
  },
] as const;

function reachWelcome(flags: readonly string[]) {
  const initial = {
    ...startDialogue(leoDecision),
    flags: ['saw_envelope', 'leo_day_four_future_heard', ...flags],
  };
  return selectOption(leoDecision, initial, 'welcome');
}

describe('Leo respects Iris contact boundaries across day four', () => {
  for (const scenario of scenarios) {
    it(scenario.name, () => {
      const welcome = reachWelcome(scenario.flags);
      const photo = selectOption(leoDecision, welcome, 'past');
      expect(currentNode(leoDecision, photo).text).toContain(scenario.photo);
      expect(availableOptions(leoDecision, photo).map((option) => option.id)).toEqual([
        'past-back',
      ]);

      const returned = selectOption(leoDecision, photo, 'past-back');
      expect(returned.node).toBe('welcome');
      expect(returned.flags).toContain('leo_supported_mutual_consent');

      const letter = selectOption(leoDecision, returned, 'letter');
      expect(availableOptions(leoDecision, letter).length).toBeLessThanOrEqual(4);
      const pressure = selectOption(leoDecision, letter, 'letter-push');
      expect(currentNode(leoDecision, pressure).text).toContain(scenario.pressure);
      expect(availableOptions(leoDecision, pressure).map((option) => option.id)).toEqual([
        'push-back',
      ]);

      const after = selectOption(leoDecision, pressure, 'push-back');
      expect(after.node).toBe('welcome');
      expect(after.flags).toContain('leo_letter_pressured_day4');
      expect(after.flags).not.toContain('leo_open_to_conversation');
    });
  }

  it('preserves Iris refusal narration when restoring a save in the photo scene', () => {
    const photo = selectOption(leoDecision, reachWelcome(['iris_letter_pressured_day4']), 'past');
    const restored = decodeSave(
      encodeSave({ stage: 'day4-leo', dialogue: photo, flags: [...photo.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(leoDecision, restored!.dialogue).text).toContain(
      'попросила не повертатися до цієї теми',
    );
    expect(selectOption(leoDecision, restored!.dialogue, 'past-back').node).toBe('welcome');
  });

  it('preserves admitted-breach narration when restoring a save in the pressure scene', () => {
    const letter = selectOption(
      leoDecision,
      reachWelcome(['iris_letter_breach_admitted']),
      'letter',
    );
    const pressure = selectOption(leoDecision, letter, 'letter-push');
    const restored = decodeSave(
      encodeSave({ stage: 'day4-leo', dialogue: pressure, flags: [...pressure.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(leoDecision, restored!.dialogue).text).toContain('не стану її підганяти');
    expect(selectOption(leoDecision, restored!.dialogue, 'push-back').node).toBe('welcome');
  });

  it('keeps legacy return IDs and the complete dialogue graph valid', () => {
    expect(validateDialogue(leoDecision)).toEqual([]);
    expect(leoDecision.nodes.find((node) => node.id === 'past')?.options[0]?.id).toBe('past-back');
    expect(leoDecision.nodes.find((node) => node.id === 'letter-push')?.options[0]?.id).toBe(
      'push-back',
    );
    expect(leoDecision.nodes.find((node) => node.id === 'past')?.options[0]?.next).toBe(
      'welcome',
    );
  });
});

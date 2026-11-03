import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const consent = ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'];

function reachLetter(flags: readonly string[]) {
  const gathering = selectOption(finalReading, startDialogue(finalReading), 'open');
  return selectOption(finalReading, { ...gathering, flags: [...flags] }, 'letter');
}

const revoked = [
  {
    name: 'Iris explicitly refused further discussion',
    flags: ['iris_letter_pressured_day4'],
    narration: 'Я попросила не повертатися до листа',
  },
  {
    name: 'Iris knows the player opened the letter',
    flags: ['opened_private_letter', 'iris_letter_breach_admitted'],
    narration: 'Айріс знає, хто його відкрив',
  },
  {
    name: 'Leo rejected pressure to read the letter',
    flags: ['leo_letter_pressured_day4'],
    narration: 'Старий лист досі запечатаний',
  },
  {
    name: 'a previous breach has already been disclosed',
    flags: ['opened_private_letter', 'final_letter_breach_disclosed'],
    narration: 'Печатка на конверті порушена',
  },
  {
    name: 'Iris refused after an admitted breach',
    flags: ['iris_letter_pressured_day4', 'opened_private_letter', 'iris_letter_breach_admitted'],
    narration: 'Я просила більше не порушувати цю тему',
  },
  {
    name: 'Iris refused without learning who broke the seal',
    flags: ['iris_letter_pressured_day4', 'opened_private_letter'],
    narration: 'ще не знає, хто її відкрив',
  },
] as const;

describe('Final letter respects revoked consent and conflicting legacy flags', () => {
  it('offers a mutual conversation when both people are willing and the seal is intact', () => {
    const letter = reachLetter(consent);
    expect(availableOptions(finalReading, letter).map((option) => option.id)).toContain('mutual');
    const conversation = selectOption(finalReading, letter, 'mutual');
    const returned = selectOption(finalReading, conversation, 'mutual-back');
    expect(returned.flags).toContain('final_mutual_conversation');
    expect(availableOptions(finalReading, returned).map((option) => option.id)).not.toContain(
      'letter',
    );
  });

  for (const scenario of revoked) {
    it(scenario.name, () => {
      const letter = reachLetter([...consent, ...scenario.flags]);
      const choices = availableOptions(finalReading, letter).map((option) => option.id);
      expect(choices).not.toContain('mutual');
      expect(choices).toContain('wait');
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(currentNode(finalReading, letter).text).toContain(scenario.narration);
      expect(() => selectOption(finalReading, letter, 'mutual')).toThrow('Option unavailable');

      const waiting = selectOption(finalReading, letter, 'wait');
      const returned = selectOption(finalReading, waiting, 'wait-back');
      expect(returned.flags).toContain('final_letter_kept_private');
      expect(returned.flags).not.toContain('final_mutual_conversation');
      expect(availableOptions(finalReading, returned).map((option) => option.id)).not.toContain(
        'letter',
      );
    });
  }

  it('keeps refusal in force after suspending and restoring the final letter conversation', () => {
    const letter = reachLetter([...consent, 'iris_letter_pressured_day4']);
    const gathering = selectOption(finalReading, letter, 'letter-back');
    expect(gathering.node).toBe('gathering');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: gathering, flags: [...gathering.flags] }),
    );
    expect(restored).not.toBeNull();
    const resumed = selectOption(finalReading, restored!.dialogue, 'letter');
    expect(availableOptions(finalReading, resumed).map((option) => option.id)).not.toContain(
      'mutual',
    );
    expect(currentNode(finalReading, resumed).text).toContain('не повертатися до листа');
  });

  it('keeps an old save already inside the mutual scene navigable', () => {
    const letter = reachLetter([...consent, 'iris_letter_pressured_day4']);
    const legacy = { ...letter, node: 'mutual' };
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: legacy, flags: [...legacy.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(selectOption(finalReading, restored!.dialogue, 'mutual-back').node).toBe('gathering');
  });

  it('preserves the original option IDs, destinations and full dialogue graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    const letter = finalReading.nodes.find((node) => node.id === 'letter');
    expect(letter?.options.find((option) => option.id === 'mutual')?.next).toBe('mutual');
    expect(letter?.options.find((option) => option.id === 'wait')?.next).toBe('wait');
  });
});

import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const cases = Array.from({ length: 16 }, (_, mask) => {
  const opened = Boolean(mask & 1);
  const pressured = Boolean(mask & 2);
  const admitted = Boolean(mask & 4);
  const respected = Boolean(mask & 8);
  const flags = [
    'saw_envelope',
    ...(opened ? ['opened_private_letter'] : []),
    ...(pressured ? ['iris_letter_pressured_day4'] : []),
    ...(admitted ? ['iris_letter_breach_admitted'] : []),
    ...(respected ? ['iris_letter_choice_respected'] : []),
  ];
  return { name: `legacy letter flags ${mask}`, flags, opened, pressured, admitted };
});

describe('day-four Iris letter legacy flag combinations', () => {
  it.each(cases)(
    '$name: has a neutral safe exit and never reopens a refused topic',
    ({ flags, opened, pressured, admitted }) => {
      const legacy = { ...startDialogue(irisDecision), node: 'letter', flags };
      const saved = encodeSave({ stage: 'day4-iris', dialogue: legacy, flags });
      const restored = decodeSave(saved);
      expect(restored).not.toBeNull();
      const state = restored!.dialogue;
      const options = availableOptions(irisDecision, state);
      const ids = options.map((option) => option.id);
      expect(ids.length).toBeLessThanOrEqual(4);
      expect(ids).toContain('letter-back');
      expect(options.find((option) => option.id === 'letter-back')?.label).toBe(
        '«Повернімося до інших тем»',
      );

      if (pressured) {
        expect(ids).toEqual(['letter-back']);
        expect(() => selectOption(irisDecision, state, 'pressure')).toThrow(
          'Option unavailable',
        );
      } else if (opened) {
        expect(ids).not.toContain('respect');
        expect(ids).not.toContain('offer');
        expect(ids).toContain('respect-opened');
        expect(ids.includes('admit-opened')).toBe(!admitted);
      } else if (admitted) {
        // An older save may have lost the opened flag after an admission.
        // Never offer a false promise that the envelope is still sealed.
        expect(ids).not.toContain('respect');
        expect(ids).not.toContain('offer');
      } else {
        expect(ids).toContain('respect');
        expect(ids).toContain('offer');
      }

      if (admitted) {
        expect(currentNode(irisDecision, state).text).toMatch(/зізнав|відкрив/);
      }
      const returned = selectOption(irisDecision, state, 'letter-back');
      expect(returned.node).toBe('welcome');
      expect(returned.flags).toEqual(flags);
      const hubIds = availableOptions(irisDecision, returned).map((option) => option.id);
      expect(hubIds).toContain('art');
      if (pressured || admitted) {
        expect(hubIds).not.toContain('letter');
      } else {
        expect(hubIds).toContain('letter');
      }
      expect(selectOption(irisDecision, returned, 'art').node).toBe('art');
    },
  );

  it('remembers an admitted breach in the ending even if the opened flag was lost', () => {
    const legacy = {
      ...startDialogue(irisDecision),
      node: 'end',
      flags: ['saw_envelope', 'iris_letter_breach_admitted'],
    };
    expect(currentNode(irisDecision, legacy).text).toContain('зізнання');
  });

  it('keeps the original sealed and opened routes and graph valid', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
    for (const opened of [false, true]) {
      const initial = {
        ...startDialogue(irisDecision),
        flags: opened ? ['saw_envelope', 'opened_private_letter'] : ['saw_envelope'],
      };
      const welcome = selectOption(irisDecision, initial, 'welcome');
      const letter = selectOption(irisDecision, welcome, 'letter');
      expect(availableOptions(irisDecision, letter).map((option) => option.id)).toEqual(
        opened
          ? ['respect-opened', 'admit-opened', 'pressure', 'letter-back']
          : ['respect', 'offer', 'pressure', 'letter-back'],
      );
    }
  });
});

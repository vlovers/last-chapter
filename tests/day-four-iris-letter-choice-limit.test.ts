import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function reachLetter(opened: boolean) {
  const initial = {
    ...startDialogue(irisDecision),
    flags: opened ? ['saw_envelope', 'opened_private_letter'] : ['saw_envelope'],
  };
  const welcome = selectOption(irisDecision, initial, 'welcome');
  return selectOption(irisDecision, welcome, 'letter');
}

describe('Iris letter conversation stays within four authored responses', () => {
  it('offers four distinct choices while the seal is intact', () => {
    const letter = reachLetter(false);
    expect(availableOptions(irisDecision, letter).map((option) => option.id)).toEqual([
      'respect',
      'offer',
      'pressure',
      'letter-back',
    ]);
    const offered = selectOption(irisDecision, letter, 'offer');
    expect(selectOption(irisDecision, offered, 'offer-back').flags).toContain(
      'iris_letter_choice_respected',
    );
  });

  it('offers four choices after the seal is broken without redundant delivery offer', () => {
    const letter = reachLetter(true);
    expect(availableOptions(irisDecision, letter).map((option) => option.id)).toEqual([
      'respect-opened',
      'admit-opened',
      'pressure',
      'letter-back',
    ]);
    expect(() => selectOption(irisDecision, letter, 'offer')).toThrow('Option unavailable');
    expect(selectOption(irisDecision, letter, 'admit-opened').flags).toContain(
      'iris_letter_breach_admitted',
    );
    expect(selectOption(irisDecision, letter, 'respect-opened').flags).toContain(
      'iris_letter_choice_respected',
    );
    expect(selectOption(irisDecision, letter, 'pressure').flags).toContain(
      'iris_letter_pressured_day4',
    );
  });

  it('preserves the opened-letter choices after save restoration', () => {
    const letter = reachLetter(true);
    const restored = decodeSave(
      encodeSave({ stage: 'day4-iris', dialogue: letter, flags: [...letter.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(availableOptions(irisDecision, restored!.dialogue).map((option) => option.id)).toEqual([
      'respect-opened',
      'admit-opened',
      'pressure',
      'letter-back',
    ]);
  });

  it('keeps old saves already inside the offer scene playable', () => {
    const letter = reachLetter(true);
    const legacy = { ...letter, node: 'offer' };
    const restored = decodeSave(
      encodeSave({ stage: 'day4-iris', dialogue: legacy, flags: [...legacy.flags] }),
    );
    expect(restored).not.toBeNull();
    const returned = selectOption(irisDecision, restored!.dialogue, 'offer-back');
    expect(returned.node).toBe('welcome');
    expect(returned.flags).toContain('iris_letter_choice_respected');
  });

  it('preserves all authored destinations and dialogue graph validity', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
    const letter = irisDecision.nodes.find((node) => node.id === 'letter');
    expect(letter?.options.find((option) => option.id === 'offer')?.next).toBe('offer');
    expect(letter?.options.find((option) => option.id === 'letter-back')?.next).toBe('welcome');
    expect(availableOptions(irisDecision, reachLetter(true)).length).toBeLessThanOrEqual(4);
    expect(availableOptions(irisDecision, reachLetter(false)).length).toBeLessThanOrEqual(4);
  });
});

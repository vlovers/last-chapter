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

const envelope = ['saw_envelope'];
const opened = [...envelope, 'opened_private_letter'];
const admitted = [...opened, 'iris_letter_breach_admitted'];
const pressured = [...opened, 'iris_letter_pressured_day4'];

function reachWelcome(flags: readonly string[]) {
  return selectOption(
    irisDecision,
    { ...startDialogue(irisDecision), flags: [...flags] },
    'welcome',
  );
}

function reachLetter(flags: readonly string[]) {
  return selectOption(irisDecision, reachWelcome(flags), 'letter');
}

function ending(flags: readonly string[]) {
  return currentNode(irisDecision, { ...reachWelcome(flags), node: 'end' }).text;
}

describe('Day-four Iris remembers the broken seal without inventing consent', () => {
  it('keeps the intact-envelope introduction intact', () => {
    const text = currentNode(irisDecision, reachWelcome(envelope)).text;
    expect(text).toContain('Ти кладеш перед Айріс знайдений конверт');
    expect(text).not.toContain('порушену печатку');
  });

  it('notices the broken seal without knowing who opened the letter', () => {
    const text = currentNode(irisDecision, reachWelcome(opened)).text;
    expect(text).toContain('порушену печатку');
    expect(text).toContain('ще не знає, хто це зробив');
    expect(text).not.toContain('Ти зізнався');
  });

  it('remembers an admitted breach rather than asking who opened the letter', () => {
    const text = currentNode(irisDecision, reachWelcome(admitted)).text;
    expect(text).toContain('Я почула, що ти відкрив лист');
    expect(text).not.toContain('Хтось його відкривав?');
  });

  it('prioritizes a broken seal and Iris refusal over a previously respected choice', () => {
    const flags = [...pressured, 'iris_letter_choice_respected'];
    const text = currentNode(irisDecision, reachWelcome(flags)).text;
    expect(text).toContain('чому конверт відкритий');
    expect(text).toContain('не про передачу листа');
    expect(text).not.toContain('Ти сказав, що це мій вибір');
    expect(availableOptions(irisDecision, reachWelcome(flags)).map((option) => option.id)).not
      .toContain('letter');
  });

  it('remembers both admitted opening and pressure, even with an old respect flag', () => {
    const flags = [...admitted, 'iris_letter_pressured_day4', 'iris_letter_choice_respected'];
    const text = currentNode(irisDecision, reachWelcome(flags)).text;
    expect(text).toContain('Ти зізнався, що відкрив його без дозволу');
    expect(text).toContain('наполягав на передачі Лео');
    expect(availableOptions(irisDecision, reachWelcome(flags)).map((option) => option.id)).not
      .toContain('letter');
  });

  it('keeps the sealed-letter scene neutral', () => {
    const text = currentNode(irisDecision, reachLetter(envelope)).text;
    expect(text).toContain('Я це писала Лео');
    expect(text).not.toContain('зім’ятої печатки');
  });

  it('asks about an unadmitted opening without claiming Iris knows the culprit', () => {
    const letter = reachLetter(opened);
    const text = currentNode(irisDecision, letter).text;
    expect(text).toContain('Хтось відкрив мій лист');
    expect(text).toContain('Я ще не знаю, хто');
    expect(availableOptions(irisDecision, letter).map((option) => option.id)).toEqual([
      'respect-opened',
      'admit-opened',
      'pressure',
      'letter-back',
    ]);
  });

  it('keeps a legacy save already inside the letter scene navigable after admission', () => {
    const legacy = { ...reachWelcome(admitted), node: 'letter' };
    const restored = decodeSave(
      encodeSave({ stage: 'day4-iris', dialogue: legacy, flags: [...legacy.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(irisDecision, restored!.dialogue).text).toContain(
      'Ти вже сказав, що відкрив конверт',
    );
    expect(selectOption(irisDecision, restored!.dialogue, 'letter-back').node).toBe('welcome');
  });

  it('keeps the sealed ending unchanged', () => {
    expect(ending(envelope)).toContain('Конверт залишається за касою');
    expect(ending(envelope)).not.toContain('порушену печатку');
  });

  it('ends an unadmitted opening without assigning guilt to a character', () => {
    const text = ending(opened);
    expect(text).toContain('Я не знаю, хто відкрив конверт');
    expect(text).toContain('за касу');
    expect(text).not.toContain('твоє зізнання');
  });

  it('ends an admitted opening without claiming forgiveness', () => {
    const text = ending(admitted);
    expect(text).toContain('Я почула твоє зізнання');
    expect(text).toContain('зараз не хочу це обговорювати');
  });

  it('preserves opened-letter narration after save and restore', () => {
    const welcome = reachWelcome(opened);
    const restored = decodeSave(
      encodeSave({ stage: 'day4-iris', dialogue: welcome, flags: [...welcome.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(irisDecision, restored!.dialogue).text).toContain('порушену печатку');
    const letter = selectOption(irisDecision, restored!.dialogue, 'letter');
    expect(currentNode(irisDecision, letter).text).toContain('Я ще не знаю, хто');
  });

  it('retains graph validity and four-or-fewer authored letter choices', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
    for (const flags of [envelope, opened]) {
      expect(availableOptions(irisDecision, reachLetter(flags)).length).toBeLessThanOrEqual(4);
    }
  });
});

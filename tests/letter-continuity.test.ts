import { describe, expect, it } from 'vitest';
import { firstEvening } from '../src/content/evening';
import { irisDecision } from '../src/content/day-four-iris';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Iris letter continuity across five days', () => {
  it('keeps an untouched envelope sealed and allows opening it once', () => {
    const atLetter = {
      ...startDialogue(firstEvening),
      node: 'letter',
      flags: ['saw_envelope'],
    };
    expect(currentNode(firstEvening, atLetter).text).toContain('Печатка ціла');
    expect(availableOptions(firstEvening, atLetter).map((option) => option.id)).toContain(
      'letter-open',
    );
    const opened = selectOption(firstEvening, atLetter, 'letter-open');
    expect(opened.flags).toContain('opened_private_letter');
    const revisited = { ...opened, node: 'letter' };
    expect(currentNode(firstEvening, revisited).text).toContain('Печатка вже порушена');
    expect(availableOptions(firstEvening, revisited).map((option) => option.id)).not.toContain(
      'letter-open',
    );
    expect(() => selectOption(firstEvening, revisited, 'letter-open')).toThrow(
      'Option unavailable',
    );
    expect(currentNode(firstEvening, { ...opened, node: 'book' }).text).toContain(
      'порушеною печаткою',
    );
  });

  it('does not let the player promise Iris an intact seal after opening it', () => {
    let state: DialogueState = {
      ...startDialogue(irisDecision),
      flags: ['saw_envelope', 'opened_private_letter'],
    };
    state = selectOption(irisDecision, state, 'welcome');
    state = selectOption(irisDecision, state, 'letter');
    const choices = availableOptions(irisDecision, state).map((option) => option.id);
    expect(choices).not.toContain('respect');
    expect(choices).toContain('respect-opened');
    expect(choices).toContain('admit-opened');

    const admitted = selectOption(irisDecision, state, 'admit-opened');
    expect(admitted.flags).toContain('iris_letter_breach_admitted');
    expect(currentNode(irisDecision, admitted).text).toMatch(/Треба було спитати|Ти мав запитати/);
    expect(admitted.flags).not.toContain('iris_letter_choice_respected');

    const respected = selectOption(irisDecision, state, 'respect-opened');
    expect(respected.flags).toContain('iris_letter_choice_respected');
    expect(currentNode(irisDecision, respected).text).toContain('не скасовує');
  });

  it('preserves the original respect option when the envelope is untouched', () => {
    let state: DialogueState = { ...startDialogue(irisDecision), flags: ['saw_envelope'] };
    state = selectOption(irisDecision, state, 'welcome');
    state = selectOption(irisDecision, state, 'letter');
    const choices = availableOptions(irisDecision, state).map((option) => option.id);
    expect(choices).toContain('respect');
    expect(choices).not.toContain('respect-opened');
    expect(choices).not.toContain('admit-opened');
    expect(currentNode(irisDecision, selectOption(irisDecision, state, 'respect')).text).toContain(
      'Дякую',
    );
  });

  it('shows the right Day 5 narration for sealed, opened and admitted letters', () => {
    const start = selectOption(finalReading, startDialogue(finalReading), 'open');
    const letter = selectOption(finalReading, { ...start, flags: ['saw_envelope'] }, 'letter');
    expect(currentNode(finalReading, letter).text).toContain('досі запечатаний');

    const opened = { ...letter, flags: [...letter.flags, 'opened_private_letter'] };
    expect(currentNode(finalReading, opened).text).toContain('Печатка на конверті порушена');

    const admitted = { ...opened, flags: [...opened.flags, 'iris_letter_breach_admitted'] };
    expect(currentNode(finalReading, admitted).text).toContain('Айріс знає');
    expect(availableOptions(finalReading, admitted).map((option) => option.id)).not.toContain(
      'mutual',
    );

    const ready = {
      ...admitted,
      flags: [...admitted.flags, 'iris_letter_choice_respected', 'leo_open_to_conversation'],
    };
    expect(availableOptions(finalReading, ready).map((option) => option.id)).not.toContain(
      'mutual',
    );
    const saved = { stage: 'day5-reading' as const, dialogue: ready, flags: ready.flags };
    expect(decodeSave(encodeSave(saved))).toEqual(saved);
  });

  it('keeps all three dialogue graphs structurally valid', () => {
    for (const story of [firstEvening, irisDecision, finalReading]) {
      expect(validateDialogue(story)).toEqual([]);
    }
  });
});

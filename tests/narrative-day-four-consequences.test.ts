import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import { thomasVisit } from '../src/content/thomas';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';

function at(node: string, flags: string[] = []): DialogueState {
  return { node, flags, history: [] };
}

describe('Day four decisions have day five consequences', () => {
  it('Iris controls whether her exhibition has three drawings or only one', () => {
    const open = selectOption(irisDecision, at('iris-exhibition-plan'), 'iris-exhibition-open');
    const privateArt = selectOption(
      irisDecision,
      at('iris-exhibition-plan'),
      'iris-exhibition-private',
    );
    expect(currentNode(irisDecision, open).text).toContain('Три малюнки');
    expect(currentNode(irisDecision, privateArt).text).toContain('Почну з одного');
    expect(currentNode(finalReading, { ...open, node: 'final-v3-iris' }).text).toContain(
      'три малюнки',
    );
    expect(currentNode(finalReading, { ...privateArt, node: 'final-v3-iris' }).text).toContain(
      'тільки один малюнок',
    );
    const returned = selectOption(irisDecision, open, 'iris-exhibition-result-back');
    expect(
      availableOptions(irisDecision, returned).some(
        (option) => option.id === 'iris-exhibition-plan',
      ),
    ).toBe(false);
  });

  it('Thomas can admit his broken promise or avoid the conversation, and Anna remembers', () => {
    const owned = selectOption(thomasVisit, at('thomas-chairs'), 'thomas-chairs-own');
    const avoided = selectOption(thomasVisit, at('thomas-chairs'), 'thomas-chairs-fix');
    expect(currentNode(thomasVisit, owned).text).toContain('Подзвоню');
    expect(currentNode(thomasVisit, avoided).text).toContain('розмова знову почекає');
    expect(
      currentNode(finalReading, { ...owned, node: 'final-couple-anna-thomas' }).text,
    ).toContain('третій поверх');
    expect(
      currentNode(finalReading, { ...avoided, node: 'final-couple-anna-thomas' }).text,
    ).toContain('ще не поговорили');
    const returned = selectOption(thomasVisit, owned, 'thomas-chairs-back');
    expect(
      availableOptions(thomasVisit, returned).some((option) => option.id === 'thomas-chairs'),
    ).toBe(false);
  });

  it('preserves dialogue graph validity', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
    expect(validateDialogue(thomasVisit)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

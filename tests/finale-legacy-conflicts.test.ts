import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, startDialogue } from '../src/game/dialogue';

function finale(flags: string[]) {
  return currentNode(finalReading, {
    ...startDialogue(finalReading),
    node: 'end',
    flags,
  }).text;
}

describe('final evening legacy-save conflicts', () => {
  it('keeps the authored letter-breach ending ahead of a mutually discussed letter', () => {
    const text = finale(['final_letter_breach_disclosed', 'final_mutual_conversation']);
    expect(text).toContain('Вона почула правду, але не обіцяла пробачення');
    expect(text).not.toContain('Вони вже поговорили у дворі');
  });

  it('does not announce both sealed and deferred case outcomes in damaged saves', () => {
    const text = finale(['final_case_sealed', 'final_case_deferred']);
    expect(text).not.toContain('Нора кладе в шухляду конверт із перевіреними фактами');
    expect(text).not.toContain('Елеонора залишає порожній конверт у шухляді');
  });

  it('keeps a single valid case afterword for ordinary saves', () => {
    expect(finale(['final_case_sealed'])).toContain('конверт із перевіреними фактами');
    expect(finale(['final_case_deferred'])).toContain('нерозгадану історію розкритою');
  });

  it('does not contradict Iris consent when damaged saves retain both outcomes', () => {
    const text = finale(['final_case_iris_boundaries', 'final_case_iris_declined']);
    expect(text).not.toContain('Айріс сама вирішуватиме');
    expect(text).not.toContain('Айріс не захотіла обговорювати');
  });

  it('retains each Iris consent outcome independently', () => {
    expect(finale(['final_case_iris_boundaries'])).toContain('Айріс сама вирішуватиме');
    expect(finale(['final_case_iris_declined'])).toContain('Айріс не захотіла обговорювати');
  });
});

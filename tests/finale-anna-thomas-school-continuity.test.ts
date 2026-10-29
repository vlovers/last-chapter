import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';

const prerequisites = ['anna_uncertainty_discussed', 'thomas_listening_discussed'];

function enter(flags: string[] = []) {
  const start = { ...startDialogue(finalReading), flags: [...prerequisites, ...flags] };
  const gathering = selectOption(finalReading, start, 'open');
  expect(availableOptions(finalReading, gathering).map((option) => option.id)).toContain(
    'final-couple-anna-thomas',
  );
  return selectOption(finalReading, gathering, 'final-couple-anna-thomas');
}

describe('Anna and Thomas final reading continuity', () => {
  it.each([
    [
      ['thomas_chairs_owned_mistake', 'thomas_anna_chairs_direct_talk'],
      'Він подзвонив ще раз після роботи',
    ],
    [
      ['thomas_chairs_avoided_conversation', 'thomas_anna_chairs_direct_talk'],
      'Нові стільці досі стоять у коридорі',
    ],
    [['thomas_chairs_owned_mistake'], 'Томас подзвонив і сказав про стільці'],
    [['thomas_chairs_avoided_conversation'], 'Він пропонував купити нові стільці'],
  ] as const)('reflects earlier chairs outcome in finale: %j', (flags, text) => {
    expect(currentNode(finalReading, enter([...flags])).text).toContain(text);
  });

  it.each([
    [
      ['thomas_anna_chairs_direct_talk'],
      'Я спитав, коли їй буде зручно поговорити',
    ],
    [
      ['thomas_anna_chairs_player_kept_distance'],
      'Ми ще не закінчили цю розмову',
    ],
    [['thomas_chairs_owned_mistake'], 'Я подзвонив і вибачився'],
    [['thomas_chairs_avoided_conversation'], 'Я купив стільці'],
  ] as const)('keeps Thomas own account consistent: %j', (flags, text) => {
    const scene = selectOption(finalReading, enter([...flags]), 'final-at-listen');
    expect(currentNode(finalReading, scene).text).toContain(text);
  });

  it.each([
    ['anna_chairs_player_defended_thomas', 'Ти тоді заступився за Томаса'],
    ['anna_chairs_player_heard_anna', 'Пам’ятаєш, я розповідала про Емму'],
    ['anna_chairs_player_changed_topic', 'Джуліан таки переконав половину класу'],
  ])('remembers player stance in the school reading: %s', (flag, text) => {
    const thomas = selectOption(finalReading, enter([flag]), 'final-at-listen');
    const school = selectOption(finalReading, thomas, 'final-at-children');
    expect(currentNode(finalReading, school).text).toContain(text);
  });

  it.each([
    ['final-at-children-offer', 'final_anna_thomas_school_space_offered', 'У книгарні?'],
    ['final-at-children-smile', 'final_anna_thomas_school_story_heard', 'Вони впоралися'],
  ])('resolves school reading choice once: %s', (choice, flag, text) => {
    const thomas = selectOption(finalReading, enter(), 'final-at-listen');
    const school = selectOption(finalReading, thomas, 'final-at-children');
    const response = selectOption(finalReading, school, choice);
    expect(response.flags).toContain(flag);
    expect(currentNode(finalReading, response).text).toContain(text);
    const back = selectOption(finalReading, response, 'final-at-school-return');
    expect(back.node).toBe('gathering');
    expect(back.flags).toContain('final_anna_thomas_heard');
    expect(availableOptions(finalReading, back).map((option) => option.id)).not.toContain(
      'final-couple-anna-thomas',
    );
  });

  it('offers a complete book route without forcing a school discussion', () => {
    const thomas = selectOption(
      finalReading,
      enter(['thomas_chairs_avoided_conversation', 'thomas_anna_chairs_direct_talk']),
      'final-at-listen',
    );
    const book = selectOption(finalReading, thomas, 'final-at-more');
    expect(currentNode(finalReading, book).text).toContain('Ту, де люди роками пишуть');
    const back = selectOption(finalReading, book, 'final-at-book-back');
    expect(back.flags).toContain('final_anna_thomas_heard');
  });

  it('does not invent reconciliation when Thomas avoided the conversation', () => {
    const scene = enter(['thomas_chairs_avoided_conversation']);
    const close = selectOption(finalReading, scene, 'final-at-leave');
    expect(currentNode(finalReading, close).text).toContain('по різні боки полиці');
    const back = selectOption(finalReading, close, 'final-at-close-back');
    expect(back.node).toBe('gathering');
    expect(back.flags).toContain('final_anna_thomas_heard');
  });
});

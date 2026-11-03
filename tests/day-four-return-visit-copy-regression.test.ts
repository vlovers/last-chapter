import { describe, expect, it } from 'vitest';
import { irisDecision } from '../src/content/day-four-iris';
import { maraDecision } from '../src/content/day-four-mara';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueStory,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function play(story: DialogueStory, flags: readonly string[], path: readonly string[]) {
  let state: DialogueState = { ...startDialogue(story), flags: [...flags] };
  for (const option of path) state = selectOption(story, state, option);
  return state;
}

describe('day-four return visits remember what the characters already know', () => {
  it.each([
    {
      name: 'sealed letter',
      flags: ['saw_envelope'],
      path: ['welcome', 'letter', 'respect', 'respect-back'],
    },
    {
      name: 'opened letter without an admission',
      flags: ['saw_envelope', 'opened_private_letter'],
      path: ['welcome', 'letter', 'respect-opened', 'respect-back'],
    },
    {
      name: 'offer to deliver only with consent',
      flags: ['saw_envelope'],
      path: ['welcome', 'letter', 'offer', 'offer-back'],
    },
  ])('Iris does not present the envelope again after $name', ({ flags, path }) => {
    const firstVisit = play(irisDecision, flags, ['welcome']);
    expect(currentNode(irisDecision, firstVisit).text).toContain('Ти кладеш перед Айріс');

    const afterConsent = play(irisDecision, flags, path);
    expect(afterConsent.flags).toContain('iris_letter_choice_respected');
    expect(currentNode(irisDecision, afterConsent).text).toContain('Дякую, що не вирішуєш за мене');
    expect(currentNode(irisDecision, afterConsent).text).not.toContain('Ти кладеш перед Айріс');

    const restored = decodeSave(
      encodeSave({ stage: 'day4-iris', dialogue: afterConsent, flags: afterConsent.flags }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(irisDecision, restored!.dialogue).text).toBe(
      currentNode(irisDecision, afterConsent).text,
    );
    expect(availableOptions(irisDecision, restored!.dialogue).map((option) => option.id)).toEqual(
      availableOptions(irisDecision, afterConsent).map((option) => option.id),
    );
  });

  it.each([
    ['iris_day_four_letter_fear_heard', 'Я поки не перечитувала'],
    ['iris_day_four_letter_feeling_heard', 'Конверт досі тут'],
    ['iris_exhibition_plan_heard', 'Я все ще думаю'],
  ])('Iris preserves the more specific %s callback after consent', (flag, expected) => {
    const state: DialogueState = {
      ...startDialogue(irisDecision),
      node: 'welcome',
      flags: ['saw_envelope', 'iris_letter_choice_respected', flag],
    };
    expect(currentNode(irisDecision, state).text).toContain(expected);
  });

  it('Iris prioritizes a later refusal over earlier consent, including old saves', () => {
    const state: DialogueState = {
      ...startDialogue(irisDecision),
      node: 'welcome',
      flags: ['saw_envelope', 'iris_letter_choice_respected', 'iris_letter_pressured_day4'],
    };
    const text = currentNode(irisDecision, state).text;
    expect(text).toContain('а потім знову почав переконувати');
    expect(text).toContain('лист сьогодні не обговорюємо');
    expect(availableOptions(irisDecision, state).map((option) => option.id)).not.toContain(
      'letter',
    );
  });

  it.each(['sold_station', 'sold_roads', 'sold_letters'] as const)(
    'Mara remembers her already-purchased %s book after a privacy-respecting conversation',
    (bookFlag) => {
      const state = play(
        maraDecision,
        ['saw_envelope', bookFlag],
        ['greet', 'letter', 'privacy', 'privacy-back'],
      );
      const text = currentNode(maraDecision, state).text;
      expect(text).toContain('вирішити, коли вручити йому книжку');
      expect(text).not.toContain('вибрати йому подарунок');

      const restored = decodeSave(
        encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }),
      );
      expect(restored).not.toBeNull();
      expect(currentNode(maraDecision, restored!.dialogue).text).toBe(text);

      const book = [
        'mara-rest',
        'mara-rest-back',
        'mara-own-story-work',
        'mara-own-story-followup-direct',
        'mara-own-story-back',
        'book',
      ].reduce(
        (progress, option) => selectOption(maraDecision, progress, option),
        restored!.dialogue,
      );
      expect(currentNode(maraDecision, book).text).toContain('Я досі не вручила Лео книжку');
      expect(availableOptions(maraDecision, book).map((option) => option.id)).toContain(
        bookFlag.slice('sold_'.length),
      );
    },
  );

  it('Mara can still plan the surprise when the book was never bought', () => {
    const state = play(
      maraDecision,
      ['saw_envelope'],
      ['greet', 'letter', 'privacy', 'privacy-back'],
    );
    const text = currentNode(maraDecision, state).text;
    expect(text).toContain('як зробити йому сюрприз');
    expect(text).not.toContain('вручити йому книжку');
  });

  it.each(['sold_station', 'sold_roads', 'sold_letters'] as const)(
    'Mara remembers the purchased %s gift after discussing her workday',
    (sale) => {
      const state: DialogueState = {
        ...startDialogue(maraDecision),
        node: 'greet',
        flags: [sale, 'mara_day_four_own_story_heard'],
      };
      const text = currentNode(maraDecision, state).text;
      expect(text).toContain('Книжку для Лео вже сховала');
      expect(text).toContain('коли її вручити');
      expect(text).not.toContain('як влаштувати Лео сюрприз');

      // The gift topic is gated on the rest conversation, not merely the sale.
      expect(availableOptions(maraDecision, state).map((option) => option.id)).not.toContain(
        'book',
      );
      const rested = { ...state, flags: [...state.flags, 'mara_day_four_rest_heard'] };
      expect(availableOptions(maraDecision, rested).map((option) => option.id)).toContain('book');
      expect(currentNode(maraDecision, rested).text).toBe(text);

      const restored = decodeSave(
        encodeSave({ stage: 'day4-mara', dialogue: rested, flags: rested.flags }),
      );
      expect(restored).not.toBeNull();
      expect(currentNode(maraDecision, restored!.dialogue).text).toBe(text);
    },
  );

  it('Mara can still plan an unpurchased gift after discussing her workday', () => {
    const state: DialogueState = {
      ...startDialogue(maraDecision),
      node: 'greet',
      flags: ['mara_day_four_own_story_heard'],
    };
    expect(currentNode(maraDecision, state).text).toContain('як влаштувати Лео сюрприз');
    expect(currentNode(maraDecision, state).text).not.toContain('Книжку для Лео вже сховала');
  });
});

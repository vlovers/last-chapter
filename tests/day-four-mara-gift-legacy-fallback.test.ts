import { describe, expect, it } from 'vitest';
import { maraDecision } from '../src/content/day-four-mara';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const path = [
  'greet',
  'mara-rest',
  'mara-rest-back',
  'mara-own-story-work',
  'mara-own-story-followup-direct',
  'mara-own-story-back',
  'book',
] as const;

function reachGiftTopic(flags: readonly string[] = []): DialogueState {
  let state: DialogueState = { ...startDialogue(maraDecision), flags: [...flags] };
  for (const optionId of path) state = selectOption(maraDecision, state, optionId);
  return state;
}

describe('day-four Mara gift continuity for complete and legacy saves', () => {
  it('does not invent a purchased or hidden book when a save lacks day-one sale flags', () => {
    const state = reachGiftTopic();
    expect(state.node).toBe('book');
    expect(currentNode(maraDecision, state).text).toContain(
      'З подарунком для Лео ще не визначилася',
    );
    expect(currentNode(maraDecision, state).text).not.toContain('Учора сховала її');
    expect(availableOptions(maraDecision, state).map((option) => option.id)).toEqual(['book-back']);
    const returned = selectOption(maraDecision, state, 'book-back');
    expect(returned.node).toBe('greet');
    expect(returned.flags).not.toContain('mara_gift_encouraged');
  });

  for (const [sale, option] of [
    ['sold_station', 'station'],
    ['sold_roads', 'roads'],
    ['sold_letters', 'letters'],
  ] as const) {
    it(`remembers the actual ${sale} purchase without introducing a second gift`, () => {
      const state = reachGiftTopic([sale]);
      expect(currentNode(maraDecision, state).text).toContain('Я досі не вручила Лео книжку');
      const options = availableOptions(maraDecision, state).map((entry) => entry.id);
      expect(options).toContain(option);
      expect(options).toContain('book-back');
      expect(options.length).toBeLessThanOrEqual(4);
      const chosen = selectOption(maraDecision, state, option);
      expect(chosen.node).toBe(option);
      expect(chosen.flags).toContain(sale);
    });
  }

  it('preserves the no-sale fallback through save and restore', () => {
    const state = reachGiftTopic();
    const restored = decodeSave(
      encodeSave({ stage: 'day4-mara', dialogue: state, flags: [...state.flags] }),
    );
    expect(restored).not.toBeNull();
    expect(currentNode(maraDecision, restored!.dialogue).text).toBe(
      currentNode(maraDecision, state).text,
    );
    expect(availableOptions(maraDecision, restored!.dialogue).map((option) => option.id)).toEqual([
      'book-back',
    ]);
  });

  it('keeps the gift branch and all return edges structurally valid', () => {
    expect(validateDialogue(maraDecision)).toEqual([]);
    const greeting = maraDecision.nodes.find((node) => node.id === 'greet');
    const gift = greeting?.options.find((option) => option.id === 'book');
    expect(gift?.requires).toContain('mara_day_four_rest_heard');
    expect(gift?.next).toBe('book');
    expect(maraDecision.nodes.find((node) => node.id === 'book')?.options.at(-1)?.id).toBe(
      'book-back',
    );
  });

  it('keeps Mara\'s return-visit wording truthful when no book was sold', () => {
    const returned = selectOption(maraDecision, reachGiftTopic(), 'book-back');
    const text = currentNode(maraDecision, returned).text;
    expect(text).toContain('як зробити Лео сюрприз');
    expect(text).not.toContain('коли вручити Лео книжку');
  });

  it('does not assume a purchased book after the letter-privacy conversation', () => {
    const returned = selectOption(
      maraDecision,
      reachGiftTopic(['mara_letter_privacy_respected']),
      'book-back',
    );
    const text = currentNode(maraDecision, returned).text;
    expect(text).toContain('як зробити йому сюрприз');
    expect(text).not.toContain('коли вручити йому книжку');
    expect(returned.flags).toContain('mara_letter_privacy_respected');
  });
});

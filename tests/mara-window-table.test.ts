import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { maraVisit } from '../src/content/mara';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

function play(
  story: DialogueStory,
  flags: readonly string[],
  route: readonly string[],
): DialogueState {
  let state: DialogueState = { ...startDialogue(story), flags };
  for (const id of route) {
    expect(
      availableOptions(story, state).map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(story, state, id);
  }
  return state;
}

const beginning = [
  'hello',
  'thank',
  'talk',
  'mara-own-morning',
  'mara-morning-question',
  'mara-dream-window-menu',
];

const returnToBook = [
  'mara-window-details-finish',
  'mara-window-finish-return',
  'mara-counter-care',
  'mara-choice-try',
  'mara-own-return',
];

const scenarios = [
  {
    choice: 'mara-window-credit',
    middle: ['mara-window-credit-boss', 'mara-window-boss-details'],
    flag: 'mara_window_credit_encouraged',
    dayFiveLine: 'спитала начальницю про табличку',
  },
  {
    choice: 'mara-window-bookshop',
    middle: ['mara-window-bookshop-details'],
    flag: 'mara_window_bookshop_suggested',
    dayFiveLine: 'маленьку партію після зміни',
  },
  {
    choice: 'mara-window-private',
    middle: ['mara-window-private-details'],
    flag: 'mara_window_private_suggested',
    dayFiveLine: 'не віддала рецепт для нової реклами',
  },
] as const;

describe('Mara: bakery authorship and her own plans', () => {
  it('has a valid conversation graph in both scenes', () => {
    expect(validateDialogue(maraVisit)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it('keeps the bakery conversation inside the existing morning topic', () => {
    const state = play(maraVisit, [], beginning);
    expect(state.node).toBe('mara-window-table');
    expect(currentNode(maraVisit, state).text).toContain('грушеві завитки');
    expect(availableOptions(maraVisit, state)).toHaveLength(3);
  });

  it.each(scenarios)(
    'remembers Mara decision from day one through day five: $choice',
    ({ choice, middle, flag, dayFiveLine }) => {
      const dayOne = play(maraVisit, [], [...beginning, choice, ...middle, ...returnToBook]);
      expect(dayOne.node).toBe('order');
      expect(dayOne.flags).toContain(flag);
      expect(dayOne.flags).toContain('mara_window_plan_discussed');
      expect(dayOne.flags).toContain('mara_own_morning_heard');

      const final = play(finalReading, dayOne.flags, [
        'open',
        'final-v3-mara-option',
        'final-mara-window-ask',
      ]);
      expect(final.node).toBe('final-mara-window');
      expect(currentNode(finalReading, final).text).toContain(dayFiveLine);

      const offered = play(finalReading, final.flags, [
        'open',
        'final-v3-mara-option',
        'final-mara-window-ask',
        'final-mara-window-offer',
        'final-mara-window-offer-back',
      ]);
      expect(offered.flags).toContain('final_mara_window_tasting_offered');
      expect(offered.flags).toContain('final_mara_window_done');
      expect(availableOptions(finalReading, offered).map((o) => o.id)).not.toContain(
        'final-mara-window-ask',
      );
      expect(seasonEnding({ flags: offered.flags }).epilogue).toContain('дегустації');
    },
  );

  it('does not expose the bakery follow-up when Mara never discussed the recipe', () => {
    const state = play(finalReading, ['mara_own_morning_heard'], ['open', 'final-v3-mara-option']);
    expect(availableOptions(finalReading, state).map((o) => o.id)).not.toContain(
      'final-mara-window-ask',
    );
  });

  it('does not turn an offered tasting into consent when Mara kept the recipe private', () => {
    const state = play(
      finalReading,
      ['mara_own_morning_heard', 'mara_window_plan_discussed', 'mara_window_private_suggested'],
      ['open', 'final-v3-mara-option', 'final-mara-window-ask', 'final-mara-window-offer'],
    );
    expect(currentNode(finalReading, state).text).toContain('Сьогодні хочу залишити його в себе');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('поки не погодилася');
  });

  it('lets the player respect Mara privacy and carries that choice to the epilogue', () => {
    const state = play(
      finalReading,
      ['mara_own_morning_heard', 'mara_window_plan_discussed', 'mara_window_private_suggested'],
      [
        'open',
        'final-v3-mara-option',
        'final-mara-window-ask',
        'final-mara-window-no-pressure',
        'final-mara-window-no-pressure-back',
        'final-v3-mara-back',
      ],
    );
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_mara_window_space_respected');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('Мариному записнику');
  });
});

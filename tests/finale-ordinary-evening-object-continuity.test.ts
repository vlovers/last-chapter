import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

const counterRoutes = [
  [
    ['counter-ruth', 'ruth-ask', 'ruth-ask-back'],
    ['counter-ruth', 'ruth-print', 'ruth-print-back'],
    ['counter-ruth', 'ruth-short', 'ruth-short-back'],
  ],
  [
    ['counter-sam', 'sam-dough', 'sam-dough-back'],
    ['counter-sam', 'sam-memoir', 'sam-memoir-back'],
    ['counter-sam', 'sam-ask-mara', 'sam-ask-back'],
  ],
  [
    ['counter-reed', 'reed-envelope', 'reed-envelope-back'],
    ['counter-reed', 'reed-book', 'reed-book-back'],
    ['counter-reed', 'reed-wait', 'reed-wait-back'],
  ],
] as const;

function enter(option: string): DialogueState {
  let state = selectOption(finalReading, startDialogue(finalReading), 'open');
  return selectOption(finalReading, state, option);
}

function play(state: DialogueState, route: readonly string[]): DialogueState {
  for (const choice of route) state = selectOption(finalReading, state, choice);
  return state;
}

describe('Final evening: objects and people remain consistent with played choices', () => {
  it('only describes the actual three objects after the canonical counter routes', () => {
    let state = enter('final-counter-encounters');
    for (const topic of counterRoutes) state = play(state, topic[0]);
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Рут сховала записку із запитаннями');
    expect(text).toContain('Сем забрав книжку про тісто');
    expect(text).toContain('запечатаний конверт пана Ріда лежить у шухляді знахідок');
    expect(text).not.toContain('закладка з рецептом');
    expect(text).not.toContain('картка пана Ріда');
    expect(state.flags).toEqual(
      expect.arrayContaining([
        'final_counter_ruth_preferences',
        'final_counter_sam_dough',
        'final_counter_reed_note',
      ]),
    );
  });

  it('does not show Sam still browsing after he finished any of his three routes', () => {
    for (const ruth of counterRoutes[0]) {
      for (const sam of counterRoutes[1]) {
        let state = play(enter('final-counter-encounters'), ruth);
        state = play(state, sam);
        const text = currentNode(finalReading, state).text;
        expect(text).toContain('Сем уже відійшов від кулінарної полиці');
        expect(text).toContain('Пан Рід терпляче чекає');
        expect(text).not.toContain('Сем усе ще роздивляється');
        const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
        expect(currentNode(finalReading, restored).text).toBe(text);
      }
    }
  });

  it('keeps the generic ending for the other 26 combinations, without inventing a recipe bookmark', () => {
    for (let ruth = 0; ruth < 3; ruth++) {
      for (let sam = 0; sam < 3; sam++) {
        for (let reed = 0; reed < 3; reed++) {
          if (ruth === 0 && sam === 0 && reed === 0) continue;
          let state = enter('final-counter-encounters');
          state = play(state, counterRoutes[0][ruth]!);
          state = play(state, counterRoutes[1][sam]!);
          state = play(state, counterRoutes[2][reed]!);
          const text = currentNode(finalReading, state).text;
          expect(text).toContain('На прилавку більше немає черги');
          expect(text).not.toContain('закладка з рецептом');
          expect(text).not.toContain('запечатаний конверт пана Ріда');
        }
      }
    }
  });

  it('describes the completed reader card as filled, not blank', () => {
    let state = enter('final-reader-debates');
    for (const route of [
      ['reader-romance', 'romance-two-books', 'romance-two-back'],
      ['reader-audio', 'audio-choices', 'audio-choices-back'],
      ['reader-villain', 'villain-no-spoilers', 'villain-spoilers-back'],
    ]) {
      state = play(state, route);
    }
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('картка з читацькими побажаннями');
    expect(text).not.toContain('чиста картка для читацьких побажань');
  });
});

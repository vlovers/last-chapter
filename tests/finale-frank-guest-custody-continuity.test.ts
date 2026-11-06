import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const visitors = {
  ruth: [
    ['ruth-ask', 'ruth-ask-back'],
    ['ruth-print', 'ruth-print-back'],
    ['ruth-short', 'ruth-short-back'],
  ],
  sam: [
    ['sam-dough', 'sam-dough-back'],
    ['sam-memoir', 'sam-memoir-back'],
    ['sam-ask-mara', 'sam-ask-back'],
  ],
  reed: [
    ['reed-envelope', 'reed-envelope-back'],
    ['reed-book', 'reed-book-back'],
    ['reed-wait', 'reed-wait-back'],
  ],
} as const;

const orders = [
  ['ruth', 'sam', 'reed'],
  ['ruth', 'reed', 'sam'],
  ['sam', 'ruth', 'reed'],
  ['sam', 'reed', 'ruth'],
  ['reed', 'ruth', 'sam'],
  ['reed', 'sam', 'ruth'],
] as const;

const custodyTexts = [
  'запечатаний конверт пана Ріда на місці',
  'записка так і залишилася між її сторінками',
  'вирішити пізніше, що робити із запискою',
] as const;

const combinations = visitors.ruth.flatMap((ruth) =>
  visitors.sam.flatMap((sam) =>
    visitors.reed.flatMap((reed, custody) =>
      orders.map((order) => ({
        ruth,
        sam,
        reed,
        custody,
        order,
        name: `${ruth[0]} / ${sam[0]} / ${reed[0]} / ${order.join('-')}`,
      })),
    ),
  ),
);

describe('Final evening: Frank guest dialogue respects counter custody and purchase choices', () => {
  it.each(combinations)('$name', ({ ruth, sam, reed, custody, order }) => {
    let state: DialogueState = startDialogue(finalReading);
    const chooseAndRestore = (id: string) => {
      state = selectOption(finalReading, state, id);
      const saved = decodeSave(
        encodeSave({
          stage: 'day5-reading',
          flags: [...state.flags],
          dialogue: state,
        }),
      );
      expect(saved, `Save failed after ${id}`).not.toBeNull();
      state = saved!.dialogue;
    };

    chooseAndRestore('open');
    chooseAndRestore('final-counter-encounters');
    const routes = { ruth, sam, reed };
    for (const visitor of order) {
      chooseAndRestore(`counter-${visitor}`);
      for (const choice of routes[visitor]) chooseAndRestore(choice);
    }
    chooseAndRestore('counter-close');
    chooseAndRestore('frank-shop-evening');
    chooseAndRestore('frank-shop-guests');

    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Рут і Сем уже закінчили розмови біля каси');
    expect(text).toContain(custodyTexts[custody]);
    for (const [index, phrase] of custodyTexts.entries()) {
      if (index !== custody) expect(text).not.toContain(phrase);
    }
    expect(text).not.toContain('Обидва запитали, чи можна погладити Френка');
    expect(text).not.toContain('залишивши старий томик або конверт');
  });

  it('does not invent a Reed outcome when only Ruth and Sam have spoken', () => {
    let state = startDialogue(finalReading);
    for (const id of [
      'open',
      'final-counter-encounters',
      'counter-ruth',
      'ruth-short',
      'ruth-short-back',
      'counter-sam',
      'sam-ask-mara',
      'sam-ask-back',
      'counter-close',
      'frank-shop-evening',
      'frank-shop-guests',
    ]) {
      state = selectOption(finalReading, state, id);
    }
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Рут і Сем уже закінчили розмови біля каси');
    for (const phrase of custodyTexts) expect(text).not.toContain(phrase);
  });

  it('does not select contradictory custody afterwords in a damaged save', () => {
    const state: DialogueState = {
      node: 'frank-shop-guests-scene',
      flags: ['final_counter_reed_done', 'final_counter_reed_note', 'final_counter_reed_book_kept'],
      history: [],
      completed: [],
      pending: [],
    };
    const text = currentNode(finalReading, state).text;
    for (const phrase of custodyTexts) expect(text).not.toContain(phrase);
  });
});

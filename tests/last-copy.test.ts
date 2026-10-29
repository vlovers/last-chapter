import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { lastCopyNodes } from '../src/content/last-copy';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

function atGathering(flags: string[] = []): DialogueState {
  return { ...startDialogue(finalReading), node: 'gathering', flags };
}

function play(route: readonly string[], flags: string[] = []): DialogueState {
  let state = atGathering(flags);
  for (const id of route) {
    expect(
      availableOptions(finalReading, state).map((option) => option.id),
      `Unavailable ${id} at ${state.node}`,
    ).toContain(id);
    state = JSON.parse(JSON.stringify(selectOption(finalReading, state, id))) as DialogueState;
  }
  return state;
}

describe('the last copy: a bookshop conflict with lasting costs', () => {
  it.each([
    [
      'honor the earlier reservation',
      ['last-copy-anna-when', 'last-copy-anna-time-back'],
      ['last-copy-miller-child', 'last-copy-miller-child-back'],
      'last-copy-honor',
      'last-copy-honor-return',
      'final_last_copy_anna_kept',
      'Анна отримала замовлену першою',
    ],
    [
      'ask both people before offering a delayed gift',
      ['last-copy-anna-share', 'last-copy-anna-loan-back'],
      ['last-copy-miller-back'],
      'last-copy-delay',
      'last-copy-delay-return',
      'final_last_copy_delayed_gift',
      'Подарунок запізнився',
    ],
    [
      'order a second copy without promising immediate delivery',
      ['last-copy-anna-back'],
      ['last-copy-miller-alternative', 'last-copy-miller-alternative-back'],
      'last-copy-order',
      'last-copy-order-return',
      'final_last_copy_second_ordered',
      'чесно назвала Міллер строк',
    ],
    [
      'break the reservation and lose Anna’s trust',
      ['last-copy-anna-back'],
      ['last-copy-miller-back'],
      'last-copy-break',
      'last-copy-break-return',
      'final_last_copy_promise_broken',
      'більше не покладалася',
    ],
  ])('%s', (_name, anna, miller, decision, finish, outcome, expectedEpilogue) => {
    const route = [
      'last-copy',
      'last-copy-ask-anna',
      ...anna,
      'last-copy-ask-miller',
      ...miller,
      'last-copy-choose',
      decision,
      finish,
    ];
    const state = play(route);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_last_copy_done');
    expect(state.flags).toContain(outcome);
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(expectedEpilogue);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'last-copy',
    );
    const outcomes = [
      'final_last_copy_anna_kept',
      'final_last_copy_delayed_gift',
      'final_last_copy_second_ordered',
      'final_last_copy_promise_broken',
    ];
    expect(outcomes.filter((flag) => state.flags.includes(flag))).toEqual([outcome]);
    expect(state.flags).not.toContain('final_ledger_iris_told');
    expect(state.flags).not.toContain('final_case_closure_complete');
  });

  it('cannot decide before hearing Anna and Miller', () => {
    let state = play(['last-copy']);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'last-copy-choose',
    );
    state = selectOption(finalReading, state, 'last-copy-ask-anna');
    state = selectOption(finalReading, state, 'last-copy-anna-back');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'last-copy-choose',
    );
  });

  it('cannot promise a loan Anna did not agree to', () => {
    const state = play([
      'last-copy',
      'last-copy-ask-anna',
      'last-copy-anna-back',
      'last-copy-ask-miller',
      'last-copy-miller-back',
      'last-copy-choose',
    ]);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'last-copy-delay',
    );
  });

  it('does not need any manuscript clues to play a separate everyday story', () => {
    const state = atGathering();
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain('last-copy');
  });

  it('lets Eleanor own the double booking and Frank find the dated slip', () => {
    const state = play([
      'last-copy',
      'last-copy-ask-eleanor',
      'last-copy-eleanor-frank',
      'last-copy-frank-back',
    ]);
    expect(state.flags).toContain('final_last_copy_order_confirmed');
    expect(state.flags).toContain('final_last_copy_eleanor_heard');
    expect(state.node).toBe('last-copy');
  });

  it('remembers an earlier children’s book club without inventing a manuscript clue', () => {
    const state = play(['last-copy'], ['final_anna_club_heard']);
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Анна вчора замовила');
    expect(text).not.toContain('рукопис');
    expect(text).not.toContain('коробк');
  });

  it('keeps every authored choice set at four buttons or fewer', () => {
    expect(lastCopyNodes.length).toBeGreaterThanOrEqual(14);
    for (const node of lastCopyNodes) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
      for (const option of node.options) {
        expect(
          finalReading.nodes.some((destination) => destination.id === option.next),
          `Missing destination for ${node.id}/${option.id}`,
        ).toBe(true);
      }
    }
  });
});

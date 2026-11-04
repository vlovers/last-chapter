import { describe, expect, it } from 'vitest';
import { leoDecision } from '../src/content/day-four-leo';
import { advanceToDayFourLeo, finishFourthDay, type ChapterState } from '../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 4: Leo and mutual consent', () => {
  it('validates the dialogue graph', () => expect(validateDialogue(leoDecision)).toEqual([]));
  it('gates old evidence and letter by actual discoveries', () => {
    const greet = selectOption(leoDecision, startDialogue(leoDecision), 'welcome');
    const options = availableOptions(leoDecision, greet).map((option) => option.id);
    expect(options).not.toContain('letter');
    expect(options).not.toContain('evidence');
    const informed = { ...greet, flags: ['saw_envelope', 'eleanor_confirmed_reservation'] };
    expect(availableOptions(leoDecision, informed).map((option) => option.id)).not.toContain(
      'evidence',
    );
    const checked = { ...informed, flags: [...informed.flags, 'eleanor_timeline_checked'] };
    const available = availableOptions(leoDecision, checked).map((option) => option.id);
    expect(available).toContain('letter');
    expect(available).toContain('evidence');
  });
  it('guards transitions and preserves letter decisions through a save', () => {
    const maraDone: ChapterState = {
      stage: 'day4-mara',
      dialogue: { ...startDialogue(leoDecision), node: 'end' },
      flags: ['saw_envelope', 'mara_letter_privacy_respected'],
    };
    let state = advanceToDayFourLeo(maraDone);
    expect(() => finishFourthDay(state)).toThrow();
    for (const id of ['welcome', 'letter', 'letter-ask', 'ask-back', 'finish']) {
      const next = selectOption(leoDecision, state.dialogue, id);
      state = { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
    }
    state = finishFourthDay(state);
    expect(state.stage).toBe('day4-complete');
    expect(state.flags).toContain('leo_open_to_conversation');
    expect(state.flags).toContain('mara_letter_privacy_respected');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('does not bypass Leo’s ticket conversation through the train anecdote', () => {
    const greet = selectOption(leoDecision, startDialogue(leoDecision), 'welcome');
    expect(availableOptions(leoDecision, greet).map((option) => option.id)).not.toContain('mara');
    const train = selectOption(leoDecision, greet, 'trains');
    expect(availableOptions(leoDecision, train).map((option) => option.id)).toEqual([
      'trains-continue',
    ]);
    const followup = selectOption(leoDecision, train, 'trains-continue');
    expect(followup.node).toBe('trains-followup');
    expect(currentNode(leoDecision, followup).text).toContain('Мара вибирає час');
    const returned = selectOption(leoDecision, followup, 'trains-followup-back');
    expect(returned.node).toBe('welcome');
    expect(returned.flags).not.toContain('leo_day_four_ticket_feeling_heard');
    expect(availableOptions(leoDecision, returned).map((option) => option.id)).not.toContain(
      'mara',
    );
    const feeling = selectOption(leoDecision, returned, 'leo-ticket-feeling');
    const ticket = selectOption(leoDecision, feeling, 'leo-ticket-feeling-back');
    expect(ticket.flags).toContain('leo_day_four_ticket_feeling_heard');
    const answer = selectOption(leoDecision, ticket, 'leo-future-honest');
    const follow = selectOption(leoDecision, answer, 'leo-future-followup-direct');
    const hub = selectOption(leoDecision, follow, 'leo-future-back');
    expect(availableOptions(leoDecision, hub).map((option) => option.id)).toContain('mara');
    // Keep the original trains-back edge for old saves that already reached Mara.
    const oldEdge = leoDecision.nodes
      .find((node) => node.id === 'trains')
      ?.options.find((option) => option.id === 'trains-back');
    expect(oldEdge?.next).toBe('mara');
    expect(oldEdge?.requires).toEqual(['leo_day_four_ticket_feeling_heard']);
    const informedTrain = { ...train, flags: ['leo_day_four_ticket_feeling_heard'] };
    expect(availableOptions(leoDecision, informedTrain).map((option) => option.id)).toEqual([
      'trains-back',
    ]);
    expect(selectOption(leoDecision, informedTrain, 'trains-back').node).toBe('mara');
  });
});

import { describe, expect, it } from 'vitest';
import { irisVisit } from '../src/content/iris';
import { irisDecision } from '../src/content/day-four-iris';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueStory,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const choices = [
  ['iris-cover-accept', 'iris-cover-accept-back', 'iris_cover_revisions_chosen', 'веселку'],
  [
    'iris-cover-negotiate',
    'iris-cover-negotiate-back',
    'iris_cover_negotiation_chosen',
    'два ескізи',
  ],
  ['iris-cover-decline', 'iris-cover-decline-back', 'iris_cover_independent_chosen', 'відмовилася'],
] as const;

function from(story: DialogueStory, node: string, flags: string[] = []): DialogueState {
  return { ...startDialogue(story), node, flags };
}

describe('Iris independent illustration commission', () => {
  it.each(choices)('records the day-two commission decision %s', (choice, back, flag) => {
    const welcome = from(irisVisit, 'welcome');
    expect(availableOptions(irisVisit, welcome).map((o) => o.id)).toContain(
      'iris-cover-commission-topic',
    );
    const intro = selectOption(irisVisit, welcome, 'iris-cover-commission-topic');
    const story = selectOption(irisVisit, intro, 'iris-cover-ask-story');
    const decision = selectOption(irisVisit, story, 'iris-cover-story-continue');
    const chosen = selectOption(irisVisit, decision, choice);
    expect(chosen.flags).toContain(flag);
    const returned = selectOption(irisVisit, chosen, back);
    expect(returned.node).toBe('welcome');
    expect(returned.flags).toContain('iris_cover_commission_discussed');
    expect(availableOptions(irisVisit, returned).map((o) => o.id)).not.toContain(
      'iris-cover-commission-topic',
    );
  });

  it.each(choices)(
    'carries the work choice into day four: %s',
    (_choice, _back, flag, expected) => {
      const welcome = from(irisDecision, 'welcome', ['iris_cover_commission_discussed', flag]);
      expect(availableOptions(irisDecision, welcome).map((o) => o.id)).toContain(
        'iris-cover-day-four-topic',
      );
      const followup = selectOption(irisDecision, welcome, 'iris-cover-day-four-topic');
      expect(currentNode(irisDecision, followup).text).toContain(expected);
      const work = selectOption(irisDecision, followup, 'iris-cover-four-ask-work');
      const returned = selectOption(irisDecision, work, 'iris-cover-four-work-back');
      expect(returned.node).toBe('welcome');
      expect(returned.flags).toContain('iris_cover_day_four_followup');
      expect(availableOptions(irisDecision, returned).map((o) => o.id)).not.toContain(
        'iris-cover-day-four-topic',
      );
    },
  );

  it.each(choices)('preserves the work choice through day five: %s', (_choice, _back, flag) => {
    const gathering = from(finalReading, 'gathering', [
      'iris_cover_commission_discussed',
      'iris_cover_day_four_followup',
      flag,
    ]);
    expect(availableOptions(finalReading, gathering).map((o) => o.id)).toContain(
      'final-iris-cover-topic',
    );
    const callback = selectOption(finalReading, gathering, 'final-iris-cover-topic');
    const offer = selectOption(finalReading, callback, 'final-iris-cover-offer-shelf');
    expect(offer.flags).toContain('final_iris_cover_portfolio_offered');
    const returned = selectOption(finalReading, offer, 'final-iris-cover-shelf-back');
    expect(returned.node).toBe('gathering');
    expect(returned.flags).toContain('final_iris_cover_done');
    expect(availableOptions(finalReading, returned).map((o) => o.id)).not.toContain(
      'final-iris-cover-topic',
    );
    expect(seasonEnding({ flags: returned.flags }).epilogue).toContain('Айріс');
  });

  it('does not expose the final callback before the day-four follow-up', () => {
    const state = from(finalReading, 'gathering', ['iris_cover_commission_discussed']);
    expect(availableOptions(finalReading, state).map((o) => o.id)).not.toContain(
      'final-iris-cover-topic',
    );
  });

  it('respects an independent zine without claiming the shop may sell it', () => {
    const state = from(finalReading, 'gathering', [
      'iris_cover_commission_discussed',
      'iris_cover_day_four_followup',
      'iris_cover_independent_chosen',
    ]);
    const callback = selectOption(finalReading, state, 'final-iris-cover-topic');
    const shelf = selectOption(finalReading, callback, 'final-iris-cover-offer-shelf');
    expect(currentNode(finalReading, shelf).text).toContain('без цінника');
    const end = selectOption(finalReading, shelf, 'final-iris-cover-shelf-back');
    const epilogue = seasonEnding({ flags: end.flags }).epilogue;
    expect(epilogue).toContain('лиса');
    expect(epilogue).not.toContain('продала');
  });

  it('offers a no-pressure ending that remains private', () => {
    const callback = selectOption(
      finalReading,
      from(finalReading, 'gathering', [
        'iris_cover_day_four_followup',
        'iris_cover_negotiation_chosen',
      ]),
      'final-iris-cover-topic',
    );
    const end = selectOption(finalReading, callback, 'final-iris-cover-leave');
    expect(end.flags).toContain('final_iris_cover_space_respected');
    expect(end.flags).not.toContain('final_iris_cover_portfolio_offered');
    expect(seasonEnding({ flags: end.flags }).epilogue).toContain('рукописів');
  });

  it('keeps all three dialogue graphs structurally valid', () => {
    for (const story of [irisVisit, irisDecision, finalReading]) {
      expect(validateDialogue(story)).toEqual([]);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { eleanorVisit } from '../src/content/eleanor';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

const arcs = [
  ['leo', leoVisit, 'leo_reflected_on_uncertainty', 'greet'],
  ['iris', irisVisit, 'iris_reflected_on_identity', 'welcome'],
  ['anna', annaVisit, 'anna_reflected_on_care', 'hello'],
  ['thomas', thomasVisit, 'thomas_reflected_on_responsibility', 'greet'],
  ['nora', noraVisit, 'nora_reflected_on_uncertainty', 'hello'],
  ['eleanor', eleanorVisit, 'eleanor_reflected_on_legacy', 'greet'],
] as const;

describe('Optional character reflection arcs', () => {
  it.each(arcs)(
    '%s supports a deep and a short reflection without trapping the player',
    (prefix, story, flag, introduction) => {
      expect(validateDialogue(story)).toEqual([]);
      for (const deep of [false, true]) {
        let state = startDialogue(story);
        expect(
          availableOptions(story, state).some((option) => option.id === `${prefix}-reflection`),
        ).toBe(false);
        state = selectOption(story, state, introduction);
        const option = availableOptions(story, state).find(
          (item) => item.id === `${prefix}-reflection`,
        );
        expect(option).toBeDefined();
        state = selectOption(story, state, `${prefix}-reflection`);
        if (deep) {
          state = selectOption(story, state, `${prefix}-reflect-question`);
          state = selectOption(story, state, `${prefix}-reflect-continue`);
          const decisions = {
            leo: ['leo-platform-ask', 'leo-asking-continue', 'leo-boundary-try'],
            iris: ['iris-memory-art', 'iris-art-continue'],
            anna: ['anna-classroom-apologize', 'anna-apology-back'],
            thomas: ['thomas-workshop-ask', 'thomas-ask-back'],
            nora: ['nora-record-uncertain', 'nora-uncertain-back'],
            eleanor: ['eleanor-key-memory', 'eleanor-memory-back'],
          } as const;
          for (const choice of decisions[prefix]) state = selectOption(story, state, choice);
        } else {
          state = selectOption(story, state, `${prefix}-reflect-return`);
        }
        state = selectOption(story, state, `${prefix}-reflect-finish`);
        expect(state.node).toBe(introduction);
        expect(state.flags).toContain(flag);
        expect(
          availableOptions(story, state).some((option) => option.id === `${prefix}-reflection`),
        ).toBe(false);
      }
    },
  );
  it.each([
    [
      'iris',
      irisVisit,
      'welcome',
      'iris-memory-private',
      'iris-private-continue',
      'iris_chose_private_art',
    ],
    [
      'anna',
      annaVisit,
      'hello',
      'anna-classroom-discuss',
      'anna-discussion-back',
      'anna_will_invite_disagreement',
    ],
    [
      'thomas',
      thomasVisit,
      'greet',
      'thomas-workshop-fear',
      'thomas-fear-back',
      'thomas_admitted_fear_of_rejection',
    ],
    [
      'nora',
      noraVisit,
      'hello',
      'nora-record-consent',
      'nora-consent-back',
      'nora_will_seek_consent',
    ],
    [
      'eleanor',
      eleanorVisit,
      'greet',
      'eleanor-key-change',
      'eleanor-change-back',
      'eleanor_will_allow_change',
    ],
  ] as const)(
    '%s has a playable alternate decision',
    (prefix, story, introduction, choice, back, flag) => {
      let state = startDialogue(story);
      for (const option of [
        introduction,
        `${prefix}-reflection`,
        `${prefix}-reflect-question`,
        `${prefix}-reflect-continue`,
        choice,
        back,
        `${prefix}-reflect-finish`,
      ]) {
        state = selectOption(story, state, option);
      }
      expect(state.node).toBe(introduction);
      expect(state.flags).toContain(flag);
    },
  );
  it.each([
    ['leo', leoVisit, 'greet', 'leo-platform-silence', 'leo-silence-continue', 'leo-boundary-wait', 'leo_accepted_silence'],
    ['iris', irisVisit, 'welcome', 'iris-memory-private', 'iris-private-continue', '', 'iris_chose_private_art'],
    ['anna', annaVisit, 'hello', 'anna-classroom-discuss', 'anna-discussion-back', '', 'anna_will_invite_disagreement'],
    ['thomas', thomasVisit, 'greet', 'thomas-workshop-fear', 'thomas-fear-back', '', 'thomas_admitted_fear_of_rejection'],
    ['nora', noraVisit, 'hello', 'nora-record-consent', 'nora-consent-back', '', 'nora_will_seek_consent'],
    ['eleanor', eleanorVisit, 'greet', 'eleanor-key-change', 'eleanor-change-back', '', 'eleanor_will_allow_change'],
  ] as const)('%s alternate branch returns safely and records its choice', (prefix, story, intro, decision, followup, extra, flag) => {
    let state = startDialogue(story);
    const choices = [intro, `${prefix}-reflection`, `${prefix}-reflect-question`, `${prefix}-reflect-continue`, decision, followup];
    if (extra) choices.push(extra);
    choices.push(`${prefix}-reflect-finish`);
    for (const option of choices) state = selectOption(story, state, option);
    expect(state.node).toBe(intro);
    expect(state.flags).toContain(flag);
    expect(availableOptions(story, state).some((option) => option.id === `${prefix}-reflection`)).toBe(false);
  });

});

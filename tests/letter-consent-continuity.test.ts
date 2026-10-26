import { describe, expect, it } from 'vitest';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';
import { irisDecision } from '../src/content/day-four-iris';
import { leoDecision } from '../src/content/day-four-leo';
import { finalReading } from '../src/content/day-five';

function play(story: DialogueStory, path: readonly string[], flags: readonly string[] = []) {
  let state: DialogueState = { ...startDialogue(story), flags };
  for (const option of path) state = selectOption(story, state, option);
  return state;
}

function choices(story: DialogueStory, state: DialogueState) {
  return availableOptions(story, state).map((option) => option.id);
}

describe('Private letter: consent and trust across days four and five', () => {
  it('does not expose the letter conversation before finding the envelope', () => {
    expect(choices(irisDecision, play(irisDecision, ['welcome']))).not.toContain('letter');
    expect(choices(leoDecision, play(leoDecision, ['welcome']))).not.toContain('letter');
  });

  it('distinguishes an offer from permission to deliver', () => {
    const iris = play(
      irisDecision,
      ['welcome', 'letter', 'offer', 'offer-back', 'leave'],
      ['saw_envelope'],
    );
    expect(iris.flags).toContain('iris_letter_delivery_offered');
    expect(iris.flags).toContain('iris_letter_choice_respected');
    expect(iris.flags).not.toContain('iris_letter_delivery_consented');
    expect(iris.flags).not.toContain('final_mutual_conversation');
  });

  it('records a privacy breach without silently erasing it after respecting Iris', () => {
    const iris = play(
      irisDecision,
      ['welcome', 'letter', 'admit-opened', 'breach-back', 'letter', 'respect-opened', 'respect-back', 'leave'],
      ['saw_envelope', 'opened_private_letter'],
    );
    expect(iris.flags).toContain('opened_private_letter');
    expect(iris.flags).toContain('iris_letter_breach_admitted');
    expect(iris.flags).toContain('iris_letter_choice_respected');
    expect(iris.flags).not.toContain('iris_letter_delivery_consented');
  });

  it('Leo can ask for a conversation but cannot authorize Iris letter delivery', () => {
    const leo = play(
      leoDecision,
      ['welcome', 'letter', 'letter-ask', 'ask-back', 'finish'],
      ['saw_envelope'],
    );
    expect(leo.flags).toContain('leo_open_to_conversation');
    expect(leo.flags).not.toContain('iris_letter_delivery_consented');
  });

  it.each([
    ['no permissions', ['saw_envelope'], false],
    ['only Iris respected', ['saw_envelope', 'iris_letter_choice_respected'], false],
    ['only Leo open', ['saw_envelope', 'leo_open_to_conversation'], false],
    ['both ready', ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'], true],
  ] as const)('%s: private conversation requires both routes', (_name, flags, allowed) => {
    const state = play(finalReading, ['open', 'letter'], flags);
    expect(choices(finalReading, state).includes('mutual')).toBe(allowed);
    expect(choices(finalReading, state)).toContain('wait');
  });

  it('does not unlock the mutual ending by apologizing after reading the letter', () => {
    const state = play(
      finalReading,
      ['open', 'letter'],
      [
        'saw_envelope',
        'opened_private_letter',
        'iris_letter_breach_admitted',
        'iris_letter_choice_respected',
        'leo_open_to_conversation',
      ],
    );
    expect(choices(finalReading, state)).not.toContain('mutual');
    expect(choices(finalReading, state)).toContain('repair-trust');
    expect(choices(finalReading, state)).toContain('wait');
  });

  it('does not automatically deliver the private letter when a conversation happens', () => {
    const state = play(
      finalReading,
      ['open', 'letter', 'mutual', 'mutual-back'],
      ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'],
    );
    expect(state.flags).toContain('final_mutual_conversation');
    expect(state.flags).not.toContain('iris_letter_delivery_consented');
    expect(choices(finalReading, state)).toContain('close');
  });

  it('allows a privacy breach to be acknowledged without forced forgiveness', () => {
    const state = play(
      finalReading,
      ['open', 'letter', 'repair-trust', 'repair-trust-back'],
      ['saw_envelope', 'opened_private_letter', 'iris_letter_breach_admitted'],
    );
    expect(state.flags).toContain('final_accepted_consequences');
    expect(state.flags).not.toContain('final_mutual_conversation');
    expect(choices(finalReading, state)).toContain('close');
  });

  it('allows leaving the letter private without resolving the relationship', () => {
    const state = play(finalReading, ['open', 'letter', 'wait', 'wait-back'], ['saw_envelope']);
    expect(state.flags).toContain('final_letter_kept_private');
    expect(state.flags).not.toContain('final_mutual_conversation');
    expect(choices(finalReading, state)).toContain('close');
  });

  it('narrates an admitted opened letter even when Leo and Mara have their own callback', () => {
    const state = play(
      finalReading,
      ['open', 'letter'],
      [
        'saw_envelope',
        'opened_private_letter',
        'iris_letter_breach_admitted',
        'leo_day_four_chose_honesty',
        'mara_day_four_named_own_needs',
      ],
    );
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('порушену печатку');
    expect(text).toContain('Айріс знає');
    expect(text).not.toContain('непорушен');
  });

  it('does not invent an unopened envelope after a concealed breach', () => {
    const state = play(
      finalReading,
      ['open', 'letter'],
      ['saw_envelope', 'opened_private_letter', 'leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'],
    );
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Печатка');
    expect(text).toContain('порушена');
    expect(text).not.toContain('досі запечатаний');
  });

  it('keeps an untouched envelope private even when Leo and Mara discuss the future', () => {
    const state = play(
      finalReading,
      ['open', 'letter'],
      ['saw_envelope', 'leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'],
    );
    const text = currentNode(finalReading, state).text;
    expect(text).toContain('Старий конверт');
    expect(text).not.toContain('порушену печатку');
  });

  it('allows a late confession on day five without inventing forgiveness', () => {
    const state = play(
      finalReading,
      ['open', 'letter', 'admit-breach-now', 'admit-breach-now-back'],
      ['saw_envelope', 'opened_private_letter'],
    );
    expect(state.flags).toContain('final_letter_breach_disclosed');
    expect(state.flags).toContain('final_accepted_consequences');
    expect(state.flags).not.toContain('final_mutual_conversation');
    expect(choices(finalReading, state)).toContain('close');
    const ending = selectOption(finalReading, state, 'close');
    expect(currentNode(finalReading, ending).text).toContain('Вона почула правду');
    expect(currentNode(finalReading, ending).text).toContain('Френк');
  });

  it('does not offer the same late confession after Iris already heard it', () => {
    const state = play(
      finalReading,
      ['open', 'letter'],
      ['saw_envelope', 'opened_private_letter', 'iris_letter_breach_admitted'],
    );
    expect(choices(finalReading, state)).not.toContain('admit-breach-now');
    expect(choices(finalReading, state)).toContain('repair-trust');
  });

  it('keeps both day-four dialogue graphs valid', () => {
    expect(validateDialogue(irisDecision)).toEqual([]);
    expect(validateDialogue(leoDecision)).toEqual([]);
    expect(currentNode(irisDecision, startDialogue(irisDecision)).id).toBe('arrival');
  });
});

import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { maraDecision } from '../src/content/day-four-mara';
import { thomasVisit } from '../src/content/thomas';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const giftPath = [
  'greet',
  'mara-rest',
  'mara-rest-back',
  'mara-own-story-work',
  'mara-own-story-followup-direct',
  'mara-own-story-back',
  'book',
] as const;

function giftWith(flags: string[]) {
  let state = { ...startDialogue(maraDecision), flags };
  for (const option of giftPath) state = selectOption(maraDecision, state, option);
  return state;
}

describe('narrative continuity integration: purchased and legacy gifts', () => {
  it('does not claim a purchased gift in a legacy save with no sale flag', () => {
    const state = giftWith([]);
    expect(currentNode(maraDecision, state).text).toContain('ще не визначилася');
    expect(currentNode(maraDecision, state).text).not.toContain('вже вибрала');
    expect(availableOptions(maraDecision, state).map(({ id }) => id)).toEqual(['book-back']);
    const saved = decodeSave(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    expect(saved).not.toBeNull();
    expect(currentNode(maraDecision, saved!.dialogue).text).toBe(currentNode(maraDecision, state).text);
  });

  it.each([
    ['sold_station', 'station', 'книжку про станцію'],
    ['sold_roads', 'roads', 'книжку про дорогу'],
    ['sold_letters', 'letters', 'книжку з листами'],
  ])('preserves the specific purchased gift %s', (sale, option, description) => {
    const state = giftWith([sale]);
    expect(currentNode(maraDecision, state).text).toContain('Я досі не вручила Лео');
    expect(currentNode(maraDecision, state).text).toContain(description);
    expect(availableOptions(maraDecision, state).map(({ id }) => id)).toContain(option);
    const chosen = selectOption(maraDecision, state, option);
    expect(chosen.flags).toContain(sale);
  });

  it('keeps a privacy-respected legacy save free of an invented gift', () => {
    const state = giftWith(['mara_letter_privacy_respected']);
    const back = selectOption(maraDecision, state, 'book-back');
    expect(currentNode(maraDecision, back).text).toContain('як зробити йому сюрприз');
    expect(back.flags).not.toContain('mara_gift_encouraged');
  });
});

describe('narrative continuity integration: Anna and Thomas', () => {
  it.each([
    ['thomas_chairs_owned_mistake', 'Він подзвонив мені'],
    ['thomas_chairs_avoided_conversation', 'Він приніс нові стільці'],
  ])('preserves the consequence of %s', (flag, expected) => {
    let state = { ...startDialogue(annaVisit), flags: ['thomas_chairs_discussed', flag] };
    state = selectOption(annaVisit, state, 'hello');
    state = selectOption(annaVisit, state, 'anna-thomas-chairs-followup');
    expect(currentNode(annaVisit, state).text).toContain(expected);
  });

  it('anchors Thomas missed promise to the day-three school reading', () => {
    let state = startDialogue(thomasVisit);
    state = selectOption(thomasVisit, state, 'greet');
    state = selectOption(thomasVisit, state, 'thomas-chairs');
    expect(currentNode(thomasVisit, state).text).toContain('сьогоднішнім читанням');
  });
});

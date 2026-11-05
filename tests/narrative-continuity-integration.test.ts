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

describe('narrative continuity integration: remembered greeting', () => {
  it('keeps the door-wedge callback exclusive to the chosen joke, including after save/restore', () => {
    const arrival = startDialogue(maraDecision);
    expect(currentNode(maraDecision, arrival).text).not.toContain('дерев’яний клинець');

    const joked = { ...arrival, flags: ['mara_door_joke_shared'] };
    expect(currentNode(maraDecision, joked).text).toContain('дерев’яний клинець');
    const saved = decodeSave(encodeSave({ stage: 'day4-mara', dialogue: joked, flags: joked.flags }));
    expect(saved).not.toBeNull();
    expect(currentNode(maraDecision, saved!.dialogue).text).toContain('дерев’яний клинець');

    const thanked = { ...arrival, flags: ['mara_buns_thanked'] };
    expect(currentNode(maraDecision, thanked).text).not.toContain('дерев’яний клинець');
  });

  it('does not grant a gift-encouragement flag merely by opening the book topic', () => {
    for (const sale of ['sold_station', 'sold_roads', 'sold_letters']) {
      const state = giftWith([sale]);
      expect(state.flags).not.toContain('mara_gift_encouraged');
      const returned = selectOption(maraDecision, state, 'book-back');
      expect(returned.flags).not.toContain('mara_gift_encouraged');
    }
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

  it.each([
    ['anna-chairs-defend', 'anna_chairs_player_defended_thomas'],
    ['anna-chairs-listen', 'anna_chairs_player_heard_anna'],
    ['anna-chairs-change-topic', 'anna_chairs_player_changed_topic'],
  ])('preserves player stance %s without consuming other branches', (option, flag) => {
    let state = { ...startDialogue(annaVisit), flags: ['thomas_chairs_discussed'] };
    state = selectOption(annaVisit, state, 'hello');
    state = selectOption(annaVisit, state, 'anna-thomas-chairs-followup');
    state = selectOption(annaVisit, state, option);
    expect(state.flags).toContain(flag);
    const returned = selectOption(annaVisit, state, 'anna-chairs-back');
    expect(returned.flags).toContain('anna_thomas_chairs_followup_discussed');
    expect(availableOptions(annaVisit, returned).map(({ id }) => id)).not.toContain(
      'anna-thomas-chairs-followup',
    );
  });

  it('anchors Thomas missed promise to the day-three school reading', () => {
    let state = startDialogue(thomasVisit);
    state = selectOption(thomasVisit, state, 'greet');
    state = selectOption(thomasVisit, state, 'thomas-chairs');
    expect(currentNode(thomasVisit, state).text).toContain('сьогоднішнім читанням');
  });
});

import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { maraVisit } from '../src/content/mara';
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

describe('narrative continuity integration: day-one and day-two chronology', () => {
  it('describes tomorrow’s school reading on day two', () => {
    const state = selectOption(annaVisit, startDialogue(annaVisit), 'hello');
    expect(currentNode(annaVisit, state).text).toContain('завтра читання');
  });

  it('answers Mara’s thanked-buns greeting with cinnamon, not the door-wedge promise', () => {
    let state = selectOption(maraVisit, startDialogue(maraVisit), 'hello');
    state = selectOption(maraVisit, state, 'thank');
    expect(currentNode(maraVisit, state).text).toContain('із корицею');
    expect(currentNode(maraVisit, state).text).not.toContain('Завтра принесу клинець');
    expect(state.flags).toContain('mara_buns_thanked');
    expect(state.flags).not.toContain('mara_door_joke_shared');
  });

  it('answers Mara’s door joke with the wedge promise, not the buns-thanks callback', () => {
    let state = selectOption(maraVisit, startDialogue(maraVisit), 'hello');
    state = selectOption(maraVisit, state, 'joke');
    expect(currentNode(maraVisit, state).text).toContain('Завтра принесу клинець');
    expect(currentNode(maraVisit, state).text).not.toContain('із корицею');
    expect(state.flags).toContain('mara_door_joke_shared');
    expect(state.flags).not.toContain('mara_buns_thanked');
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

describe('narrative continuity integration: save boundary', () => {
  it('rejects a save that invents a pending topic without a completion ledger', () => {
    const state = giftWith([]);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    delete raw.completed;
    raw.pending = [{ hub: 'greet', key: 'invented' }];
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('rejects a save with the same topic simultaneously completed and pending', () => {
    const state = giftWith([]);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    raw.completed = ['["greet","book",[]]'];
    raw.pending = [{ hub: 'greet', key: '["greet","book",[]]' }];
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('rejects unknown completed options that could hide unrelated topics', () => {
    const state = giftWith([]);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    raw.completed = ['["greet","not-a-real-option",[]]'];
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('rejects pending entries whose hub differs from their completion key', () => {
    const state = giftWith([]);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    raw.pending = [{ hub: 'book', key: '["greet","book",[]]' }];
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('rejects completion keys with forged reopen conditions', () => {
    const state = giftWith([]);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    raw.completed = ['["greet","book",["invented_flag"]]'];
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('rejects duplicate world flags instead of changing dialogue branch priority', () => {
    const state = giftWith(['sold_station']);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    raw.flags.push('sold_station');
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('rejects a completion key that claims an unsupported reopening flag', () => {
    const state = giftWith([]);
    const raw = JSON.parse(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    raw.completed = [JSON.stringify(['greet', 'book', ['invented_reopening_flag']])];
    raw.pending = [];
    expect(decodeSave(JSON.stringify(raw))).toBeNull();
  });

  it('accepts the canonical completion ledger generated by actual choices', () => {
    const state = giftWith(['sold_station']);
    expect(state.completed?.length).toBeGreaterThan(0);
    const restored = decodeSave(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    expect(restored).not.toBeNull();
    expect(restored!.dialogue.completed).toEqual(state.completed);
    expect(restored!.dialogue.pending).toEqual(state.pending);
  });

  it('preserves an unchanged active scene and options through save/restore', () => {
    const state = giftWith(['sold_roads']);
    const saved = decodeSave(encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags }));
    expect(saved).not.toBeNull();
    expect(saved!.stage).toBe('day4-mara');
    expect(saved!.dialogue.node).toBe(state.node);
    expect(currentNode(maraDecision, saved!.dialogue).text).toBe(
      currentNode(maraDecision, state).text,
    );
    expect(availableOptions(maraDecision, saved!.dialogue).map(({ id }) => id)).toEqual(
      availableOptions(maraDecision, state).map(({ id }) => id),
    );
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

  it.each([
    ['anna_chairs_player_defended_thomas', 'Ти мене захищав?'],
    ['anna_chairs_player_heard_anna', 'Ти її вислухав?'],
    ['anna_chairs_player_changed_topic', 'Ви говорили про читання?'],
  ])('Thomas remembers Anna conversation stance %s after save/restore', (flag, expected) => {
    let state = {
      ...startDialogue(thomasVisit),
      flags: ['anna_thomas_chairs_followup_discussed', flag],
    };
    state = selectOption(thomasVisit, state, 'greet');
    state = selectOption(thomasVisit, state, 'thomas-anna-chairs-reaction');
    expect(currentNode(thomasVisit, state).text).toContain(expected);
    const saved = decodeSave(encodeSave({ stage: 'thomas', dialogue: state, flags: state.flags }));
    expect(saved).not.toBeNull();
    expect(currentNode(thomasVisit, saved!.dialogue).text).toContain(expected);
    state = selectOption(thomasVisit, saved!.dialogue, 'thomas-anna-chairs-direct');
    expect(state.flags).toContain('thomas_anna_chairs_direct_talk');
    state = selectOption(thomasVisit, state, 'thomas-anna-chairs-back');
    expect(state.flags).toContain('thomas_anna_chairs_reaction_discussed');
    expect(availableOptions(thomasVisit, state).map(({ id }) => id)).not.toContain(
      'thomas-anna-chairs-reaction',
    );
  });

  it('does not expose the Thomas follow-up before Anna was consulted', () => {
    let state = startDialogue(thomasVisit);
    state = selectOption(thomasVisit, state, 'greet');
    expect(availableOptions(thomasVisit, state).map(({ id }) => id)).not.toContain(
      'thomas-anna-chairs-reaction',
    );
  });

  it('anchors Thomas missed promise to the day-three school reading', () => {
    let state = startDialogue(thomasVisit);
    state = selectOption(thomasVisit, state, 'greet');
    state = selectOption(thomasVisit, state, 'thomas-chairs');
    expect(currentNode(thomasVisit, state).text).toContain('сьогоднішнім читанням');
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const routes = [
  ['frank-shop-bookmark', 'frank-shop-bookmark-spare', 'frank-shop-bookmark-spare-back', 'final_frank_shop_spare_bookmark', 'чисту закладку'],
  ['frank-shop-bookmark', 'frank-shop-bookmark-wait', 'frank-shop-bookmark-wait-back', 'final_frank_shop_waited_for_cat', 'доки Френк прокинеться'],
  ['frank-shop-bookmark', 'frank-shop-bookmark-laugh', 'frank-shop-bookmark-laugh-back', 'final_frank_shop_anna_laughed', 'директора з питань дрімоти'],
  ['frank-shop-rest', 'frank-shop-rest-box', 'frank-shop-rest-box-back', 'final_frank_shop_box_offered', 'коробку з чистим рушником'],
  ['frank-shop-rest', 'frank-shop-rest-cups', 'frank-shop-rest-cups-back', 'final_frank_shop_quiet_corner', 'прибрали чашки'],
  ['frank-shop-rest', 'frank-shop-rest-alone', 'frank-shop-rest-alone-back', 'final_frank_shop_rest_left', 'сам обрав місце'],
  ['frank-shop-guests', 'frank-shop-guests-sign', 'frank-shop-guests-sign-back', 'final_frank_shop_sign_drafted', 'не годувати й не будити'],
  ['frank-shop-guests', 'frank-shop-guests-anna', 'frank-shop-guests-anna-back', 'final_frank_shop_visitor_note', 'ще один малюнок Френка'],
  ['frank-shop-guests', 'frank-shop-guests-no-promise', 'frank-shop-guests-no-promise-back', 'final_frank_shop_no_promise', 'не став частиною програми'],
] as const;

function atGathering() {
  return selectOption(finalReading, startDialogue(finalReading), 'open');
}

describe('Frank shop evening', () => {
  it('is optional and never blocks the direct finale', () => {
    expect(selectOption(finalReading, atGathering(), 'close').node).toBe('end');
  });

  it.each(routes)('route %s / %s records only its earned consequence', (topic, choice, back, flag, fragment) => {
    let state = selectOption(finalReading, atGathering(), 'frank-shop-evening');
    for (const id of [topic, choice, back, 'frank-shop-leave']) {
      state = selectOption(finalReading, state, id);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(flag);
    expect(state.flags).toContain('final_frank_shop_evening_done');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain('frank-shop-evening');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(fragment);
    expect(seasonEnding({ flags: [] }).epilogue).not.toContain(fragment);
  });

  it('restores mid-visit progress without repeating a completed scene', () => {
    let state = selectOption(finalReading, atGathering(), 'frank-shop-evening');
    for (const id of ['frank-shop-rest', 'frank-shop-rest-box', 'frank-shop-rest-box-back']) {
      state = selectOption(finalReading, state, id);
    }
    const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
    expect(availableOptions(finalReading, restored).map((option) => option.id)).not.toContain('frank-shop-rest');
    expect(availableOptions(finalReading, restored).map((option) => option.id)).toContain('frank-shop-guests');
    const next = selectOption(finalReading, restored, 'frank-shop-guests');
    expect(next.flags).not.toContain('final_frank_shop_guests_done');
  });

  it('uses visitor context without pretending Frank is a clue or a scheduled performer', () => {
    const baseline = currentNode(finalReading, {
      node: 'frank-shop-guests-scene',
      flags: [],
      history: [],
    });
    const visitors = currentNode(finalReading, {
      node: 'frank-shop-guests-scene',
      flags: ['final_counter_ruth_done', 'final_counter_sam_done'],
      history: [],
    });
    expect(baseline.text).toContain('Пан Рід');
    expect(visitors.text).toContain('Рут і Сем');
  });

  it('keeps the complete graph valid and each new node within four options', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    const nodes = finalReading.nodes.filter((node) => node.id.startsWith('frank-shop-'));
    expect(nodes).toHaveLength(13);
    for (const node of nodes) {
      expect(node.options.length, node.id).toBeGreaterThan(0);
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

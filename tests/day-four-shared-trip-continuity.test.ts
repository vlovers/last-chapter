import { describe, expect, it } from 'vitest';
import { leoDecision } from '../src/content/day-four-leo';
import { maraDecision } from '../src/content/day-four-mara';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueStory,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function follow(story: DialogueStory, path: readonly string[], flags: readonly string[] = []) {
  let state: DialogueState = { ...startDialogue(story), flags: [...flags] };
  for (const id of path) state = selectOption(story, state, id);
  return state;
}

const leoRoute = [
  'welcome',
  'leo-ticket-feeling',
  'leo-ticket-feeling-back',
  'leo-future-honest',
  'leo-future-followup-direct',
  'leo-future-back',
  'mara',
] as const;

const maraRoute = [
  'greet',
  'mara-rest',
  'mara-rest-back',
  'mara-own-story-work',
  'mara-own-story-followup-direct',
  'mara-own-story-back',
  'book',
  'roads',
] as const;

describe('day four: Mara and Leo remember the same planned seaside trip', () => {
  it('Leo says Mara already chose a seaside hotel and he found three trains', () => {
    const state = follow(leoDecision, leoRoute);
    const text = currentNode(leoDecision, state).text;
    expect(text).toContain('Мара вже вибрала готель біля моря');
    expect(text).toContain('три потяги');
    expect(availableOptions(leoDecision, state).length).toBeLessThanOrEqual(4);
  });

  it('Mara discusses the booked hotel and three trains instead of inventing a future trip', () => {
    const state = follow(maraDecision, maraRoute, ['sold_roads']);
    const text = currentNode(maraDecision, state).text;
    expect(text).toContain('Готель біля моря я вже вибрала');
    expect(text).toContain('Лео знайшов три потяги');
    expect(text).not.toContain('одного дня просто сядемо');
    expect(availableOptions(maraDecision, state).map((option) => option.id)).toEqual([
      'roads-back',
    ]);
  });

  it('preserves the same conversation after saving and restoring the roads-book branch', () => {
    const state = follow(maraDecision, maraRoute, ['sold_roads']);
    const saved = encodeSave({ stage: 'day4-mara', dialogue: state, flags: state.flags });
    const restored = decodeSave(saved);
    expect(restored).not.toBeNull();
    expect(currentNode(maraDecision, restored!.dialogue).text).toBe(
      currentNode(maraDecision, state).text,
    );
    const returned = selectOption(maraDecision, restored!.dialogue, 'roads-back');
    expect(returned.node).toBe('greet');
    expect(returned.flags).toContain('mara_gift_encouraged');
    expect(availableOptions(maraDecision, returned).length).toBeGreaterThan(0);
  });
});

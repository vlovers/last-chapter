import { describe, expect, it } from 'vitest';
import { eleanorVisit } from '../src/content/eleanor';
import { leoDecision } from '../src/content/day-four-leo';
import { availableOptions, currentNode, selectOption, validateDialogue, type DialogueState } from '../src/game/dialogue';

function state(node: string, flags: string[] = []): DialogueState {
  return { node, flags, history: [] };
}

describe('Reservation evidence chain', () => {
  it('requires both archival records before Eleanor can reconstruct the timeline', () => {
    expect(availableOptions(eleanorVisit, state('greet')).some((option) => option.id === 'timeline')).toBe(false);
    expect(availableOptions(eleanorVisit, state('greet', ['saw_receipt', 'saw_repair_note'])).some((option) => option.id === 'timeline')).toBe(true);
  });

  it('records whether the player distinguishes evidence from an accusation', () => {
    const careful = selectOption(eleanorVisit, state('timeline'), 'timeline-check');
    const accusatory = selectOption(eleanorVisit, state('timeline'), 'timeline-blame');
    expect(currentNode(eleanorVisit, careful).text).toContain('чого не знаємо');
    expect(currentNode(eleanorVisit, accusatory).text).toContain('без доказів');
    expect(selectOption(eleanorVisit, careful, 'timeline-back').flags).toContain('eleanor_timeline_checked');
  });

  it('lets Leo question the accusation without changing the underlying facts', () => {
    const options = availableOptions(leoDecision, state('welcome', ['eleanor_timeline_checked']));
    expect(options.some((option) => option.id === 'evidence')).toBe(true);
    expect(currentNode(leoDecision, state('evidence', ['eleanor_timeline_kept_uncertainty'])).text).toContain('дві дати');
    expect(currentNode(leoDecision, state('evidence', ['eleanor_timeline_assumed_guilt'])).text).toContain('не довели');
  });

  it('keeps both dialogue graphs valid', () => {
    expect(validateDialogue(eleanorVisit)).toEqual([]);
    expect(validateDialogue(leoDecision)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

const reflections = [
  ['leo', 'leo_reflected_on_uncertainty'],
  ['iris', 'iris_reflected_on_identity'],
  ['anna', 'anna_reflected_on_care'],
  ['thomas', 'thomas_reflected_on_responsibility'],
  ['nora', 'nora_reflected_on_uncertainty'],
  ['eleanor', 'eleanor_reflected_on_legacy'],
] as const;

describe('Day five reflection payoffs', () => {
  it('preserves a valid finale graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it.each(reflections)('%s callback requires a previous personal conversation', (person, flag) => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(availableOptions(finalReading, state).some((option) => option.id === `${person}-reflection-callback`)).toBe(false);
    state = { ...state, flags: [flag] };
    expect(availableOptions(finalReading, state).some((option) => option.id === `${person}-reflection-callback`)).toBe(true);
    state = selectOption(finalReading, state, `${person}-reflection-callback`);
    state = selectOption(finalReading, state, `${person}-reflection-back`);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(`final_${person}_reflection_heard`);
    expect(availableOptions(finalReading, state).some((option) => option.id === `${person}-reflection-callback`)).toBe(false);
  });
  it.each([
    ['iris', 'iris_chose_open_art', 'iris_chose_private_art'],
    ['anna', 'anna_will_apologize_to_student', 'anna_will_invite_disagreement'],
    ['thomas', 'thomas_will_ask_before_helping', 'thomas_admitted_fear_of_rejection'],
    ['nora', 'nora_will_preserve_uncertainty', 'nora_will_seek_consent'],
    ['eleanor', 'eleanor_will_keep_shared_memory', 'eleanor_will_allow_change'],
  ] as const)('%s finale reflects the specific choice', (person, first, second) => {
    const start = selectOption(finalReading, startDialogue(finalReading), 'open');
    const story = finalReading.nodes.find((node) => node.id === `${person}-reflection-callback`);
    expect(story?.textWhen?.length).toBe(2);
    const texts = [first, second].map((flag) =>
      currentNode(finalReading, {
        ...start,
        node: `${person}-reflection-callback`,
        flags: [flag],
      }).text,
    );
    expect(texts[0]).not.toBe(texts[1]);
    expect(texts[0]).not.toBe(story?.text);
    expect(texts[1]).not.toBe(story?.text);
  });

});

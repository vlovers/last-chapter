import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

function gather(flags: string[] = []) {
  const start = { ...startDialogue(finalReading), flags };
  return selectOption(finalReading, start, 'open');
}

function choices(state: ReturnType<typeof gather>) {
  return availableOptions(finalReading, state).map((option) => option.id);
}

describe('day-five gathering pacing and optional callbacks', () => {
  it('allows the evening to end without completing optional conversations', () => {
    const state = gather();
    expect(choices(state)).toContain('close');
    expect(selectOption(finalReading, state, 'close').node).toBe('end');
  });

  it('keeps closing available even with many optional callbacks unlocked', () => {
    const state = gather([
      'final_after_anna_class_books_reserved',
      'final_after_leo_mara_walk',
      'final_after_eleanor_orders_planned',
      'final_after_miller_restraint_acknowledged',
      'final_after_iris_light_book_chosen',
      'anna_uncertainty_discussed',
      'thomas_listening_discussed',
    ]);
    expect(choices(state)).toContain('close');
    expect(choices(state)).toContain('final-aftercare-anna-option');
    expect(choices(state)).toContain('final-aftercare-leo-option');
    expect(selectOption(finalReading, state, 'close').node).toBe('end');
  });

  it('returns from Anna aftercare to the gathering without offering it again', () => {
    const state = gather(['final_after_anna_class_books_reserved']);
    const conversation = selectOption(finalReading, state, 'final-aftercare-anna-option');
    const result = selectOption(finalReading, conversation, 'final-aftercare-anna-vote');
    const back = selectOption(finalReading, result, 'final-aftercare-anna-vote-back');
    expect(back.node).toBe('gathering');
    expect(back.flags).toContain('final_aftercare_anna_done');
    expect(back.flags).toContain('final_anna_reading_vote');
    expect(choices(back)).not.toContain('final-aftercare-anna-option');
    expect(choices(back)).toContain('close');
  });

  it.each([
    {
      name: 'Leo',
      flag: 'final_after_leo_mara_walk',
      entry: 'final-aftercare-leo-option',
      choice: 'final-aftercare-leo-wish',
      back: 'final-aftercare-leo-wish-back',
      done: 'final_aftercare_leo_done',
    },
    {
      name: 'Iris',
      flag: 'final_after_iris_light_book_chosen',
      entry: 'final-aftercare-iris-option',
      choice: 'final-aftercare-iris-no-spoiler',
      back: 'final-aftercare-iris-no-spoiler-back',
      done: 'final_aftercare_iris_done',
    },
    {
      name: 'Miller',
      flag: 'final_after_miller_restraint_acknowledged',
      entry: 'final-aftercare-miller-option',
      choice: 'final-aftercare-miller-rules',
      back: 'final-aftercare-miller-rules-back',
      done: 'final_aftercare_miller_done',
    },
    {
      name: 'Eleanor',
      flag: 'final_after_eleanor_orders_planned',
      entry: 'final-aftercare-eleanor-option',
      choice: 'final-aftercare-eleanor-sort',
      back: 'final-aftercare-eleanor-sort-back',
      done: 'final_aftercare_eleanor_done',
    },
  ])(
    'returns from $name aftercare once without blocking the finale',
    ({ flag, entry, choice, back, done }) => {
      const state = gather([flag]);
      expect(choices(state)).toContain(entry);
      const conversation = selectOption(finalReading, state, entry);
      const result = selectOption(finalReading, conversation, choice);
      const returned = selectOption(finalReading, result, back);
      expect(returned.node).toBe('gathering');
      expect(returned.flags).toContain(done);
      expect(choices(returned)).not.toContain(entry);
      expect(choices(returned)).toContain('close');
    },
  );

  it('keeps other optional conversations accessible after returning', () => {
    const state = gather([
      'final_after_anna_class_books_reserved',
      'final_after_leo_mara_walk',
    ]);
    const conversation = selectOption(finalReading, state, 'final-aftercare-anna-option');
    const result = selectOption(finalReading, conversation, 'final-aftercare-anna-vote');
    const back = selectOption(finalReading, result, 'final-aftercare-anna-vote-back');
    expect(choices(back)).toContain('final-aftercare-leo-option');
    expect(choices(back)).toContain('close');
  });
});

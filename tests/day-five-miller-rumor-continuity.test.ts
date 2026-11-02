import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

const flagsFor = (rumor: 'none' | 'open' | 'corrected'): string[] => {
  if (rumor === 'none') return [];
  const flags = ['final_miller_ledger_rumor_seeded'];
  if (rumor === 'corrected') flags.push('final_miller_rumor_corrected_publicly');
  return flags;
};

const at = (node: string, rumor: 'none' | 'open' | 'corrected') => ({
  ...startDialogue(finalReading),
  node,
  flags: flagsFor(rumor),
});

describe('Day-five Miller rumor continuity after the public gathering', () => {
  it('preserves the complete graph and the three-choice conversation', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const rumor of ['none', 'open', 'corrected'] as const) {
      const state = at('after-case-miller-new', rumor);
      const choices = availableOptions(finalReading, state);
      expect(choices).toHaveLength(3);
      expect(choices.find((choice) => choice.id === 'after-miller-apology-new')?.label).toContain(
        'без чужих таємниць',
      );
    }
  });

  it('does not invent an apology when the rumor has not been corrected', () => {
    const text = currentNode(finalReading, at('after-case-miller-apology-new', 'open')).text;
    expect(text).toContain('знову наговорила зайвого');
    expect(text).toContain('Ніхто не називає це вибаченням');
    expect(text).not.toContain('вже пояснила всім');
  });

  it('acknowledges the public correction without granting Iris forgiveness', () => {
    const text = currentNode(finalReading, at('after-case-miller-apology-new', 'corrected')).text;
    expect(text).toContain('вже пояснила всім');
    expect(text).toContain('Ніхто не вимагає від неї пробачення');
    expect(text).not.toContain('Ніхто не називає це вибаченням');
  });

  it('retains the ordinary non-rumor conversation', () => {
    const text = currentNode(finalReading, at('after-case-miller-apology-new', 'none')).text;
    expect(text).toContain('Я намагалася');
    expect(text).not.toContain('коробку');
  });

  it('shows distinct next-day announcements for open and corrected rumors', () => {
    const open = currentNode(finalReading, at('bookshop-tomorrow-miller-new', 'open')).text;
    const corrected = currentNode(
      finalReading,
      at('bookshop-tomorrow-miller-new', 'corrected'),
    ).text;
    const ordinary = currentNode(finalReading, at('bookshop-tomorrow-miller-new', 'none')).text;
    expect(open).toContain('Сьогодні вже вистачило здогадів');
    expect(corrected).toContain('Після того, що я наговорила');
    expect(corrected).not.toContain('Сьогодні вже вистачило здогадів');
    expect(ordinary).toContain('НАДЗВИЧАЙНА ЗУСТРІЧ ЧИТАЧІВ');
  });

  for (const rumor of ['none', 'open', 'corrected'] as const) {
    it(`completes Miller's tea callback with ${rumor} rumor history`, () => {
      let state = {
        ...at('after-case-tea', rumor),
        flags: [...flagsFor(rumor), 'final_case_closure_complete'],
      };
      state = selectOption(finalReading, state, 'after-tea-help-group');
      state = selectOption(finalReading, state, 'after-tea-miller-new');
      state = selectOption(finalReading, state, 'after-miller-apology-new');
      state = selectOption(finalReading, state, 'after-miller-apology-finish-new');
      expect(state.flags).toContain('final_after_miller_restraint_acknowledged');
      state = selectOption(finalReading, state, 'after-tea-return');
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain('final_after_case_tea_done');
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'after-case-tea',
      );
    });

    it(`completes Miller's next-day privacy notice with ${rumor} rumor history`, () => {
      let state = {
        ...at('bookshop-tomorrow', rumor),
        flags: [
          ...flagsFor(rumor),
          'final_ledger_scene_complete',
          'final_manuscript_provenance_decided',
        ],
      };
      state = selectOption(finalReading, state, 'tomorrow-neighbors-group');
      state = selectOption(finalReading, state, 'tomorrow-miller-new');
      state = selectOption(finalReading, state, 'tomorrow-miller-privacy-new');
      state = selectOption(finalReading, state, 'tomorrow-miller-privacy-back-new');
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain('final_miller_notice_privacy');
      expect(state.flags).toContain('final_tomorrow_miller_done');
    });
  }
});

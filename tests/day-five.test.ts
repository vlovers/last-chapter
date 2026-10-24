import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { finishSeason, startFifthDay, type ChapterState } from '../src/game/chapter';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day 5 and first-season epilogues', () => {
  it('has a valid dialogue graph', () => expect(validateDialogue(finalReading)).toEqual([]));
  it('only permits a private meeting when both prerequisites were earned', () => {
    const opening = selectOption(finalReading, startDialogue(finalReading), 'open');
    const letter = selectOption(finalReading, { ...opening, flags: ['saw_envelope'] }, 'letter');
    expect(availableOptions(finalReading, letter).map((option) => option.id)).not.toContain(
      'mutual',
    );
    const ready = {
      ...letter,
      flags: ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'],
    };
    expect(availableOptions(finalReading, ready).map((option) => option.id)).toContain('mutual');
  });
  it('carries a chosen ending through saves and blocks premature completion', () => {
    const day4: ChapterState = {
      stage: 'day4-complete',
      dialogue: startDialogue(finalReading),
      flags: ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'],
    };
    let state = startFifthDay(day4);
    expect(() => finishSeason(state)).toThrow();
    for (const id of ['open', 'letter', 'mutual', 'mutual-back', 'close']) {
      const next = selectOption(finalReading, state.dialogue, id);
      state = { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
    }
    state = finishSeason(state);
    expect(state.stage).toBe('season-complete');
    expect(seasonEnding(state).letter).toContain('наодинці');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('has a separate epilogue for choosing to wait', () => {
    expect(
      seasonEnding({ flags: ['final_letter_kept_private', 'mara_future_supported'] }).epilogue,
    ).toContain('Мара');
    expect(seasonEnding({ flags: ['final_letter_kept_private'] }).letter).toContain('залишила');
  });
});

import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';
import type { ChapterState } from '../src/game/chapter';

/**
 * Model-check the real final gathering through the same option availability,
 * completion ledger and JSON save format used in the game.
 *
 * Unlike an adjacency walk, this does not pretend missing prerequisite flags
 * are earned. Each scenario begins with an explicit, attainable-style snapshot.
 */
function initial(flags: readonly string[] = []): DialogueState {
  return { node: 'gathering', flags, history: [] };
}

function playableAfterSave(state: DialogueState): DialogueState {
  const chapter: ChapterState = {
    stage: 'day5-reading',
    dialogue: state,
    flags: state.flags,
  };
  const restored = decodeSave(encodeSave(chapter));
  expect(restored, 'A playable finale state must survive saving').not.toBeNull();
  return restored!.dialogue;
}

describe('Final evening player-facing save and decision audit', () => {
  it('keeps the closing route available after a declined private letter', () => {
    let state = initial(['saw_envelope']);
    state = selectOption(finalReading, state, 'letter');
    state = playableAfterSave(selectOption(finalReading, state, 'letter-back'));
    expect(state.node).toBe('gathering');
    expect(availableOptions(finalReading, state).map((item) => item.id)).toContain('close');
    // Deferring the matter must not silently mark the topic complete.
    expect(availableOptions(finalReading, state).map((item) => item.id)).toContain('letter');
    expect(selectOption(finalReading, state, 'close').node).toBe('end');
  });

  it('keeps the chapter conversation available to a player who actually discussed it', () => {
    const options = availableOptions(
      finalReading,
      initial(['missing_chapter_discussed']),
    ).map((item) => item.id);
    expect(options).toContain('chapter-reckoning');
    expect(options).toContain('close');
  });

  it('carries an admitted letter breach through save and a player decision', () => {
    let state = initial([
      'saw_envelope',
      'opened_private_letter',
      'iris_letter_breach_admitted',
    ]);
    state = playableAfterSave(selectOption(finalReading, state, 'letter'));
    expect(availableOptions(finalReading, state).map((item) => item.id)).toContain(
      'repair-trust',
    );
    state = playableAfterSave(selectOption(finalReading, state, 'repair-trust'));
    state = playableAfterSave(selectOption(finalReading, state, 'repair-trust-back'));
    expect(state.flags).toContain('final_accepted_consequences');
    expect(availableOptions(finalReading, state).map((item) => item.id)).not.toContain(
      'letter',
    );
    expect(selectOption(finalReading, state, 'close').node).toBe('end');
  });

  it('lets a player discuss rumors, save the consequence, then end the night', () => {
    let state = playableAfterSave(selectOption(finalReading, initial(), 'rumor'));
    state = playableAfterSave(selectOption(finalReading, state, 'rumor-apology'));
    state = playableAfterSave(selectOption(finalReading, state, 'rumor-apology-back'));
    expect(state.flags).toContain('final_repaired_rumor');
    expect(availableOptions(finalReading, state).map((item) => item.id)).not.toContain(
      'rumor',
    );
    expect(selectOption(finalReading, state, 'close').node).toBe('end');
  });
});

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

function key(state: DialogueState): string {
  return JSON.stringify([
    state.node,
    [...state.flags].sort(),
    [...(state.completed ?? [])].sort(),
    state.pending ?? [],
  ]);
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

function checkReachability(start: DialogueState, expected: string): void {
  const queue: DialogueState[] = [playableAfterSave(start)];
  const seen = new Set<string>();
  let reachedEnding = false;
  let reachedExpected = false;

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const state = queue[cursor]!;
    const id = key(state);
    if (seen.has(id)) continue;
    seen.add(id);
    if (state.node === 'end') {
      reachedEnding = true;
      continue;
    }
    const options = availableOptions(finalReading, state);
    expect(options.length, `Dead end at ${state.node} in ${expected}`).toBeGreaterThan(0);
    for (const option of options) {
      // The close option is deliberately a valid escape; other routes still
      // must remain live when players actually choose to explore them.
      const next = playableAfterSave(selectOption(finalReading, state, option.id));
      if (next.flags.includes(expected)) reachedExpected = true;
      if (next.node === 'end') reachedEnding = true;
      if (!seen.has(key(next))) queue.push(next);
    }
    // A bound catches accidentally repeatable narrative cycles without making
    // the test depend on all optional combinations being enumerated.
    if (seen.size > 60000) throw new Error('Finale state space exceeded audit limit');
  }

  expect(reachedEnding, `No ending reachable from ${expected}`).toBe(true);
  expect(reachedExpected, `Choice consequence ${expected} is unreachable`).toBe(true);
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

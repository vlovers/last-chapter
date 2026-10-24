import { describe, expect, it } from 'vitest';
import { decodeSave, encodeSave } from '../src/game/save';
import { stageStory, type ChapterState } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';

function checkpoint(flags: string[]): string {
  return JSON.stringify({ version: 1, stage: 'day4-complete', node: 'end', flags, history: [] });
}

describe('Day 4 save compatibility', () => {
  it('does not infer missing encounters from optional dialogue flags', () => {
    const state = decodeSave(checkpoint(['iris_letter_choice_respected', 'saw_envelope']));
    expect(state?.stage).toBe('day4-complete');
    expect(state?.flags).toContain('saw_envelope');
  });
  it('preserves completed Day 4 when Mara flags exist but Leo flags do not', () => {
    const state = decodeSave(
      checkpoint(['iris_letter_choice_respected', 'mara_supported_independence']),
    );
    expect(state?.stage).toBe('day4-complete');
    expect(state?.dialogue.node).toBe('end');
  });
  it('preserves completed Day 4 with Leo flags', () => {
    expect(decodeSave(checkpoint(['leo_open_to_conversation']))?.stage).toBe('day4-complete');
  });
  it('round-trips a legitimate completed Day 4 with no optional flags', () => {
    const flags: string[] = [];
    const state: ChapterState = {
      stage: 'day4-complete',
      flags,
      dialogue: { ...startDialogue(stageStory('day4-complete')), node: 'end', flags, history: [] },
    };
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
});

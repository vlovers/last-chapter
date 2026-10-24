import { describe, expect, it } from 'vitest';
import { decodeSave } from '../src/game/save';

function legacy(flags: string[]): string {
  return JSON.stringify({ version: 1, stage: 'day4-complete', node: 'end', flags, history: [] });
}

describe('Day 4 evolving prototype save compatibility', () => {
  it('resumes at Mara when an old save finished after Iris', () => {
    const state = decodeSave(legacy(['iris_letter_choice_respected', 'saw_envelope']));
    expect(state?.stage).toBe('day4-mara');
    expect(state?.flags).toContain('saw_envelope');
    expect(state?.dialogue.node).toBe('arrival');
  });
  it('resumes at Leo when an old save finished after Mara', () => {
    const state = decodeSave(legacy(['iris_letter_choice_respected', 'mara_supported_independence']));
    expect(state?.stage).toBe('day4-leo');
    expect(state?.flags).toContain('mara_supported_independence');
  });
  it('keeps completed Day 4 when Leo has spoken', () => {
    const state = decodeSave(legacy(['iris_letter_choice_respected', 'mara_supported_independence', 'leo_open_to_conversation']));
    expect(state?.stage).toBe('day4-complete');
    expect(state?.dialogue.node).toBe('end');
  });
  it('does not invent progress when an old save has no distinguishing flags', () => {
    expect(decodeSave(legacy([]))?.stage).toBe('day4-complete');
  });
});

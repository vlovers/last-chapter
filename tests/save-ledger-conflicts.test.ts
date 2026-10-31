import { describe, expect, it } from 'vitest';
import { stageStory, type ChapterState } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const checkpoint = (): ChapterState => ({
  stage: 'miller',
  flags: [],
  dialogue: { ...startDialogue(stageStory('miller')), completed: [], pending: [] },
});

const payload = (): Record<string, unknown> =>
  JSON.parse(encodeSave(checkpoint())) as Record<string, unknown>;

describe('save completion and pending ledger conflicts', () => {
  it.each([
    [
      'a topic marked both completed and pending',
      { completed: ['topic-a'], pending: [{ hub: 'arrival', key: 'topic-a' }] },
    ],
    [
      'a pending key assigned to different hubs',
      {
        completed: [],
        pending: [
          { hub: 'arrival', key: 'topic-a' },
          { hub: 'other-hub', key: 'topic-a' },
        ],
      },
    ],
    ['a whitespace-only flag', { flags: ['   '] }],
    ['a whitespace-only history entry', { history: ['\t'] }],
    ['a whitespace-only completion key', { completed: ['   '], pending: [] }],
    ['a whitespace-only pending hub', { completed: [], pending: [{ hub: '\n', key: 'a' }] }],
    ['a whitespace-only pending key', { completed: [], pending: [{ hub: 'arrival', key: '  ' }] }],
  ] as const)('rejects %s', (_reason, changes) => {
    const valid = JSON.stringify(payload());
    expect(decodeSave(JSON.stringify({ ...payload(), ...changes }))).toBeNull();
    expect(decodeSave(valid)).toEqual(checkpoint());
  });

  it('refuses to encode a completed topic that is still pending', () => {
    const state = checkpoint();
    expect(() =>
      encodeSave({
        ...state,
        dialogue: {
          ...state.dialogue,
          completed: ['topic-a'],
          pending: [{ hub: 'arrival', key: 'topic-a' }],
        },
      }),
    ).toThrow('Save cannot be restored');
  });

  it('preserves independent pending topics under the same hub and different hubs', () => {
    const state: ChapterState = {
      ...checkpoint(),
      dialogue: {
        ...checkpoint().dialogue,
        completed: ['already-done'],
        pending: [
          { hub: 'arrival', key: 'topic-a' },
          { hub: 'arrival', key: 'topic-b' },
          { hub: 'other-hub', key: 'topic-c' },
        ],
      },
    };
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it('preserves legacy saves that do not have a completion ledger', () => {
    const legacy = payload();
    delete legacy.completed;
    delete legacy.pending;
    expect(decodeSave(JSON.stringify(legacy))).toEqual({
      ...checkpoint(),
      dialogue: startDialogue(stageStory('miller')),
    });
  });
});

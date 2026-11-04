import { describe, expect, it } from 'vitest';
import { stageStory, type ChapterStage, type ChapterState } from '../src/game/chapter';
import { startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const stages: readonly ChapterStage[] = [
  'miller',
  'mara',
  'evening',
  'complete',
  'iris',
  'anna',
  'leo',
  'day2-complete',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'quiet-evening',
  'day3-complete',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day4-complete',
  'day5-reading',
  'season-complete',
];

const checkpoint = (stage: ChapterStage): ChapterState => ({
  stage,
  flags: [],
  dialogue: { ...startDialogue(stageStory(stage)), completed: [], pending: [] },
});

describe('dialogue save ledger integrity', () => {
  it.each(stages)('round trips a versioned completion ledger at %s', (stage) => {
    const state = checkpoint(stage);
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it('preserves valid legacy saves without a completion ledger', () => {
    const state = checkpoint('quiet-evening');
    const legacy = { ...state, dialogue: startDialogue(stageStory(state.stage)) };
    expect(decodeSave(encodeSave(legacy))).toEqual(legacy);
  });

  it('rejects pending topics when the completion ledger is missing', () => {
    const saved = JSON.parse(encodeSave(checkpoint('miller'))) as Record<string, unknown>;
    delete saved.completed;
    saved.pending = [{ hub: 'arrival', key: 'topic' }];
    expect(decodeSave(JSON.stringify(saved))).toBeNull();
  });

  it.each([
    ['empty completion key', { completed: [''], pending: [] }],
    ['empty pending key', { completed: [], pending: [{ hub: 'arrival', key: '' }] }],
    [
      'duplicate pending topic',
      {
        completed: [],
        pending: [
          { hub: 'arrival', key: 'topic' },
          { hub: 'arrival', key: 'topic' },
        ],
      },
    ],
  ])('rejects %s without losing the original save', (_reason, invalid) => {
    const state = checkpoint('miller');
    const original = encodeSave(state);
    const malformed = { ...JSON.parse(original), ...invalid };
    expect(decodeSave(JSON.stringify(malformed))).toBeNull();
    expect(decodeSave(original)).toEqual(state);
    expect(() =>
      encodeSave({
        ...state,
        dialogue: { ...state.dialogue, ...invalid },
      }),
    ).toThrow('Save cannot be restored');
  });

  it.each([
    ['duplicate completion entries', { completed: ['topic', 'topic'], pending: [] }],
    ['missing pending list', { completed: [], pending: undefined }],
    ['null pending list', { completed: [], pending: null }],
    ['null completion list', { completed: null, pending: [] }],
    ['empty pending hub', { completed: [], pending: [{ hub: '', key: 'topic' }] }],
    ['non-string pending hub', { completed: [], pending: [{ hub: 42, key: 'topic' }] }],
    ['non-string pending key', { completed: [], pending: [{ hub: 'arrival', key: 42 }] }],
    ['oversized completion key', { completed: ['x'.repeat(1001)], pending: [] }],
    ['oversized pending hub', { completed: [], pending: [{ hub: 'x'.repeat(121), key: 'topic' }] }],
    [
      'oversized pending key',
      { completed: [], pending: [{ hub: 'arrival', key: 'x'.repeat(1001) }] },
    ],
  ])('rejects %s in an untrusted ledger', (_reason, invalid) => {
    const original = encodeSave(checkpoint('miller'));
    const malformed = { ...JSON.parse(original), ...invalid };
    expect(decodeSave(JSON.stringify(malformed))).toBeNull();
    expect(decodeSave(original)).not.toBeNull();
  });

  it('rejects ledgers exceeding their entry budgets', () => {
    const original = JSON.parse(encodeSave(checkpoint('miller')));
    expect(
      decodeSave(
        JSON.stringify({
          ...original,
          completed: Array.from({ length: 8193 }, (_, i) => `topic-${i}`),
        }),
      ),
    ).toBeNull();
    expect(
      decodeSave(
        JSON.stringify({
          ...original,
          pending: Array.from({ length: 1025 }, (_, i) => ({
            hub: 'arrival',
            key: `topic-${i}`,
          })),
        }),
      ),
    ).toBeNull();
  });

  it('keeps distinct pending topics under one hub', () => {
    const state = checkpoint('miller');
    const dialogue = {
      ...state.dialogue,
      pending: [
        { hub: 'arrival', key: 'topic-a' },
        { hub: 'arrival', key: 'topic-b' },
      ],
    };
    const valid = { ...state, dialogue };
    expect(decodeSave(encodeSave(valid))).toEqual(valid);
  });
});

import { describe, expect, it } from 'vitest';
import { maraDecision } from '../src/content/day-four-mara';
import { millerVisit } from '../src/content/first-day';
import { stageStory, type ChapterStage, type ChapterState } from '../src/game/chapter';
import { selectOption, startDialogue } from '../src/game/dialogue';
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
        { hub: 'hello', key: JSON.stringify(['hello', 'books', []]) },
        { hub: 'hello', key: JSON.stringify(['hello', 'eleanor', []]) },
      ],
    };
    const valid = { ...state, dialogue };
    expect(decodeSave(encodeSave(valid))).toEqual(valid);
  });
});

function authoredCheckpoint(stage: 'miller' | 'day4-mara') {
  const story = stage === 'miller' ? millerVisit : maraDecision;
  return JSON.parse(
    encodeSave({
      stage,
      flags: [],
      dialogue: { ...startDialogue(story), completed: [], pending: [] },
    }),
  ) as Record<string, unknown>;
}

describe('save completion ledger integrity', () => {
  it('accepts an authored one-time completion key', () => {
    const save = authoredCheckpoint('miller');
    const entry = millerVisit.nodes.find((node) => node.id === millerVisit.start)!;
    const option = entry.options.find((choice) => choice.id === 'greet')!;
    save.completed = [JSON.stringify([entry.id, option.id, []])];
    expect(decodeSave(JSON.stringify(save))).not.toBeNull();
  });

  it('accepts an unfinished authored topic as pending', () => {
    const save = authoredCheckpoint('miller');
    const entry = millerVisit.nodes.find((node) => node.id === millerVisit.start)!;
    const option = entry.options.find((choice) => choice.id === 'greet')!;
    const key = JSON.stringify([entry.id, option.id, []]);
    save.node = option.next;
    save.pending = [{ hub: entry.id, key }];
    expect(decodeSave(JSON.stringify(save))).not.toBeNull();
  });

  it('rejects a repeatable or suspended choice in completed progress', () => {
    const entry = maraDecision.nodes.find((node) =>
      node.options.some((choice) => choice.repeatability === 'repeatable' || choice.suspend),
    )!;
    const option = entry.options.find(
      (choice) => choice.repeatability === 'repeatable' || choice.suspend,
    )!;
    expect(option).toBeDefined();
    const save = authoredCheckpoint('day4-mara');
    save.completed = [JSON.stringify([entry.id, option.id, []])];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a repeatable or suspended choice in pending progress', () => {
    const entry = maraDecision.nodes.find((node) =>
      node.options.some((choice) => choice.repeatability === 'repeatable' || choice.suspend),
    )!;
    const option = entry.options.find(
      (choice) => choice.repeatability === 'repeatable' || choice.suspend,
    )!;
    const save = authoredCheckpoint('day4-mara');
    save.pending = [{ hub: entry.id, key: JSON.stringify([entry.id, option.id, []]) }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('preserves legacy history-only checkpoints without inventing a ledger', () => {
    const save = authoredCheckpoint('miller');
    delete save.completed;
    delete save.pending;
    save.history = ['greet'];
    save.node = 'hello';
    const restored = decodeSave(JSON.stringify(save));
    expect(restored).not.toBeNull();
    expect(restored?.dialogue.completed).toBeUndefined();
    expect(restored?.dialogue.history).toEqual(['greet']);
  });

  it('round-trips progress generated by the actual dialogue engine', () => {
    const state = selectOption(millerVisit, startDialogue(millerVisit), 'greet');
    const encoded = encodeSave({
      stage: 'miller',
      dialogue: state,
      flags: state.flags,
    });
    const restored = decodeSave(encoded);
    expect(restored?.dialogue).toEqual(state);
    expect(restored?.stage).toBe('miller');
  });

  it('preserves real in-flight topic progress across repeated saves', () => {
    const state = selectOption(millerVisit, startDialogue(millerVisit), 'greet');
    const chapter = { stage: 'miller' as const, dialogue: state, flags: state.flags };
    const first = decodeSave(encodeSave(chapter));
    expect(first).not.toBeNull();
    const second = decodeSave(encodeSave(first!));
    expect(second?.dialogue.pending).toEqual(state.pending);
    expect(second?.dialogue.history).toEqual(state.history);
  });

  it('rejects a completion key for an unknown choice', () => {
    const save = authoredCheckpoint('miller');
    save.completed = [JSON.stringify([millerVisit.start, '__unknown_choice__', []])];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a completion key for an unknown scene', () => {
    const save = authoredCheckpoint('miller');
    save.completed = [JSON.stringify(['__unknown_scene__', 'greet', []])];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a completion key with an unauthored reopening flag', () => {
    const save = authoredCheckpoint('miller');
    save.flags = ['fabricated'];
    save.completed = [JSON.stringify([millerVisit.start, 'greet', ['fabricated']])];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects the same key in both completed and pending ledgers', () => {
    const save = authoredCheckpoint('miller');
    const key = JSON.stringify([millerVisit.start, 'greet', []]);
    save.completed = [key];
    save.pending = [{ hub: millerVisit.start, key }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects pending entries whose hub disagrees with their key', () => {
    const save = authoredCheckpoint('miller');
    save.pending = [{ hub: 'hello', key: JSON.stringify([millerVisit.start, 'greet', []]) }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects duplicate pending keys even when hubs differ', () => {
    const save = authoredCheckpoint('miller');
    const key = JSON.stringify([millerVisit.start, 'greet', []]);
    save.pending = [
      { hub: millerVisit.start, key },
      { hub: 'hello', key },
    ];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a pending ledger without a completed ledger', () => {
    const save = authoredCheckpoint('miller');
    delete save.completed;
    save.pending = [
      { hub: millerVisit.start, key: JSON.stringify([millerVisit.start, 'greet', []]) },
    ];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('round-trips a real authored choice through encode and decode', () => {
    const story = millerVisit;
    const first = story.nodes.find((node) => node.id === story.start)!;
    const option = first.options.find((choice) => choice.id === 'greet')!;
    const save = authoredCheckpoint('miller');
    save.node = option.next;
    save.history = [option.id];
    save.pending = [{ hub: first.id, key: JSON.stringify([first.id, option.id, []]) }];
    const decoded = decodeSave(JSON.stringify(save));
    expect(decoded).not.toBeNull();
    const restored = decodeSave(encodeSave(decoded!));
    expect(restored?.dialogue.node).toBe(option.next);
    expect(restored?.dialogue.pending).toEqual(save.pending);
  });

  it('rejects a completion key with an invalid JSON payload', () => {
    const save = authoredCheckpoint('miller');
    save.completed = ['not-json'];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects noncanonical completed keys that would not match engine-generated keys', () => {
    const save = authoredCheckpoint('miller');
    save.completed = ['[ "arrival", "greet", [] ]'];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects noncanonical pending keys that would not match engine-generated keys', () => {
    const save = authoredCheckpoint('miller');
    save.pending = [{ hub: millerVisit.start, key: '[ "arrival", "greet", [] ]' }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects completion keys containing noncanonical JSON escape sequences', () => {
    const save = authoredCheckpoint('miller');
    save.completed = ['["arrival","gr\\u0065et",[]]'];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a completion key with the wrong tuple length', () => {
    const save = authoredCheckpoint('miller');
    save.completed = [JSON.stringify([millerVisit.start, 'greet'])];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects duplicate completed entries', () => {
    const save = authoredCheckpoint('miller');
    const key = JSON.stringify([millerVisit.start, 'greet', []]);
    save.completed = [key, key];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects duplicate saved flags', () => {
    const save = authoredCheckpoint('miller');
    save.flags = ['known', 'known'];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a non-string flag in a save', () => {
    const save = authoredCheckpoint('miller');
    save.flags = ['known', 42];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects an invalid pending entry without a key', () => {
    const save = authoredCheckpoint('miller');
    save.pending = [{ hub: millerVisit.start }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a pending entry whose key is not JSON', () => {
    const save = authoredCheckpoint('miller');
    save.pending = [{ hub: millerVisit.start, key: 'not-json' }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a save with an unknown dialogue node', () => {
    const save = authoredCheckpoint('miller');
    save.node = '__missing_node__';
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a save with an unknown stage', () => {
    const save = authoredCheckpoint('miller');
    save.stage = '__missing_stage__';
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('rejects a save with an unsupported version', () => {
    const save = authoredCheckpoint('miller');
    save.version = 999;
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });
});

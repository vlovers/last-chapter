import { describe, expect, it } from 'vitest';
import { maraDecision } from '../src/content/day-four-mara';
import { millerVisit } from '../src/content/first-day';
import { startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function checkpoint(stage: 'miller' | 'day4-mara') {
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
    const save = checkpoint('miller');
    const entry = millerVisit.nodes.find((node) => node.id === millerVisit.start)!;
    const option = entry.options.find((choice) => choice.id === 'greet')!;
    save.completed = [JSON.stringify([entry.id, option.id, []])];
    expect(decodeSave(JSON.stringify(save))).not.toBeNull();
  });

  it('accepts an unfinished authored topic as pending', () => {
    const save = checkpoint('miller');
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
    const save = checkpoint('day4-mara');
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
    const save = checkpoint('day4-mara');
    save.pending = [{ hub: entry.id, key: JSON.stringify([entry.id, option.id, []]) }];
    expect(decodeSave(JSON.stringify(save))).toBeNull();
  });

  it('preserves legacy history-only checkpoints without inventing a ledger', () => {
    const save = checkpoint('miller');
    delete save.completed;
    delete save.pending;
    save.history = ['greet'];
    const restored = decodeSave(JSON.stringify(save));
    expect(restored).not.toBeNull();
    expect(restored?.dialogue.completed).toBeUndefined();
    expect(restored?.dialogue.history).toEqual(['greet']);
  });
});

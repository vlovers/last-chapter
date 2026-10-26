import { describe, expect, it } from 'vitest';
import { encodeSave, decodeSave } from '../src/game/save';
import { startDialogue, selectOption, availableOptions } from '../src/game/dialogue';
import { stageStory, type ChapterState } from '../src/game/chapter';
import { noraVisit } from '../src/content/nora';

describe('Legacy dialogue save migration', () => {
  it('writes a completion ledger before trimming a long legacy history', () => {
    const story = stageStory('miller');
    const start = startDialogue(story);
    const first = availableOptions(story, start)[0];
    expect(first).toBeDefined();
    const selected = selectOption(story, start, first.id);
    const legacy: ChapterState = {
      stage: 'miller',
      flags: selected.flags,
      dialogue: {
        node: selected.node,
        flags: selected.flags,
        history: [...selected.history, ...Array.from({ length: 300 }, () => 'old-action')],
      },
    };
    const restored = decodeSave(encodeSave(legacy));
    expect(restored).not.toBeNull();
    expect(restored!.dialogue.history).toHaveLength(256);
    expect(restored!.dialogue.completed).toBeDefined();
    expect(restored!.dialogue.pending).toBeDefined();
    expect(decodeSave(encodeSave(restored!))?.dialogue.completed).toEqual(
      restored!.dialogue.completed,
    );
  });

  it('can rewrite an older Day 3 checkpoint without losing its save', () => {
    const oldNode = noraVisit.nodes.find(
      (node) => !stageStory('day3-complete').nodes.some((entry) => entry.id === node.id),
    );
    if (!oldNode) return;
    const legacy = {
      version: 1,
      stage: 'day3-complete',
      node: oldNode.id,
      flags: [],
      history: [],
    };
    const restored = decodeSave(JSON.stringify(legacy));
    expect(restored).not.toBeNull();
    expect(decodeSave(encodeSave(restored!))).not.toBeNull();
  });

  it('keeps the save version stable for existing installations', () => {
    const state: ChapterState = {
      stage: 'miller',
      flags: [],
      dialogue: startDialogue(stageStory('miller')),
    };
    const data = JSON.parse(encodeSave(state)) as Record<string, unknown>;
    expect(data.version).toBe(1);
    expect(decodeSave(JSON.stringify(data))).not.toBeNull();
  });
});

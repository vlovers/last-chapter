import { describe, expect, it } from 'vitest';
import { millerVisit } from '../src/content/first-day';
import {
  availableOptions,
  type DialogueStory,
  restoreDialogueProgress,
  selectOption,
  startDialogue,
} from '../src/game/dialogue';

function completedMillerConversation() {
  let state = startDialogue(millerVisit);
  for (const id of ['greet', 'chat', 'jam', 'jam-kind', 'jam-kind-return']) {
    state = selectOption(millerVisit, state, id);
  }
  return state;
}

describe('legacy dialogue replay performance', () => {
  it('replays one immutable legacy snapshot only once across repeated UI reads', () => {
    const completed = completedMillerConversation();
    let replayCount = 0;
    const history = new Proxy([...completed.history], {
      get(target, key, receiver) {
        if (key === Symbol.iterator) replayCount++;
        return Reflect.get(target, key, receiver);
      },
    });
    const legacy = { node: completed.node, flags: completed.flags, history };

    const restored = restoreDialogueProgress(millerVisit, legacy);
    expect(restored.completed).toEqual(completed.completed);
    expect(restored.pending).toEqual(completed.pending);
    const expected = availableOptions(millerVisit, completed).map((option) => option.id);
    for (let frame = 0; frame < 120; frame++) {
      expect(restoreDialogueProgress(millerVisit, legacy)).toBe(restored);
      expect(availableOptions(millerVisit, legacy).map((option) => option.id)).toEqual(expected);
    }
    expect(replayCount).toBe(1);
    expect(legacy).not.toHaveProperty('completed');
    expect(legacy).not.toHaveProperty('pending');
  });

  it('keeps independent caches for distinct dialogue graphs and snapshots', () => {
    const completed = completedMillerConversation();
    const legacy = {
      node: completed.node,
      flags: completed.flags,
      history: completed.history,
    };
    const first = restoreDialogueProgress(millerVisit, legacy);
    const secondStory = { ...millerVisit };
    const otherGraph = restoreDialogueProgress(secondStory, legacy);
    const otherSnapshot = restoreDialogueProgress(millerVisit, { ...legacy });

    expect(otherGraph).not.toBe(first);
    expect(otherSnapshot).not.toBe(first);
    expect(otherGraph.completed).toEqual(first.completed);
    expect(otherSnapshot.completed).toEqual(first.completed);
    expect(restoreDialogueProgress(secondStory, legacy)).toBe(otherGraph);
  });

  it('does not wrap or cache modern saves with an explicit completion ledger', () => {
    const modern = completedMillerConversation();
    expect(modern.completed).toBeDefined();
    expect(restoreDialogueProgress(millerVisit, modern)).toBe(modern);
    expect(restoreDialogueProgress(millerVisit, modern)).toBe(modern);
  });

  it('restores a full-length legacy route without changing the saved history', () => {
    const story: DialogueStory = {
      start: 'hub',
      nodes: [
        {
          id: 'hub',
          speaker: 'Оповідач',
          text: 'Книгарня відкрита.',
          hub: true,
          options: [
            { id: 'open', label: 'Почати розмову', next: 'topic' },
            { id: 'idle', label: 'Оглянути кімнату', next: 'hub', repeatability: 'repeatable' },
          ],
        },
        {
          id: 'topic',
          speaker: 'Гість',
          text: 'Поговорімо.',
          options: [{ id: 'return', label: 'Повернутися', next: 'hub' }],
        },
      ],
    };
    // Stay below the save format's 16,384-edge budget, but stress the
    // old quadratic replay path with thousands of repeatable interactions.
    const history = ['open', 'return', ...Array<string>(16_000).fill('idle')];
    const legacy = { node: 'hub', flags: [], history };

    const restored = restoreDialogueProgress(story, legacy);
    expect(restored.completed).toEqual([JSON.stringify(['hub', 'open', []])]);
    expect(restored.pending).toEqual([]);
    expect(restored.history).toBe(history);
    expect(availableOptions(story, legacy).map((option) => option.id)).toEqual(['idle']);

    // A real new choice still records its edge; only internal replay skips it.
    const next = selectOption(story, legacy, 'idle');
    expect(next.history).toHaveLength(history.length + 1);
    expect(next.history.at(-1)).toBe('idle');
    expect(next.completed).toEqual(restored.completed);
    expect(legacy).not.toHaveProperty('completed');
  });
});

import { describe, expect, it } from 'vitest';
import { millerVisit } from '../src/content/first-day';
import {
  availableOptions,
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
});

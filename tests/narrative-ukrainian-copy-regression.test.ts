import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { quietEvening } from '../src/content/quiet-evening';
import { validateDialogue, type DialogueNode } from '../src/game/dialogue';

const revisedFinaleScenes = [
  'gathering',
  'ledger-outcome',
  'workshop-evidence-owner',
  'iris',
  'frank-trust',
  'end',
  'final-aftercare-leo',
  'final-aftercare-leo-space-result',
  'final-aftercare-iris-return-result',
  'final-aftercare-iris-quiet-result',
] as const;

function authoredNarration(node: DialogueNode): string[] {
  return [
    node.text,
    ...(node.textWhen ?? []).map((variant) => variant.text),
    ...(node.afterwordWhen ?? []).map((callback) => callback.text),
  ];
}

function expectFinishedNarration(node: DialogueNode) {
  for (const text of authoredNarration(node)) {
    expect(text.trim(), `Unfinished narration: ${node.id}`).toMatch(/[.!?…»”]$/u);
  }
}

describe('Ukrainian scene-copy continuity', () => {
  it('keeps every quiet-evening narration and flag variant complete', () => {
    for (const node of quietEvening.nodes) expectFinishedNarration(node);
  });

  it('addresses the player consistently in quiet-evening exploration', () => {
    for (const id of ['closing-leftovers', 'window', 'window-memory']) {
      const node = quietEvening.nodes.find((entry) => entry.id === id);
      expect(node, `Missing quiet-evening scene: ${id}`).toBeDefined();
      expect(node!.text).not.toMatch(/(?:^|\s)(?:Ви|ви|вашого)(?:\s|$)/u);
      expectFinishedNarration(node!);
    }
  });

  it('keeps the revised finale scenes and conditional variants complete', () => {
    for (const id of revisedFinaleScenes) {
      const node = finalReading.nodes.find((entry) => entry.id === id);
      expect(node, `Missing finale scene: ${id}`).toBeDefined();
      expectFinishedNarration(node!);
    }
  });

  it('preserves valid dialogue links and conditional gates', () => {
    expect(validateDialogue(quietEvening)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

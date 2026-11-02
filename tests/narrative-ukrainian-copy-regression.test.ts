import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { quietEvening } from '../src/content/quiet-evening';
import { stageStory, type ChapterStage } from '../src/game/chapter';
import { validateDialogue, type DialogueNode } from '../src/game/dialogue';

const playablePreFinaleStages = [
  'miller',
  'mara',
  'evening',
  'iris',
  'anna',
  'leo',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'quiet-evening',
  'day4-iris',
  'day4-mara',
  'day4-leo',
] as const satisfies readonly ChapterStage[];

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
  it('keeps authored narration complete across all four opening days', () => {
    for (const stage of playablePreFinaleStages) {
      const graph = stageStory(stage);
      for (const node of graph.nodes) expectFinishedNarration(node);
    }
  });

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

  it('keeps the fourth-day narrator addressing the player as ти, not Ви', () => {
    const scenes = [
      ['day4-iris', 'welcome'],
      ['day4-iris', 'respect'],
      ['day4-iris', 'end'],
      ['day4-mara', 'arrival'],
    ] as const satisfies readonly (readonly [ChapterStage, string])[];
    for (const [stage, id] of scenes) {
      const node = stageStory(stage).nodes.find((entry) => entry.id === id);
      expect(node, `Missing fourth-day scene: ${stage}/${id}`).toBeDefined();
      for (const narration of authoredNarration(node!)) {
        expect(narration, `Formal narrator in ${stage}/${id}`).not.toMatch(
          /(?<![\p{L}])Ви(?![\p{L}])/u,
        );
      }
    }
  });

  it('preserves valid dialogue links and conditional gates', () => {
    expect(validateDialogue(quietEvening)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

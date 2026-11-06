import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { quietEvening } from '../src/content/quiet-evening';
import { stageStory, type ChapterStage } from '../src/game/chapter';
import { validateDialogue, type DialogueNode } from '../src/game/dialogue';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';

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
  it('uses Ukrainian prose and replies in the main story and all optional Mara topics', () => {
    const stages: readonly ChapterStage[] = [...playablePreFinaleStages, 'day5-reading'];
    const texts = stages.flatMap((stage) =>
      stageStory(stage).nodes.flatMap((node) => [
        node.speaker,
        ...authoredNarration(node),
        ...node.options.map((option) => option.label),
      ]),
    );
    for (const topic of [maraBookClub, maraAfterHours, maraReturnVisit, maraLetterDecision]) {
      texts.push(topic.title);
      for (const node of topic.nodes) {
        texts.push(
          node.speaker,
          node.text,
          ...(node.variants ?? []).map((variant) => variant.text),
          ...node.choices.map((choice) => choice.label),
        );
      }
    }
    for (const text of texts) expect(text).not.toMatch(/[A-Za-z]{3,}/u);
  });

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

  it('avoids stray punctuation and awkward voice descriptions across all five days', () => {
    const stages: readonly ChapterStage[] = [...playablePreFinaleStages, 'day5-reading'];
    for (const stage of stages) {
      for (const node of stageStory(stage).nodes) {
        for (const narration of authoredNarration(node)) {
          expect(narration, `${stage}/${node.id}: extra dot`).not.toMatch(/[?!…]»\./u);
          expect(narration, `${stage}/${node.id}: lowered voice`).not.toMatch(/знизує голос/u);
        }
      }
    }
  });

  it('preserves valid dialogue links and conditional gates', () => {
    expect(validateDialogue(quietEvening)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

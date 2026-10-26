import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  advanceSecondDay,
  advanceToLeo,
  advanceToThomas,
  advanceToNora,
  advanceToDayFourMara,
  advanceToDayFourLeo,
  finishSecondDay,
  finishThirdDay,
  finishFourthDay,
  finishSeason,
  startBookClub,
  stageStory,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, type DialogueStory } from '../src/game/dialogue';

const transitions = [
  ['miller', advanceChapter],
  ['mara', advanceChapter],
  ['evening', advanceChapter],
  ['iris', advanceSecondDay],
  ['anna', advanceToLeo],
  ['leo', finishSecondDay],
  ['eleanor', advanceToThomas],
  ['thomas', advanceToNora],
  ['nora', startBookClub],
  ['book-club', finishThirdDay],
  ['day4-iris', advanceToDayFourMara],
  ['day4-mara', advanceToDayFourLeo],
  ['day4-leo', finishFourthDay],
  ['day5-reading', finishSeason],
] as const;

function blockedOptions(story: DialogueStory) {
  const target = story.nodes.find((node) => node.options.length > 0);
  if (!target) throw new Error('Story has no selectable node');
  // One-shot options on this node are already completed in this snapshot.
  // The player-facing menu is empty even though authored edges remain.
  const completed = target.options
    .filter((option) => option.repeatability !== 'repeatable')
    .map((option) => JSON.stringify([target.id, option.id, []]));
  return { target, completed };
}

describe('All five days agree on available choices at transitions', () => {
  for (const [stage, transition] of transitions) {
    it(`allows ${stage} to advance when authored choices were already completed`, () => {
      const story = stageStory(stage);
      const { target, completed } = blockedOptions(story);
      const state: ChapterState = {
        stage,
        flags: [],
        dialogue: {
          node: target.id,
          flags: [],
          history: [],
          completed,
        },
      };
      // Conditions may introduce hidden or repeatable options. Only check
      // states where the player-facing menu is actually exhausted.
      if (availableOptions(story, state.dialogue).length !== 0) return;
      const next = transition(state);
      expect(next.stage).not.toBe(stage);
    });
  }

  it('does not skip a conversation with an available choice', () => {
    for (const [stage, transition] of transitions) {
      const story = stageStory(stage);
      const node = story.nodes.find((item) =>
        item.options.some((option) => option.repeatability !== 'repeatable' && !(option.requires?.length)),
      );
      if (!node) continue;
      const state: ChapterState = {
        stage,
        flags: [],
        dialogue: { node: node.id, flags: [], history: [] },
      };
      if (availableOptions(story, state.dialogue).length === 0) continue;
      expect(() => transition(state), stage).toThrow();
    }
  });
});

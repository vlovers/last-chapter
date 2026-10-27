import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  advanceSecondDay,
  advanceToLeo,
  advanceToThomas,
  advanceToNora,
  advanceToDayFourMara,
  advanceToDayFourLeo,
  startChapter,
  type ChapterStage,
} from '../src/game/chapter';
import { startDialogue, type DialogueStory } from '../src/game/dialogue';
import { millerVisit } from '../src/content/first-day';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { eleanorVisit } from '../src/content/eleanor';
import { thomasVisit } from '../src/content/thomas';
import { irisDecision } from '../src/content/day-four-iris';
import { maraDecision } from '../src/content/day-four-mara';

const transitions: readonly {
  name: string;
  from: ChapterStage;
  to: ChapterStage;
  story: DialogueStory;
  advance: (state: ReturnType<typeof startChapter>) => ReturnType<typeof startChapter>;
}[] = [
  {
    name: 'Miller to Mara',
    from: 'miller',
    to: 'mara',
    story: millerVisit,
    advance: advanceChapter,
  },
  {
    name: 'Iris to Anna',
    from: 'iris',
    to: 'anna',
    story: irisVisit,
    advance: advanceSecondDay,
  },
  { name: 'Anna to Leo', from: 'anna', to: 'leo', story: annaVisit, advance: advanceToLeo },
  {
    name: 'Eleanor to Thomas',
    from: 'eleanor',
    to: 'thomas',
    story: eleanorVisit,
    advance: advanceToThomas,
  },
  {
    name: 'Thomas to Nora',
    from: 'thomas',
    to: 'nora',
    story: thomasVisit,
    advance: advanceToNora,
  },
  {
    name: 'Day-four Iris to Mara',
    from: 'day4-iris',
    to: 'day4-mara',
    story: irisDecision,
    advance: advanceToDayFourMara,
  },
  {
    name: 'Day-four Mara to Leo',
    from: 'day4-mara',
    to: 'day4-leo',
    story: maraDecision,
    advance: advanceToDayFourLeo,
  },
];

describe('character transitions retain dialogue discoveries', () => {
  it.each(transitions)('$name', ({ from, to, story, advance }) => {
    const ending = story.nodes.find((node) => node.options.length === 0);
    expect(ending).toBeDefined();
    const state = {
      ...startChapter(),
      stage: from,
      flags: ['previous_discovery'],
      dialogue: {
        ...startDialogue(story),
        node: ending!.id,
        flags: ['previous_discovery', 'current_dialogue_discovery'],
      },
    };
    const result = advance(state);
    expect(result.stage).toBe(to);
    expect(result.flags).toContain('current_dialogue_discovery');
    expect(result.dialogue.flags).toContain('current_dialogue_discovery');
    expect(result.dialogue.flags).toContain('previous_discovery');
  });
});

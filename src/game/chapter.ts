import { millerVisit } from '../content/first-day';
import { maraVisit } from '../content/mara';
import { firstEvening } from '../content/evening';
import {
  currentNode, selectOption, startDialogue,
  type DialogueState, type DialogueStory,
} from './dialogue';

export type ChapterStage = 'miller' | 'mara' | 'evening' | 'complete';
const stages: readonly ChapterStage[] = ['miller', 'mara', 'evening', 'complete'];

export interface ChapterState {
  readonly stage: ChapterStage;
  readonly dialogue: DialogueState;
  readonly flags: readonly string[];
}

export const stageStory = (stage: ChapterStage): DialogueStory => {
  switch (stage) {
    case 'miller': return millerVisit;
    case 'mara': return maraVisit;
    case 'evening': return firstEvening;
    case 'complete': return firstEvening;
  }
};

export const startChapter = (): ChapterState => ({
  stage: 'miller',
  dialogue: startDialogue(millerVisit),
  flags: [],
});

export function chooseChapterOption(state: ChapterState, id: string): ChapterState {
  if (state.stage === 'complete') throw new Error('Chapter segment completed');
  const next = selectOption(stageStory(state.stage), state.dialogue, id);
  return { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
}

export function advanceChapter(state: ChapterState): ChapterState {
  if (state.stage === 'complete') return state;
  if (currentNode(stageStory(state.stage), state.dialogue).options.length > 0) {
    throw new Error('Finish the conversation before continuing');
  }
  const nextStage = stages[stages.indexOf(state.stage) + 1];
  if (!nextStage) throw new Error('Invalid chapter stage');
  return { ...state, stage: nextStage, dialogue: startDialogue(stageStory(nextStage)) };
}

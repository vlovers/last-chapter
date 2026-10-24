import { leoVisit } from '../content/leo';
import { annaVisit } from '../content/anna';
import { irisVisit } from '../content/iris';
import { millerVisit } from '../content/first-day';
import { maraVisit } from '../content/mara';
import { firstEvening } from '../content/evening';
import {
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
  type DialogueStory,
} from './dialogue';

export type ChapterStage = 'miller' | 'mara' | 'evening' | 'complete' | 'iris' | 'anna' | 'leo' | 'day2-complete';
const stages: readonly ChapterStage[] = ['miller', 'mara', 'evening', 'complete'];

export interface ChapterState {
  readonly stage: ChapterStage;
  readonly dialogue: DialogueState;
  readonly flags: readonly string[];
}

export const stageStory = (stage: ChapterStage): DialogueStory => {
  switch (stage) {
    case 'miller':
      return millerVisit;
    case 'mara':
      return maraVisit;
    case 'evening':
      return firstEvening;
    case 'complete':
      return firstEvening;
    case 'iris':
      return irisVisit;
    case 'anna':
      return annaVisit;
    case 'leo':
    case 'day2-complete':
      return leoVisit;
  }
};

export const startChapter = (): ChapterState => ({
  stage: 'miller',
  dialogue: startDialogue(millerVisit),
  flags: [],
});

export function chooseChapterOption(state: ChapterState, id: string): ChapterState {
  if (state.stage === 'complete' || state.stage === 'day2-complete') throw new Error('Chapter segment completed');
  const next = selectOption(stageStory(state.stage), state.dialogue, id);
  return { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
}

export function advanceChapter(state: ChapterState): ChapterState {
  if (state.stage === 'complete' || state.stage === 'day2-complete') return state;
  if (currentNode(stageStory(state.stage), state.dialogue).options.length > 0) {
    throw new Error('Finish the conversation before continuing');
  }
  const nextStage = stages[stages.indexOf(state.stage) + 1];
  if (!nextStage) throw new Error('Invalid chapter stage');
  return { ...state, stage: nextStage, dialogue: { ...startDialogue(stageStory(nextStage)), flags: state.flags } };
}

/** Explicitly begin Day 2, preserving discoveries and consent decisions from Day 1. */
export function startSecondDay(state: ChapterState): ChapterState {
  if (state.stage !== 'complete') throw new Error('Finish Day 1 before starting Day 2');
  return { ...state, stage: 'iris', dialogue: { ...startDialogue(irisVisit), flags: state.flags } };
}

/** Day 2 currently contains an Iris encounter; later scenes will be inserted before its end. */
export function finishSecondDay(state: ChapterState): ChapterState {
  if (state.stage !== 'leo') throw new Error('Finish all Day 2 visits first');
  if (currentNode(leoVisit, state.dialogue).options.length) throw new Error('Finish the conversation');
  return { ...state, stage: 'day2-complete' };
}

/** Move from the Iris encounter to Anna, retaining Day 1 and Day 2 flags. */
export function advanceSecondDay(state: ChapterState): ChapterState {
  if (state.stage !== 'iris') throw new Error('Finish Day 1 before meeting Anna');
  if (currentNode(irisVisit, state.dialogue).options.length) throw new Error('Finish the Iris conversation');
  return { ...state, stage: 'anna', dialogue: { ...startDialogue(annaVisit), flags: state.flags } };
}

/** Continue Day 2 after Anna's visit. */
export function advanceToLeo(state: ChapterState): ChapterState {
  if (state.stage !== 'anna') throw new Error('Finish Anna first');
  if (currentNode(annaVisit, state.dialogue).options.length) throw new Error('Finish Anna first');
  return { ...state, stage: 'leo', dialogue: { ...startDialogue(leoVisit), flags: state.flags } };
}

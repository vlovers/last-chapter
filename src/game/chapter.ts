import { noraVisit } from '../content/nora';
import { thomasVisit } from '../content/thomas';
import { eleanorVisit } from '../content/eleanor';
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

export type ChapterStage =
  | 'miller'
  | 'mara'
  | 'evening'
  | 'complete'
  | 'iris'
  | 'anna'
  | 'leo'
  | 'day2-complete'
  | 'eleanor'
  | 'thomas'
  | 'nora'
  | 'day3-complete';
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
    case 'eleanor':
      return eleanorVisit;
    case 'thomas':
      return thomasVisit;
    case 'nora':
    case 'day3-complete':
      return noraVisit;
  }
};

export const startChapter = (): ChapterState => ({
  stage: 'miller',
  dialogue: startDialogue(millerVisit),
  flags: [],
});

export function chooseChapterOption(state: ChapterState, id: string): ChapterState {
  if (
    state.stage === 'complete' ||
    state.stage === 'day2-complete' ||
    state.stage === 'day3-complete'
  )
    throw new Error('Chapter segment completed');
  const next = selectOption(stageStory(state.stage), state.dialogue, id);
  return { ...state, dialogue: next, flags: [...new Set([...state.flags, ...next.flags])] };
}

export function advanceChapter(state: ChapterState): ChapterState {
  if (
    state.stage === 'complete' ||
    state.stage === 'day2-complete' ||
    state.stage === 'day3-complete'
  )
    return state;
  if (!['miller', 'mara', 'evening'].includes(state.stage)) {
    throw new Error('Use the explicit Day 2 transitions');
  }
  if (currentNode(stageStory(state.stage), state.dialogue).options.length > 0) {
    throw new Error('Finish the conversation before continuing');
  }
  const nextStage = stages[stages.indexOf(state.stage) + 1];
  if (!nextStage) throw new Error('Invalid chapter stage');
  return {
    ...state,
    stage: nextStage,
    dialogue: { ...startDialogue(stageStory(nextStage)), flags: state.flags },
  };
}

/** Explicitly begin Day 2, preserving discoveries and consent decisions from Day 1. */
export function startSecondDay(state: ChapterState): ChapterState {
  if (state.stage !== 'complete') throw new Error('Finish Day 1 before starting Day 2');
  return { ...state, stage: 'iris', dialogue: { ...startDialogue(irisVisit), flags: state.flags } };
}

/** Finish the current Day 2 sequence after Leo's visit. */
export function finishSecondDay(state: ChapterState): ChapterState {
  if (state.stage !== 'leo') throw new Error('Finish all Day 2 visits first');
  if (currentNode(leoVisit, state.dialogue).options.length)
    throw new Error('Finish the conversation');
  return { ...state, stage: 'day2-complete' };
}

/** Move from the Iris encounter to Anna, retaining Day 1 and Day 2 flags. */
export function advanceSecondDay(state: ChapterState): ChapterState {
  if (state.stage !== 'iris') throw new Error('Finish Day 1 before meeting Anna');
  if (currentNode(irisVisit, state.dialogue).options.length)
    throw new Error('Finish the Iris conversation');
  return { ...state, stage: 'anna', dialogue: { ...startDialogue(annaVisit), flags: state.flags } };
}

/** Continue Day 2 after Anna's visit. */
export function advanceToLeo(state: ChapterState): ChapterState {
  if (state.stage !== 'anna') throw new Error('Finish Anna first');
  if (currentNode(annaVisit, state.dialogue).options.length) throw new Error('Finish Anna first');
  return { ...state, stage: 'leo', dialogue: { ...startDialogue(leoVisit), flags: state.flags } };
}

/** Start Day 3 after all Day 2 conversations, retaining world discoveries. */
export function startThirdDay(state: ChapterState): ChapterState {
  if (state.stage !== 'day2-complete') throw new Error('Finish Day 2 first');
  return {
    ...state,
    stage: 'eleanor',
    dialogue: { ...startDialogue(eleanorVisit), flags: state.flags },
  };
}

/** Finish the current Day 3 sequence after Thomas's visit. */
export function finishThirdDay(state: ChapterState): ChapterState {
  if (state.stage !== 'nora') throw new Error('Finish Nora first');
  if (currentNode(noraVisit, state.dialogue).options.length)
    throw new Error('Finish the conversation');
  return { ...state, stage: 'day3-complete' };
}

/** Advance Day 3 from Eleanor to Thomas without losing previous discoveries. */
export function advanceToThomas(state: ChapterState): ChapterState {
  if (state.stage !== 'eleanor') throw new Error('Finish Eleanor first');
  if (currentNode(eleanorVisit, state.dialogue).options.length)
    throw new Error('Finish Eleanor first');
  return {
    ...state,
    stage: 'thomas',
    dialogue: { ...startDialogue(thomasVisit), flags: state.flags },
  };
}

/** Continue Day 3 from Thomas to Nora, preserving privacy and rumor decisions. */
export function advanceToNora(state: ChapterState): ChapterState {
  if (state.stage !== 'thomas') throw new Error('Finish Thomas first');
  if (currentNode(thomasVisit, state.dialogue).options.length) throw new Error('Finish Thomas first');
  return { ...state, stage: 'nora', dialogue: { ...startDialogue(noraVisit), flags: state.flags } };
}

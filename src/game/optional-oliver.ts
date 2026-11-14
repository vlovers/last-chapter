import { oliverUnreadBook } from '../content/optional/oliver';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from './dialogue';
import type { ChapterState } from './chapter';

export const OLIVER_COMPLETED = 'optional_oliver_unread_completed';
export type OliverSession = { readonly dialogue: DialogueState; readonly complete: boolean };

/** A side conversation, never a replacement for the canonical Day 2 chapter. */
export function canStartOliver(chapter: ChapterState): boolean {
  return (
    ['iris', 'anna', 'leo', 'day2-complete'].includes(chapter.stage) &&
    !chapter.flags.includes(OLIVER_COMPLETED)
  );
}

export function startOliver(chapter: ChapterState): OliverSession {
  if (!canStartOliver(chapter)) throw new Error('Oliver is not available');
  return { dialogue: startDialogue(oliverUnreadBook), complete: false };
}

export function chooseOliver(session: OliverSession, choice: string): OliverSession {
  if (session.complete) throw new Error('Oliver conversation already finished');
  const dialogue = selectOption(oliverUnreadBook, session.dialogue, choice);
  return {
    dialogue,
    complete: availableOptions(oliverUnreadBook, dialogue).length === 0,
  };
}

/** Commit only the completion marker to the existing chapter save; no schema change. */
export function finishOliver(chapter: ChapterState, session: OliverSession): ChapterState {
  if (!session.complete) throw new Error('Finish or decline Oliver before leaving');
  if (!canStartOliver(chapter)) throw new Error('Oliver is no longer available');
  return {
    ...chapter,
    flags: [...new Set([...chapter.flags, OLIVER_COMPLETED])],
    dialogue: {
      ...chapter.dialogue,
      flags: [...new Set([...chapter.dialogue.flags, OLIVER_COMPLETED])],
    },
  };
}

export function oliverLine(session: OliverSession) {
  return currentNode(oliverUnreadBook, session.dialogue);
}

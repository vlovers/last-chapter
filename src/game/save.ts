import type { ChapterState, ChapterStage } from './chapter';
import { stageStory } from './chapter';
import { currentNode, restoreDialogueProgress } from './dialogue';
import { noraVisit } from '../content/nora';

export const SAVE_KEY = 'last-chapter:save:v1';
const VERSION = 1;
// History is diagnostic; completed/pending ledgers preserve choice availability.
const MAX_HISTORY = 256;
const MAX_FLAGS = 1024;
const MAX_LEDGER = 2048;

interface SavedChapter {
  version: number;
  stage: ChapterStage;
  node: string;
  flags: string[];
  history: string[];
  completed?: readonly string[];
  pending?: readonly { hub: string; key: string }[];
}

const stages: readonly ChapterStage[] = [
  'miller',
  'mara',
  'evening',
  'complete',
  'iris',
  'anna',
  'leo',
  'day2-complete',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'day3-complete',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day4-complete',
  'day5-reading',
  'season-complete',
];

export function encodeSave(state: ChapterState): string {
  // Reconstruct legacy completion progress before trimming the choice history.
  const dialogue = state.dialogue.completed === undefined
    ? restoreDialogueProgress(stageStory(state.stage), state.dialogue)
    : state.dialogue;
  const save: SavedChapter = {
    version: VERSION,
    stage: state.stage,
    node: state.dialogue.node,
    // Preserve world discoveries and flags produced in the active dialogue.
    flags: [...new Set([...state.flags, ...dialogue.flags])],
    history: dialogue.history.slice(-MAX_HISTORY),
    ...(dialogue.completed !== undefined
      ? { completed: dialogue.completed, pending: dialogue.pending ?? [] }
      : {}),
  };
  return JSON.stringify(save);
}

export function decodeSave(raw: string): ChapterState | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    if (obj.version !== VERSION || !stages.includes(obj.stage as ChapterStage)) return null;
    if (typeof obj.node !== 'string' || !Array.isArray(obj.flags) || !Array.isArray(obj.history))
      return null;
    if (!obj.flags.every((value: unknown) => typeof value === 'string')) return null;
    if (!obj.history.every((value: unknown) => typeof value === 'string')) return null;
    if (obj.flags.length > MAX_FLAGS || obj.history.length > MAX_HISTORY) return null;
    // Save data is untrusted: validate it before loading dialogue content.
    if (new Set(obj.flags).size !== obj.flags.length) return null;
    if (obj.flags.some((flag: string) => !flag || flag.length > 120)) return null;
    if (obj.history.some((id: string) => !id || id.length > 120)) return null;
    const stage = obj.stage as ChapterStage;
    if (
      obj.completed !== undefined &&
      (!Array.isArray(obj.completed) ||
        obj.completed.length > MAX_LEDGER ||
        !obj.completed.every((v: unknown) => typeof v === 'string' && v.length <= 1000) ||
        new Set(obj.completed).size !== obj.completed.length ||
        !Array.isArray(obj.pending) ||
        obj.pending.length > MAX_LEDGER ||
        !obj.pending.every(
          (v: unknown) =>
            !!v &&
            typeof v === 'object' &&
            typeof (v as Record<string, unknown>).hub === 'string' &&
            typeof (v as Record<string, unknown>).key === 'string' &&
            String((v as Record<string, unknown>).key).length <= 1000,
        ))
    )
      return null;
    const dialogue = {
      node: obj.node,
      flags: obj.flags as string[],
      history: obj.history as string[],
      ...(obj.completed !== undefined
        ? {
            completed: obj.completed as string[],
            pending: obj.pending as { hub: string; key: string }[],
          }
        : {}),
    };
    try {
      currentNode(stageStory(stage), dialogue);
    } catch {
      // Older Day 3 saves were created before the book-club finale existed.
      // Preserve their completion checkpoint rather than resetting the entire story.
      if (stage !== 'day3-complete') return null;
      try {
        currentNode(noraVisit, dialogue);
      } catch {
        return null;
      }
    }
    // Keep the original shape for untouched saves; availability lazily migrates
    // old histories. Encoding their next choice writes the explicit ledger.
    return { stage, dialogue, flags: obj.flags as string[] };
  } catch {
    return null;
  }
}

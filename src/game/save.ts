import type { ChapterState, ChapterStage } from './chapter';
import { stageStory } from './chapter';
import { currentNode, restoreDialogueProgress } from './dialogue';
import { noraVisit } from '../content/nora';
import { quietEvening } from '../content/quiet-evening';

export const SAVE_KEY = 'last-chapter:save:v1';
const VERSION = 1;
// Bounded payloads support long authored routes without discarding valid progress.
export const SAVE_LIMITS = {
  bytes: 1_048_576,
  flags: 1024,
  history: 16_384,
  completed: 8192,
  pending: 1024,
} as const;

interface SavedChapter {
  version: number;
  stage: ChapterStage;
  node: string;
  flags: string[];
  history: string[];
  completed?: readonly string[];
  pending?: readonly { hub: string; key: string }[];
}

/** localStorage stores UTF-16 strings, but the save budget is in UTF-8 bytes. */
function exceedsSaveLimit(raw: string): boolean {
  if (raw.length > SAVE_LIMITS.bytes) return true;
  const byteLength = new TextEncoder().encode(raw).byteLength;
  return byteLength > SAVE_LIMITS.bytes;
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
  'quiet-evening',
  'day3-complete',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day4-complete',
  'day5-reading',
  'season-complete',
];

export function encodeSave(state: ChapterState): string {
  let dialogue = state.dialogue;
  if (dialogue.completed === undefined && dialogue.history.length > SAVE_LIMITS.history) {
    try {
      dialogue = restoreDialogueProgress(stageStory(state.stage), dialogue);
    } catch {
      if (state.stage !== 'day3-complete') throw new Error('Invalid legacy dialogue save');
      try {
        dialogue = restoreDialogueProgress(quietEvening, dialogue);
      } catch {
        dialogue = restoreDialogueProgress(noraVisit, dialogue);
      }
    }
  }
  const save: SavedChapter = {
    version: VERSION,
    stage: state.stage,
    node: state.dialogue.node,
    // Preserve world discoveries and flags produced in the active dialogue.
    flags: [...new Set([...state.flags, ...dialogue.flags])],
    // Once an explicit completion ledger exists, old history is diagnostic only.
    // Keep a recent window rather than writing a save our own decoder rejects.
    history:
      dialogue.completed !== undefined
        ? dialogue.history.slice(-SAVE_LIMITS.history)
        : [...dialogue.history],
    ...(dialogue.completed !== undefined
      ? { completed: dialogue.completed, pending: dialogue.pending ?? [] }
      : {}),
  };
  const serialized = JSON.stringify(save);
  if (exceedsSaveLimit(serialized)) throw new Error('Save exceeds byte limit');
  // Never write a save that our own decoder would discard on the next launch.
  // This also covers ledger/flag limits and invalid dialogue nodes, not just bytes.
  if (decodeSave(serialized) === null) throw new Error('Save cannot be restored');
  return serialized;
}

export function decodeSave(raw: string): ChapterState | null {
  try {
    if (exceedsSaveLimit(raw)) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    if (obj.version !== VERSION || !stages.includes(obj.stage as ChapterStage)) return null;
    if (typeof obj.node !== 'string' || !Array.isArray(obj.flags) || !Array.isArray(obj.history))
      return null;
    if (!obj.flags.every((value: unknown) => typeof value === 'string')) return null;
    if (!obj.history.every((value: unknown) => typeof value === 'string')) return null;
    if (obj.flags.length > SAVE_LIMITS.flags || obj.history.length > SAVE_LIMITS.history)
      return null;
    // Save data is untrusted: validate it before loading dialogue content.
    if (new Set(obj.flags).size !== obj.flags.length) return null;
    if (obj.flags.some((flag: string) => !flag || flag.length > 120)) return null;
    if (obj.history.some((id: string) => !id || id.length > 120)) return null;
    // A pending ledger without its completed counterpart cannot be replayed
    // reliably; do not silently discard half of a save's topic progress.
    if (obj.pending !== undefined && obj.completed === undefined) return null;
    const stage = obj.stage as ChapterStage;
    if (
      obj.completed !== undefined &&
      (!Array.isArray(obj.completed) ||
        obj.completed.length > SAVE_LIMITS.completed ||
        !obj.completed.every(
          (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 1000,
        ) ||
        new Set(obj.completed).size !== obj.completed.length ||
        !Array.isArray(obj.pending) ||
        obj.pending.length > SAVE_LIMITS.pending ||
        !obj.pending.every(
          (v: unknown) =>
            !!v &&
            typeof v === 'object' &&
            typeof (v as Record<string, unknown>).hub === 'string' &&
            String((v as Record<string, unknown>).hub).length > 0 &&
            String((v as Record<string, unknown>).hub).length <= 120 &&
            typeof (v as Record<string, unknown>).key === 'string' &&
            String((v as Record<string, unknown>).key).length > 0 &&
            String((v as Record<string, unknown>).key).length <= 1000,
        ) ||
        new Set(
          (obj.pending as { hub: string; key: string }[]).map(({ hub, key }) =>
            JSON.stringify([hub, key]),
          ),
        ).size !== obj.pending.length
      )
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
        try {
          currentNode(quietEvening, dialogue);
        } catch {
          return null;
        }
      }
    }
    // A completed day-three checkpoint can originate from Nora, the book club,
    // or the optional quiet evening. Its dialogue node is historical, not an
    // active scene; preserve it even if later content changes the stage graph.
    // Keep the original shape for untouched saves; availability lazily migrates
    // old histories. Encoding their next choice writes the explicit ledger.
    return { stage, dialogue, flags: obj.flags as string[] };
  } catch {
    return null;
  }
}

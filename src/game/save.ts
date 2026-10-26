import type { ChapterState, ChapterStage } from './chapter';
import { stageStory } from './chapter';
import { currentNode } from './dialogue';
import { noraVisit } from '../content/nora';

export const SAVE_KEY = 'last-chapter:save:v1';
const VERSION = 1;

interface SavedChapter {
  version: number;
  stage: ChapterStage;
  node: string;
  flags: string[];
  history: string[];
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
  const save: SavedChapter = {
    version: VERSION,
    stage: state.stage,
    node: state.dialogue.node,
    flags: [...state.flags],
    history: [...state.dialogue.history],
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
    if (obj.flags.length > 128 || obj.history.length > 256) return null;
    // Save data is untrusted: validate flag and history limits before loading dialogue content.
    if (new Set(obj.flags).size !== obj.flags.length) return null;
    if (obj.flags.some((flag: string) => !flag || flag.length > 120)) return null;
    if (obj.history.some((id: string) => !id || id.length > 120)) return null;
    const stage = obj.stage as ChapterStage;
    const dialogue = {
      node: obj.node,
      flags: obj.flags as string[],
      history: obj.history as string[],
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
    if (obj.flags.length > 128 || obj.history.length > 256) return null;
    // Save data is untrusted: a malformed payload must never bypass a dialogue gate.
    if (new Set(obj.flags).size !== obj.flags.length) return null;
    if (obj.flags.some((flag: string) => !flag || flag.length > 120)) return null;
    if (obj.history.some((id: string) => !id || id.length > 120)) return null;
    return { stage, dialogue, flags: obj.flags as string[] };
  } catch {
    return null;
  }
}

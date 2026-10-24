import type { ChapterState, ChapterStage } from './chapter';
import { stageStory } from './chapter';
import { currentNode } from './dialogue';

export const SAVE_KEY = 'last-chapter:save:v1';
const VERSION = 1;

interface SavedChapter {
  version: number;
  stage: ChapterStage;
  node: string;
  flags: string[];
  history: string[];
}

const stages: readonly ChapterStage[] = ['miller', 'mara', 'evening', 'complete', 'iris', 'day2-complete'];

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
    const stage = obj.stage as ChapterStage;
    const dialogue = {
      node: obj.node,
      flags: obj.flags as string[],
      history: obj.history as string[],
    };
    currentNode(stageStory(stage), dialogue);
    if (obj.flags.length > 128 || obj.history.length > 256) return null;
    return { stage, dialogue, flags: obj.flags as string[] };
  } catch {
    return null;
  }
}

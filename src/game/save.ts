import type { ChapterState, ChapterStage } from './chapter';
import { stageStory } from './chapter';
import { currentNode, startDialogue } from './dialogue';
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
    let stage = obj.stage as ChapterStage;
    let dialogue = {
      node: obj.node,
      flags: obj.flags as string[],
      history: obj.history as string[],
    };
    // Earlier prototypes marked Day 4 complete after Iris or Mara, before
    // the remaining encounters were implemented. Resume at the missing visit.
    if (stage === 'day4-complete' && obj.node === 'end') {
      const flags = obj.flags as string[];
      const hasLeo = flags.some(
        (flag) =>
          flag.startsWith('leo_') &&
          (flag.includes('day4') ||
            [
              'leo_understood_timeline',
              'leo_open_to_conversation',
              'leo_letter_consent_respected',
              'leo_respected_mara_relationship',
              'leo_supported_mutual_consent',
            ].includes(flag)),
      );
      const hasMara = flags.some(
        (flag) =>
          flag.startsWith('mara_') &&
          [
            'mara_supported_independence',
            'mara_letter_privacy_respected',
            'mara_letter_pressured',
            'mara_gift_encouraged',
            'mara_future_supported',
          ].includes(flag),
      );
      const hasIris = flags.some(
        (flag) =>
          flag.startsWith('iris_') &&
          [
            'iris_letter_choice_respected',
            'iris_letter_delivery_offered',
            'iris_letter_pressured_day4',
            'iris_offered_exhibition',
            'iris_supported_autonomy',
          ].includes(flag),
      );
      if (!hasLeo && hasMara) {
        stage = 'day4-leo';
        dialogue = { ...startDialogue(stageStory(stage)), flags, history: [] };
      } else if (!hasLeo && hasIris) {
        stage = 'day4-mara';
        dialogue = { ...startDialogue(stageStory(stage)), flags, history: [] };
      }
    }
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

import { bellwickSchedule, bellwickStory, type BellwickEncounterId } from './bellwick-schedule';
import { selectOption, startDialogue, type DialogueState } from '../game/dialogue';

export interface BellwickProgress {
  readonly finished: readonly BellwickEncounterId[];
  readonly sessions: Partial<Record<BellwickEncounterId, DialogueState>>;
}

export const freshBellwickProgress = (): BellwickProgress => ({ finished: [], sessions: {} });

function validId(value: string): value is BellwickEncounterId {
  return bellwickSchedule.some((scene) => scene.id === value);
}

/** Replay recorded choices instead of trusting forged or stale node/flag values. */
export function decodeBellwickProgress(raw: string | null): BellwickProgress {
  if (!raw) return freshBellwickProgress();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return freshBellwickProgress();
    const record = parsed as Record<string, unknown>;
    if (!Array.isArray(record.finished)) return freshBellwickProgress();
    const finished = [
      ...new Set(
        record.finished.filter(
          (id): id is BellwickEncounterId => typeof id === 'string' && validId(id),
        ),
      ),
    ];
    const sessions: Partial<Record<BellwickEncounterId, DialogueState>> = {};
    if (record.sessions && typeof record.sessions === 'object' && !Array.isArray(record.sessions)) {
      for (const [id, value] of Object.entries(record.sessions)) {
        if (!validId(id) || finished.includes(id) || !value || typeof value !== 'object') continue;
        const candidate = value as Record<string, unknown>;
        if (
          typeof candidate.node !== 'string' ||
          !Array.isArray(candidate.history) ||
          candidate.history.length > 100 ||
          !candidate.history.every((choice) => typeof choice === 'string')
        )
          continue;
        try {
          const story = bellwickStory(id);
          let replay = startDialogue(story);
          for (const choice of candidate.history)
            replay = selectOption(story, replay, choice as string);
          if (replay.node === candidate.node) sessions[id] = replay;
        } catch {
          /* ignore corrupt scene, keep others */
        }
      }
    }
    return { finished, sessions };
  } catch {
    return freshBellwickProgress();
  }
}

export function encodeBellwickProgress(progress: BellwickProgress): string {
  return JSON.stringify(progress);
}

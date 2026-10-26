import { currentNode, selectOption, startDialogue, type DialogueState } from '../game/dialogue';
import { oliverUnreadBook } from '../content/optional/oliver';

export interface OliverProgress {
  readonly finished: boolean;
  readonly dialogue: DialogueState;
}

export const freshOliverProgress = (): OliverProgress => ({
  finished: false,
  dialogue: startDialogue(oliverUnreadBook),
});

export function decodeOliverProgress(raw: string | null): OliverProgress {
  if (!raw) return freshOliverProgress();
  // Legacy save stored only the completion marker.
  if (raw === 'done') return { ...freshOliverProgress(), finished: true };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return freshOliverProgress();
    const value = parsed as Record<string, unknown>;
    if (typeof value.finished !== 'boolean') return freshOliverProgress();
    if (!value.dialogue || typeof value.dialogue !== 'object') return freshOliverProgress();
    const state = value.dialogue as Record<string, unknown>;
    if (
      typeof state.node !== 'string' ||
      !Array.isArray(state.flags) ||
      !state.flags.every((flag) => typeof flag === 'string') ||
      !Array.isArray(state.history) ||
      !state.history.every((id) => typeof id === 'string')
    )
      return freshOliverProgress();
    if (
      (state.completed !== undefined &&
        (!Array.isArray(state.completed) ||
          !state.completed.every((id) => typeof id === 'string'))) ||
      (state.pending !== undefined &&
        (!Array.isArray(state.pending) ||
          !state.pending.every(
            (entry) =>
              entry !== null &&
              typeof entry === 'object' &&
              typeof (entry as Record<string, unknown>).hub === 'string' &&
              typeof (entry as Record<string, unknown>).key === 'string',
          )))
    )
      return freshOliverProgress();
    // A valid node name alone is insufficient: never restore an impossible path.
    let replay = startDialogue(oliverUnreadBook);
    for (const optionId of state.history) {
      replay = selectOption(oliverUnreadBook, replay, optionId as string);
    }
    if (replay.node !== state.node) return freshOliverProgress();
    const dialogue = replay;
    currentNode(oliverUnreadBook, dialogue);
    return { finished: value.finished, dialogue };
  } catch {
    return freshOliverProgress();
  }
}

export function encodeOliverProgress(progress: OliverProgress): string {
  return JSON.stringify(progress);
}

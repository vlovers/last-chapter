import { SAVE_KEY } from '../game/save';
import { SERVICE_KEY } from '../game/recommendation';
import { OPTIONAL_PROGRESS_KEYS } from './optional-progress';

export const RECOVERY_KEY = 'last-chapter:save:recovery:v1';

interface RecoverySnapshot {
  entries: Record<string, string>;
}

/** Preserve original bytes for repair; never guess story facts from a rejected save. */
export function preserveUnreadableProgress(raw: string): string | null {
  try {
    const entries: Record<string, string> = { [SAVE_KEY]: raw };
    for (const key of [SERVICE_KEY, ...Object.values(OPTIONAL_PROGRESS_KEYS)]) {
      const value = localStorage.getItem(key);
      if (value !== null) entries[key] = value;
    }
    const previous = localStorage.getItem(RECOVERY_KEY);
    let snapshots: RecoverySnapshot[] = [];
    if (previous !== null) {
      const archive: unknown = JSON.parse(previous);
      if (!archive || typeof archive !== 'object' || Array.isArray(archive)) return null;
      const value = archive as Record<string, unknown>;
      if (
        value.version !== 1 ||
        !Array.isArray(value.snapshots) ||
        !value.snapshots.every((snapshot: unknown) => {
          if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false;
          const data = (snapshot as Record<string, unknown>).entries;
          return (
            !!data &&
            typeof data === 'object' &&
            !Array.isArray(data) &&
            Object.values(data).every((entry) => typeof entry === 'string')
          );
        })
      )
        return null;
      snapshots = value.snapshots as RecoverySnapshot[];
    }
    // Repeated loads of an unchanged broken record must not grow the archive.
    const snapshot = JSON.stringify({ entries });
    if (!snapshots.some((entry) => JSON.stringify(entry) === snapshot)) {
      snapshots = [...snapshots, { entries }];
    }
    const backup = JSON.stringify({ version: 1, snapshots });
    localStorage.setItem(RECOVERY_KEY, backup);
    // A failed or no-op backup must never authorize clearing the original data.
    return localStorage.getItem(RECOVERY_KEY) === backup ? backup : null;
  } catch {
    return null;
  }
}

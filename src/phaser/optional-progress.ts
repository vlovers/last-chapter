/** Optional journal and conversation data belongs to the current narrative save. */
export const OPTIONAL_PROGRESS_KEYS = {
  bookClub: 'last-chapter:conversation:mara:v1',
  afterHours: 'last-chapter:conversation:mara:after-hours:v1',
  returnVisit: 'last-chapter:conversation:mara:return:v1',
  letter: 'last-chapter:conversation:mara:letter:v1',
  notes: 'last-chapter:notes:v1',
} as const;

/** A missing or invalid chapter save must not resurrect conversations from an old game. */
export function discardOrphanedOptionalProgress(): void {
  for (const key of Object.values(OPTIONAL_PROGRESS_KEYS)) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Some storage adapters deny deletion but still permit overwriting.
      try {
        localStorage.setItem(key, '');
      } catch {
        // Storage is optional; the player can continue without persistence.
      }
    }
  }
}

import type { FiveDayStory } from './five-day-story';

/** UI identifiers only: all prose and availability come from the player's current knowledge. */
export function journalEntries(story: FiveDayStory) {
  return {
    clues: [
      ...story.knownEvidence.map((entry) => ({ ...entry, id: `known:${entry.title}` })),
      ...story.evidence
        .filter((clue) => clue.collected)
        .map((clue) => ({
          id: `clue:${clue.id}`,
          title: clue.label,
          kind: clue.kind,
          source: 'Огляд книгарні',
          detail: clue.detail,
        })),
    ],
    events: story.notes
      .filter((note) => !note.startsWith('Чутка:'))
      .map((detail) => ({ id: `event:${detail}`, detail })),
    rumors: story.notes
      .filter((note) => note.startsWith('Чутка:'))
      .map((detail) => ({ id: `rumor:${detail}`, detail })),
  };
}

export function unreadJournalIds(story: FiveDayStory, seen: ReadonlySet<string>): string[] {
  const entries = journalEntries(story);
  return [...entries.clues, ...entries.events, ...entries.rumors]
    .map((entry) => entry.id)
    .filter((id) => !seen.has(id));
}

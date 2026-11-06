import type { ConversationSession, ConversationTopic } from './conversation-engine';
import { maraBookClub } from './mara-book-club';
import { maraAfterHours } from './mara-after-hours';
import { maraReturnVisit } from './mara-return-visit';
import { maraLetterDecision } from './mara-letter-decision';

/** One source of truth for which optional scenes are available on each story day. */
export function availableMaraTopics(
  day: number,
  letterSession?: ConversationSession,
): readonly ConversationTopic[] {
  const topics: ConversationTopic[] = [maraBookClub, maraAfterHours];
  // A later meeting can introduce the letter on its own. Once it has begun,
  // resuming the earlier, undecided meeting would reverse Mara's chronology.
  const laterMeetingStarted =
    letterSession?.topic === maraLetterDecision.id &&
    (letterSession.node !== maraLetterDecision.entry || letterSession.finished);
  if (day >= 3 && !laterMeetingStarted) topics.push(maraReturnVisit);
  if (day >= 4) topics.push(maraLetterDecision);
  return topics;
}

export function allowedMaraTopic(
  day: number,
  selected: ConversationTopic,
  letterSession?: ConversationSession,
): ConversationTopic {
  return (
    availableMaraTopics(day, letterSession).find((topic) => topic.id === selected.id) ??
    maraBookClub
  );
}

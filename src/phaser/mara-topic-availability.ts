import type { ConversationTopic } from './conversation-engine';
import { maraBookClub } from './mara-book-club';
import { maraAfterHours } from './mara-after-hours';
import { maraReturnVisit } from './mara-return-visit';
import { maraLetterDecision } from './mara-letter-decision';

/** One source of truth for which optional scenes are available on each story day. */
export function availableMaraTopics(day: number): readonly ConversationTopic[] {
  const topics: ConversationTopic[] = [maraBookClub, maraAfterHours];
  if (day >= 3) topics.push(maraReturnVisit);
  if (day >= 4) topics.push(maraLetterDecision);
  return topics;
}

export function allowedMaraTopic(day: number, selected: ConversationTopic): ConversationTopic {
  return availableMaraTopics(day).find((topic) => topic.id === selected.id) ?? maraBookClub;
}

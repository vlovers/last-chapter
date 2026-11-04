import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  conversationView,
  restoreConversation,
  startConversation,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';
import { allowedMaraTopic, availableMaraTopics } from '../src/phaser/mara-topic-availability';

function follow(topic: ConversationTopic, choices: string[], memories: string[] = []) {
  let session = startConversation(topic, memories);
  for (const choice of choices) {
    session = answerConversation(topic, session, choice);
    const restored = restoreConversation(topic, JSON.stringify(session));
    expect(restored).toEqual(session);
    session = restored!;
  }
  return session;
}

describe('Mara optional meetings retain their chronology', () => {
  it.each(['choice', 'curious', 'time'])(
    'supports consecutive meetings on day four after the %s answer',
    (choice) => {
      expect(availableMaraTopics(4)).toContain(maraReturnVisit);
      expect(availableMaraTopics(4)).toContain(maraLetterDecision);
      const earlier = follow(maraReturnVisit, ['listen', choice]);
      const later = startConversation(maraLetterDecision, earlier.memories);
      expect(conversationView(maraLetterDecision, later).text).not.toMatch(
        /весь тиждень|кілька днів|весь день/iu,
      );
      const decision = follow(maraLetterDecision, ['ask'], earlier.memories);
      expect(conversationView(maraLetterDecision, decision).text).toMatch(
        /на зустріч не погодилася|до зустрічі не готова|не готова до зустрічі/iu,
      );
      expect(availableMaraTopics(4, decision)).not.toContain(maraReturnVisit);
    },
  );

  it('does not reopen uncertainty after a stand-alone resolution and save restoration', () => {
    const later = follow(maraLetterDecision, ['ask', 'support', 'exit']);
    expect(later.finished).toBe(true);
    expect(availableMaraTopics(5, later)).not.toContain(maraReturnVisit);
    expect(allowedMaraTopic(5, maraReturnVisit, later)).not.toBe(maraReturnVisit);
  });

  it('also protects legacy saves at the decision without a new memory flag', () => {
    const legacy = {
      ...startConversation(maraLetterDecision),
      node: 'decision',
    };
    const restored = restoreConversation(maraLetterDecision, JSON.stringify(legacy));
    expect(restored).not.toBeNull();
    expect(availableMaraTopics(4, restored!)).not.toContain(maraReturnVisit);
  });

  it('keeps the earlier meeting available when the later invitation is deferred', () => {
    const later = follow(maraLetterDecision, ['later']);
    expect(later.suspended).toBe(true);
    expect(availableMaraTopics(4, later)).toContain(maraReturnVisit);
  });

  it('does not mistake an unrelated conversation session for a later meeting', () => {
    const book = follow(maraBookClub, ['empathy']);
    expect(availableMaraTopics(4, book)).toContain(maraReturnVisit);
  });

  it('answers the personal question in the book club without exposing another person', () => {
    const session = follow(maraBookClub, ['rhys', 'agency', 'question']);
    const text = conversationView(maraBookClub, session).text;
    expect(text).toContain('Так, про конкретну людину');
    expect(text).toContain('Ім’я поки залишу при собі');
  });

  it('answers whether Mara still speaks to the person before closing the conversation', () => {
    const session = follow(maraAfterHours, ['tamlin', 'motives', 'personal', 'question']);
    expect(conversationView(maraAfterHours, session).text).toContain(
      'Ми майже перестали спілкуватися',
    );
  });

  it('gives distinct immediate replies to empathy and accountability after a reload', () => {
    const empathy = follow(maraBookClub, ['empathy']);
    const critical = follow(maraBookClub, ['critical']);
    expect(empathy.memories).toContain('mara:tamlin:empathy');
    expect(critical.memories).toContain('mara:tamlin:accountability');
    expect(conversationView(maraBookClub, empathy).text).not.toEqual(
      conversationView(maraBookClub, critical).text,
    );
  });

  it('can resume the Tamlin discussion without inventing a whole day between replies', () => {
    const session = follow(maraAfterHours, ['tamlin', 'exit']);
    expect(session.suspended).toBeUndefined();
    const opening = startConversation(maraAfterHours, session.memories);
    expect(conversationView(maraAfterHours, opening).text).not.toContain('весь день');
  });
});

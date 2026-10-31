import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  conversationView,
  restoreConversation,
  startConversation,
  type ConversationSession,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';

const roundTrip = (topic: ConversationTopic, session: ConversationSession) =>
  restoreConversation(topic, JSON.stringify(session));

const interruptions: readonly {
  name: string;
  topic: ConversationTopic;
  choices: readonly string[];
  node: string;
}[] = [
  { name: 'book club', topic: maraBookClub, choices: ['empathy', 'exit'], node: 'tamlin' },
  {
    name: 'after-hours debate',
    topic: maraAfterHours,
    choices: ['tamlin', 'motives', 'exit'],
    node: 'motives',
  },
  { name: 'return visit', topic: maraReturnVisit, choices: ['busy'], node: 'opening' },
  { name: 'letter decision', topic: maraLetterDecision, choices: ['later'], node: 'arrival' },
];

describe('optional conversations survive interruption and save restoration', () => {
  it.each(interruptions)(
    'restores a suspended $name without completing it',
    ({ topic, choices, node }) => {
      let session = startConversation(topic);
      for (const choice of choices) session = answerConversation(topic, session, choice);

      expect(session.suspended).toBe(true);
      expect(session.finished).toBe(false);
      const restored = roundTrip(topic, session);
      expect(restored).toEqual(session);
      expect(conversationView(topic, restored!).id).toBe(node);
    },
  );

  it('resumes the same book-club choice after reloading and clears the interruption', () => {
    let session = answerConversation(maraBookClub, startConversation(maraBookClub), 'empathy');
    const pendingBefore = session.pending;
    session = answerConversation(maraBookClub, session, 'exit');
    const restored = roundTrip(maraBookClub, session)!;

    expect(restored.pending).toEqual(pendingBefore);
    const resumed = answerConversation(maraBookClub, restored, 'motives');
    expect(resumed.suspended).toBeUndefined();
    expect(resumed.node).toBe('rhys');
    expect(resumed.memories).toContain('mara:tamlin:empathy');
    expect(roundTrip(maraBookClub, resumed)).toEqual(resumed);
  });

  it('does not turn a suspended letter conversation into a completed one after reload', () => {
    const interrupted = answerConversation(
      maraLetterDecision,
      startConversation(maraLetterDecision),
      'later',
    );
    const restored = roundTrip(maraLetterDecision, interrupted)!;
    const continued = answerConversation(maraLetterDecision, restored, 'ask');

    expect(continued.node).toBe('decision');
    expect(continued.finished).toBe(false);
    expect(continued.suspended).toBeUndefined();
  });

  it('rejects non-boolean interruption metadata and impossible finished interruptions', () => {
    const active = startConversation(maraBookClub);
    expect(roundTrip(maraBookClub, { ...active, suspended: true })).toEqual({
      ...active,
      suspended: true,
    });
    expect(
      restoreConversation(maraBookClub, JSON.stringify({ ...active, suspended: 'yes' })),
    ).toBeNull();
    const finished = answerConversation(maraBookClub, active, 'leave');
    expect(
      restoreConversation(maraBookClub, JSON.stringify({ ...finished, suspended: true })),
    ).toBeNull();
  });

  it.each([
    'not-json',
    '["welcome"]',
    '["welcome","empathy","extra"]',
    '["welcome",null]',
    '[ "welcome", "empathy" ]',
  ])('rejects a malformed pending completion key: %s', (key) => {
    const session = answerConversation(maraBookClub, startConversation(maraBookClub), 'empathy');
    expect(
      roundTrip(maraBookClub, {
        ...session,
        pending: [{ node: 'welcome', key }],
      }),
    ).toBeNull();
  });

  it('rejects pending keys whose encoded source differs from the pending node', () => {
    const session = answerConversation(maraBookClub, startConversation(maraBookClub), 'empathy');
    expect(
      roundTrip(maraBookClub, {
        ...session,
        pending: [{ node: 'rhys', key: session.pending![0]!.key }],
      }),
    ).toBeNull();
  });

  it('rejects malformed completed keys without discarding valid older choice identifiers', () => {
    const finished = answerConversation(maraBookClub, startConversation(maraBookClub), 'leave');
    expect(roundTrip(maraBookClub, { ...finished, completed: ['not-a-choice-key'] })).toBeNull();
    const retired = JSON.stringify(['retired-node', 'retired-choice']);
    expect(roundTrip(maraBookClub, { ...finished, completed: [retired] })).toEqual({
      ...finished,
      completed: [retired],
    });
  });

  it('preserves legacy sessions without ledgers or interruption metadata', () => {
    const legacy = startConversation(maraBookClub);
    expect(roundTrip(maraBookClub, legacy)).toEqual(legacy);
  });
});

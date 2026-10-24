import { describe, expect, it } from 'vitest';
import { answerConversation, conversationView, startConversation, validateTopic } from '../src/phaser/conversation-engine';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';

describe('Mara letter resolution', () => {
  it('has reachable nodes and an exit from every branch', () => {
    expect(validateTopic(maraLetterDecision)).toEqual([]);
  });
  it('acknowledges the earlier choice to give Mara autonomy', () => {
    const session = startConversation(maraLetterDecision, ['return:autonomy']);
    expect(conversationView(maraLetterDecision, session).text).toContain('не зобов’язана');
    const letter = answerConversation(maraLetterDecision, session, 'ask');
    expect(conversationView(maraLetterDecision, letter).text).toContain('третій шлях');
  });
  it('can be left without a penalty', () => {
    const session = answerConversation(maraLetterDecision, startConversation(maraLetterDecision), 'later');
    expect(session.finished).toBe(true);
  });
  it('remembers a supportive answer', () => {
    let session = startConversation(maraLetterDecision);
    session = answerConversation(maraLetterDecision, session, 'ask');
    session = answerConversation(maraLetterDecision, session, 'support');
    expect(session.memories).toContain('letter:affirmed');
  });
});

import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  conversationView,
  startConversation,
  validateTopic,
} from '../src/phaser/conversation-engine';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';

describe('Mara letter resolution', () => {
  it('has reachable nodes and an exit from every branch', () => {
    expect(validateTopic(maraLetterDecision)).toEqual([]);
  });
  it('stands alone when the earlier optional conversations were skipped', () => {
    const session = startConversation(maraLetterDecision);
    expect(conversationView(maraLetterDecision, session).text).toContain('Мені написала людина');
    expect(conversationView(maraLetterDecision, session).text).not.toContain('Пам’ятаєш лист');

    const decision = answerConversation(maraLetterDecision, session, 'ask');
    expect(conversationView(maraLetterDecision, decision).text).toContain('давно не розмовляла');
    const reflection = answerConversation(maraLetterDecision, decision, 'support');
    expect(conversationView(maraLetterDecision, reflection).text).toContain('У книжках');
    expect(conversationView(maraLetterDecision, reflection).text).not.toContain('ми говорили');
  });
  it('only recalls a Tamlin debate when that memory exists', () => {
    let session = startConversation(maraLetterDecision, ['after:tamlin']);
    session = answerConversation(maraLetterDecision, session, 'ask');
    session = answerConversation(maraLetterDecision, session, 'support');
    expect(conversationView(maraLetterDecision, session).text).toContain('Пам’ятаєш нашу суперечку');
  });
  it('acknowledges the earlier choice to give Mara autonomy', () => {
    const session = startConversation(maraLetterDecision, ['return:autonomy']);
    expect(conversationView(maraLetterDecision, session).text).toContain('не зобов’язана');
    const letter = answerConversation(maraLetterDecision, session, 'ask');
    expect(conversationView(maraLetterDecision, letter).text).toContain('третій шлях');
  });
  it('can be left without a penalty', () => {
    const session = answerConversation(
      maraLetterDecision,
      startConversation(maraLetterDecision),
      'later',
    );
    expect(session.finished).toBe(true);
  });
  it('remembers a supportive answer', () => {
    let session = startConversation(maraLetterDecision);
    session = answerConversation(maraLetterDecision, session, 'ask');
    session = answerConversation(maraLetterDecision, session, 'support');
    expect(session.memories).toContain('letter:affirmed');
  });
});

import { describe, expect, it } from 'vitest';
import { answerConversation, conversationView, restoreConversation, startConversation, validateTopic } from '../src/phaser/conversation-engine';
import { maraBookClub } from '../src/phaser/mara-book-club';

describe('optional book-club conversation', () => {
  it('has no missing targets or unreachable nodes', () => {
    expect(validateTopic(maraBookClub)).toEqual([]);
  });
  it('allows leaving immediately without a penalty', () => {
    const session = startConversation(maraBookClub);
    const result = answerConversation(maraBookClub, session, 'leave');
    expect(result.finished).toBe(true);
    expect(result.memories).toEqual([]);
  });
  it('remembers player stance and branches through Frank', () => {
    let s = startConversation(maraBookClub);
    s = answerConversation(maraBookClub, s, 'rhys');
    s = answerConversation(maraBookClub, s, 'cat');
    s = answerConversation(maraBookClub, s, 'boss');
    expect(s.memories).toContain('mara:rhys:double-standard');
    expect(s.memories).toContain('mara:frank:boss');
    expect(conversationView(maraBookClub, s).id).toBe('frank-story');
    expect(restoreConversation(maraBookClub, JSON.stringify(s))).toEqual(s);
  });
  it('rejects unknown and inaccessible options', () => {
    expect(() => answerConversation(maraBookClub, startConversation(maraBookClub), 'not-a-choice')).toThrow();
  });
  it('rejects tampered session state', () => {
    expect(restoreConversation(maraBookClub, '{"topic":"mara.book-club.v1","node":"bad","memories":[],"finished":false}')).toBeNull();
  });
});

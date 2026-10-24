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
  it('detects a reachable conversation loop with no way to leave', () => {
    expect(validateTopic({
      id: 'trapped', title: 'Trapped', entry: 'a',
      nodes: [
        { id: 'a', speaker: 'A', text: 'Hello', choices: [{ id: 'next', label: 'Next', next: 'b' }] },
        { id: 'b', speaker: 'B', text: 'Again', choices: [{ id: 'again', label: 'Again', next: 'a' }] },
      ],
    })).toContain('No path to exit: a');
  });

  it('detects dead ends and empty choice labels', () => {
    const errors = validateTopic({
      id: 'invalid', title: 'Invalid', entry: 'a',
      nodes: [{ id: 'a', speaker: 'A', text: 'Hello', choices: [] }],
    });
    expect(errors).toContain('Dead end: a');
    expect(errors).toContain('No path to exit: a');
  });

  it('rejects tampered session state', () => {
    expect(restoreConversation(maraBookClub, '{"topic":"mara.book-club.v1","node":"bad","memories":[],"finished":false}')).toBeNull();
  });
});

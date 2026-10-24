import { describe, expect, it } from 'vitest';
import { answerConversation, conversationView, startConversation, validateTopic } from '../src/phaser/conversation-engine';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';

describe('Mara return visit', () => {
  it('has reachable scenes', () => {
    expect(validateTopic(maraReturnVisit)).toEqual([]);
  });
  it('recalls Frank from an earlier conversation', () => {
    const s = startConversation(maraReturnVisit, ['after:frank-boss']);
    expect(conversationView(maraReturnVisit, s).text).toContain('директор Френк');
  });
  it('allows the player to leave without deciding for Mara', () => {
    const s = answerConversation(maraReturnVisit, startConversation(maraReturnVisit), 'busy');
    expect(s.finished).toBe(true);
  });
  it('remembers a boundary-supporting answer', () => {
    let s = startConversation(maraReturnVisit);
    s = answerConversation(maraReturnVisit, s, 'listen');
    s = answerConversation(maraReturnVisit, s, 'choice');
    expect(s.memories).toContain('return:autonomy');
  });
});

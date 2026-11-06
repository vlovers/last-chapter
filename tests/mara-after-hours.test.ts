import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  conversationView,
  restoreConversation,
  startConversation,
  validateTopic,
} from '../src/phaser/conversation-engine';
import { maraAfterHours } from '../src/phaser/mara-after-hours';

describe('Mara after-hours conversations', () => {
  it('has a complete reachable graph', () => {
    expect(validateTopic(maraAfterHours)).toEqual([]);
    expect(maraAfterHours.nodes.length).toBeGreaterThanOrEqual(18);
  });

  it('supports the Tamlin/Rhysand debate and remembers a stance', () => {
    let session = startConversation(maraAfterHours);
    session = answerConversation(maraAfterHours, session, 'tamlin');
    session = answerConversation(maraAfterHours, session, 'motives');
    session = answerConversation(maraAfterHours, session, 'growth');
    expect(session.memories).toContain('after:tamlin');
    expect(session.memories).toContain('after:motives');
    expect(conversationView(maraAfterHours, session).id).toBe('second-chance');
  });

  it('supports an optional Frank story and exit', () => {
    let session = startConversation(maraAfterHours);
    session = answerConversation(maraAfterHours, session, 'frank');
    session = answerConversation(maraAfterHours, session, 'boss');
    session = answerConversation(maraAfterHours, session, 'respect');
    session = answerConversation(maraAfterHours, session, 'exit');
    expect(session.finished).toBe(true);
    expect(session.memories).toContain('after:frank-boss');
    expect(restoreConversation(maraAfterHours, JSON.stringify(session))).toEqual(session);
  });

  it('recalls Frank as the shop boss when revisiting', () => {
    const session = startConversation(maraAfterHours, ['after:frank-boss']);
    expect(conversationView(maraAfterHours, session).text).toContain('господар книгарні');
  });

  it('changes personal dialogue after a boundary-respecting response', () => {
    const session = {
      ...startConversation(maraAfterHours, ['after:frank-boundary']),
      node: 'personal',
    };
    expect(conversationView(maraAfterHours, session).text).toContain('не тиснеш');
  });

  it('supports ending immediately', () => {
    expect(
      answerConversation(maraAfterHours, startConversation(maraAfterHours), 'exit').finished,
    ).toBe(true);
  });
});

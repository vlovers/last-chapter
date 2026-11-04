import { describe, expect, it, vi } from 'vitest';
import {
  answerConversation,
  conversationView,
  restoreConversation,
  startConversation,
  validateTopic,
  type ConversationNode,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';

function longTopic(length: number): ConversationTopic {
  const nodes: ConversationNode[] = Array.from({ length }, (_, index) => ({
    id: `scene-${index}`,
    speaker: 'Мара',
    text: `Розмова ${index}.`,
    choices: [
      {
        id: 'next',
        label: 'Далі',
        next: index === length - 1 ? '__exit' : `scene-${index + 1}`,
      },
    ],
  }));
  return { id: 'mara.large', title: 'Довга розмова', entry: 'scene-0', nodes };
}

describe('optional conversation runtime indexing', () => {
  it('navigates a large graph without scanning authored nodes for every reply', () => {
    const topic = longTopic(10_000);
    const find = vi.spyOn(topic.nodes, 'find');
    const some = vi.spyOn(topic.nodes, 'some');
    let session = startConversation(topic);

    for (let index = 0; index < 100; index++) {
      expect(conversationView(topic, session).id).toBe(`scene-${index}`);
      session = answerConversation(topic, session, 'next');
    }

    expect(session.node).toBe('scene-100');
    expect(restoreConversation(topic, JSON.stringify(session))).toEqual(session);
    expect(find).not.toHaveBeenCalled();
    expect(some).not.toHaveBeenCalled();
    find.mockRestore();
    some.mockRestore();
  });

  it('restores a large pending ledger without scanning all nodes per entry', () => {
    const topic = longTopic(10_000);
    const some = vi.spyOn(topic.nodes, 'some');
    const pending = Array.from({ length: 128 }, (_, index) => ({
      node: `scene-${index}`,
      key: JSON.stringify([`scene-${index}`, 'next']),
    }));
    const saved = {
      topic: topic.id,
      node: 'scene-128',
      memories: ['mara:heard'],
      finished: false,
      completed: [],
      pending,
    };

    expect(restoreConversation(topic, JSON.stringify(saved))).toEqual(saved);
    expect(some).not.toHaveBeenCalled();
    some.mockRestore();
  });

  it('preserves the first authored definition for an invalid duplicate ID', () => {
    const topic: ConversationTopic = {
      id: 'duplicate',
      title: 'Розмова',
      entry: 'entry',
      nodes: [
        {
          id: 'entry',
          speaker: 'Мара',
          text: 'Перша репліка.',
          choices: [{ id: 'leave', label: 'Вийти', next: '__exit' }],
        },
        {
          id: 'entry',
          speaker: 'Мара',
          text: 'Друга репліка.',
          choices: [{ id: 'wrong', label: 'Ні', next: '__exit' }],
        },
      ],
    };
    expect(validateTopic(topic)).toContain('Duplicate node IDs');
    expect(
      conversationView(topic, {
        topic: topic.id,
        node: topic.entry,
        memories: [],
        finished: false,
      }).text,
    ).toBe('Перша репліка.');
  });

  it('does not reuse an index from another topic with identical node IDs', () => {
    const first = longTopic(2);
    const second: ConversationTopic = {
      id: 'mara.other',
      title: 'Інша розмова',
      entry: 'scene-0',
      nodes: [
        {
          id: 'scene-0',
          speaker: 'Мара',
          text: 'Інший початок.',
          choices: [{ id: 'leave', label: 'Вийти', next: '__exit' }],
        },
      ],
    };
    expect(conversationView(first, startConversation(first)).text).toBe('Розмова 0.');
    expect(conversationView(second, startConversation(second)).text).toBe('Інший початок.');
    expect(conversationView(first, startConversation(first)).text).toBe('Розмова 0.');
  });

  it('rejects a missing current node and a missing pending node after indexing', () => {
    const topic = longTopic(3);
    const active = answerConversation(topic, startConversation(topic), 'next');
    expect(restoreConversation(topic, JSON.stringify({ ...active, node: 'missing' }))).toBeNull();
    expect(
      restoreConversation(
        topic,
        JSON.stringify({
          ...active,
          pending: [{ node: 'missing', key: JSON.stringify(['missing', 'next']) }],
        }),
      ),
    ).toBeNull();
  });

  it('keeps all four Mara conversations restorable and their dialogue available', () => {
    for (const topic of [maraBookClub, maraAfterHours, maraReturnVisit, maraLetterDecision]) {
      const session = startConversation(topic);
      const restored = restoreConversation(topic, JSON.stringify(session));
      expect(restored).toEqual(session);
      expect(conversationView(topic, restored!).id).toBe(topic.entry);
      expect(conversationView(topic, restored!).choices.length).toBeGreaterThan(0);
    }
  });

  it('retains the original memory-gated choices after restoring a real conversation', () => {
    const session = answerConversation(maraBookClub, startConversation(maraBookClub), 'rhys');
    const restored = restoreConversation(maraBookClub, JSON.stringify(session));
    expect(restored).toEqual(session);
    expect(conversationView(maraBookClub, restored!).choices).toEqual(
      conversationView(maraBookClub, session).choices,
    );
  });
});

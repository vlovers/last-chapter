import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  startConversation,
  validateTopic,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';

const topics = [maraBookClub, maraAfterHours, maraReturnVisit, maraLetterDecision];

function topicWithChoices(
  choices: ConversationTopic['nodes'][number]['choices'],
): ConversationTopic {
  return {
    id: 'regression.topic',
    title: 'Розмова',
    entry: 'start',
    nodes: [{ id: 'start', speaker: 'Мара', text: 'Можемо поговорити.', choices }],
  };
}

describe('Mara conversation routes and mobile choice budget', () => {
  it.each(topics)('keeps every choice screen within four replies: $id', (topic) => {
    for (const node of topic.nodes) {
      expect(
        node.choices.length,
        `${topic.id}/${node.id} has too many replies`,
      ).toBeLessThanOrEqual(4);
    }
  });

  it.each(topics)('keeps every authored node reachable and able to finish: $id', (topic) => {
    expect(validateTopic(topic)).toEqual([]);
  });

  it.each([
    ['warm', 'mara:frank:warm'],
    ['judge', 'mara:frank:judge'],
    ['boss', 'mara:frank:boss'],
  ])('preserves Frank response %s and its narrative memory', (choice, memory) => {
    let session = startConversation(maraBookClub);
    for (const id of ['rhys', 'cat', choice]) {
      session = answerConversation(maraBookClub, session, id);
    }
    expect(session.node).toBe('frank-story');
    expect(session.memories).toContain(memory);
  });

  it('keeps an immediate exit from Frank without consuming a response', () => {
    let session = startConversation(maraBookClub);
    for (const id of ['rhys', 'cat', 'exit']) {
      session = answerConversation(maraBookClub, session, id);
    }
    expect(session.finished).toBe(true);
  });

  it('resumes a suspended book-club discussion rather than treating it as an ending', () => {
    let session = answerConversation(maraBookClub, startConversation(maraBookClub), 'empathy');
    session = answerConversation(maraBookClub, session, 'exit');
    expect(session.suspended).toBe(true);
    expect(session.node).toBe('tamlin');
    expect(session.finished).toBe(false);
    session = answerConversation(maraBookClub, session, 'motives');
    expect(session.node).toBe('rhys');
    expect(session.suspended).toBeUndefined();
  });

  it('rejects a graph where the only exit suspends instead of finishing', () => {
    const topic = topicWithChoices([
      { id: 'later', label: 'Пізніше', next: '__exit', suspend: true },
    ]);
    expect(validateTopic(topic)).toContain('No path to exit: start');
  });

  it('does not count a suspended transition as a reachable scene', () => {
    const topic: ConversationTopic = {
      ...topicWithChoices([
        { id: 'later', label: 'Пізніше', next: 'hidden', suspend: true },
        { id: 'finish', label: 'Закінчити', next: '__exit' },
      ]),
      nodes: [
        {
          id: 'start',
          speaker: 'Мара',
          text: 'Поговоримо.',
          choices: [
            { id: 'later', label: 'Пізніше', next: 'hidden', suspend: true },
            { id: 'finish', label: 'Закінчити', next: '__exit' },
          ],
        },
        {
          id: 'hidden',
          speaker: 'Мара',
          text: 'Ця сцена недосяжна.',
          choices: [{ id: 'finish', label: 'До зустрічі', next: '__exit' }],
        },
      ],
    };
    expect(validateTopic(topic)).toEqual(
      expect.arrayContaining(['Suspension must exit: start/later', 'Unreachable node: hidden']),
    );
  });

  it('accepts a real exit alongside a deferral', () => {
    const topic = topicWithChoices([
      { id: 'later', label: 'Пізніше', next: '__exit', suspend: true },
      { id: 'finish', label: 'До зустрічі', next: '__exit' },
    ]);
    expect(validateTopic(topic)).toEqual([]);
  });
});

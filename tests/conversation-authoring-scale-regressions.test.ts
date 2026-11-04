import { describe, expect, it } from 'vitest';
import {
  answerConversation,
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

const entry: ConversationNode = {
  id: 'entry',
  speaker: 'Мара',
  text: 'Привіт.',
  choices: [{ id: 'leave', label: 'До зустрічі', next: '__exit' }],
};
const topic: ConversationTopic = {
  id: 'test.memory-validation',
  title: 'Розмова',
  entry: 'entry',
  nodes: [entry],
};
const withEntry = (node: ConversationNode): ConversationTopic => ({
  ...topic,
  nodes: [node],
});

describe('Optional conversation authoring limits and graph traversal', () => {
  it.each([
    ['book club', maraBookClub],
    ['after hours', maraAfterHours],
    ['return visit', maraReturnVisit],
    ['letter decision', maraLetterDecision],
  ])('keeps the authored %s conversation valid', (_name, authored) => {
    expect(validateTopic(authored)).toEqual([]);
  });

  it('rejects blank and oversized remembered flags before they disappear from saves', () => {
    for (const remember of [' ', 'x'.repeat(121)]) {
      const candidate = withEntry({
        ...entry,
        choices: [{ ...entry.choices[0]!, remember }],
      });
      expect(validateTopic(candidate)).toContain('Invalid remembered memory: entry');
      expect(() => startConversation(candidate)).toThrow('Invalid conversation graph');
    }
  });

  it('rejects gates that cannot fit into a persisted memory', () => {
    const oversized = 'x'.repeat(121);
    const candidate = withEntry({
      ...entry,
      variants: [{ when: oversized, text: 'Інша репліка.' }],
      choices: [
        {
          ...entry.choices[0]!,
          requires: oversized,
          excludes: oversized,
        },
      ],
    });
    const errors = validateTopic(candidate);
    expect(errors).toContain('Oversized variant condition: entry');
    expect(errors).toContain('Oversized required memory: entry');
    expect(errors).toContain('Oversized excluded memory: entry');
  });

  it('preserves the maximum valid memory length across a finished save', () => {
    const remember = 'x'.repeat(120);
    const candidate = withEntry({
      ...entry,
      choices: [{ ...entry.choices[0]!, remember }],
    });
    expect(validateTopic(candidate)).toEqual([]);
    const finished = answerConversation(candidate, startConversation(candidate), 'leave');
    expect(finished.memories).toEqual([remember]);
    expect(restoreConversation(candidate, JSON.stringify(finished))).toEqual(finished);
  });

  it('validates a deep authored graph without recursive traversal', () => {
    const length = 10_000;
    const nodes: ConversationNode[] = Array.from({ length }, (_, index) => ({
      id: `node-${index}`,
      speaker: 'Мара',
      text: 'Ще одна сторінка.',
      choices: [
        {
          id: 'next',
          label: 'Далі',
          next: index === length - 1 ? '__exit' : `node-${index + 1}`,
        },
      ],
    }));
    const deep: ConversationTopic = { ...topic, entry: 'node-0', nodes };
    expect(validateTopic(deep)).toEqual([]);
    expect(startConversation(deep).node).toBe('node-0');
  });

  it('still reports disconnected scenes and cycles with no exit', () => {
    const disconnected: ConversationTopic = {
      ...topic,
      nodes: [
        entry,
        {
          id: 'lost',
          speaker: 'Мара',
          text: 'Загублена сторінка.',
          choices: [{ id: 'loop', label: 'Ще раз', next: 'lost' }],
        },
      ],
    };
    expect(validateTopic(disconnected)).toEqual([
      'Unreachable node: lost',
      'No path to exit: lost',
    ]);
  });
});

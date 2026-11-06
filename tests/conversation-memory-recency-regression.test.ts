import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  conversationView,
  normalizeMemories,
  restoreConversation,
  startConversation,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';

const anchor = 'mara:promise-kept';
const overflow = Array.from({ length: 80 }, (_, index) => `memory-${index}`);

const topic: ConversationTopic = {
  id: 'memory-recency-regression',
  title: 'Розмова з Марою',
  entry: 'start',
  nodes: [
    {
      id: 'start',
      speaker: 'Мара',
      text: 'Почнемо.',
      variants: [{ when: anchor, text: 'Ти пам’ятаєш нашу домовленість.' }],
      choices: [
        { id: 'reaffirm', label: 'Я пам’ятаю', next: 'later', remember: anchor },
        { id: 'leave', label: 'До зустрічі', next: '__exit' },
      ],
    },
    {
      id: 'later',
      speaker: 'Мара',
      text: 'Маєш ще хвилинку?',
      choices: [{ id: 'finish', label: 'Так', next: '__exit', remember: 'fresh-memory' }],
    },
  ],
};

describe('optional dialogue memory recency and capped saves', () => {
  it('retains the latest 80 distinct memories, including a recently reaffirmed old one', () => {
    const normalized = normalizeMemories([anchor, ...overflow, anchor]);
    expect(normalized).toHaveLength(80);
    expect(normalized[0]).toBe('memory-1');
    expect(normalized.at(-1)).toBe(anchor);
    expect(normalized).not.toContain('memory-0');
    expect(new Set(normalized).size).toBe(80);
  });

  it('moves a repeated memory to its most recent position without inventing duplicates', () => {
    expect(normalizeMemories(['first', 'second', 'first'])).toEqual(['second', 'first']);
    expect(normalizeMemories(['same', 'same', 'same'])).toEqual(['same']);
  });

  it('ignores invalid memories while preserving recent valid values', () => {
    expect(normalizeMemories(['', '  ', 'valid', 'x'.repeat(121), 'recent', 'valid'])).toEqual([
      'recent',
      'valid',
    ]);
  });

  it('keeps conditional Ukrainian narration available after a memory-budget overflow', () => {
    const session = startConversation(topic, [anchor, ...overflow, anchor]);
    expect(session.memories).toContain(anchor);
    expect(conversationView(topic, session).text).toBe('Ти пам’ятаєш нашу домовленість.');
    expect(restoreConversation(topic, JSON.stringify(session))).toEqual(session);
  });

  it('preserves a reaffirmed choice across a later new memory and save roundtrip', () => {
    const initial = startConversation(topic, [anchor, ...overflow.slice(0, 79)]);
    expect(initial.memories).toHaveLength(80);
    const reaffirmed = answerConversation(topic, initial, 'reaffirm');
    expect(reaffirmed.memories.at(-1)).toBe(anchor);
    const finished = answerConversation(topic, reaffirmed, 'finish');
    expect(finished.finished).toBe(true);
    expect(finished.memories).toContain(anchor);
    expect(finished.memories).toContain('fresh-memory');
    expect(finished.memories).toHaveLength(80);
    expect(restoreConversation(topic, JSON.stringify(finished))).toEqual(finished);
  });
});

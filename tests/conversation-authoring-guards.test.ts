import { describe, expect, it } from 'vitest';
import {
  conversationView,
  normalizeMemories,
  restoreConversation,
  startConversation,
  validateTopic,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';

const topic: ConversationTopic = {
  id: 'test.authoring',
  title: 'Розмова',
  entry: 'entry',
  nodes: [
    {
      id: 'entry',
      speaker: 'Мара',
      text: 'Привіт.',
      variants: [{ when: 'remembered', text: 'Знову привіт.' }],
      choices: [{ id: 'leave', label: 'До зустрічі', next: '__exit' }],
    },
  ],
};

const withEntry = (entry: ConversationTopic['nodes'][number]): ConversationTopic => ({
  ...topic,
  nodes: [entry],
});

describe('optional conversation authoring and save consistency', () => {
  it('keeps all four authored Mara graphs valid', () => {
    for (const story of [maraBookClub, maraAfterHours, maraReturnVisit, maraLetterDecision]) {
      expect(validateTopic(story)).toEqual([]);
    }
  });

  it('rejects duplicate narration prerequisites within the same node', () => {
    const entry = topic.nodes[0]!;
    expect(
      validateTopic(
        withEntry({
          ...entry,
          variants: [
            { when: 'remembered', text: 'Перша версія.' },
            { when: 'remembered', text: 'Недосяжна версія.' },
          ],
        }),
      ),
    ).toContain('Duplicate variant condition: entry');
  });

  it('rejects a blank narration prerequisite', () => {
    const entry = topic.nodes[0]!;
    expect(
      validateTopic(withEntry({ ...entry, variants: [{ when: ' ', text: 'Текст.' }] })),
    ).toContain('Empty variant condition: entry');
  });

  it('allows the same memory to control narration in separate nodes', () => {
    const next: ConversationTopic['nodes'][number] = {
      id: 'next',
      speaker: 'Мара',
      text: 'Ще одна зустріч.',
      variants: [{ when: 'remembered', text: 'Ти пам’ятаєш.' }],
      choices: [{ id: 'leave', label: 'До зустрічі', next: '__exit' }],
    };
    const entry = {
      ...topic.nodes[0]!,
      choices: [{ id: 'next', label: 'Далі', next: 'next' }],
    };
    expect(validateTopic({ ...topic, nodes: [entry, next] })).toEqual([]);
  });

  it('rejects contradictory memory gates that make a choice unreachable', () => {
    const entry = topic.nodes[0]!;
    expect(
      validateTopic(
        withEntry({
          ...entry,
          choices: [{ id: 'leave', label: 'Вийти', next: '__exit', requires: 'x', excludes: 'x' }],
        }),
      ),
    ).toContain('Impossible choice condition: entry');
  });

  it('rejects blank option IDs and blank memory gates', () => {
    const entry = topic.nodes[0]!;
    const errors = validateTopic(
      withEntry({
        ...entry,
        choices: [{ id: ' ', label: 'Вийти', next: '__exit', requires: ' ', excludes: ' ' }],
      }),
    );
    expect(errors).toContain('Empty choice ID: entry');
    expect(errors).toContain('Empty required memory: entry');
    expect(errors).toContain('Empty excluded memory: entry');
  });

  it('rejects blank authoring metadata', () => {
    expect(validateTopic({ ...topic, id: ' ' })).toContain('Empty topic ID');
    expect(validateTopic({ ...topic, title: ' ' })).toContain('Empty topic title');
    expect(validateTopic(withEntry({ ...topic.nodes[0]!, speaker: ' ' }))).toContain(
      'Empty speaker: entry',
    );
  });

  it('drops whitespace-only memories while retaining exact meaningful flags', () => {
    expect(normalizeMemories([' ', '', '  ', 'remembered', 'remembered', 'x '])).toEqual([
      'remembered',
      'x ',
    ]);
  });

  it('produces a session that can be restored after receiving blank legacy memories', () => {
    const session = startConversation(topic, ['  ', 'remembered', '', 'remembered']);
    expect(session.memories).toEqual(['remembered']);
    expect(restoreConversation(topic, JSON.stringify(session))).toEqual(session);
    expect(conversationView(topic, session).text).toBe('Знову привіт.');
  });

  it('keeps large completion ledgers and memory gates independent', () => {
    const choices = Array.from({ length: 512 }, (_, index) => ({
      id: `choice-${index}`,
      label: `Варіант ${index}`,
      next: '__exit',
      requires: index % 2 === 0 ? 'allowed' : undefined,
      excludes: index % 3 === 0 ? 'blocked' : undefined,
    }));
    const largeTopic = withEntry({ ...topic.nodes[0]!, choices });
    const completed = choices.slice(0, 256).map((choice) => JSON.stringify(['entry', choice.id]));
    const session = {
      ...startConversation(largeTopic, ['allowed']),
      completed,
      pending: [],
    };
    const restored = restoreConversation(largeTopic, JSON.stringify(session));
    expect(restored).toEqual(session);
    const available = conversationView(largeTopic, restored!).choices;
    expect(available).toHaveLength(256);
    expect(available[0]?.id).toBe('choice-256');
    expect(available.at(-1)?.id).toBe('choice-511');
  });
  it('keeps repeatable choices available after restoring a completed ledger', () => {
    const repeatableTopic = withEntry({
      ...topic.nodes[0]!,
      choices: [{ id: 'leave', label: 'До зустрічі', next: '__exit', repeatability: 'repeatable' }],
    });
    const session = {
      ...startConversation(repeatableTopic),
      completed: [JSON.stringify(['entry', 'leave'])],
      pending: [],
    };
    const restored = restoreConversation(repeatableTopic, JSON.stringify(session));
    expect(restored).toEqual(session);
    expect(conversationView(repeatableTopic, restored!).choices.map((choice) => choice.id)).toEqual([
      'leave',
    ]);
  });

  it('applies memory gates without losing conditional narration', () => {
    const gatedTopic = withEntry({
      ...topic.nodes[0]!,
      choices: [
        { id: 'remember', label: 'Пам’ятаю', next: '__exit', requires: 'remembered' },
        { id: 'forget', label: 'Не пам’ятаю', next: '__exit', excludes: 'remembered' },
      ],
    });
    const remembered = startConversation(gatedTopic, ['remembered']);
    const forgotten = startConversation(gatedTopic);
    expect(conversationView(gatedTopic, remembered).text).toBe('Знову привіт.');
    expect(conversationView(gatedTopic, remembered).choices.map((choice) => choice.id)).toEqual([
      'remember',
    ]);
    expect(conversationView(gatedTopic, forgotten).choices.map((choice) => choice.id)).toEqual([
      'forget',
    ]);
  });

});

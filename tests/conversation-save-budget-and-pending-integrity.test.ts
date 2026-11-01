import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  restoreConversation,
  startConversation,
  type ConversationTopic,
} from '../src/phaser/conversation-engine';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraAfterHours } from '../src/phaser/mara-after-hours';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';

const active = () => answerConversation(maraBookClub, startConversation(maraBookClub), 'empathy');
const restore = (session: unknown) => restoreConversation(maraBookClub, JSON.stringify(session));

describe('optional conversation save budget and pending route integrity', () => {
  it('round-trips active, nested, suspended, finished and legacy sessions', () => {
    const pending = active();
    const nested = answerConversation(maraBookClub, pending, 'motives');
    const suspended = answerConversation(maraBookClub, pending, 'exit');
    const finished = answerConversation(maraBookClub, startConversation(maraBookClub), 'leave');
    for (const session of [pending, nested, suspended, finished, startConversation(maraBookClub)]) {
      expect(restore(session)).toEqual(session);
    }
  });

  it('keeps every authored Mara topic restorable without a ledger', () => {
    for (const topic of [maraBookClub, maraAfterHours, maraReturnVisit, maraLetterDecision]) {
      const session = startConversation(topic);
      expect(restoreConversation(topic, JSON.stringify(session))).toEqual(session);
    }
  });

  it('rejects a pending key for a choice removed from the current graph', () => {
    const session = active();
    expect(
      restore({
        ...session,
        pending: [{ node: 'welcome', key: JSON.stringify(['welcome', 'retired-choice']) }],
      }),
    ).toBeNull();
  });

  it('rejects suspended and immediately finished choices in pending routes', () => {
    const session = active();
    expect(
      restore({
        ...session,
        pending: [{ node: 'tamlin', key: JSON.stringify(['tamlin', 'exit']) }],
      }),
    ).toBeNull();
    expect(
      restore({
        ...session,
        pending: [{ node: 'welcome', key: JSON.stringify(['welcome', 'leave']) }],
      }),
    ).toBeNull();
  });

  it('rejects repeatable choices as pending without blocking normal repeatable dialogue', () => {
    const topic: ConversationTopic = {
      id: 'repeatable-save-check',
      title: 'Розмова',
      entry: 'entry',
      nodes: [
        {
          id: 'entry',
          speaker: 'Мара',
          text: 'Почнімо.',
          choices: [
            { id: 'again', label: 'Ще раз', next: 'entry', repeatability: 'repeatable' },
            { id: 'leave', label: 'До зустрічі', next: '__exit' },
          ],
        },
      ],
    };
    const session = answerConversation(topic, startConversation(topic), 'again');
    expect(restoreConversation(topic, JSON.stringify(session))).toEqual(session);
    expect(
      restoreConversation(
        topic,
        JSON.stringify({
          ...session,
          completed: [],
          pending: [{ node: 'entry', key: JSON.stringify(['entry', 'again']) }],
        }),
      ),
    ).toBeNull();
  });

  it('preserves retired completed keys while validating live pending routes', () => {
    const session = active();
    const retired = JSON.stringify(['retired-node', 'retired-choice']);
    expect(restore({ ...session, completed: [retired] })).toEqual({
      ...session,
      completed: [retired],
    });
  });

  it('rejects oversized ASCII payloads before parsing', () => {
    const session = active();
    const raw = JSON.stringify({ ...session, padding: 'x'.repeat(270_000) });
    expect(restoreConversation(maraBookClub, raw)).toBeNull();
  });

  it('enforces the byte budget for multibyte Ukrainian text, not just string length', () => {
    const session = active();
    const raw = JSON.stringify({ ...session, padding: 'ї'.repeat(150_000) });
    expect(raw.length).toBeLessThan(262_144);
    expect(new TextEncoder().encode(raw).byteLength).toBeGreaterThan(262_144);
    expect(restoreConversation(maraBookClub, raw)).toBeNull();
  });
});

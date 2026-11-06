import { describe, expect, it } from 'vitest';
import {
  answerConversation,
  restoreConversation,
  startConversation,
} from '../src/phaser/conversation-engine';
import { maraBookClub } from '../src/phaser/mara-book-club';

const restore = (session: unknown) => restoreConversation(maraBookClub, JSON.stringify(session));
const active = () => answerConversation(maraBookClub, startConversation(maraBookClub), 'rhys');
const finished = () => answerConversation(maraBookClub, startConversation(maraBookClub), 'leave');

describe('optional conversation save ledger integrity', () => {
  it('restores a valid unfinished conversation with its pending choice', () => {
    const session = active();
    expect(session.pending).toHaveLength(1);
    expect(restore(session)).toEqual(session);
  });

  it('restores a completed conversation with its completion ledger', () => {
    const session = finished();
    expect(session.finished).toBe(true);
    expect(session.pending).toEqual([]);
    expect(restore(session)).toEqual(session);
  });

  it('rejects a pending ledger without a completed ledger', () => {
    expect(restore({ ...active(), completed: undefined })).toBeNull();
  });

  it('rejects duplicate completed choices', () => {
    const session = finished();
    expect(
      restore({ ...session, completed: [...session.completed!, ...session.completed!] }),
    ).toBeNull();
  });

  it('rejects a completed ledger whose pending counterpart is missing', () => {
    expect(restore({ ...active(), pending: undefined })).toBeNull();
  });

  it('rejects an oversized pending completion key', () => {
    const session = active();
    expect(
      restore({ ...session, pending: [{ ...session.pending![0]!, key: 'x'.repeat(301) }] }),
    ).toBeNull();
  });

  it('rejects a pending choice that was already completed', () => {
    const session = active();
    expect(restore({ ...session, completed: [session.pending![0]!.key] })).toBeNull();
  });

  it('rejects the same pending choice recorded twice', () => {
    const session = active();
    expect(restore({ ...session, pending: [...session.pending!, ...session.pending!] })).toBeNull();
  });

  it('rejects a pending choice attached to a missing node', () => {
    const session = active();
    expect(
      restore({ ...session, pending: [{ ...session.pending![0]!, node: 'missing-node' }] }),
    ).toBeNull();
  });

  it('rejects a blank pending key and a blank completed key', () => {
    const session = active();
    expect(restore({ ...session, pending: [{ ...session.pending![0]!, key: '  ' }] })).toBeNull();
    expect(restore({ ...session, completed: ['  '] })).toBeNull();
  });

  it('rejects an already finished conversation with unresolved pending choices', () => {
    expect(restore({ ...active(), finished: true })).toBeNull();
  });

  it('rejects blank memories but keeps old sessions without explicit ledgers', () => {
    const session = startConversation(maraBookClub);
    expect(restore(session)).toEqual(session);
    expect(restore({ ...session, memories: ['   '] })).toBeNull();
  });
});

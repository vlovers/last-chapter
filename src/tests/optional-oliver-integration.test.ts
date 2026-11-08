import { describe, expect, it } from 'vitest';
import { startChapter, type ChapterState } from '../game/chapter';
import { irisVisit } from '../content/iris';
import { startDialogue } from '../game/dialogue';
import {
  OLIVER_COMPLETED,
  canStartOliver,
  chooseOliver,
  finishOliver,
  oliverLine,
  startOliver,
} from '../game/optional-oliver';
import { decodeSave, encodeSave } from '../game/save';

const dayTwo = (): ChapterState => ({ ...startChapter(), stage: 'iris', dialogue: startDialogue(irisVisit) });

describe('optional Oliver side conversation integration', () => {
  it('is unavailable before Day 2 and cannot be started twice', () => {
    expect(canStartOliver(startChapter())).toBe(false);
    const chapter = dayTwo();
    expect(canStartOliver(chapter)).toBe(true);
    const done = finishOliver(chapter, chooseOliver(startOliver(chapter), 'oliver-unread-decline'));
    expect(canStartOliver(done)).toBe(false);
    expect(() => startOliver(done)).toThrow();
  });

  it('keeps the main dialogue and stage unchanged', () => {
    const chapter = dayTwo();
    const session = chooseOliver(startOliver(chapter), 'oliver-unread-decline');
    const done = finishOliver(chapter, session);
    expect(done.stage).toBe(chapter.stage);
    expect(done.dialogue.node).toBe(chapter.dialogue.node);
    expect(done.flags).toContain(OLIVER_COMPLETED);
  });

  it('requires a terminal choice before completion', () => {
    const chapter = dayTwo();
    expect(() => finishOliver(chapter, startOliver(chapter))).toThrow();
  });

  it('persists completion in the existing save format', () => {
    const chapter = dayTwo();
    let session = startOliver(chapter);
    session = chooseOliver(session, 'oliver-unread-play');
    session = chooseOliver(session, 'oliver-unread-mail');
    session = chooseOliver(session, 'oliver-unread-mail-finish');
    expect(session.complete).toBe(true);
    expect(oliverLine(session).id).toBe('oliver-unread-end');
    const saved = decodeSave(encodeSave(finishOliver(chapter, session)));
    expect(saved).not.toBeNull();
    expect(canStartOliver(saved as ChapterState)).toBe(false);
  });


  it.each(['complete', 'eleanor', 'day3-complete', 'day4-iris', 'season-complete'] as const)(
    'rejects a stale Oliver session after transitioning to %s',
    (stage) => {
      const chapter = dayTwo();
      const finished = chooseOliver(startOliver(chapter), 'oliver-unread-decline');
      const transitioned = { ...chapter, stage };
      expect(canStartOliver(transitioned)).toBe(false);
      expect(() => startOliver(transitioned)).toThrow('Oliver is not available');
      expect(() => finishOliver(transitioned, finished)).toThrow('Oliver is no longer available');
    },
  );

  it('rejects replay after completion even when the saved dialogue remains unchanged', () => {
    const chapter = dayTwo();
    const finished = chooseOliver(startOliver(chapter), 'oliver-unread-decline');
    const completed = finishOliver(chapter, finished);
    expect(completed.dialogue.node).toBe(chapter.dialogue.node);
    expect(completed.dialogue.flags).toContain(OLIVER_COMPLETED);
    expect(() => finishOliver(completed, finished)).toThrow('Oliver is no longer available');
  });

  it('does not grant mystery or trust flags', () => {
    const chapter = dayTwo();
    const session = chooseOliver(startOliver(chapter), 'oliver-unread-decline');
    const done = finishOliver(chapter, session);
    expect(done.flags.filter((flag) => !chapter.flags.includes(flag))).toEqual([OLIVER_COMPLETED]);
  });
});

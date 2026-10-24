import { describe, expect, it } from 'vitest';
import { bookClub } from '../src/content/book-club';
import { noraVisit } from '../src/content/nora';
import { startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';
import { finishThirdDay, stageStory, startFourthDay, type ChapterState } from '../src/game/chapter';

describe('Day 3 completion checkpoint regression', () => {
  it('uses the book-club graph for the completed Day 3 stage', () => {
    expect(stageStory('day3-complete')).toBe(bookClub);
  });

  it('restores a newly completed Day 3 and advances to Day 4', () => {
    const state: ChapterState = {
      stage: 'book-club',
      dialogue: { ...startDialogue(bookClub), node: 'end', flags: ['club_respected_privacy'], history: ['privacy'] },
      flags: ['club_respected_privacy'],
    };
    const completed = finishThirdDay(state);
    const restored = decodeSave(encodeSave(completed));
    expect(restored).toEqual(completed);
    expect(startFourthDay(restored!).stage).toBe('day4-iris');
  });

  it('retains old completed Day 3 saves from the pre-book-club version', () => {
    const legacyNode = noraVisit.nodes.find((node) => node.options.length === 0);
    expect(legacyNode).toBeDefined();
    const old: ChapterState = {
      stage: 'day3-complete',
      dialogue: { ...startDialogue(noraVisit), node: legacyNode!.id, flags: ['nora_confidentiality_respected'], history: [] },
      flags: ['nora_confidentiality_respected'],
    };
    const restored = decodeSave(encodeSave(old));
    expect(restored).toEqual(old);
    expect(startFourthDay(restored!).flags).toContain('nora_confidentiality_respected');
  });

  it('rejects unrelated dialogue nodes in a Day 3 checkpoint', () => {
    const malformed = JSON.parse(encodeSave({
      stage: 'day3-complete',
      dialogue: { ...startDialogue(bookClub), node: 'not-a-scene' },
      flags: [],
    })) as Record<string, unknown>;
    expect(decodeSave(JSON.stringify(malformed))).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import {
  advanceChapter,
  advanceSecondDay,
  advanceToDayFourLeo,
  advanceToDayFourMara,
  advanceToLeo,
  advanceToNora,
  advanceToThomas,
  finishFourthDay,
  finishSeason,
  finishSecondDay,
  finishThirdDay,
  startBookClub,
  startChapter,
  startFifthDay,
  startFourthDay,
  startSecondDay,
  startThirdDay,
  type ChapterState,
} from '../src/game/chapter';

const discovered: ChapterState = {
  ...startChapter(),
  flags: ['found_blue_book', 'mara_respects_boundaries'],
  dialogue: {
    ...startChapter().dialogue,
    flags: ['found_blue_book', 'mara_respects_boundaries'],
  },
};

describe('Five-day chapter transition guards', () => {
  it('rejects skipping directly to later days from a fresh save', () => {
    expect(() => startSecondDay(discovered)).toThrow();
    expect(() => startThirdDay(discovered)).toThrow();
    expect(() => startFourthDay(discovered)).toThrow();
    expect(() => startFifthDay(discovered)).toThrow();
    expect(() => finishSeason(discovered)).toThrow();
  });

  it('requires the correct stage for every day transition', () => {
    expect(() => advanceSecondDay(discovered)).toThrow();
    expect(() => advanceToLeo(discovered)).toThrow();
    expect(() => advanceToThomas(discovered)).toThrow();
    expect(() => advanceToNora(discovered)).toThrow();
    expect(() => startBookClub(discovered)).toThrow();
    expect(() => finishSecondDay(discovered)).toThrow();
    expect(() => finishThirdDay(discovered)).toThrow();
    expect(() => finishFourthDay(discovered)).toThrow();
    expect(() => advanceToDayFourMara(discovered)).toThrow();
    expect(() => advanceToDayFourLeo(discovered)).toThrow();
  });

  it('does not advance a conversation that still has available choices', () => {
    expect(() => advanceChapter(discovered)).toThrow('Finish the conversation before continuing');
  });
});

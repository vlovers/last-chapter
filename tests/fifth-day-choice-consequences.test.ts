import { describe, expect, it } from 'vitest';
import {
  chooseChapterOption,
  finishSeason,
  startFifthDay,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, currentNode, startDialogue } from '../src/game/dialogue';
import { finalReading } from '../src/content/day-five';

function enterFinale(flags: string[]) {
  const previous: ChapterState = {
    stage: 'day4-complete',
    flags,
    dialogue: { ...startDialogue(finalReading), flags },
  };
  return chooseChapterOption(startFifthDay(previous), 'open');
}

function choices(chapter: ChapterState) {
  return availableOptions(finalReading, chapter.dialogue).map((option) => option.id);
}

describe('Fifth-day choice consequences', () => {
  it.each([
    ['anna_chose_maps', 'anna-maps', 'anna-mystery', 'maps-back'],
    ['anna_chose_mystery', 'anna-mystery', 'anna-maps', 'mystery-back'],
  ])('keeps the %s callback', (flag, visible, hidden, back) => {
    let chapter = enterFinale([flag]);
    chapter = chooseChapterOption(chapter, 'anna');
    expect(choices(chapter)).toContain(visible);
    expect(choices(chapter)).not.toContain(hidden);
    chapter = chooseChapterOption(chapter, visible);
    const callback = currentNode(finalReading, chapter.dialogue);
    expect(callback.text.length).toBeGreaterThan(40);
    chapter = chooseChapterOption(chapter, back);
    expect(chapter.flags).toContain('final_anna_club_heard');
    expect(choices(chapter)).not.toContain('anna');
    chapter = chooseChapterOption(chapter, 'close');
    chapter = finishSeason(chapter);
    expect(chapter.flags).toContain(flag);
    expect(chapter.flags).toContain('final_anna_club_heard');
    expect(chapter.stage).toBe('season-complete');
  });

  it('hides the private letter until the envelope is found', () => {
    expect(choices(enterFinale([]))).not.toContain('letter');
    expect(choices(enterFinale(['saw_envelope']))).toContain('letter');
  });
});

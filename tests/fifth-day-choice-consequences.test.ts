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

  it.each([
    ['iris', 'iris_day_four_respected_freedom', 'iris_day_four_supported_belonging'],
    ['mara', 'mara_day_four_named_own_needs', 'mara_day_four_chose_own_time'],
    ['leo', 'leo_day_four_chose_honesty', 'leo_day_four_respected_privacy'],
  ])('reflects distinct day-four outcomes for %s', (person, first, second) => {
    const callback = `day-four-${person}-callback`;
    const back = `day-four-${person}-back`;
    const heard = `final_day_four_${person}_heard`;
    const prerequisite = {
      iris: 'iris_day_four_boundary_heard',
      mara: 'mara_day_four_own_story_heard',
      leo: 'leo_day_four_future_heard',
    }[person];
    expect(prerequisite).toBeDefined();
    const endings = [first, second].map((decision) => {
      let chapter = enterFinale([prerequisite!, decision]);
      expect(choices(chapter)).toContain(callback);
      chapter = chooseChapterOption(chapter, callback);
      const text = currentNode(finalReading, chapter.dialogue).text;
      chapter = chooseChapterOption(chapter, back);
      expect(chapter.flags).toContain(heard);
      expect(choices(chapter)).not.toContain(callback);
      chapter = finishSeason(chooseChapterOption(chapter, 'close'));
      expect(chapter.stage).toBe('season-complete');
      expect(chapter.flags).toContain(decision);
      return text;
    });
    expect(endings[0]).not.toBe(endings[1]);
    expect(choices(enterFinale([first]))).not.toContain(callback);
  });
});

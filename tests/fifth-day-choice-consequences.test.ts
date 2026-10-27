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

describe('Fifth-day choice consequences', () => {
  it.each([
    ['anna_chose_maps', 'anna-maps', 'anna-mystery', 'maps-back'],
    ['anna_chose_mystery', 'anna-mystery', 'anna-maps', 'mystery-back'],
  ])(
    'shows the %s purchase callback and keeps it in the ending',
    (flag, visible, hidden, back) => {
    let chapter = enterFinale([flag]);
    chapter = chooseChapterOption(chapter, 'anna');
    const options = availableOptions(finalReading, chapter.dialogue).map((option) => option.id);
    expect(options).toContain(visible);
    expect(options).not.toContain(hidden);
    chapter = chooseChapterOption(chapter, visible);
    expect(currentNode(finalReading, chapter.dialogue).text.length).toBeGreaterThan(40);
    chapter = chooseChapterOption(chapter, back);
    expect(chapter.flags).toContain('final_anna_club_heard');
      expect(
        availableOptions(finalReading, chapter.dialogue).map((option) => option.id),
      ).not.toContain('anna');
    chapter = chooseChapterOption(chapter, 'close');
    chapter = finishSeason(chapter);
    expect(chapter.flags).toContain(flag);
    expect(chapter.flags).toContain('final_anna_club_heard');
      expect(chapter.stage).toBe('season-complete');
    },
  );

  it('does not expose a private letter without discovering its envelope', () => {
    const withoutEnvelope = enterFinale([]);
    const withEnvelope = enterFinale(['saw_envelope']);
    expect(
      availableOptions(finalReading, withoutEnvelope.dialogue).map((option) => option.id),
    ).not.toContain('letter');
    expect(
      availableOptions(finalReading, withEnvelope.dialogue).map((option) => option.id),
    ).toContain('letter');
  });
});

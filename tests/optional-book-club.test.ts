import { describe, expect, it } from 'vitest';
import {
  chooseChapterOption,
  finishThirdDay,
  skipBookClub,
  startChapter,
  startFourthDay,
  startFifthDay,
} from '../src/game/chapter';
import { selectOption, startDialogue } from '../src/game/dialogue';
import { quietEvening } from '../src/content/quiet-evening';
import { noraVisit } from '../src/content/nora';
import { encodeSave, decodeSave } from '../src/game/save';
import { storyProgress } from '../src/game/progress';
import { finalReading } from '../src/content/day-five';
import { seasonEnding } from '../src/game/endings';
import { availableOptions, currentNode } from '../src/game/dialogue';

describe('optional day-three book club', () => {
  it('rejects skipping before Nora has finished speaking', () => {
    expect(() => skipBookClub(startChapter())).toThrow();
  });

  it('lets the player keep the manuscript page and carries it through a save', () => {
    const opened = selectOption(quietEvening, startDialogue(quietEvening), 'tidy-books');
    const kept = selectOption(quietEvening, opened, 'keep-page');
    expect(kept.flags).toContain('quiet_evening_page_found');
    const chapter = {
      ...startChapter(),
      stage: 'quiet-evening' as const,
      dialogue: kept,
      flags: kept.flags,
    };
    expect(decodeSave(encodeSave(chapter))?.flags).toContain('quiet_evening_page_found');
    const checkpoint = finishThirdDay({ ...chapter, flags: ['book_club_skipped'] });
    expect(checkpoint.stage).toBe('day3-complete');
    expect(checkpoint.flags).toContain('quiet_evening_page_found');
  });

  it('allows leaving the page without claiming it was collected', () => {
    const opened = selectOption(quietEvening, startDialogue(quietEvening), 'tidy-books');
    const left = selectOption(quietEvening, opened, 'leave-page');
    expect(left.flags).not.toContain('quiet_evening_page_found');
  });

  it('continues from Nora through a saved quiet evening into Day 4', () => {
    const nora = {
      ...startChapter(),
      stage: 'nora' as const,
      dialogue: { ...startDialogue(noraVisit), node: 'end' },
    };
    const evening = skipBookClub(nora);
    expect(evening.flags).toContain('book_club_skipped');
    expect(evening.flags).not.toContain('book_club_started');
    const restored = decodeSave(encodeSave(evening));
    expect(restored?.stage).toBe('quiet-evening');
    const discovered = chooseChapterOption(restored!, 'tidy-books');
    const collected = chooseChapterOption(discovered, 'keep-page');
    const checkpoint = finishThirdDay(collected);
    const fourthDay = startFourthDay(decodeSave(encodeSave(checkpoint))!);
    expect(fourthDay.stage).toBe('day4-iris');
    expect(fourthDay.flags).toContain('quiet_evening_page_found');
    expect(fourthDay.dialogue.flags).toContain('quiet_evening_page_found');
    expect(fourthDay.flags).not.toContain('book_club_started');
  });

  it('offers a day-five manuscript decision and reflects custody in the ending', () => {
    const finalDay = startFifthDay({
      ...startChapter(),
      stage: 'day4-complete',
      flags: ['quiet_evening_page_found', 'iris_quiet_page_discussed', 'iris_quiet_page_stars_compared'],
    });
    const gathering = chooseChapterOption(finalDay, 'open');
    expect(availableOptions(finalReading, gathering.dialogue).map((option) => option.id)).toContain(
      'quiet-manuscript-followup',
    );
    const followup = chooseChapterOption(gathering, 'quiet-manuscript-followup');
    expect(currentNode(finalReading, followup.dialogue).text).toContain('три зірочки');
    const handedOver = chooseChapterOption(followup, 'quiet-manuscript-return');
    const returned = chooseChapterOption(handedOver, 'quiet-manuscript-result-back');
    expect(seasonEnding(returned).epilogue).toContain('Айріс забрала сторінку');
    expect(availableOptions(finalReading, returned.dialogue).map((option) => option.id)).not.toContain(
      'quiet-manuscript-followup',
    );
  });

  it('persists the quiet evening and its completed checkpoint', () => {
    const evening = {
      ...startChapter(),
      stage: 'quiet-evening' as const,
      flags: ['book_club_skipped', 'evening_shop_kept_open'],
      dialogue: startDialogue(quietEvening),
    };
    expect(decodeSave(encodeSave(evening))?.stage).toBe('quiet-evening');
    expect(storyProgress(evening.stage)[2]?.status).toBe('current');
    expect(() => finishThirdDay(evening)).toThrow('Finish the conversation');

    const completed = {
      ...evening,
      dialogue: { ...startDialogue(quietEvening), node: 'end', flags: evening.flags },
    };
    const checkpoint = finishThirdDay(completed);
    expect(checkpoint.stage).toBe('day3-complete');
    expect(decodeSave(encodeSave(checkpoint))?.stage).toBe('day3-complete');
  });
});

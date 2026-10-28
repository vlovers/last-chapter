import { describe, expect, it } from 'vitest';
import {
  chooseChapterOption,
  finishThirdDay,
  skipBookClub,
  startChapter,
  advanceToDayFourMara,
  startFourthDay,
  startFifthDay,
} from '../src/game/chapter';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { quietEvening } from '../src/content/quiet-evening';
import { noraVisit } from '../src/content/nora';
import { encodeSave, decodeSave } from '../src/game/save';
import { storyProgress } from '../src/game/progress';
import { finalReading } from '../src/content/day-five';
import { seasonEnding } from '../src/game/endings';

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
      flags: [
        'quiet_evening_page_found',
        'iris_quiet_page_discussed',
        'iris_quiet_page_stars_compared',
      ],
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
    expect(
      availableOptions(finalReading, returned.dialogue).map((option) => option.id),
    ).not.toContain('quiet-manuscript-followup');
  });

  it('keeps the manuscript finale hidden without a conversation with Iris', () => {
    const finalDay = startFifthDay({
      ...startChapter(),
      stage: 'day4-complete',
      flags: ['quiet_evening_page_found'],
    });
    const gathering = chooseChapterOption(finalDay, 'open');
    expect(
      availableOptions(finalReading, gathering.dialogue).map((option) => option.id),
    ).not.toContain('quiet-manuscript-followup');
  });

  it('archives the manuscript without claiming that its author is known', () => {
    const finalDay = startFifthDay({
      ...startChapter(),
      stage: 'day4-complete',
      flags: [
        'quiet_evening_page_found',
        'iris_quiet_page_discussed',
        'iris_quiet_page_window_theory',
      ],
    });
    const gathering = chooseChapterOption(finalDay, 'open');
    const followup = chooseChapterOption(gathering, 'quiet-manuscript-followup');
    expect(currentNode(finalReading, followup.dialogue).text).toContain('відчинене вікно');
    const archived = chooseChapterOption(followup, 'quiet-manuscript-archive');
    const completed = chooseChapterOption(archived, 'quiet-manuscript-result-back');
    const restored = decodeSave(encodeSave(completed));
    expect(restored?.flags).toContain('final_quiet_manuscript_archived');
    expect(restored?.flags).not.toContain('final_quiet_manuscript_returned');
    expect(seasonEnding(restored!).epilogue).toContain('зберегли у книгарні');
  });

  it('carries the manuscript clue through the actual Iris dialogue and into Mara', () => {
    const chapter = startFourthDay({
      ...startChapter(),
      stage: 'day3-complete',
      flags: ['quiet_evening_page_found'],
    });
    const welcome = chooseChapterOption(chapter, 'welcome');
    const page = chooseChapterOption(welcome, 'quiet-page');
    const stars = chooseChapterOption(page, 'quiet-page-stars');
    const compared = chooseChapterOption(stars, 'quiet-page-compare');
    const respected = chooseChapterOption(compared, 'quiet-page-respect');
    const returned = chooseChapterOption(respected, 'quiet-page-return');
    const finished = chooseChapterOption(returned, 'leave');
    const mara = advanceToDayFourMara(decodeSave(encodeSave(finished))!);
    expect(mara.flags).toContain('iris_quiet_page_stars_compared');
    expect(mara.flags).toContain('iris_quiet_page_privacy_respected');
    expect(mara.dialogue.flags).toContain('iris_quiet_page_discussed');
  });

  it('does not contradict the final manuscript custody decision in the epilogue', () => {
    const returned = seasonEnding({
      flags: [
        'quiet_evening_page_found',
        'iris_quiet_page_privacy_respected',
        'final_quiet_manuscript_returned',
      ],
    }).epilogue;
    expect(returned).toContain('Айріс забрала сторінку');
    expect(returned).not.toContain('залишити знайдену сторінку');
    const archived = seasonEnding({
      flags: [
        'quiet_evening_page_found',
        'iris_quiet_page_identity_questioned',
        'final_quiet_manuscript_archived',
      ],
    }).epilogue;
    expect(archived).toContain('зберегли у книгарні');
    expect(archived).not.toContain('пошукати власника');
  });

  it('keeps both manuscript choices mutually exclusive', () => {
    const initial = startFifthDay({
      ...startChapter(),
      stage: 'day4-complete',
      flags: ['quiet_evening_page_found', 'iris_quiet_page_discussed'],
    });
    const gathering = chooseChapterOption(initial, 'open');
    const followup = chooseChapterOption(gathering, 'quiet-manuscript-followup');
    const archived = chooseChapterOption(followup, 'quiet-manuscript-archive');
    expect(
      availableOptions(finalReading, archived.dialogue).map((option) => option.id),
    ).not.toContain('quiet-manuscript-return');
    const returned = chooseChapterOption(archived, 'quiet-manuscript-result-back');
    expect(returned.flags).toContain('final_quiet_manuscript_archived');
    expect(returned.flags).not.toContain('final_quiet_manuscript_returned');
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

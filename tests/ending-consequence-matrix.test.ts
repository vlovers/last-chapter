import { describe, expect, it } from 'vitest';
import { seasonEnding } from '../src/game/endings';

const ending = (...flags: string[]) => seasonEnding({ flags });

describe('finale consequence matrix', () => {
  it('keeps private correspondence private in all ending variants', () => {
    for (const flags of [
      [],
      ['final_mutual_conversation'],
      ['final_letter_kept_private'],
      ['final_mutual_conversation', 'final_letter_kept_private'],
    ]) {
      const result = ending(...flags);
      expect(result.letter).toBeTruthy();
      expect(result.letter).not.toMatch(/зачитал|оприлюднен|публічн.*лист/i);
    }
  });

  it('distinguishes mutual conversation from a letter kept private', () => {
    const mutual = ending('final_mutual_conversation');
    const privateLetter = ending('final_letter_kept_private');
    const undecided = ending();
    expect(new Set([mutual.letter, privateLetter.letter, undecided.letter]).size).toBe(3);
    expect(ending('final_mutual_conversation', 'final_letter_kept_private').letter).toBe(
      mutual.letter,
    );
  });

  it('acknowledges earlier privacy violations even after making amends', () => {
    const respectful = ending('final_respected_privacy');
    for (const flag of [
      'anna_rumor_pressed',
      'thomas_privacy_pressed',
      'nora_confidentiality_pressed',
    ]) {
      const repaired = ending('final_respected_privacy', flag);
      expect(repaired.community).not.toBe(respectful.community);
      expect(repaired.community).toContain('попередніх');
    }
    expect(ending('final_repaired_rumor').community).toBe(respectful.community);
  });

  it('preserves every independent future when Iris and Mara are both supported', () => {
    const exhibition = ending('final_iris_exhibition', 'book_club_started');
    const mara = ending('mara_future_supported', 'book_club_started');
    const bookClub = ending('book_club_started');
    const both = ending('final_iris_exhibition', 'mara_future_supported', 'book_club_started');
    expect(new Set([exhibition.epilogue, mara.epilogue, bookClub.epilogue]).size).toBe(3);
    expect(exhibition.epilogue).toContain('Вікна Беллвіка');
    expect(mara.epilogue).toContain('Мара почала');
    for (const future of [bookClub, exhibition, mara, both]) {
      expect(future.epilogue).toContain('книжковий клуб');
    }
    expect(both.epilogue).toContain('Вікна Беллвіка');
    expect(both.epilogue).toContain('Мара почала');
    expect(both.epilogue).toBe(
      ending('mara_future_supported', 'final_iris_exhibition', 'book_club_started').epilogue,
    );
    const privateExhibition = ending(
      'final_letter_kept_private',
      'final_iris_exhibition',
      'book_club_started',
    );
    expect(privateExhibition.epilogue).toBe(exhibition.epilogue);
  });

  it('does not invent a book club after a quiet evening', () => {
    const quiet = ending('evening_shop_kept_open', 'final_iris_exhibition');
    expect(quiet.epilogue).toContain('замість книжкового клубу');
    expect(quiet.epilogue).toContain('Вікна Беллвіка');
    expect(quiet.epilogue).not.toContain('нове оголошення про книжковий клуб');
  });

  it('remembers the quiet-evening manuscript without claiming it was resolved', () => {
    const untouched = ending('evening_shop_kept_open');
    const discovered = ending('evening_shop_kept_open', 'quiet_evening_page_found');
    const respected = ending(
      'evening_shop_kept_open',
      'quiet_evening_page_found',
      'iris_quiet_page_privacy_respected',
    );
    const questioned = ending(
      'evening_shop_kept_open',
      'quiet_evening_page_found',
      'iris_quiet_page_identity_questioned',
    );

    expect(discovered.epilogue).toContain('Знайдена ввечері сторінка');
    expect(respected.epilogue).toContain('залишити знайдену сторінку між ними');
    expect(questioned.epilogue).toContain('пошукати власника знайденої сторінки');
    expect(
      new Set([untouched.epilogue, discovered.epilogue, respected.epilogue, questioned.epilogue])
        .size,
    ).toBe(4);

    for (const result of [untouched, discovered, respected, questioned]) {
      expect(result.epilogue).toContain('Френк заснув біля вікна');
      expect(result.epilogue).not.toContain('нове оголошення про книжковий клуб');
    }
  });

  it('keeps the manuscript decision independent of the letter and community outcomes', () => {
    const manuscriptFlags = [
      'evening_shop_kept_open',
      'quiet_evening_page_found',
      'iris_quiet_page_privacy_respected',
    ];
    const baseline = ending(...manuscriptFlags);
    const changed = ending(...manuscriptFlags, 'final_mutual_conversation', 'final_repaired_rumor');
    expect(changed.epilogue).toBe(baseline.epilogue);
    expect(changed.letter).not.toBe(baseline.letter);
    expect(changed.community).not.toBe(baseline.community);
  });

  it('preserves unrelated ending dimensions across every combination of decisions', () => {
    const letters = [[], ['final_mutual_conversation'], ['final_letter_kept_private']];
    const communities = [[], ['final_respected_privacy'], ['final_repaired_rumor']];
    const futures = [
      [],
      ['final_iris_exhibition'],
      ['mara_future_supported'],
      ['final_iris_exhibition', 'mara_future_supported'],
    ];
    for (const letterFlags of letters) {
      for (const communityFlags of communities) {
        for (const futureFlags of futures) {
          const flags = [...letterFlags, ...communityFlags, ...futureFlags];
          const result = ending(...flags);
          expect(result.letter).toBe(ending(...letterFlags).letter);
          expect(result.community).toBe(ending(...communityFlags).community);
          expect(result.epilogue).toBe(ending(...futureFlags).epilogue);
          expect(ending(...flags)).toEqual(result);
        }
      }
    }
  });

  it('does not erase earlier pressure when the player later repairs a rumor', () => {
    const baseline = ending('final_repaired_rumor');
    const afterPressure = ending('final_repaired_rumor', 'anna_rumor_pressed');
    expect(afterPressure.community).not.toBe(baseline.community);
    expect(afterPressure.letter).toBe(baseline.letter);
    expect(afterPressure.epilogue).toBe(baseline.epilogue);
  });
});

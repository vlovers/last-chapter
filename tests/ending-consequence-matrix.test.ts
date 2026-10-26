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

  it('keeps unrelated artistic and bookstore plans independent of the letter', () => {
    const exhibition = ending('final_iris_exhibition');
    const mara = ending('mara_future_supported');
    const bookClub = ending();
    expect(new Set([exhibition.epilogue, mara.epilogue, bookClub.epilogue]).size).toBe(3);
    expect(ending('final_iris_exhibition', 'mara_future_supported').epilogue).toBe(
      exhibition.epilogue,
    );
    expect(ending('final_letter_kept_private', 'final_iris_exhibition').epilogue).toBe(
      exhibition.epilogue,
    );
  });
});

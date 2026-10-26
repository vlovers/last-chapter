import { describe, expect, it } from 'vitest';
import { seasonEnding } from '../src/game/endings';

function ending(...flags: string[]) {
  return seasonEnding({ flags });
}

describe('Finale consequence matrix', () => {
  it('distinguishes mutual consent, private keeping and unresolved letters', () => {
    const mutual = ending('final_mutual_conversation');
    const privateLetter = ending('final_letter_kept_private');
    const unresolved = ending();
    expect(new Set([mutual.letter, privateLetter.letter, unresolved.letter]).size).toBe(3);
  });

  it('does not erase earlier privacy pressure with a last-minute apology', () => {
    const repaired = ending('final_repaired_rumor');
    const pressured = ending('anna_rumor_pressed', 'final_repaired_rumor');
    expect(pressured.community).not.toBe(repaired.community);
    expect(pressured.community).toContain('не стирає');
  });

  it('keeps a concealed breach distinct from confession and consent', () => {
    const hidden = ending('opened_private_letter');
    const admitted = ending('opened_private_letter', 'iris_letter_breach_admitted', 'final_accepted_consequences');
    const mutual = ending('final_mutual_conversation');
    expect(new Set([hidden.letter, admitted.letter, mutual.letter]).size).toBe(3);
    expect(hidden.letter).toContain('не знає');
    expect(admitted.letter).toContain('не дала обіцянки');
  });

  it('does not mistake a private letter for consent to a mutual conversation', () => {
    const privateLetter = ending('final_letter_kept_private');
    expect(privateLetter.letter).not.toBe(ending('final_mutual_conversation').letter);
  });

  it('gives Iris and Mara distinct visible futures', () => {
    const iris = ending('final_iris_exhibition');
    const mara = ending('mara_future_supported');
    const ordinary = ending();
    expect(new Set([iris.epilogue, mara.epilogue, ordinary.epilogue]).size).toBe(3);
  });

  it('uses deterministic outcomes independent of flag order', () => {
    const flags = ['final_repaired_rumor', 'anna_rumor_pressed', 'mara_future_supported'];
    expect(ending(...flags)).toEqual(ending(...flags.reverse()));
  });
});

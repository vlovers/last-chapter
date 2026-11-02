import { describe, expect, it } from 'vitest';
import { quietEvening } from '../src/content/quiet-evening';
import { journalEvidence, journalFacts } from '../src/phaser/journal-facts';
import { selectOption, startDialogue } from '../src/game/dialogue';

const facts = new Map(journalFacts);
const evidence = new Map(journalEvidence.map((entry) => [entry.flag, entry]));

describe('quiet-evening journal coverage', () => {
  const discovered = [
    'quiet_evening_page_found',
    'quiet_evening_page_examined',
    'iris_quiet_page_stars_compared',
    'iris_quiet_page_window_theory',
  ] as const;

  it.each(discovered)('provides authored journal copy for %s', (flag) => {
    expect(facts.get(flag)?.trim().length).toBeGreaterThan(20);
    expect(evidence.get(flag)?.source.trim().length).toBeGreaterThan(5);
  });

  it('records the manuscript only when the player keeps it', () => {
    const opening = startDialogue(quietEvening);
    const manuscript = selectOption(quietEvening, opening, 'tidy-books');
    const kept = selectOption(quietEvening, manuscript, 'keep-page');
    const left = selectOption(quietEvening, manuscript, 'leave-page');
    expect(kept.flags).toContain('quiet_evening_page_found');
    expect(left.flags).not.toContain('quiet_evening_page_found');
  });

  it('keeps the margin warning separate from taking the manuscript', () => {
    const manuscript = selectOption(quietEvening, startDialogue(quietEvening), 'tidy-books');
    const margin = selectOption(quietEvening, manuscript, 'read-margin');
    const kept = selectOption(quietEvening, margin, 'margin-keep');
    const left = selectOption(quietEvening, margin, 'margin-leave');
    expect(kept.flags).toContain('quiet_evening_page_found');
    expect(kept.flags).toContain('quiet_evening_margin_warning_seen');
    expect(left.flags).not.toContain('quiet_evening_page_found');
    expect(left.flags).toContain('quiet_evening_margin_warning_seen');
  });

  it('does not attribute unsupported day-two testimony to Iris', () => {
    expect(facts.has('iris_mothers_draft_heard')).toBe(false);
    expect(evidence.has('iris_mothers_draft_heard' as string)).toBe(false);
  });

  it('distinguishes the observed markings from the window interpretation', () => {
    expect(evidence.get('quiet_evening_page_examined')?.kind).toBe('observation');
    expect(evidence.get('iris_quiet_page_stars_compared')?.kind).toBe('observation');
    expect(evidence.get('iris_quiet_page_window_theory')?.kind).toBe('inference');
  });

  it('documents mutually exclusive manuscript custody outcomes without declaring authorship', () => {
    const returned = facts.get('final_quiet_manuscript_returned');
    const archived = facts.get('final_quiet_manuscript_archived');
    expect(returned).toContain('Айріс');
    expect(archived).toContain('книгарні');
    expect(returned).not.toContain('автора встановлено');
    expect(archived).not.toContain('автора встановлено');
    expect(returned).not.toEqual(archived);
  });

  it('keeps club and quiet-evening records separate', () => {
    expect(facts.get('book_club_started')).toContain('книжковий клуб');
    expect(facts.get('book_club_skipped')).toContain('тихий вечір');
  });

  it('links every evidence entry to an authored journal fact', () => {
    for (const entry of journalEvidence) {
      expect(facts.has(entry.flag), `Missing journal fact for ${entry.flag}`).toBe(true);
    }
  });

  it('does not confuse manuscript observation with an authorship claim', () => {
    const discovered = facts.get('quiet_evening_page_found');
    const examined = facts.get('quiet_evening_page_examined');
    expect(discovered).toContain('Автора не встановлено');
    expect(examined).toContain('дві цілі олівцеві зірочки');
    expect(facts.get('iris_quiet_page_stars_compared')).toContain(
      'авторство аркуша не підтверджено',
    );
  });

  it('does not duplicate journal fact flags or evidence provenance', () => {
    expect(new Set(journalFacts.map(([flag]) => flag)).size).toBe(journalFacts.length);
    expect(new Set(journalEvidence.map(({ flag }) => flag)).size).toBe(journalEvidence.length);
  });
});

import { describe, expect, it } from 'vitest';
import { journalEvidence, journalFacts } from '../src/phaser/journal-facts';

const facts = new Map(journalFacts);
const evidence = new Map(journalEvidence.map((entry) => [entry.flag, entry]));

describe('quiet-evening journal coverage', () => {
  const discovered = [
    'iris_mothers_draft_heard',
    'quiet_evening_page_found',
    'quiet_evening_page_examined',
    'iris_quiet_page_stars_compared',
    'iris_quiet_page_window_theory',
  ] as const;

  it.each(discovered)('provides authored journal copy for %s', (flag) => {
    expect(facts.get(flag)?.trim().length).toBeGreaterThan(20);
    expect(evidence.get(flag)?.source.trim().length).toBeGreaterThan(5);
  });

  it('distinguishes the observed markings from the window interpretation', () => {
    expect(evidence.get('quiet_evening_page_examined')?.kind).toBe('observation');
    expect(evidence.get('iris_quiet_page_stars_compared')?.kind).toBe('observation');
    expect(evidence.get('iris_quiet_page_window_theory')?.kind).toBe('inference');
    expect(evidence.get('iris_mothers_draft_heard')?.kind).toBe('testimony');
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

  it('does not duplicate journal fact flags or evidence provenance', () => {
    expect(new Set(journalFacts.map(([flag]) => flag)).size).toBe(journalFacts.length);
    expect(new Set(journalEvidence.map(({ flag }) => flag)).size).toBe(journalEvidence.length);
  });
});

import { describe, expect, it } from 'vitest';
import {
  deliverPrivateLetter,
  evidenceLevel,
  grantConsent,
  initialWorld,
  knows,
  observe,
  share,
} from '../src/game/knowledge';

describe('knowledge provenance', () => {
  it('keeps repeated observations as hearsay rather than direct evidence', () => {
    const world = share(initialWorld(), 'miller-sighting', 'miller', 'player');
    expect(evidenceLevel(world, 'player', 'met-nora')).toBe('rumor');
    expect(evidenceLevel(world, 'player', 'having-affair')).toBe('unknown');
    expect(evidenceLevel(world, 'miller', 'met-nora')).toBe('direct');
  });
  it('rejects knowledge teleportation', () => {
    expect(() => share(initialWorld(), 'thomas-private', 'miller', 'anna')).toThrow();
    expect(knows(initialWorld(), 'anna', 'support-meeting')).toBe(false);
  });
  it('preserves provenance through multiple tellings', () => {
    const first = share(initialWorld(), 'miller-sighting', 'miller', 'player');
    const second = share(first, 'miller-sighting:miller:player:1', 'player', 'anna');
    expect(evidenceLevel(second, 'anna', 'met-nora')).toBe('rumor');
    expect(second.reports.at(-1)?.parentId).toBe('miller-sighting:miller:player:1');
  });
  it('requires consent before sharing private letters', () => {
    const world = observe(initialWorld(), {
      id: 'letter-box',
      factId: 'iris-letter',
      claim: 'letter-exists',
      source: 'player',
      listener: 'player',
      day: 1,
      kind: 'document',
    });
    expect(() => deliverPrivateLetter(world, 'player', 'leo')).toThrow(/consent/);
    const allowed = grantConsent(world, 'iris', 'leo', 'iris-letter');
    expect(knows(deliverPrivateLetter(allowed, 'player', 'leo'), 'leo', 'letter-exists')).toBe(
      true,
    );
  });
  it('deduplicates the same disclosure', () => {
    const first = share(initialWorld(), 'miller-sighting', 'miller', 'player');
    expect(share(first, 'miller-sighting', 'miller', 'player')).toBe(first);
  });
  it('does not rewrite the truth when a rumor is repeated', () => {
    const world = share(initialWorld(), 'miller-sighting', 'miller', 'player');
    expect(knows(world, 'thomas', 'support-meeting')).toBe(true);
    expect(knows(world, 'player', 'support-meeting')).toBe(false);
  });
});

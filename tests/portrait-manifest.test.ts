import { describe, expect, it } from 'vitest';
import { cast, castMember } from '../src/game/cast';

describe('Original character portrait manifest', () => {
  it('provides one unique, local portrait per recurring character', () => {
    expect(cast).toHaveLength(8);
    expect(new Set(cast.map((member) => member.portrait)).size).toBe(8);
    for (const member of cast) {
      expect(member.portrait).toBe('/art/portraits/' + member.id + '.svg');
      expect(member.name.length).toBeGreaterThan(1);
    }
  });
  it('does not assign a portrait to the narrator', () => {
    expect(castMember('Оповідач')).toBeUndefined();
  });
});

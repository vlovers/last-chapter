import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, type DialogueState } from '../src/game/dialogue';

function callback(node: string, ...flags: string[]): string {
  const state: DialogueState = { node, flags, history: [] };
  return currentNode(finalReading, state).text;
}

describe('Mara and Leo share consequences across character arcs', () => {
  it('lets Mara acknowledge their mutual conversation', () => {
    const text = callback(
      'day-four-mara-callback',
      'mara_day_four_named_own_needs',
      'leo_day_four_chose_honesty',
    );
    expect(text).toContain('Ми з Лео поговорили');
    expect(text).toContain('чого потребую');
  });

  it('lets Leo recognize Mara boundaries without deciding for her', () => {
    const text = callback(
      'day-four-leo-callback',
      'leo_day_four_chose_honesty',
      'mara_day_four_named_own_needs',
    );
    expect(text).toContain('власне');
    expect(text).toContain('замість вгадувати');
  });

  it('preserves Mara solo callback when Leo did not choose honesty', () => {
    expect(callback('day-four-mara-callback', 'mara_day_four_named_own_needs')).toContain(
      'потрібна не обіцянка',
    );
  });

  it('preserves Leo solo callback when Mara did not name her needs', () => {
    expect(callback('day-four-leo-callback', 'leo_day_four_chose_honesty')).toContain(
      'Ми з Марою поговорили',
    );
  });
});

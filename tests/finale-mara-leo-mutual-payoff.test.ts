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
    expect(text).toContain('Ми з Лео нарешті поговорили про той квиток');
    expect(text).toContain('перевернули половину квартири');
  });

  it('lets Leo recognize Mara boundaries without deciding for her', () => {
    const text = callback(
      'day-four-leo-callback',
      'leo_day_four_chose_honesty',
      'mara_day_four_named_own_needs',
    );
    expect(text).toContain('просто поснідати вдома');
    expect(text).toContain('зроблю млинці');
  });

  it('does not reveal the mutual outcome when Mara only chose time for herself', () => {
    const text = callback(
      'day-four-mara-callback',
      'mara_day_four_chose_own_time',
      'leo_day_four_chose_honesty',
    );
    expect(text).toContain('Завтра пекарня працюватиме без мене');
    expect(text).not.toContain('Ми з Лео поговорили');
  });

  it('does not reveal the mutual outcome when Leo kept his memories private', () => {
    const text = callback(
      'day-four-leo-callback',
      'leo_day_four_respected_privacy',
      'mara_day_four_named_own_needs',
    );
    expect(text).toContain('Я залишив старий квиток');
    expect(text).not.toContain('Мара сказала');
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

import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { availableOptions, currentNode, startDialogue, selectOption } from '../src/game/dialogue';

describe('Anna and Thomas chairs continuity', () => {
  const at = (story: typeof annaVisit, flags: string[]) => {
    const start = { ...startDialogue(story), flags };
    return selectOption(story, start, 'hello');
  };

  it('only exposes the follow-up after Thomas discusses the missed promise', () => {
    expect(
      availableOptions(annaVisit, at(annaVisit, [])).some(
        (o) => o.id === 'anna-thomas-chairs-followup',
      ),
    ).toBe(false);
    expect(
      availableOptions(annaVisit, at(annaVisit, ['thomas_chairs_discussed'])).some(
        (o) => o.id === 'anna-thomas-chairs-followup',
      ),
    ).toBe(true);
  });

  it.each([
    ['thomas_chairs_owned_mistake', 'Він подзвонив мені'],
    ['thomas_chairs_avoided_conversation', 'Він приніс нові стільці'],
  ])('reflects Thomas choice %s in Anna dialogue', (flag, expected) => {
    const state = selectOption(
      annaVisit,
      at(annaVisit, ['thomas_chairs_discussed', flag]),
      'anna-thomas-chairs-followup',
    );
    expect(currentNode(annaVisit, state).text).toContain(expected);
  });

  it.each([
    ['anna-chairs-defend', 'anna_chairs_player_defended_thomas'],
    ['anna-chairs-listen', 'anna_chairs_player_heard_anna'],
    ['anna-chairs-change-topic', 'anna_chairs_player_changed_topic'],
  ])('records player stance %s', (option, flag) => {
    const start = selectOption(
      annaVisit,
      at(annaVisit, ['thomas_chairs_discussed']),
      'anna-thomas-chairs-followup',
    );
    const chosen = selectOption(annaVisit, start, option);
    expect(chosen.flags).toContain(flag);
    const returned = selectOption(annaVisit, chosen, 'anna-chairs-back');
    expect(returned.flags).toContain('anna_thomas_chairs_followup_discussed');
    expect(
      availableOptions(annaVisit, returned).some((o) => o.id === 'anna-thomas-chairs-followup'),
    ).toBe(false);
  });

  it('keeps Thomas ownership and avoidance options available in his own scene', () => {
    const ids = thomasVisit.nodes
      .find((node) => node.id === 'thomas-chairs')
      ?.options.map((option) => option.id);
    expect(ids).toContain('thomas-chairs-own');
    expect(ids).toContain('thomas-chairs-fix');
  });
});

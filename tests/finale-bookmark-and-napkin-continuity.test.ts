import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const bookmarkRoutes = [
  {
    choice: 'frank-shop-bookmark-spare',
    back: 'frank-shop-bookmark-spare-back',
    result: 'Рибку нехай залишить собі до ранку',
    flag: 'final_frank_shop_spare_bookmark',
  },
  {
    choice: 'frank-shop-bookmark-wait',
    back: 'frank-shop-bookmark-wait-back',
    result: 'закладку забрати завтра',
    flag: 'final_frank_shop_waited_for_cat',
  },
  {
    choice: 'frank-shop-bookmark-laugh',
    back: 'frank-shop-bookmark-laugh-back',
    result: 'Анна забирає свою рибку',
    flag: 'final_frank_shop_anna_laughed',
  },
] as const;

describe('Final evening: bookmark and illustrated napkin continuity', () => {
  it.each(
    [false, true].flatMap((heardAnna) =>
      bookmarkRoutes.map((route) => ({
        ...route,
        heardAnna,
        name: `${heardAnna ? 'Anna club heard' : 'ordinary'} / ${route.choice}`,
      })),
    ),
  )('$name', ({ choice, back, result, flag, heardAnna }) => {
    let state = startDialogue(finalReading);
    state = selectOption(finalReading, state, 'open');
    if (heardAnna) {
      state = { ...state, flags: [...state.flags, 'final_anna_club_heard'] };
    }
    state = selectOption(finalReading, state, 'frank-shop-evening');
    state = selectOption(finalReading, state, 'frank-shop-bookmark');

    const introduction = currentNode(finalReading, state).text;
    expect(introduction).toMatch(/рибк/iu);
    expect(introduction).toContain(heardAnna ? 'мою рибку' : 'картонну рибку');
    state = selectOption(finalReading, state, choice);
    expect(currentNode(finalReading, state).text).toContain(result);

    const saved = decodeSave(
      encodeSave({ stage: 'day5-reading', flags: [...state.flags], dialogue: state }),
    );
    expect(saved).not.toBeNull();
    state = saved!.dialogue;
    state = selectOption(finalReading, state, back);
    expect(state.node).toBe('frank-shop-hub');
    expect(state.flags).toContain('final_frank_shop_bookmark_done');
    expect(state.flags).toContain(flag);
  });

  it('attributes the villain-discussion napkin to Iris after a save round trip', () => {
    let state = startDialogue(finalReading);
    for (const choice of [
      'open',
      'final-reader-debates',
      'reader-villain',
      'villain-nora',
      'villain-nora-back',
    ]) {
      state = selectOption(finalReading, state, choice);
    }
    const saved = decodeSave(
      encodeSave({ stage: 'day5-reading', flags: [...state.flags], dialogue: state }),
    );
    expect(saved).not.toBeNull();
    const hub = currentNode(finalReading, saved!.dialogue).text;
    expect(hub).toContain('яке намалювала Айріс');
    expect(hub).toContain('серед читацьких жартів');
    expect(hub).not.toContain('Нора кладе серветку');
  });
});

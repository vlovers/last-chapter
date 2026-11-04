import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

const resolved = ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'] as const;

function gathering(flags: string[] = [...resolved]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

function choices(state: ReturnType<typeof startDialogue>) {
  return availableOptions(finalReading, state).map((option) => option.id);
}

function enterActivity(state: ReturnType<typeof startDialogue>, entry: string) {
  const group =
    entry === 'tomorrow-tea' || entry === 'tomorrow-frank-new'
      ? 'tomorrow-room-group'
      : entry === 'tomorrow-miller-new' ||
          entry === 'tomorrow-iris-new' ||
          entry === 'tomorrow-neighbors-new'
        ? 'tomorrow-neighbors-group'
        : 'tomorrow-books-group';
  return selectOption(finalReading, selectOption(finalReading, state, group), entry);
}

describe('fifth-day bookshop tomorrow: six ordinary-life endings', () => {
  it('does not interrupt the investigation before the box and custody decisions', () => {
    for (const flags of [[], [resolved[0]], [resolved[1]]]) {
      expect(choices(gathering(flags))).not.toContain('bookshop-tomorrow');
    }
    expect(choices(gathering())).toContain('bookshop-tomorrow');
  });

  it('lets the player postpone tidying without consuming the conversation', () => {
    const scene = selectOption(finalReading, gathering(), 'bookshop-tomorrow');
    expect(choices(scene)).toEqual(
      expect.arrayContaining([
        'tomorrow-books-group',
        'tomorrow-neighbors-group',
        'tomorrow-room-group',
        'tomorrow-later',
      ]),
    );
    const postponed = selectOption(finalReading, scene, 'tomorrow-later');
    expect(postponed.flags).not.toContain('final_bookshop_tomorrow_done');
    expect(choices(postponed)).toContain('bookshop-tomorrow');
  });

  it.each([
    [
      'tomorrow-shelf',
      'tomorrow-shelf-argue',
      'tomorrow-shelf-finish',
      'final_bookshop_debate_shelf',
      'сперечатися про фінали',
    ],
    [
      'tomorrow-shelf',
      'tomorrow-shelf-surprise',
      'tomorrow-shelf-finish',
      'final_bookshop_surprise_shelf',
      'книжка-сюрприз',
    ],
    [
      'tomorrow-cards',
      'tomorrow-cards-window',
      'tomorrow-cards-finish',
      'final_bookshop_children_window',
      'дитячі малюнки',
    ],
    [
      'tomorrow-cards',
      'tomorrow-cards-box',
      'tomorrow-cards-finish',
      'final_bookshop_wish_box',
      'скринька читацьких побажань',
    ],
    [
      'tomorrow-tea',
      'tomorrow-tea-rest',
      'tomorrow-tea-finish',
      'final_bookshop_quiet_cup',
      'чашку чаю',
    ],
    [
      'tomorrow-tea',
      'tomorrow-tea-buns',
      'tomorrow-tea-finish',
      'final_bookshop_mara_recipe',
      'рецепт булочок',
    ],
  ])('persists %s / %s as a one-shot consequence', (entry, choice, finish, flag, epilogue) => {
    const scene = selectOption(finalReading, gathering(), 'bookshop-tomorrow');
    const branch = enterActivity(scene, entry);
    const response = selectOption(finalReading, branch, choice);
    const completed = selectOption(finalReading, response, finish);
    expect(completed.node).toBe('gathering');
    expect(completed.flags).toContain(flag);
    expect(completed.flags).toContain('final_bookshop_tomorrow_done');
    expect(choices(completed)).not.toContain('bookshop-tomorrow');
    expect(seasonEnding({ flags: completed.flags }).epilogue).toContain(epilogue);
    expect(seasonEnding({ flags: completed.flags }).epilogue).not.toContain(
      'авторство другого аркуша встановлено',
    );
  });

  it('accounts for Nora’s three novels when she selects two for the shelf', () => {
    const scene = selectOption(finalReading, gathering(), 'bookshop-tomorrow');
    expect(currentNode(finalReading, scene).text).toContain('три романи');
    const shelf = enterActivity(scene, 'tomorrow-shelf');
    expect(currentNode(finalReading, shelf).text).toContain('відкладає один');
    expect(currentNode(finalReading, shelf).text).toContain('два інші');
  });

  it('offers Iris a choice without implying that the player grants permission', () => {
    const scene = selectOption(finalReading, gathering(), 'bookshop-tomorrow');
    const iris = enterActivity(scene, 'tomorrow-iris-new');
    const option = availableOptions(finalReading, iris).find(
      (entry) => entry.id === 'tomorrow-iris-choose-new',
    );
    expect(option?.label).toBe('Запропонувати Айріс самій обрати книжку');
  });

  it('does not make a rumor disappear from the public room or the ending', () => {
    const flags = [...resolved, 'final_miller_ledger_rumor_seeded'];
    const scene = selectOption(finalReading, gathering(flags), 'bookshop-tomorrow');
    expect(currentNode(finalReading, scene).text).toContain('Айріс не підходить');
    const shelf = enterActivity(scene, 'tomorrow-shelf');
    const result = selectOption(finalReading, shelf, 'tomorrow-shelf-argue');
    const done = selectOption(finalReading, result, 'tomorrow-shelf-finish');
    expect(seasonEnding({ flags: done.flags }).community).toContain('чутка');
  });

  it('acknowledges a correction without claiming Iris forgave anyone', () => {
    const flags = [
      ...resolved,
      'final_miller_ledger_rumor_seeded',
      'final_miller_rumor_corrected_publicly',
    ];
    const scene = selectOption(finalReading, gathering(flags), 'bookshop-tomorrow');
    expect(currentNode(finalReading, scene).text).toContain('Айріс досі стоїть окремо');
    expect(seasonEnding({ flags: scene.flags }).community).toContain('не почув виправлення');
  });

  it('keeps the scene completed after save and reload', () => {
    const scene = selectOption(finalReading, gathering(), 'bookshop-tomorrow');
    const tea = enterActivity(scene, 'tomorrow-tea');
    const result = selectOption(finalReading, tea, 'tomorrow-tea-rest');
    const done = selectOption(finalReading, result, 'tomorrow-tea-finish');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: done, flags: done.flags }),
    );
    expect(restored).not.toBeNull();
    expect(restored?.flags).toContain('final_bookshop_quiet_cup');
    expect(choices(restored!.dialogue)).not.toContain('bookshop-tomorrow');
  });

  it('validates every new node and limits each to four choices', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of finalReading.nodes.filter((entry) =>
      entry.id.startsWith('bookshop-tomorrow'),
    )) {
      expect(new Set(node.options.map((option) => option.id)).size, node.id).toBe(
        node.options.length,
      );
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});

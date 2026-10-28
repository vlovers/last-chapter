import { afterEach, describe, expect, it, vi } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { finaleTopicGroups } from '../src/content/finale-topics';
import { startDialogue } from '../src/game/dialogue';
import { encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

afterEach(() => vi.unstubAllGlobals());
const gathering = finalReading.nodes.find((node) => node.id === 'gathering')!;
function storyWith(flags: readonly string[]) {
  const save = encodeSave({
    stage: 'day5-reading',
    flags,
    dialogue: { ...startDialogue(finalReading), node: 'gathering', flags },
  });
  const values = new Map([[SAVE_KEY, save]]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  return { story: new FiveDayStory(), values, save };
}

describe('finale navigation without changing narrative state', () => {
  it('categorizes every authored topic exactly once and leaves completion separate', () => {
    const ids = finaleTopicGroups.flatMap((group) => [...group.choices]);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(
      gathering.options
        .filter((option) => option.id !== 'close')
        .map((option) => option.id)
        .sort(),
    );
  });

  for (const flags of [
    [],
    [...new Set(gathering.options.flatMap((option) => option.requires ?? []))],
    [
      'final_supported_iris',
      'final_anna_club_heard',
      'final_quiet_manuscript_followup',
      'final_frank_evening_heard',
    ],
  ]) {
    it(`keeps every available option reachable with ${flags.length} prior facts`, () => {
      const { story, values, save } = storyWith(flags);
      const canonical = story.open();
      const overview = story.present();
      expect(overview.choices.length).toBeLessThanOrEqual(5);
      expect(overview.choices.some((choice) => choice.id === 'close')).toBe(true);
      const found = new Set(['close']);
      for (const category of overview.choices.filter((choice) =>
        choice.id.startsWith('__topics_'),
      )) {
        story.choose(category.id);
        const pages = new Set<string>();
        for (let step = 0; step < 20; step++) {
          const view = story.present();
          const signature = view.choices.map((choice) => choice.id).join(',');
          if (pages.has(signature)) break;
          pages.add(signature);
          expect(view.choices.length).toBeLessThanOrEqual(6);
          expect(view.choices.some((choice) => choice.id === 'close')).toBe(true);
          for (const choice of view.choices) if (!choice.id.startsWith('__')) found.add(choice.id);
          if (!view.choices.some((choice) => choice.id === '__more_choices')) break;
          story.choose('__more_choices');
        }
        expect(pages.size).toBeLessThan(20);
        story.choose('__topics');
      }
      expect([...found].sort()).toEqual(canonical.choices.map((choice) => choice.id).sort());
      expect(story.open()).toEqual(canonical);
      expect(values.get(SAVE_KEY)).toBe(save);
    });
  }

  it('updates unseen counts after a decision, then restores the exact underlying conversation', () => {
    const { story, values } = storyWith(['quiet_evening_page_found', 'iris_quiet_page_discussed']);
    const before = story
      .present()
      .choices.find((choice) => choice.id === '__topics_mystery')!.label;
    story.choose('__topics_mystery');
    story.choose('quiet-manuscript-followup');
    story.choose('quiet-manuscript-archive');
    const restored = new FiveDayStory();
    expect(restored.present()).toEqual(story.present());
    restored.choose('quiet-manuscript-result-back');
    restored.choose('__topics_mystery');
    restored.choose('__topics');
    expect(
      restored.present().choices.find((choice) => choice.id === '__topics_mystery')!.label,
    ).not.toBe(before);
    expect(
      restored.open().choices.some((choice) => choice.id === 'quiet-manuscript-followup'),
    ).toBe(false);
    expect(JSON.parse(values.get(SAVE_KEY)!).flags).toContain('final_quiet_manuscript_archived');
  });

  it('never offers group navigation or pagination for completed days', () => {
    const { story } = storyWith([]);
    expect(() => story.choose('__topics_unknown')).toThrow('Navigation unavailable');
    story.choose('close');
    story.choose('__advance');
    expect(story.present().choices.map((choice) => choice.id)).toEqual(['__restart']);
    expect(() => story.choose('__more_choices')).toThrow('Navigation unavailable');
  });
});

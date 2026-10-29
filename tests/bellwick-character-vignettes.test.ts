import { describe, expect, it } from 'vitest';
import { leoVisit } from '../src/content/leo';
import { thomasVisit } from '../src/content/thomas';
import { eleanorVisit } from '../src/content/eleanor';
import { selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Bellwick station, bakery and old bookshop memories', () => {
  it('keeps every dialogue graph valid', () => {
    for (const story of [leoVisit, thomasVisit, eleanorVisit]) expect(validateDialogue(story)).toEqual([]);
  });
  it('supports all station concert responses', () => {
    for (const [choice, back, flag] of [
      ['leo-music-join', 'leo-music-join-back', 'leo_platform_singing_heard'],
      ['leo-music-train', 'leo-music-train-back', 'leo_platform_concert_heard'],
      ['leo-music-mara', 'leo-music-mara-back', 'leo_mara_platform_idea_heard'],
    ] as const) {
      let state = startDialogue(leoVisit);
      for (const id of ['greet', 'leo-platform-music', choice, back]) state = selectOption(leoVisit, state, id);
      expect(state.node).toBe('greet');
      expect(state.flags).toContain(flag);
    }
  });
  it('supports all crooked bakery shelf responses', () => {
    for (const [choice, back, flag] of [
      ['thomas-shelf-fix', 'thomas-shelf-fix-back', 'thomas_bakery_shelf_fix_discussed'],
      ['thomas-shelf-joke', 'thomas-shelf-joke-back', 'thomas_bakery_shelf_joke_heard'],
      ['thomas-shelf-ask', 'thomas-shelf-ask-back', 'thomas_bakery_cat_heard'],
    ] as const) {
      let state = startDialogue(thomasVisit);
      for (const id of ['greet', 'thomas-crooked-shelf', choice, back]) state = selectOption(thomasVisit, state, id);
      expect(state.node).toBe('greet');
      expect(state.flags).toContain(flag);
    }
  });
  it('supports all Eleanor bookshop ephemera responses', () => {
    for (const [choice, back, flag] of [
      ['eleanor-receipts-search', 'eleanor-receipts-search-back', 'eleanor_lost_key_story_heard'],
      ['eleanor-receipts-keep', 'eleanor-receipts-keep-back', 'eleanor_book_ephemera_discussed'],
      ['eleanor-receipts-frank', 'eleanor-receipts-frank-back', 'eleanor_frank_detective_joke_heard'],
    ] as const) {
      let state = startDialogue(eleanorVisit);
      for (const id of ['greet', 'eleanor-old-receipts', choice, back]) state = selectOption(eleanorVisit, state, id);
      expect(state.node).toBe('greet');
      expect(state.flags).toContain(flag);
    }
  });
});

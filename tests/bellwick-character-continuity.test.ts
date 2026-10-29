import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { leoVisit } from '../src/content/leo';
import { annaVisit } from '../src/content/anna';
import { noraVisit } from '../src/content/nora';
import { currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';
import type { DialogueStory } from '../src/game/dialogue';

describe('Character memories of optional Bellwick conversations', () => {
  const cases: readonly {
    story: DialogueStory;
    path: readonly string[];
    flag: string;
    excerpt: string;
  }[] = [
    {
      story: maraVisit,
      path: ['hello', 'thank', 'talk'],
      flag: 'mara_fantasy_captain_supported',
      excerpt: 'корабельних боргів',
    },
    {
      story: leoVisit,
      path: ['greet'],
      flag: 'leo_mara_platform_idea_heard',
      excerpt: 'запросив Мару',
    },
    {
      story: annaVisit,
      path: ['hello'],
      flag: 'anna_school_theater_hero_heard',
      excerpt: 'крилатим деревом',
    },
    {
      story: noraVisit,
      path: ['hello'],
      flag: 'nora_umbrella_exhibit_heard',
      excerpt: 'двадцять дев’ять',
    },
  ];
  for (const { story, path, flag, excerpt } of cases) {
    it(`remembers ${flag} and keeps the old conversation accessible`, () => {
      expect(validateDialogue(story)).toEqual([]);
      let state = startDialogue(story);
      for (const id of path) state = selectOption(story, state, id);
      const node = currentNode(story, state);
      expect(
        node.textWhen?.some((line) => line.requires.includes(flag) && line.text.includes(excerpt)),
      ).toBe(true);
      expect(node.options.length).toBeGreaterThan(0);
    });
  }
});

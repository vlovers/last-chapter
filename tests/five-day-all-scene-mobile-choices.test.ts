import { afterEach, describe, expect, it, vi } from 'vitest';
import { stageStory, type ChapterStage } from '../src/game/chapter';
import { availableOptions, startDialogue, type DialogueState } from '../src/game/dialogue';
import { encodeSave, SAVE_KEY } from '../src/game/save';
import { FiveDayStory } from '../src/phaser/five-day-story';

const activeStages = [
  'miller',
  'mara',
  'evening',
  'iris',
  'anna',
  'leo',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'quiet-evening',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day5-reading',
] as const satisfies readonly ChapterStage[];

function collectVisibleReplies(session: FiveDayStory, stage: string, node: string) {
  const seenPages = new Set<string>();
  const replies: string[] = [];
  let cycled = false;
  for (let index = 0; index < 100; index++) {
    const ids = session.open().choices.map((choice) => choice.id);
    const signature = JSON.stringify(ids);
    if (seenPages.has(signature)) {
      cycled = true;
      break;
    }
    seenPages.add(signature);
    expect(ids.length, `${stage}/${node}: too many visible buttons`).toBeLessThanOrEqual(4);
    expect(new Set(ids).size, `${stage}/${node}: duplicate buttons`).toBe(ids.length);
    replies.push(...ids.filter((id) => !id.startsWith('__')));
    if (!ids.includes('__more_choices')) return replies;
    session.choose('__more_choices');
  }
  expect(cycled, `${stage}/${node}: pagination did not return to the first page`).toBe(true);
  return replies;
}

afterEach(() => vi.unstubAllGlobals());

describe('all five days: every authored scene fits four buttons and exposes its replies', () => {
  for (const stage of activeStages) {
    it(`${stage}: checks all nodes and distinct required-flag variants after save restoration`, () => {
      const values = new Map<string, string>();
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
          values.set(key, value);
        },
        removeItem: (key: string) => {
          values.delete(key);
        },
      });
      const graph = stageStory(stage);
      for (const node of graph.nodes) {
        const variants = new Map<string, readonly string[]>([['[]', []]]);
        for (const option of node.options) {
          const flags = option.requires ?? [];
          variants.set(JSON.stringify([...flags].sort()), flags);
        }
        for (const flags of variants.values()) {
          const dialogue: DialogueState = {
            ...startDialogue(graph),
            node: node.id,
            flags: [...flags],
          };
          const encoded = encodeSave({ stage, dialogue, flags });
          values.set(SAVE_KEY, encoded);
          const session = new FiveDayStory();
          expect(session.stage).toBe(stage);
          expect(session.isProgressSaved).toBe(true);
          const expected = availableOptions(graph, dialogue).map((option) => option.id);
          const actual = collectVisibleReplies(session, stage, node.id);
          expect(new Set(actual).size, `${stage}/${node.id}: repeated authored reply`).toBe(
            actual.length,
          );
          expect([...actual].sort(), `${stage}/${node.id}: missing reply`).toEqual(
            [...expected].sort(),
          );
          expect(values.get(SAVE_KEY), `${stage}/${node.id}: paging wrote a save`).toBe(
            encoded,
          );
        }
      }
    });
  }
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { books } from '../src/content/books';
import { customerOrders } from '../src/content/customer-orders';
import { stageStory, startChapter } from '../src/game/chapter';
import { decodeSave, encodeSave, SAVE_KEY, SAVE_LIMITS } from '../src/game/save';
import { SERVICE_KEY, validateOrderDefinition } from '../src/game/recommendation';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { availableOptions } from '../src/game/dialogue';
import { CLUES } from '../src/phaser/clue-board';

afterEach(() => vi.unstubAllGlobals());
function setup(stage = 'miller', node = 'order', flags: string[] = []) {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => storage.set(k, v),
  });
  storage.set(
    SAVE_KEY,
    JSON.stringify({ version: 1, stage, node, flags, history: [], completed: [], pending: [] }),
  );
  const events: Event[] = [];
  const target = new EventTarget();
  target.addEventListener('last-chapter:recommendation', (event) => events.push(event));
  vi.stubGlobal('window', target);
  return { story: new FiveDayStory(), storage, events };
}
describe('authored order extension contract', () => {
  it('binds all current orders to the existing catalog and original receipt branches', () => {
    expect(new Set(customerOrders.map((order) => order.id)).size).toBe(3);
    for (const order of customerOrders)
      expect(validateOrderDefinition(order, stageStory(order.stage))).toEqual([]);
    const order = customerOrders[0]!;
    expect(
      validateOrderDefinition(
        { ...order, choices: [{ book: 'missing', choice: 'missing', receipt: 'missing' }] },
        stageStory(order.stage),
      ),
    ).toEqual(
      expect.arrayContaining([
        'Unknown catalog book: missing',
        'Missing authored option: missing',
        'Missing original receipt grant: missing',
      ]),
    );
  });
  for (const order of customerOrders)
    for (const book of books)
      for (const clarify of [false, true]) {
        it(`${order.id}: ${book.id}, optional question ${clarify}, retry/suspend/reload/idempotence`, () => {
          const { story, storage, events } = setup(order.stage, order.node);
          const initial = storage.get(SAVE_KEY);
          if (clarify) story.clarifyRequest();
          expect(story.request?.asked).toBe(clarify);
          const result = story.recommend(book.id)!;
          const choice = order.choices.find((choice) => choice.book === book.id);
          expect(result.accepted).toBe(Boolean(choice));
          expect(events).toHaveLength(1);
          if (choice) {
            expect(decodeSave(storage.get(SAVE_KEY)!)?.flags).toContain(choice.receipt);
            const persisted = storage.get(SAVE_KEY),
              restored = new FiveDayStory();
            expect(restored.orders).toHaveLength(1);
            expect(restored.lastRecommendation).toEqual({ text: result.text, accepted: true });
            expect(restored.recommend(book.id)).toBeNull();
            expect(events).toHaveLength(1);
            expect(storage.get(SAVE_KEY)).toBe(persisted);
            // Every purchase reaction retains a valid route toward the original visit ending.
            expect(
              availableOptions(stageStory(order.stage), decodeSave(persisted!)!.dialogue).length,
            ).toBeGreaterThan(0);
          } else {
            expect(storage.get(SAVE_KEY)).toBe(initial);
            const restored = new FiveDayStory();
            expect(restored.lastRecommendation).toEqual({ text: result.text, accepted: false });
            expect(restored.request?.asked).toBe(clarify);
            expect(restored.recommend(book.id)?.accepted).toBe(false);
            expect(events).toHaveLength(2);
            expect(restored.recommend(order.choices[0]!.book)?.accepted).toBe(true);
            expect(restored.orders).toHaveLength(1);
          }
          expect(JSON.parse(storage.get(SERVICE_KEY)!).version).toBe(1);
        });
      }
  it('resumes old completed purchases from receipt flags even with no service save, and blocks a second sale', () => {
    const { story, events } = setup('miller', 'order', ['sold_witnesses']);
    expect(story.request).toBeNull();
    expect(story.recommend('orchard')).toBeNull();
    expect(events).toHaveLength(0);
    expect(story.lastRecommendation?.accepted).toBe(true);
    expect(story.lastRecommendation?.text).toContain('Шестеро');
    expect(story.orders).toHaveLength(1);
  });
  it('caps retry diagnostics without discarding questions or adding purchases', () => {
    const { story, storage } = setup();
    story.clarifyRequest();
    for (let i = 0; i < 150; i++) story.recommend('station');
    const resumed = new FiveDayStory();
    expect(resumed.orders).toHaveLength(0);
    expect(resumed.request?.asked).toBe(true);
    expect(JSON.parse(storage.get(SERVICE_KEY)!).attempts).toHaveLength(30);
  });
});
describe('large saves and investigation provenance', () => {
  it('round trips a long route with many flags, history and completion records without resetting the chapter', () => {
    const state = startChapter();
    const flags = Array.from({ length: 600 }, (_, i) => `known_${i}`);
    const chapter = {
      ...state,
      flags,
      dialogue: {
        ...state.dialogue,
        flags,
        history: Array(5000).fill('greet'),
        completed: Array.from({ length: 2000 }, (_, i) =>
          JSON.stringify(['arrival', `topic_${i}`, []]),
        ),
        pending: [],
      },
    };
    expect(decodeSave(encodeSave(chapter))).toEqual(chapter);
    const { storage } = setup();
    storage.set(SAVE_KEY, encodeSave(chapter));
    expect(new FiveDayStory().stage).toBe('miller');
    expect(decodeSave(storage.get(SAVE_KEY)!)?.flags).toHaveLength(600);
  });
  it('bounds diagnostic history while retaining the authoritative completion ledger', () => {
    const state = startChapter(),
      completed = [JSON.stringify(['arrival', 'greet', []])];
    const chapter = {
      ...state,
      dialogue: {
        ...state.dialogue,
        history: Array(SAVE_LIMITS.history + 200).fill('greet'),
        completed,
        pending: [],
      },
    };
    const loaded = decodeSave(encodeSave(chapter));
    expect(loaded?.dialogue.history).toHaveLength(SAVE_LIMITS.history);
    expect(loaded?.dialogue.completed).toEqual(completed);
    expect(decodeSave(' '.repeat(SAVE_LIMITS.bytes + 1))).toBeNull();
    expect(
      decodeSave(
        JSON.stringify({
          version: 1,
          stage: 'miller',
          node: 'arrival',
          flags: [],
          history: [],
          completed: [],
          pending: [{ hub: '', key: 'invalid' }],
        }),
      ),
    ).toBeNull();
  });
  it('projects only discovered records and testimony; a deduction is never labelled an observation', () => {
    const { story } = setup('miller', 'order', ['saw_receipt', 'heard_about_leak', 'rumor_heard']);
    expect(story.knownEvidence.map((entry) => entry.kind)).toEqual(['record', 'testimony']);
    expect(story.knownEvidence.some((entry) => entry.title === 'Журнал ремонту')).toBe(false);
    expect(CLUES.find((clue) => clue.id === 'timeline')?.kind).toBe('inference');
  });
});

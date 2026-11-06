import { afterEach, describe, expect, it, vi } from 'vitest';
import journeys from './fixtures/production-v2-journeys.json';
import { createNarrativeHarness } from './helpers/narrative-harness';
import { seasonEnding } from '../src/game/endings';
import { currentNode } from '../src/game/dialogue';
import { stageStory } from '../src/game/chapter';
import { decodeSave, encodeSave } from '../src/game/save';

afterEach(() => vi.unstubAllGlobals());

type Harness = ReturnType<typeof createNarrativeHarness>;
type Routes = Partial<Record<string, readonly string[]>>;
const common: Routes = journeys.common;
const annaVoice = [
  'hello',
  'anna-book-disagreement',
  'anna-disagreement-debate',
  'anna-disagreement-back',
  'anna-v3-conversation',
  'anna-v3-ask',
  'anna-v3-challenge',
  'anna-v3-follow',
  'anna-v3-accept',
  'anna-v3-return',
  'books',
  'maps',
  'purchase-end',
  '__advance',
];
const thomasVoice = [
  'greet',
  'thomas-chairs',
  'thomas-chairs-own',
  'thomas-chairs-back',
  'thomas-v3-conversation',
  'thomas-v3-ask',
  'thomas-v3-challenge',
  'thomas-v3-follow',
  'thomas-v3-accept',
  'thomas-v3-return',
  'finish',
  '__advance',
];

function playToFinale(harness: Harness, overrides: Routes = {}) {
  for (let stage = 0; harness.game.stage !== 'day5-reading'; stage++) {
    if (stage > 25) throw new Error('Five-day progression loop');
    const route = overrides[harness.game.stage] ?? common[harness.game.stage];
    if (!route) throw new Error('No route for ' + harness.game.stage);
    for (const id of route) harness.choose(id);
  }
}

describe('production five-day integrity matrix', () => {
  it('gives a factual fallback when the school promise was not discussed earlier', () => {
    const harness = createNarrativeHarness(true);
    playToFinale(harness, {
      anna: annaVoice,
      thomas: thomasVoice.filter(
        (id) => !['thomas-chairs', 'thomas-chairs-own', 'thomas-chairs-back'].includes(id),
      ),
    });
    for (const id of ['open', 'final-couple-anna-thomas-option', 'final-at-listen'])
      harness.choose(id);
    expect(harness.game.open().text).toContain('Я обіцяв допомогти й не прийшов');
    expect(harness.game.open().text).not.toMatch(/час доставки|купив|подзвонив/);
  });

  it('uses the recent stance when an older save retains a different earlier stance', () => {
    const harness = createNarrativeHarness();
    playToFinale(harness, { anna: annaVoice, thomas: thomasVoice });
    for (const id of [
      'open',
      'school-reading-followup',
      'school-chairs-listen',
      'school-chairs-thomas',
      'school-chairs-plan',
      'school-chairs-outcome-back',
      'final-couple-anna-thomas-option',
      'final-at-listen',
      'final-at-children',
    ])
      harness.choose(id);
    const state = harness.chapter();
    // Earlier releases could save the now-legacy Day 2 branch. Both memories
    // remain facts, while the current evening's reply takes display priority.
    const olderMemory = 'anna_chairs_player_defended_thomas';
    const restored = decodeSave(
      encodeSave({
        ...state,
        flags: [...state.flags, olderMemory],
        dialogue: { ...state.dialogue, flags: [...state.dialogue.flags, olderMemory] },
      }),
    )!;
    expect(restored).not.toBeNull();
    expect(currentNode(stageStory(restored.stage), restored.dialogue).text).toContain(
      'Пам’ятаєш, я розповідала про Емму',
    );
    expect(restored.flags).toContain(olderMemory);
  });
  it.each([
    ['trusting/honest', 'mutual', false],
    ['secretive/avoidant', 'concealed', false],
    ['mixed', 'admitted', false],
    ['minimal interaction', 'minimal-evidence', false],
    ['completionist compatible topics', 'optional-completed', false],
    ['legacy continuation', 'maximum-evidence', true],
  ] as const)('%s earns its ending and survives every reload', (name, fixtureId, legacy) => {
    const scenario = journeys.scenarios.find((entry) => entry.id === fixtureId)!;
    const overrides = scenario.overrides as Routes;
    const harness = createNarrativeHarness(legacy);
    const visited = new Set<number>();
    const states = new Set<string>();
    for (let step = 0; harness.game.stage !== 'season-complete'; step++) {
      if (step > 25) throw new Error('Progression exceeded stage budget');
      visited.add(harness.game.day);
      const route = overrides[harness.game.stage] ?? common[harness.game.stage];
      expect(route, 'Missing scenario stage').toBeDefined();
      for (const id of route!) {
        harness.choose(id);
        const state = harness.chapter();
        const signature = JSON.stringify([
          state.stage,
          state.dialogue.node,
          state.flags,
          state.dialogue.completed,
          state.dialogue.pending,
        ]);
        expect(states.has(signature), `Unexpected loop after ${id}`).toBe(false);
        states.add(signature);
      }
    }
    expect([...visited]).toEqual([1, 2, 3, 4, 5]);
    expect(harness.game.progress.every((day) => day.status === 'completed')).toBe(true);
    expect(harness.chapter().flags).toEqual(expect.arrayContaining(scenario.expected));
    for (const flag of scenario.absent) expect(harness.chapter().flags).not.toContain(flag);
    const ending = seasonEnding(harness.chapter());
    expect(harness.game.open().text).toBe(
      [ending.letter, ending.community, ending.epilogue].join('\n\n'),
    );
    expect(harness.game.open().text).toContain(scenario.summary);
    console.info(
      'Verified narrative scenario',
      JSON.stringify({
        name,
        days: [...visited],
        choices: harness.trace.length,
        restores: harness.restores,
        legacy,
        finalNode: harness.chapter().dialogue.node,
      }),
    );
  });

  it.each([
    [
      'school-chairs-defend',
      'anna_chairs_player_defended_thomas',
      'Я чув, як ти мене захищав',
      'Ти тоді заступився за Томаса',
    ],
    [
      'school-chairs-listen',
      'anna_chairs_player_heard_anna',
      'Ти її вислухав',
      'Пам’ятаєш, я розповідала про Емму',
    ],
    [
      'school-chairs-reading',
      'anna_chairs_player_changed_topic',
      'Про книжковий пікнік',
      'Джуліан таки переконав',
    ],
  ])(
    '%s has a reachable Thomas response and a later Anna callback',
    (stance, flag, response, callback) => {
      const harness = createNarrativeHarness();
      playToFinale(harness, { anna: annaVoice, thomas: thomasVoice });
      for (const id of ['open', 'school-reading-followup', stance, 'school-chairs-thomas'])
        harness.choose(id);
      expect(harness.game.open().text).toContain(response);
      expect(harness.chapter().flags).toContain(flag);
      for (const id of ['school-chairs-plan', 'school-chairs-outcome-back']) harness.choose(id);
      expect(harness.allChoices()).not.toContain('school-reading-followup');
      const before = harness.chapter();
      expect(() => harness.game.choose('school-reading-followup')).toThrow('Option unavailable');
      expect(harness.chapter()).toEqual(before);
      harness.choose('final-couple-anna-thomas-option');
      expect(harness.game.open().text).toContain('Ми вже домовилися');
      harness.choose('final-at-listen');
      expect(harness.game.open().text).toContain('Після вечора, вдома');
      harness.choose('final-at-children');
      expect(harness.game.open().text).toContain(callback);
      for (const id of ['final-at-children-book', 'final-at-book-back', 'close', '__advance'])
        harness.choose(id);
      expect(seasonEnding(harness.chapter()).epilogue).toContain('домовилися поговорити вдома');
    },
  );

  it('keeps avoidance unresolved without inventing a purchase or an agreed time', () => {
    const harness = createNarrativeHarness(true);
    playToFinale(harness, {
      anna: annaVoice,
      thomas: thomasVoice.map((id) => (id === 'thomas-chairs-own' ? 'thomas-chairs-fix' : id)),
    });
    for (const id of ['open', 'final-couple-anna-thomas-option', 'final-at-listen'])
      harness.choose(id);
    expect(harness.game.open().text).toContain('пропонував купити');
    expect(harness.game.open().text).not.toContain('Я купив');
    for (const id of [
      'final-at-done',
      'final-at-close-back',
      'school-reading-followup',
      'school-chairs-reading',
      'school-chairs-thomas',
      'school-chairs-space',
      'school-chairs-outcome-back',
      'close',
      '__advance',
    ])
      harness.choose(id);
    expect(harness.chapter().flags).not.toContain('final_school_chairs_time_agreed');
    const ending = seasonEnding(harness.chapter());
    expect(ending.epilogue).toContain('Ти не домовлявся за них');
    expect(ending.epilogue).not.toContain('домовилися поговорити вдома');
  });

  it('remembers leaving the couple space in a later conversation that evening', () => {
    const harness = createNarrativeHarness(true);
    playToFinale(harness, { anna: annaVoice, thomas: thomasVoice });
    for (const id of [
      'open',
      'school-reading-followup',
      'school-chairs-reading',
      'school-chairs-thomas',
      'school-chairs-space',
      'school-chairs-outcome-back',
      'final-couple-anna-thomas-option',
    ])
      harness.choose(id);
    expect(harness.game.open().text).toContain('Розмову про стільці ми ще не закінчили');
    harness.choose('final-at-listen');
    expect(harness.game.open().text).toContain('дав нам самим розібратися');
    for (const id of ['final-at-done', 'final-at-close-back', 'close', '__advance'])
      harness.choose(id);
    expect(seasonEnding(harness.chapter()).epilogue).toContain('Ти не домовлявся за них');
  });

  it('keeps all seven character arcs coherent in one compatible completionist route', () => {
    const harness = createNarrativeHarness(true);
    const iris = common['day4-iris']!;
    playToFinale(harness, {
      anna: annaVoice,
      thomas: thomasVoice,
      'day4-iris': [
        ...iris.slice(0, -2),
        'art',
        'art-back',
        'iris-exhibition-open',
        'iris-exhibition-result-back',
        ...iris.slice(-2),
      ],
      'day4-mara': [
        'greet',
        'mara-rest',
        'mara-rest-back',
        'mara-own-story-work',
        'mara-own-story-followup-direct',
        'mara-own-story-back',
        'book',
        'book-back',
        'future',
        'future-back',
        'finish',
        '__advance',
      ],
      'day4-leo': [
        'welcome',
        'evidence',
        'evidence-back',
        'letter',
        'letter-ask',
        'ask-back',
        'finish',
        '__advance',
      ],
    });
    const gift = harness.trace.find(
      (entry) => entry.stage === 'day4-mara' && entry.option === 'book-back',
    );
    expect(gift?.text).toContain('станці');
    const evidence = harness.trace.find(
      (entry) => entry.stage === 'day4-leo' && entry.option === 'evidence-back',
    );
    expect(evidence?.text).toContain('я не знаю, що тоді знала Айріс');
    for (const id of ['open', 'rumor-miller-followup']) harness.choose(id);
    expect(harness.game.open().text).toContain('Ви ще тоді сказали');
    for (const id of [
      'rumor-miller-candy',
      'rumor-miller-books-return',
      'iris',
      'iris-exhibit',
      'exhibit-back',
      'final-eleanor-memory-topic',
    ])
      harness.choose(id);
    expect(harness.game.open().text).toContain('Елеонора');
    for (const id of [
      'final-eleanor-memory-dates',
      'final-eleanor-memory-record-gap',
      'final-eleanor-memory-dates-back',
      'school-reading-followup',
      'school-chairs-listen',
      'school-chairs-thomas',
      'school-chairs-plan',
      'school-chairs-outcome-back',
      'letter',
      'mutual',
      'mutual-back',
      'close',
      '__advance',
    ])
      harness.choose(id);
    const ending = seasonEnding(harness.chapter());
    expect(ending.letter).toContain('поговорили наодинці');
    for (const text of ['Вікна Беллвіка', 'Мара почала', 'домовилися поговорити вдома']) {
      expect(ending.epilogue).toContain(text);
    }
    expect(harness.chapter().flags).toEqual(
      expect.arrayContaining([
        'rumor_challenged',
        'eleanor_timeline_kept_uncertainty',
        'leo_understood_timeline',
        'final_eleanor_memory_gap_recorded',
        'final_iris_exhibition',
        'mara_future_supported',
      ]),
    );
    expect(harness.chapter().flags).not.toContain('opened_private_letter');
  });

  it.each([false, true])('remembers an immediate rumor withdrawal (withdrawn=%s)', (withdrawn) => {
    const harness = createNarrativeHarness(true);
    playToFinale(harness, {
      miller: [
        'greet',
        'town',
        'gossip',
        'what-saw',
        'speculate',
        withdrawn ? 'speculation-reconsider' : 'speculation-move-on',
        'orchard',
        'leave-orchard',
        '__advance',
      ],
    });
    for (const id of ['open', 'rumor-miller-followup']) harness.choose(id);
    expect(harness.game.open().text).toContain(
      withdrawn ? 'Ви тоді самі себе зупинили' : 'Ми тоді обоє',
    );
    for (const id of ['rumor-miller-listen', 'rumor-miller-answer-return']) harness.choose(id);
    expect(harness.allChoices()).not.toContain('rumor-miller-followup');
    for (const id of ['close', '__advance']) harness.choose(id);
    expect(harness.chapter().flags).toContain('rumor_amplified');
    expect(harness.chapter().flags).not.toContain('final_player_rumor_owned');
    const ending = seasonEnding(harness.chapter());
    expect(ending.epilogue).toContain(
      withdrawn ? 'відразу попросив пані Міллер' : 'За ці слова ще доведеться відповідати',
    );
    expect(ending.letter).not.toContain('відкрив');
  });
});

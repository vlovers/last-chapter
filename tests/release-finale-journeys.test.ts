import { afterEach, expect, it, vi } from 'vitest';
import journeys from './fixtures/production-v2-journeys.json';
import { createNarrativeHarness } from './helpers/narrative-harness';

afterEach(() => vi.unstubAllGlobals());

function playToFinale(fixtureId = 'mutual') {
  const harness = createNarrativeHarness(true);
  const common = journeys.common as Record<string, readonly string[]>;
  const scenario = journeys.scenarios.find((entry) => entry.id === fixtureId)!;
  const overrides = scenario.overrides as Partial<Record<string, readonly string[]>>;
  while (harness.game.stage !== 'day5-reading') {
    for (const id of overrides[harness.game.stage] ?? common[harness.game.stage]!)
      harness.choose(id);
  }
  return harness;
}

function revealLedger(harness: ReturnType<typeof playToFinale>, informed = true) {
  const route = journeys.scenarios.find((scenario) => scenario.id === 'mutual')!.overrides[
    'day5-reading'
  ]!;
  for (const id of route.slice(0, route.indexOf('ledger-finish') + 1)) {
    harness.choose(id === 'ledger-tell-iris' && !informed ? 'ledger-private' : id);
  }
}

it.each([false, true])(
  'Iris only recalls the box record after seeing it (informed=%s)',
  (informed) => {
    const harness = playToFinale();
    revealLedger(harness, informed);
    expect(harness.chapter().flags).toContain('final_ledger_resolved_17');
    for (const id of ['final-iris-evidence-topic', 'final-iris-evidence-rumor']) harness.choose(id);
    if (informed) {
      expect(harness.game.open().text).toContain('У журналі є запис про коробку');
      expect(harness.game.open().text).not.toContain('Це не доказ, що існує коробка');
    } else {
      expect(harness.game.open().text).toContain('Це не доказ, що існує коробка');
      expect(harness.game.open().text).not.toContain('У журналі є запис про коробку');
    }
    for (const id of [
      'final-iris-evidence-rumor-own',
      'final-iris-evidence-rumor-back',
      'close',
      '__advance',
    ])
      harness.choose(id);
    expect(harness.chapter().flags).toContain('final_ledger_resolved_17');
    expect(harness.chapter().flags).not.toContain('final_miller_ledger_rumor_seeded');
    expect(harness.game.stage).toBe('season-complete');
  },
);

it.each([
  [
    'corrected publicly',
    ['rumor-own', 'rumor-correct'],
    'final_miller_rumor_corrected_publicly',
    'Дехто вже пішов',
  ],
  ['blame shifted', ['rumor-deflect'], 'final_miller_rumor_deflected', 'перекласти провину'],
] as const)(
  'retains the consequences of a new false report: %s',
  (_name, response, flag, ending) => {
    const harness = playToFinale();
    revealLedger(harness);
    for (const id of [
      'miller-ledger-gossip',
      'miller-ledger-tease',
      'miller-ledger-back',
      'miller-rumor-aftermath',
      ...response,
      'rumor-aftermath-finish',
      'close',
      '__advance',
    ])
      harness.choose(id);
    expect(harness.chapter().flags).toContain('final_miller_ledger_rumor_seeded');
    expect(harness.chapter().flags).toContain(flag);
    expect(harness.chapter().flags).toContain('final_ledger_resolved_17');
    expect(harness.game.open().text).toContain(ending);
    expect(harness.game.stage).toBe('season-complete');
  },
);

it.each([
  ['final-eleanor-memory-accuse', 'final_eleanor_memory_public_accusation', 'пригрозив'],
  ['final-eleanor-memory-record-gap', 'final_eleanor_memory_gap_recorded', 'порожній рядок'],
] as const)(
  'keeps Eleanor’s uncertain call distinct from the player’s %s',
  (choice, flag, ending) => {
    const harness = playToFinale();
    for (const id of [
      'open',
      'final-eleanor-memory-topic',
      'final-eleanor-memory-dates',
      choice,
      'final-eleanor-memory-dates-back',
      'close',
      '__advance',
    ])
      harness.choose(id);
    expect(harness.chapter().flags).toContain(flag);
    expect(harness.game.open().text).toContain(ending);
    expect(harness.game.open().text).not.toContain('дзвінок підтверджено');
  },
);

it('lets an actual rumor amplifier admit it publicly without erasing the original choice', () => {
  const harness = playToFinale('private-rumor');
  expect(harness.chapter().flags).toContain('rumor_amplified');
  for (const id of [
    'open',
    'rumor-player-accountability',
    'rumor-own-public',
    'rumor-player-own-return',
    'close',
    '__advance',
  ])
    harness.choose(id);
  expect(harness.chapter().flags).toContain('rumor_amplified');
  expect(harness.chapter().flags).toContain('final_player_rumor_owned');
  expect(harness.game.open().text).toContain('Анна й Томас почули, що ти сам підтримав чутку');
  expect(harness.game.stage).toBe('season-complete');
});

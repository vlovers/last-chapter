import { afterEach, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { stageStory } from '../src/game/chapter';
import { availableOptions } from '../src/game/dialogue';
import { decodeSave, SAVE_KEY } from '../src/game/save';

afterEach(() => vi.unstubAllGlobals());

it('preserves production choices across 80 deterministic current and legacy save routes', () => {
  const covered = new Map<string, number>();
  const summaries = [];
  for (let seed = 1; seed <= 80; seed++) {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    let game = new FiveDayStory();
    let random = seed;
    const rng = () => (random = (Math.imul(random, 1664525) + 1013904223) >>> 0) / 2 ** 32;
    const route: string[] = [];
    const local = new Map<string, number>();
    for (let step = 0; game.stage !== 'season-complete'; step++) {
      const before = decodeSave(storage.get(SAVE_KEY) ?? '');
      const key = game.stage + '/' + (before?.dialogue.node ?? 'arrival');
      expect(step, JSON.stringify({ seed, route })).toBeLessThan(1400);
      const choices = game.open().choices;
      expect(choices.length).toBeLessThanOrEqual(4);
      const narrative =
        before && !game.stage.endsWith('complete')
          ? availableOptions(stageStory(game.stage), before.dialogue)
          : choices;
      const options = narrative.length ? narrative : choices;
      const selectable = options.filter((option) => option.id !== '__more_choices');
      expect(selectable.length, JSON.stringify({ seed, key, route })).toBeGreaterThan(0);
      const scored = selectable
        .map((option) => {
          const edge = key + '/' + option.id;
          const terminal =
            'next' in option &&
            stageStory(game.stage).nodes.find((node) => node.id === option.next)?.options.length ===
              0;
          return {
            option,
            edge,
            score:
              rng() * 4 -
              (covered.get(edge) ?? 0) * 0.05 -
              (local.get(edge) ?? 0) * 12 -
              (terminal ? 3 : 0),
          };
        })
        .sort((a, b) => b.score - a.score);
      const selected = scored[0]!;
      route.push(selected.edge);
      covered.set(selected.edge, (covered.get(selected.edge) ?? 0) + 1);
      local.set(selected.edge, (local.get(selected.edge) ?? 0) + 1);
      game.choose(selected.option.id);
      expect(game.isProgressSaved, JSON.stringify({ seed, route })).toBe(true);
      const raw = storage.get(SAVE_KEY)!;
      const state = decodeSave(raw)!;
      expect(state, JSON.stringify({ seed, route })).not.toBeNull();
      const text = game.open().text;
      const expected = !game.stage.endsWith('complete')
        ? availableOptions(stageStory(game.stage), state.dialogue).map((o) => o.id)
        : [];
      if (seed % 2 === 0) {
        const legacy = JSON.parse(raw);
        delete legacy.completed;
        delete legacy.pending;
        storage.set(SAVE_KEY, JSON.stringify(legacy));
      }
      game = new FiveDayStory();
      expect(game.stage).toBe(state.stage);
      expect(decodeSave(storage.get(SAVE_KEY)!)!.flags).toEqual(state.flags);
      expect(game.open().text, JSON.stringify({ seed, route })).toBe(text);
      if (!game.stage.endsWith('complete')) {
        const restored = decodeSave(storage.get(SAVE_KEY)!)!;
        expect(
          availableOptions(stageStory(game.stage), restored.dialogue).map((o) => o.id),
          JSON.stringify({ seed, route }),
        ).toEqual(expected);
      }
    }
    summaries.push({
      seed,
      steps: route.length,
      flags: decodeSave(storage.get(SAVE_KEY)!)!.flags.length,
    });
  }
  expect(summaries).toHaveLength(80);
  console.info('Production save-route matrix', {
    routes: summaries.length,
    choices: summaries.reduce((total, route) => total + route.steps, 0),
    observedEdges: covered.size,
  });
}, 120_000);

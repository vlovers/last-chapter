import { expect, vi } from 'vitest';
import { FiveDayStory } from '../../src/phaser/five-day-story';
import { stageStory, type ChapterState } from '../../src/game/chapter';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../../src/game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from '../../src/game/save';

/** History is a trace, not simulation state once completion has been restored. */
function stateKey(state: DialogueState): string {
  return JSON.stringify([
    state.node,
    [...state.flags].sort(),
    [...(state.completed ?? [])].sort(),
    state.pending ?? [],
  ]);
}

/** A bounded runtime audit. Findings have witnesses; a cutoff never proves unreachability. */
export function auditRuntime(
  story: DialogueStory,
  initialFlags: readonly string[] = [],
  maxStates = 1000,
) {
  const structuralErrors = validateDialogue(story);
  const witnesses: Record<string, readonly string[]> = {};
  const deadEnds: { node: string; path: readonly string[] }[] = [];
  const noProgressLoops: { node: string; option: string; path: readonly string[] }[] = [];
  const terminals = new Set<string>();
  const edges = new Map<string, string[]>();
  const positions = new Map<string, { node: string; path: readonly string[] }>();
  const queue = [{ state: { ...startDialogue(story), flags: initialFlags }, path: [] as string[] }];
  const seen = new Set<string>();
  let cursor = 0;
  while (cursor < queue.length && seen.size < maxStates) {
    const { state, path } = queue[cursor++]!;
    const key = stateKey(state);
    if (seen.has(key)) continue;
    seen.add(key);
    positions.set(key, { node: state.node, path });
    edges.set(key, []);
    witnesses[state.node] ??= path;
    const node = currentNode(story, state);
    const options = availableOptions(story, state);
    if (!node.options.length) terminals.add(node.id);
    else if (!options.length) deadEnds.push({ node: node.id, path });
    const optionIds = new Set<string>();
    for (const option of options) {
      if (optionIds.has(option.id)) continue;
      optionIds.add(option.id);
      // Structural defects are reported without trying to execute broken edges.
      if (!story.nodes.some((destination) => destination.id === option.next)) continue;
      const next = selectOption(story, state, option.id);
      edges.get(key)!.push(stateKey(next));
      if (stateKey(next) === key) {
        noProgressLoops.push({ node: node.id, option: option.id, path });
      } else if (!seen.has(stateKey(next))) {
        queue.push({ state: next, path: [...path, option.id] });
      }
    }
  }
  // Find closed runtime components, including multi-node loops. A component
  // with an edge to an unexpanded state remains unknown even at the cutoff.
  let nextIndex = 0;
  const indexes = new Map<string, number>();
  const lows = new Map<string, number>();
  const stack: string[] = [];
  const active = new Set<string>();
  const closedCycles: { nodes: string[]; path: readonly string[] }[] = [];
  function visit(key: string) {
    indexes.set(key, nextIndex);
    lows.set(key, nextIndex++);
    stack.push(key);
    active.add(key);
    for (const target of edges.get(key) ?? []) {
      if (!edges.has(target)) continue;
      if (!indexes.has(target)) {
        visit(target);
        lows.set(key, Math.min(lows.get(key)!, lows.get(target)!));
      } else if (active.has(target)) {
        lows.set(key, Math.min(lows.get(key)!, indexes.get(target)!));
      }
    }
    if (lows.get(key) !== indexes.get(key)) return;
    const component = new Set<string>();
    let member: string;
    do {
      member = stack.pop()!;
      active.delete(member);
      component.add(member);
    } while (member !== key);
    const cyclic = component.size > 1 || edges.get(key)!.includes(key);
    if (
      cyclic &&
      [...component].every((entry) => edges.get(entry)!.every((target) => component.has(target)))
    ) {
      closedCycles.push({
        nodes: [...new Set([...component].map((entry) => positions.get(entry)!.node))].sort(),
        path: positions.get(key)!.path,
      });
    }
  }
  for (const key of edges.keys()) if (!indexes.has(key)) visit(key);
  return {
    structuralErrors,
    witnesses,
    deadEnds,
    noProgressLoops,
    closedCycles,
    terminals: [...terminals],
    unwitnessedNodes: story.nodes.map((node) => node.id).filter((id) => !witnesses[id]),
    truncated: cursor < queue.length,
    exploredStates: seen.size,
  };
}

/** Future-only prerequisites are concerns, not proof that the whole scene is unreachable. */
export function auditChronology(stories: readonly { day: number; story: DialogueStory }[]) {
  const firstGrant = new Map<string, number>();
  const authoredGrants = new Set(
    stories.flatMap(({ story }) =>
      story.nodes.flatMap((node) => node.options.flatMap((option) => option.grants ?? [])),
    ),
  );
  // An optimistic fixed point: mutually exclusive choices may coexist here.
  // Even this generous model cannot earn a fact from an inaccessible producer.
  // Unknown producers (exploration/service facts) are external, never fabricated witnesses.
  let changed = true;
  while (changed) {
    changed = false;
    for (const { day, story } of stories) {
      const reachable = new Set([story.start]);
      let expanded = true;
      while (expanded) {
        expanded = false;
        for (const node of story.nodes) {
          if (!reachable.has(node.id)) continue;
          for (const option of node.options) {
            if (
              !(option.requires ?? []).every(
                (flag) => !authoredGrants.has(flag) || (firstGrant.get(flag) ?? Infinity) <= day,
              )
            )
              continue;
            if (!reachable.has(option.next)) {
              reachable.add(option.next);
              expanded = true;
            }
            for (const flag of option.grants ?? []) {
              if ((firstGrant.get(flag) ?? Infinity) > day) {
                firstGrant.set(flag, day);
                changed = expanded = true;
              }
            }
          }
        }
      }
    }
  }
  return stories.flatMap(({ day, story }) =>
    story.nodes.flatMap((node) =>
      node.options.flatMap((option) =>
        (option.requires ?? []).flatMap((flag) => {
          const earliest = firstGrant.get(flag);
          return earliest !== undefined && earliest > day
            ? [{ day, node: node.id, option: option.id, flag, earliest }]
            : [];
        }),
      ),
    ),
  );
}

export interface NarrativeTrace {
  stage: string;
  node: string;
  option: string;
  text: string;
}

/** Drive the production adapter, including pagination, checkpoints and real save decoding. */
export function createNarrativeHarness(legacy = false) {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  let game = new FiveDayStory();
  const trace: NarrativeTrace[] = [];
  let restores = 0;
  const chapter = (): ChapterState => {
    const state = decodeSave(storage.get(SAVE_KEY) ?? '');
    if (!state) throw new Error('Missing or invalid narrative save');
    return state;
  };
  const allChoices = () => {
    const ids: string[] = [];
    const pages = new Set<string>();
    for (let page = 0; page < 100; page++) {
      const view = game.open();
      expect(view.choices.length, `${game.stage}: choice screen overflow`).toBeLessThanOrEqual(4);
      const key = JSON.stringify(view.choices.map((choice) => choice.id));
      if (pages.has(key)) return ids;
      pages.add(key);
      for (const choice of view.choices) {
        if (choice.id !== '__more_choices') {
          expect(ids, 'Duplicate paginated option').not.toContain(choice.id);
          ids.push(choice.id);
        }
      }
      if (!view.choices.some((choice) => choice.id === '__more_choices')) return ids;
      const before = storage.get(SAVE_KEY);
      game.choose('__more_choices');
      expect(storage.get(SAVE_KEY), 'Pagination changed story progress').toBe(before);
    }
    throw new Error('Pagination loop exceeded budget');
  };
  const restore = () => {
    const before = chapter();
    const expectedChoices = allChoices();
    const expectedText = game.open().text;
    const expectedNotes = game.notes;
    const expectedEvidence = game.evidence;
    if (legacy) {
      const raw = JSON.parse(encodeSave(before));
      delete raw.completed;
      delete raw.pending;
      storage.set(SAVE_KEY, JSON.stringify(raw));
    }
    const stored = storage.get(SAVE_KEY);
    game = new FiveDayStory();
    restores++;
    expect(storage.get(SAVE_KEY), 'Reading a save rewrote it').toBe(stored);
    expect(game.open().text).toBe(expectedText);
    expect(allChoices()).toEqual(expectedChoices);
    expect(game.notes).toEqual(expectedNotes);
    expect(game.evidence).toEqual(expectedEvidence);
    expect(chapter().flags).toEqual(before.flags);
  };
  return {
    get game() {
      return game;
    },
    get restores() {
      return restores;
    },
    chapter,
    allChoices,
    restore,
    trace,
    choose(id: string) {
      const before = storage.has(SAVE_KEY) ? chapter() : undefined;
      expect(allChoices(), `${game.stage}/${before?.dialogue.node}: unavailable ${id}`).toContain(
        id,
      );
      for (let page = 0; page < 100; page++) {
        const view = game.open();
        if (view.choices.some((choice) => choice.id === id)) {
          trace.push({
            stage: game.stage,
            node: before?.dialogue.node ?? stageStory('miller').start,
            option: id,
            text: view.text,
          });
          game.choose(id);
          const after = chapter();
          expect(new Set(after.flags).size, 'Duplicate narrative mutation').toBe(
            after.flags.length,
          );
          expect(after.flags).toEqual(expect.arrayContaining([...(before?.flags ?? [])]));
          if (!id.startsWith('__') && before?.stage === after.stage) {
            expect(after.dialogue.history).toEqual([...before.dialogue.history, id]);
          }
          restore();
          return;
        }
        if (!view.choices.some((choice) => choice.id === '__more_choices')) break;
        game.choose('__more_choices');
      }
      throw new Error('Could not select ' + id);
    },
  };
}

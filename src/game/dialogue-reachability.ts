import type { DialogueStory } from './dialogue';

export interface DialogueReachabilityResult {
  readonly reachableNodes: readonly string[];
  readonly reachableEdges: readonly string[];
  readonly unreachableNodes: readonly string[];
  readonly unreachableEdges: readonly string[];
  /** Edges that require and exclude the same fact: impossible under any initial facts. */
  readonly impossibleEdges: readonly string[];
  /** Prerequisite facts that cannot be granted by any choice in this story. */
  readonly potentiallyExternalFlags: readonly string[];
  readonly truncated: boolean;
  readonly exploredStates: number;
  /** First feasible option-ID route from the start to each reached node. */
  readonly witnessPaths: Readonly<Record<string, readonly string[]>>;
}

/**
 * Flag-feasibility exploration, not full save-ledger simulation.
 * External story facts can be supplied as initialFlags.
 */
export function analyzeDialogueReachability(
  story: DialogueStory,
  initialFlags: readonly string[] = [],
  maxStates = 10000,
): DialogueReachabilityResult {
  // Mirror the runtime's first-definition semantics for duplicate IDs.
  const byId = new Map<string, (typeof story.nodes)[number]>();
  for (const node of story.nodes) {
    if (!byId.has(node.id)) byId.set(node.id, node);
  }
  const reachableNodes = new Set<string>();
  const reachableEdges = new Set<string>();
  const visited = new Set<string>();
  const witnessPaths: Record<string, readonly string[]> = {};
  const queued = new Set<string>();
  const queue: { node: string; flags: readonly string[]; path: readonly string[] }[] = [
    { node: story.start, flags: [...new Set(initialFlags)].sort(), path: [] },
  ];
  queued.add(JSON.stringify([story.start, queue[0]!.flags]));
  const effectiveNodes = [...byId.values()];
  const impossibleEdges = effectiveNodes.flatMap((node) =>
    node.options
      .filter((option) =>
        (option.requires ?? []).some((flag) => (option.unless ?? []).includes(flag)),
      )
      .map((option) => JSON.stringify([node.id, option.id, option.next])),
  );
  const localGrants = new Set(
    effectiveNodes.flatMap((node) => node.options.flatMap((option) => option.grants ?? [])),
  );
  const potentiallyExternalFlags = [
    ...new Set(
      effectiveNodes.flatMap((node) => node.options.flatMap((option) => option.requires ?? [])),
    ),
  ].filter((flag) => !localGrants.has(flag));
  const allEdges = effectiveNodes.flatMap((node) =>
    node.options.map((option) => JSON.stringify([node.id, option.id, option.next])),
  );
  let cursor = 0;
  let truncated = false;
  const limit = Number.isFinite(maxStates) ? Math.max(0, Math.floor(maxStates)) : 10000;

  while (cursor < queue.length) {
    if (visited.size >= limit) {
      truncated = true;
      break;
    }
    const state = queue[cursor++]!;
    const key = JSON.stringify([state.node, state.flags]);
    if (visited.has(key)) continue;
    visited.add(key);
    const node = byId.get(state.node);
    if (!node) continue;
    reachableNodes.add(node.id);
    witnessPaths[node.id] ??= state.path;
    const facts = new Set(state.flags);
    for (const option of node.options) {
      if (!(option.requires ?? []).every((flag) => facts.has(flag))) continue;
      if ((option.unless ?? []).some((flag) => facts.has(flag))) continue;
      reachableEdges.add(JSON.stringify([node.id, option.id, option.next]));
      const nextFlags = [...new Set([...state.flags, ...(option.grants ?? [])])].sort();
      const nextKey = JSON.stringify([option.next, nextFlags]);
      if (!queued.has(nextKey)) {
        queued.add(nextKey);
        queue.push({ node: option.next, flags: nextFlags, path: [...state.path, option.id] });
      }
    }
  }

  return {
    reachableNodes: [...reachableNodes],
    reachableEdges: [...reachableEdges],
    unreachableNodes: effectiveNodes.map((node) => node.id).filter((id) => !reachableNodes.has(id)),
    unreachableEdges: allEdges.filter((edge) => !reachableEdges.has(edge)),
    impossibleEdges,
    potentiallyExternalFlags,
    truncated,
    exploredStates: visited.size,
    witnessPaths,
  };
}

export type TopicId = string;
export type SceneId = string;

export interface DialogueOption {
  readonly id: string;
  readonly label: string;
  readonly next: SceneId;
  readonly requires?: readonly string[];
  /** Hide an option if any of these facts is already true. */
  readonly unless?: readonly string[];
  readonly grants?: readonly string[];
  /** Choices complete on return/exit; reusable interactions opt out explicitly. */
  readonly repeatability?: 'once' | 'repeatable';
  /** A changed set of these story facts opens a fresh version of the topic. */
  readonly reopensWhen?: readonly string[];
  /** Return without completing the active topic (for an explicit deferral). */
  readonly suspend?: boolean;
}

export interface DialogueNode {
  readonly id: SceneId;
  readonly speaker: string;
  readonly text: string;
  /** Most specific matching flag-dependent narration replaces the default text. */
  readonly textWhen?: readonly { readonly requires: readonly string[]; readonly text: string }[];
  /** Independent closing callbacks follow the selected narration without replacing it. */
  readonly afterwordWhen?: readonly {
    readonly requires: readonly string[];
    readonly unless?: readonly string[];
    readonly text: string;
  }[];
  readonly options: readonly DialogueOption[];
  readonly hub?: boolean;
  /** Some endings have an authored ethical priority independent of flag count. */
  readonly variantSelection?: 'specific' | 'authored';
}

export interface DialogueStory {
  readonly start: SceneId;
  readonly nodes: readonly DialogueNode[];
}

export interface DialogueState {
  readonly node: SceneId;
  readonly flags: readonly string[];
  readonly history: readonly string[];
  readonly completed?: readonly string[];
  readonly pending?: readonly { hub: string; key: string }[];
}

export function startDialogue(story: DialogueStory): DialogueState {
  if (!story.nodes.some((node) => node.id === story.start)) {
    throw new Error('Missing start node');
  }
  return { node: story.start, flags: [], history: [] };
}

export function currentNode(story: DialogueStory, state: DialogueState): DialogueNode {
  const node = story.nodes.find((entry) => entry.id === state.node);
  if (!node) throw new Error('Missing dialogue node');
  // Prefer the most specific matching narration. A generic one-flag variant
  // must not hide a later two-flag variant when both conditions are true.
  const variant = node.textWhen?.reduce<NonNullable<DialogueNode['textWhen']>[number] | undefined>(
    (best, entry) => {
      if (!entry.requires.every((flag) => state.flags.includes(flag))) return best;
      if (node.variantSelection === 'authored') return best ?? entry;
      return !best || entry.requires.length > best.requires.length ? entry : best;
    },
    undefined,
  );
  const afterwords = (node.afterwordWhen ?? [])
    .filter(
      (entry) =>
        entry.requires.every((flag) => state.flags.includes(flag)) &&
        !(entry.unless ?? []).some((flag) => state.flags.includes(flag)),
    )
    .map((entry) => entry.text);
  return variant || afterwords.length
    ? { ...node, text: [variant?.text ?? node.text, ...afterwords].join('\n\n') }
    : node;
}

function completionKey(node: DialogueNode, option: DialogueOption, flags: readonly string[]) {
  return JSON.stringify([
    node.id,
    option.id,
    (option.reopensWhen ?? []).filter((f) => flags.includes(f)),
  ]);
}

// Legacy histories can contain thousands of edges. A single immutable dialogue
// snapshot is queried repeatedly by the journal, guidance and dialogue UI, so
// replay its history only once per graph. Weak keys avoid retaining old scenes.
const legacyReplayCache = new WeakMap<DialogueState, WeakMap<DialogueStory, DialogueState>>();

/** Reconstruct legacy progress from its recorded edges, never from flags alone. */
export function restoreDialogueProgress(story: DialogueStory, state: DialogueState): DialogueState {
  if (state.completed !== undefined) return state;
  const cached = legacyReplayCache.get(state)?.get(story);
  if (cached) return cached;
  let replay = startDialogue(story);
  for (const id of state.history) {
    const node = currentNode(story, replay);
    const option = node.options.find((o) => o.id === id);
    if (!option) break;
    // Legacy replay only needs flags and completion ledgers. Rebuilding a
    // growing history array on every edge makes long migrations quadratic.
    replay = applyOption(story, replay, node, option, false);
  }
  const restored = { ...state, completed: replay.completed ?? [], pending: replay.pending ?? [] };
  let byStory = legacyReplayCache.get(state);
  if (!byStory) {
    byStory = new WeakMap<DialogueStory, DialogueState>();
    legacyReplayCache.set(state, byStory);
  }
  byStory.set(story, restored);
  return restored;
}

export function availableOptions(
  story: DialogueStory,
  state: DialogueState,
): readonly DialogueOption[] {
  const progress = restoreDialogueProgress(story, state);
  const node = currentNode(story, state);
  return node.options.filter(
    (option) =>
      (option.requires ?? []).every((flag) => state.flags.includes(flag)) &&
      !(option.unless ?? []).some((flag) => state.flags.includes(flag)) &&
      (option.repeatability === 'repeatable' ||
        !progress.completed?.includes(completionKey(node, option, state.flags))),
  );
}

export function selectOption(
  story: DialogueStory,
  state: DialogueState,
  optionId: string,
): DialogueState {
  const option = availableOptions(story, state).find((item) => item.id === optionId);
  if (!option) throw new Error('Option unavailable');
  if (!story.nodes.some((node) => node.id === option.next)) {
    throw new Error('Missing destination node');
  }
  return applyOption(
    story,
    restoreDialogueProgress(story, state),
    currentNode(story, state),
    option,
  );
}

function applyOption(
  story: DialogueStory,
  state: DialogueState,
  node: DialogueNode,
  option: DialogueOption,
  recordHistory = true,
): DialogueState {
  let pending = [...(state.pending ?? [])];
  const returning = pending.some((p) => p.hub === option.next);
  if (option.suspend) {
    const index = pending.findIndex((p) => p.hub === option.next);
    if (index >= 0) pending = pending.slice(0, index);
  }
  const completed = new Set(state.completed ?? []);
  if (option.repeatability !== 'repeatable' && !option.suspend && !returning) {
    const key = completionKey(node, option, state.flags);
    if (!pending.some((p) => p.key === key)) pending.push({ hub: node.id, key });
  }
  const destination = story.nodes.find((n) => n.id === option.next)!;
  // Merely opening or suspending a topic does not consume it. Returning to its
  // hub, reaching a terminal or explicitly leaving the hub region does.
  const remaining = pending.filter((p) => {
    const finishes =
      !option.suspend &&
      (p.hub === option.next ||
        !destination.options.length ||
        (option.repeatability === 'repeatable' && node.hub));
    if (finishes) completed.add(p.key);
    return !finishes;
  });
  return {
    node: option.next,
    flags: [...new Set([...state.flags, ...(option.grants ?? [])])],
    history: recordHistory ? [...state.history, option.id] : state.history,
    completed: [...completed],
    pending: remaining,
  };
}

export function validateDialogue(story: DialogueStory): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const node of story.nodes) {
    if (ids.has(node.id)) errors.push(`Duplicate node: ${node.id}`);
    ids.add(node.id);
    if (!node.id.trim()) errors.push('Empty node id');
    if (!node.speaker.trim()) errors.push(`Empty speaker: ${node.id}`);
    if (!node.text.trim()) errors.push(`Empty text: ${node.id}`);
    for (const variant of node.textWhen ?? []) {
      if (!variant.text.trim()) errors.push(`Empty conditional text: ${node.id}`);
      if (variant.requires.length === 0) errors.push(`Unconditional text variant: ${node.id}`);
      if (variant.requires.some((flag) => !flag.trim())) {
        errors.push(`Blank conditional flag: ${node.id}`);
      }
      if (new Set(variant.requires).size !== variant.requires.length) {
        errors.push(`Duplicate conditional flag: ${node.id}`);
      }
    }
    for (const entry of node.afterwordWhen ?? []) {
      if (!entry.text.trim()) errors.push(`Empty afterword: ${node.id}`);
      if (entry.requires.length === 0) errors.push(`Unconditional afterword: ${node.id}`);
      for (const field of ['requires', 'unless'] as const) {
        const flags = entry[field] ?? [];
        if (flags.some((flag) => !flag.trim())) {
          errors.push(`Blank afterword ${field}: ${node.id}`);
        }
        if (new Set(flags).size !== flags.length) {
          errors.push(`Duplicate afterword ${field}: ${node.id}`);
        }
      }
      if (entry.requires.some((flag) => (entry.unless ?? []).includes(flag))) {
        errors.push(`Impossible afterword condition: ${node.id}`);
      }
    }
    const options = new Set<string>();
    for (const option of node.options) {
      if (options.has(option.id)) errors.push(`Duplicate option: ${node.id}/${option.id}`);
      options.add(option.id);
      if (!option.id.trim()) errors.push(`Empty option id: ${node.id}`);
      if (!option.next.trim()) errors.push(`Empty destination: ${node.id}/${option.id}`);
      if (!option.label.trim()) errors.push(`Empty option label: ${node.id}/${option.id}`);
      for (const field of ['requires', 'unless', 'grants'] as const) {
        if ((option[field] ?? []).some((flag) => !flag.trim())) {
          errors.push(`Blank ${field} flag: ${node.id}/${option.id}`);
        }
      }
      if (new Set(option.requires ?? []).size !== (option.requires ?? []).length) {
        errors.push(`Duplicate required flag: ${node.id}/${option.id}`);
      }
      if (new Set(option.unless ?? []).size !== (option.unless ?? []).length) {
        errors.push(`Duplicate excluded flag: ${node.id}/${option.id}`);
      }
      if (new Set(option.grants ?? []).size !== (option.grants ?? []).length) {
        errors.push(`Duplicate granted flag: ${node.id}/${option.id}`);
      }
      if ((option.requires ?? []).some((flag) => (option.unless ?? []).includes(flag))) {
        errors.push(`Impossible option condition: ${node.id}/${option.id}`);
      }
    }
  }
  if (!ids.has(story.start)) errors.push('Missing start');
  for (const node of story.nodes) {
    for (const option of node.options) {
      if (!ids.has(option.next)) errors.push(`Missing destination: ${option.next}`);
    }
  }
  const reachable = new Set<string>();
  const queue = [story.start];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || reachable.has(id)) continue;
    reachable.add(id);
    const node = story.nodes.find((entry) => entry.id === id);
    for (const option of node?.options ?? []) {
      if (ids.has(option.next) && !reachable.has(option.next)) queue.push(option.next);
    }
  }
  for (const id of ids) {
    if (!reachable.has(id)) errors.push(`Unreachable node: ${id}`);
  }
  return errors;
}

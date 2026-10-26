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
}

export interface DialogueNode {
  readonly id: SceneId;
  readonly speaker: string;
  readonly text: string;
  /** First matching flag-dependent narration replaces the default text. */
  readonly textWhen?: readonly { readonly requires: readonly string[]; readonly text: string }[];
  readonly options: readonly DialogueOption[];
}

export interface DialogueStory {
  readonly start: SceneId;
  readonly nodes: readonly DialogueNode[];
}

export interface DialogueState {
  readonly node: SceneId;
  readonly flags: readonly string[];
  readonly history: readonly string[];
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
  const variant = node.textWhen?.find((entry) =>
    entry.requires.every((flag) => state.flags.includes(flag)),
  );
  return variant ? { ...node, text: variant.text } : node;
}

export function availableOptions(
  story: DialogueStory,
  state: DialogueState,
): readonly DialogueOption[] {
  return currentNode(story, state).options.filter(
    (option) =>
      (option.requires ?? []).every((flag) => state.flags.includes(flag)) &&
      !(option.unless ?? []).some((flag) => state.flags.includes(flag)),
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
  return {
    node: option.next,
    flags: [...new Set([...state.flags, ...(option.grants ?? [])])],
    history: [...state.history, option.id],
  };
}

export function validateDialogue(story: DialogueStory): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const node of story.nodes) {
    if (ids.has(node.id)) errors.push(`Duplicate node: ${node.id}`);
    ids.add(node.id);
    if (!node.text.trim()) errors.push(`Empty text: ${node.id}`);
    for (const variant of node.textWhen ?? []) {
      if (!variant.text.trim()) errors.push(`Empty conditional text: ${node.id}`);
      if (variant.requires.length === 0) errors.push(`Unconditional text variant: ${node.id}`);
      if (new Set(variant.requires).size !== variant.requires.length) {
        errors.push(`Duplicate conditional flag: ${node.id}`);
      }
    }
    const options = new Set<string>();
    for (const option of node.options) {
      if (options.has(option.id)) errors.push(`Duplicate option: ${node.id}/${option.id}`);
      options.add(option.id);
      if (!option.label.trim()) errors.push(`Empty option label: ${node.id}/${option.id}`);
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
  return errors;
}

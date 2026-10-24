export type TopicId = string;
export type SceneId = string;

export interface DialogueOption {
  readonly id: string;
  readonly label: string;
  readonly next: SceneId;
  readonly requires?: readonly string[];
  readonly grants?: readonly string[];
}

export interface DialogueNode {
  readonly id: SceneId;
  readonly speaker: string;
  readonly text: string;
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
  return node;
}

export function availableOptions(story: DialogueStory, state: DialogueState): readonly DialogueOption[] {
  return currentNode(story, state).options.filter((option) =>
    (option.requires ?? []).every((flag) => state.flags.includes(flag)),
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
    const options = new Set<string>();
    for (const option of node.options) {
      if (options.has(option.id)) errors.push(`Duplicate option: ${node.id}/${option.id}`);
      options.add(option.id);
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

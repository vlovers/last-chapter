export interface ConversationChoice {
  id: string;
  label: string;
  next: string;
  remember?: string;
  requires?: string;
  excludes?: string;
}
export interface ConversationNode {
  id: string;
  speaker: string;
  text: string;
  variants?: readonly { when: string; text: string }[];
  choices: readonly ConversationChoice[];
}
export interface ConversationTopic {
  id: string;
  title: string;
  entry: string;
  nodes: readonly ConversationNode[];
}
export interface ConversationSession {
  topic: string;
  node: string;
  memories: string[];
  finished: boolean;
}
export function validateTopic(topic: ConversationTopic): string[] {
  const errors: string[] = [];
  const ids = new Set(topic.nodes.map((node) => node.id));
  if (ids.size !== topic.nodes.length) errors.push('Duplicate node IDs');
  if (!ids.has(topic.entry)) errors.push('Missing entry');
  for (const node of topic.nodes) {
    if (!node.choices.length) errors.push('Dead end: ' + node.id);
    if (!node.text.trim()) errors.push('Empty text: ' + node.id);
    for (const variant of node.variants ?? []) if (!variant.text.trim()) errors.push('Empty variant: ' + node.id);
    const choices = new Set<string>();
    for (const choice of node.choices) {
      if (!choice.label.trim()) errors.push('Empty choice label: ' + node.id);
      if (choices.has(choice.id)) errors.push('Duplicate choice: ' + node.id);
      choices.add(choice.id);
      if (choice.next !== '__exit' && !ids.has(choice.next))
        errors.push('Missing target: ' + choice.next);
    }
  }
  const reached = new Set<string>();
  const walk = (id: string) => {
    if (reached.has(id) || !ids.has(id)) return;
    reached.add(id);
    for (const c of topic.nodes.find((n) => n.id === id)!.choices)
      if (c.next !== '__exit') walk(c.next);
  };
  walk(topic.entry);
  for (const id of ids) if (!reached.has(id)) errors.push('Unreachable node: ' + id);
  const exitReachable = new Set<string>();
  const reverse = new Map<string, string[]>();
  for (const node of topic.nodes) {
    for (const choice of node.choices) {
      const parents = reverse.get(choice.next) ?? [];
      parents.push(node.id);
      reverse.set(choice.next, parents);
    }
  }
  const pending = [...(reverse.get('__exit') ?? [])];
  while (pending.length) {
    const id = pending.pop()!;
    if (exitReachable.has(id)) continue;
    exitReachable.add(id);
    pending.push(...(reverse.get(id) ?? []));
  }
  for (const id of ids) if (!exitReachable.has(id)) errors.push('No path to exit: ' + id);
  return errors;
}
export function startConversation(topic: ConversationTopic, memories: readonly string[] = []): ConversationSession {
  if (validateTopic(topic).length) throw new Error('Invalid conversation graph');
  return { topic: topic.id, node: topic.entry, memories: [...memories], finished: false };
}
export function conversationView(topic: ConversationTopic, session: ConversationSession) {
  if (session.topic !== topic.id || session.finished) throw new Error('Conversation not active');
  const node = topic.nodes.find((item) => item.id === session.node);
  if (!node) throw new Error('Invalid conversation node');
  const variant = node.variants?.find((v) => session.memories.includes(v.when));
  return { ...node, text: variant?.text ?? node.text, choices: node.choices.filter((c) =>
    (!c.requires || session.memories.includes(c.requires)) && (!c.excludes || !session.memories.includes(c.excludes))) };
}
export function answerConversation(topic: ConversationTopic, session: ConversationSession, choiceId: string): ConversationSession {
  const choice = conversationView(topic, session).choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error('Unavailable conversation choice');
  return {
    topic: topic.id,
    node: choice.next === '__exit' ? session.node : choice.next,
    memories: choice.remember && !session.memories.includes(choice.remember)
      ? [...session.memories, choice.remember] : [...session.memories],
    finished: choice.next === '__exit',
  };
}
export function restoreConversation(topic: ConversationTopic, raw: string): ConversationSession | null {
  try {
    const x: unknown = JSON.parse(raw);
    if (!x || typeof x !== 'object') return null;
    const s = x as Record<string, unknown>;
    if (s.topic !== topic.id || typeof s.node !== 'string' || typeof s.finished !== 'boolean' ||
        !Array.isArray(s.memories) || s.memories.length > 80 ||
        !s.memories.every((m: unknown) => typeof m === 'string' && m.length <= 120) ||
        new Set(s.memories).size !== s.memories.length ||
        !topic.nodes.some((n) => n.id === s.node)) return null;
    return { topic: topic.id, node: s.node, finished: s.finished, memories: [...s.memories] };
  } catch { return null; }
}

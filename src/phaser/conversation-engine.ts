export interface ConversationChoice {
  id: string;
  label: string;
  next: string;
  remember?: string;
  requires?: string;
  excludes?: string;
  repeatability?: 'once' | 'repeatable';
  /** An interruption preserves the current node instead of finishing the topic. */
  suspend?: boolean;
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
  repeatability?: 'once' | 'repeatable';
  nodes: readonly ConversationNode[];
}
export interface ConversationSession {
  topic: string;
  node: string;
  memories: string[];
  finished: boolean;
  completed?: string[];
  pending?: { node: string; key: string }[];
  suspended?: boolean;
}
export function validateTopic(topic: ConversationTopic): string[] {
  const errors: string[] = [];
  const ids = new Set(topic.nodes.map((node) => node.id));
  if (ids.size !== topic.nodes.length) errors.push('Duplicate node IDs');
  if (!ids.has(topic.entry)) errors.push('Missing entry');
  for (const node of topic.nodes) {
    if (!node.choices.length) errors.push('Dead end: ' + node.id);
    if (!node.text.trim()) errors.push('Empty text: ' + node.id);
    for (const variant of node.variants ?? [])
      if (!variant.text.trim()) errors.push('Empty variant: ' + node.id);
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
export function normalizeMemories(memories: readonly string[]): string[] {
  return [...new Set(memories.filter((memory) => memory.length > 0 && memory.length <= 120))].slice(
    -80,
  );
}

export function startConversation(
  topic: ConversationTopic,
  memories: readonly string[] = [],
): ConversationSession {
  if (validateTopic(topic).length) throw new Error('Invalid conversation graph');
  return {
    topic: topic.id,
    node: topic.entry,
    memories: normalizeMemories(memories),
    finished: false,
  };
}
export function conversationView(topic: ConversationTopic, session: ConversationSession) {
  if (session.topic !== topic.id || session.finished) throw new Error('Conversation not active');
  const node = topic.nodes.find((item) => item.id === session.node);
  if (!node) throw new Error('Invalid conversation node');
  const variant = node.variants?.find((v) => session.memories.includes(v.when));
  return {
    ...node,
    text: variant?.text ?? node.text,
    choices: node.choices.filter(
      (c) =>
        (!c.requires || session.memories.includes(c.requires)) &&
        (!c.excludes || !session.memories.includes(c.excludes)) &&
        (c.repeatability === 'repeatable' ||
          !session.completed?.includes(JSON.stringify([node.id, c.id]))),
    ),
  };
}
export function answerConversation(
  topic: ConversationTopic,
  session: ConversationSession,
  choiceId: string,
): ConversationSession {
  const choice = conversationView(topic, session).choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error('Unavailable conversation choice');
  if (choice.suspend) return { ...session, suspended: true };
  const completed = new Set(session.completed ?? []);
  const key = JSON.stringify([session.node, choice.id]);
  const pending = [...(session.pending ?? [])];
  if (
    choice.repeatability !== 'repeatable' &&
    !pending.some((p) => p.node === choice.next || p.key === key)
  )
    pending.push({ node: session.node, key });
  const remaining = pending.filter((p) => {
    if (choice.next === '__exit' || p.node === choice.next) {
      completed.add(p.key);
      return false;
    }
    return true;
  });
  return {
    completed: [...completed],
    pending: remaining,
    topic: topic.id,
    node: choice.next === '__exit' ? session.node : choice.next,
    memories: normalizeMemories(
      choice.remember ? [...session.memories, choice.remember] : session.memories,
    ),
    finished: choice.next === '__exit',
  };
}
/** Ledger keys are produced by JSON.stringify([nodeId, choiceId]). */
function isChoiceLedgerKey(key: string): boolean {
  try {
    const parsed: unknown = JSON.parse(key);
    return (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      parsed.every((part) => typeof part === 'string' && part.trim().length > 0) &&
      JSON.stringify(parsed) === key
    );
  } catch {
    return false;
  }
}

export function restoreConversation(
  topic: ConversationTopic,
  raw: string,
): ConversationSession | null {
  try {
    const x: unknown = JSON.parse(raw);
    if (!x || typeof x !== 'object') return null;
    const s = x as Record<string, unknown>;
    if (
      s.topic !== topic.id ||
      typeof s.node !== 'string' ||
      typeof s.finished !== 'boolean' ||
      (s.suspended !== undefined && typeof s.suspended !== 'boolean') ||
      (s.finished && s.suspended === true) ||
      !Array.isArray(s.memories) ||
      s.memories.length > 80 ||
      !s.memories.every(
        (m: unknown) => typeof m === 'string' && m.trim().length > 0 && m.length <= 120,
      ) ||
      new Set(s.memories).size !== s.memories.length ||
      !topic.nodes.some((n) => n.id === s.node)
    )
      return null;
    // A partial ledger must not silently lose unfinished conversations.
    if (s.pending !== undefined && s.completed === undefined) return null;
    if (
      s.completed !== undefined &&
      (!Array.isArray(s.completed) ||
        s.completed.length > 256 ||
        !s.completed.every(
          (v: unknown) => typeof v === 'string' && v.length <= 300 && isChoiceLedgerKey(v),
        ) ||
        !Array.isArray(s.pending) ||
        s.pending.length > 128 ||
        !s.pending.every(
          (v: unknown) =>
            !!v &&
            typeof v === 'object' &&
            typeof (v as Record<string, unknown>).node === 'string' &&
            topic.nodes.some((node) => node.id === (v as Record<string, unknown>).node) &&
            typeof (v as Record<string, unknown>).key === 'string' &&
            String((v as Record<string, unknown>).key).length <= 300 &&
            isChoiceLedgerKey(String((v as Record<string, unknown>).key)) &&
            JSON.parse(String((v as Record<string, unknown>).key))[0] ===
              (v as Record<string, unknown>).node,
        ))
    )
      return null;
    if (s.completed !== undefined) {
      const completed = new Set(s.completed as string[]);
      const pending = s.pending as { node: string; key: string }[];
      if (
        completed.size !== (s.completed as string[]).length ||
        new Set(pending.map(({ key }) => key)).size !== pending.length ||
        pending.some(({ key }) => completed.has(key)) ||
        (s.finished && pending.length > 0)
      )
        return null;
    }
    return {
      topic: topic.id,
      node: s.node,
      finished: s.finished,
      memories: [...s.memories],
      ...(s.suspended === true ? { suspended: true } : {}),
      ...(s.completed !== undefined
        ? {
            completed: [...(s.completed as string[])],
            pending: s.pending as { node: string; key: string }[],
          }
        : {}),
    };
  } catch {
    return null;
  }
}

export function conversationAvailable(
  topic: ConversationTopic,
  session: ConversationSession,
): boolean {
  return session.topic === topic.id && (!session.finished || topic.repeatability === 'repeatable');
}

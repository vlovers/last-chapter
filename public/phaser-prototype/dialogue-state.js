import { MARA, OBJECTS } from './dialogue-content.js';
export function openDialogue(id, completed = false) {
  if (id === 'mara') return { kind: 'mara', node: completed ? 'after' : 'hello' };
  return Object.hasOwn(OBJECTS, id) ? { kind: 'object', node: id } : null;
}
export function dialogueNode(dialogue, state) {
  if (!dialogue) return null;
  if (dialogue.kind === 'object')
    return Object.hasOwn(OBJECTS, dialogue.node)
      ? { ...OBJECTS[dialogue.node], choices: [] }
      : null;
  if (dialogue.kind !== 'mara') return null;
  if (dialogue.node === 'after')
    return {
      speaker: 'Мара',
      mood: 'warm',
      text:
        state.book === 'station'
          ? '«Скляна станція» вже в торбинці. Дякую. Посиджу ще хвилинку — не хочу, щоб папір змок.'
          : '«Мапи незавершених доріг» уже в торбинці. Дякую. Здається, дощ потроху стихає.',
      choices: [],
    };
  return Object.hasOwn(MARA, dialogue.node) ? MARA[dialogue.node] : null;
}
export function chooseDialogue(dialogue, choiceId) {
  if (dialogue?.kind !== 'mara') return null;
  const choice = Object.hasOwn(MARA, dialogue.node)
    ? MARA[dialogue.node].choices.find((item) => item.id === choiceId)
    : null;
  return choice
    ? {
        dialogue: { ...dialogue, node: choice.next },
        effect: choice.effect ?? {},
        complete: choice.next === 'end',
      }
    : null;
}

export function validateDialogue(nodes = MARA, objects = OBJECTS) {
  const prose = (value) => typeof value === 'string' && value.length > 0 && value.length <= 2000;
  for (const node of [...Object.values(nodes), ...Object.values(objects)]) {
    if (!prose(node.speaker) || !prose(node.text)) throw new Error('Invalid dialogue prose');
  }
  for (const node of Object.values(nodes)) {
    if (!Array.isArray(node.choices)) throw new Error('Missing dialogue choices');
    const ids = new Set();
    for (const choice of node.choices) {
      if (
        !prose(choice.id) ||
        ids.has(choice.id) ||
        !prose(choice.label) ||
        !Object.hasOwn(nodes, choice.next)
      )
        throw new Error('Invalid dialogue edge');
      ids.add(choice.id);
      for (const [key, value] of Object.entries(choice.effect ?? {})) {
        if (
          !(key === 'book' && ['station', 'roads'].includes(value)) &&
          !(key === 'privacy' && ['respected', 'asked'].includes(value))
        )
          throw new Error('Invalid dialogue effect');
      }
    }
  }
  return true;
}

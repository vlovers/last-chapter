import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, type DialogueState } from '../src/game/dialogue';

const variants = [
  ['mara', 'mara_discussed_forgiveness', 'mara_discussed_change'],
  ['leo', 'leo_chose_listening', 'leo_accepted_silence'],
  ['iris', 'iris_chose_open_art', 'iris_chose_private_art'],
  ['anna', 'anna_will_apologize_to_student', 'anna_will_invite_disagreement'],
  ['thomas', 'thomas_will_ask_before_helping', 'thomas_admitted_fear_of_rejection'],
  ['nora', 'nora_will_preserve_uncertainty', 'nora_will_seek_consent'],
  ['eleanor', 'eleanor_will_keep_shared_memory', 'eleanor_will_allow_change'],
] as const;

function rendered(id: string, flags: readonly string[]) {
  const state: DialogueState = { node: id, flags, history: [] };
  return currentNode(finalReading, state).text;
}

describe('Finale choice-dependent narration', () => {
  for (const [name, first, second] of variants) {
    it(`${name} renders each earned variant and a neutral fallback`, () => {
      const id = `final-v3-${name}`;
      const original = finalReading.nodes.find((node) => node.id === id);
      expect(original).toBeDefined();
      const [a, b] = original!.textWhen ?? [];
      expect(a).toBeDefined();
      expect(b).toBeDefined();
      if (!a || !b) throw new Error('Missing conditional variants: ' + id);
      expect(rendered(id, [])).toBe(original!.text);
      expect(rendered(id, [first])).toBe(a.text);
      expect(rendered(id, [second])).toBe(b.text);
      expect(rendered(id, [first])).not.toBe(rendered(id, [second]));
      // The engine uses first-matching precedence when both flags are present.
      expect(rendered(id, [first, second])).toBe(a.text);
    });
  }
});

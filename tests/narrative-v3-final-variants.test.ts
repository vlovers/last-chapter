import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { validateDialogue } from '../src/game/dialogue';

const cases = [
  ['mara', 'mara_discussed_forgiveness', 'mara_discussed_change'],
  ['leo', 'leo_chose_listening', 'leo_accepted_silence'],
  ['iris', 'iris_chose_open_art', 'iris_chose_private_art'],
  ['anna', 'anna_will_apologize_to_student', 'anna_will_invite_disagreement'],
  ['thomas', 'thomas_will_ask_before_helping', 'thomas_admitted_fear_of_rejection'],
  ['nora', 'nora_will_preserve_uncertainty', 'nora_will_seek_consent'],
  ['eleanor', 'eleanor_will_keep_shared_memory', 'eleanor_will_allow_change'],
] as const;

describe('Narrative V3 finale variants', () => {
  it('has no broken dialogue destinations', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it('offers one-time callbacks only after their source discussions', () => {
    const gathering = finalReading.nodes.find((entry) => entry.id === 'gathering');
    expect(gathering).toBeDefined();
    for (const [name] of cases) {
      const option = gathering!.options.find((entry) => entry.next === `final-v3-${name}`);
      expect(option?.requires).toHaveLength(1);
      expect(option?.unless).toEqual([`final_v3_${name}_heard`]);
      const ending = finalReading.nodes.find((entry) => entry.id === `final-v3-${name}`);
      expect(ending?.options[0]?.grants).toContain(`final_v3_${name}_heard`);
      expect(ending?.options[0]?.next).toBe('gathering');
    }
  });

  for (const [name, first, second] of cases) {
    it(`${name} reflects both earlier choices`, () => {
      const node = finalReading.nodes.find((entry) => entry.id === `final-v3-${name}`);
      expect(node).toBeDefined();
      const variants = node?.textWhen ?? [];
      expect(variants.some((variant) => variant.requires?.includes(first))).toBe(true);
      expect(variants.some((variant) => variant.requires?.includes(second))).toBe(true);
      expect(variants.every((variant) => variant.text.trim().length > 0)).toBe(true);
      const callback = finalReading.nodes.find((entry) => entry.id === 'gathering')?.options.find((option) => option.next === `final-v3-${name}`);
      expect(callback?.unless).toContain(`final_v3_${name}_heard`);
    });
  }
});

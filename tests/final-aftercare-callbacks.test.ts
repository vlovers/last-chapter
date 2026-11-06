import type { DialogueState } from '../src/game/dialogue';
import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const routes = [
  {
    person: 'anna',
    earlier: 'final_after_anna_class_books_reserved',
    endings: ['vote', 'read', 'lend'],
  },
  { person: 'leo', earlier: 'final_after_leo_mara_walk', endings: ['wish', 'umbrella', 'space'] },
  {
    person: 'eleanor',
    earlier: 'final_after_eleanor_orders_planned',
    endings: ['sort', 'call', 'close'],
  },
  {
    person: 'miller',
    earlier: 'final_after_miller_restraint_acknowledged',
    endings: ['rules', 'questions', 'cohost'],
  },
  {
    person: 'iris',
    earlier: 'final_after_iris_light_book_chosen',
    endings: ['no-spoiler', 'return', 'quiet'],
  },
] as const;

describe('Final-night aftercare callbacks: traversal, save reload, and exclusivity', () => {
  it('keeps the final-day graph structurally valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  for (const route of routes) {
    for (const ending of route.endings) {
      it(`persists ${route.person} / ${ending} across reload and closes the callback once`, () => {
        const entry = `final-aftercare-${route.person}-option`;
        const base = { ...startDialogue(finalReading), node: 'gathering' };
        expect(availableOptions(finalReading, base).map((option) => option.id)).not.toContain(
          entry,
        );

        let dialogue: DialogueState = { ...base, flags: [route.earlier] };
        expect(availableOptions(finalReading, dialogue).map((option) => option.id)).toContain(
          entry,
        );
        dialogue = selectOption(finalReading, dialogue, entry);
        dialogue = selectOption(
          finalReading,
          dialogue,
          `final-aftercare-${route.person}-${ending}`,
        );

        const checkpoint = decodeSave(
          encodeSave({
            stage: 'day5-reading',
            dialogue,
            flags: dialogue.flags,
          }),
        );
        expect(checkpoint).not.toBeNull();
        expect(checkpoint?.dialogue).toEqual(dialogue);

        dialogue = selectOption(
          finalReading,
          checkpoint!.dialogue,
          `final-aftercare-${route.person}-${ending}-back`,
        );
        expect(dialogue.node).toBe('gathering');
        expect(dialogue.flags).toContain(`final_aftercare_${route.person}_done`);
        expect(availableOptions(finalReading, dialogue).map((option) => option.id)).not.toContain(
          entry,
        );

        const restored = decodeSave(
          encodeSave({
            stage: 'day5-reading',
            dialogue,
            flags: dialogue.flags,
          }),
        );
        expect(restored?.dialogue.flags).toContain(`final_aftercare_${route.person}_done`);
        expect(
          availableOptions(finalReading, restored!.dialogue).map((option) => option.id),
        ).not.toContain(entry);
      });
    }
  }

  it('preserves independently unlocked callbacks when one character conversation closes', () => {
    let dialogue: DialogueState = {
      ...startDialogue(finalReading),
      node: 'gathering',
      flags: routes.map((route) => route.earlier),
    };
    for (const route of routes) {
      const entry = `final-aftercare-${route.person}-option`;
      expect(availableOptions(finalReading, dialogue).map((option) => option.id)).toContain(entry);
      dialogue = selectOption(finalReading, dialogue, entry);
      const ending = route.endings[0];
      dialogue = selectOption(finalReading, dialogue, `final-aftercare-${route.person}-${ending}`);
      dialogue = selectOption(
        finalReading,
        dialogue,
        `final-aftercare-${route.person}-${ending}-back`,
      );
      expect(dialogue.node).toBe('gathering');
      expect(dialogue.flags).toContain(`final_aftercare_${route.person}_done`);
      dialogue = decodeSave(
        encodeSave({
          stage: 'day5-reading',
          dialogue,
          flags: dialogue.flags,
        }),
      )!.dialogue;
    }
    for (const route of routes) {
      expect(dialogue.flags).toContain(`final_aftercare_${route.person}_done`);
      expect(availableOptions(finalReading, dialogue).map((option) => option.id)).not.toContain(
        `final-aftercare-${route.person}-option`,
      );
    }
  });
});

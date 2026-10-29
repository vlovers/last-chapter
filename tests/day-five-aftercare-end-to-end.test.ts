import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

describe('Day five: after-case choices lead into their final-night consequences', () => {
  const routes = [
    { person: 'anna', choice: 'books', callback: 'read', flag: 'final_after_anna_class_books_reserved' },
    { person: 'leo', choice: 'walk', callback: 'space', flag: 'final_after_leo_mara_walk' },
    { person: 'eleanor', choice: 'stock', callback: 'sort', flag: 'final_after_eleanor_orders_planned' },
    { person: 'miller', choice: 'apology', callback: 'questions', flag: 'final_after_miller_restraint_acknowledged' },
    { person: 'iris', choice: 'book', callback: 'quiet', flag: 'final_after_iris_light_book_chosen' },
  ] as const;

  for (const route of routes) {
    it(`connects ${route.person} after-case choice to finale through a real save`, () => {
      let dialogue = {
        ...startDialogue(finalReading),
        node: 'gathering',
        flags: ['final_case_closure_complete'],
      };
      dialogue = selectOption(finalReading, dialogue, 'after-case-tea');
      dialogue = selectOption(finalReading, dialogue, `after-tea-${route.person}-new`);
      dialogue = selectOption(finalReading, dialogue, `after-${route.person}-${route.choice}-new`);
      const finish = availableOptions(finalReading, dialogue)[0];
      expect(finish?.grants).toContain(route.flag);
      dialogue = selectOption(finalReading, dialogue, finish.id);
      dialogue = selectOption(finalReading, dialogue, 'after-tea-return');
      expect(dialogue.node).toBe('gathering');

      const checkpoint = decodeSave(encodeSave({
        stage: 'day5-reading',
        dialogue,
        flags: dialogue.flags,
      }));
      expect(checkpoint).not.toBeNull();
      dialogue = checkpoint!.dialogue;

      const entry = `final-aftercare-${route.person}-option`;
      expect(availableOptions(finalReading, dialogue).map((option) => option.id)).toContain(entry);
      dialogue = selectOption(finalReading, dialogue, entry);
      dialogue = selectOption(finalReading, dialogue, `final-aftercare-${route.person}-${route.callback}`);
      dialogue = selectOption(finalReading, dialogue, `final-aftercare-${route.person}-${route.callback}-back`);
      expect(dialogue.node).toBe('gathering');
      expect(dialogue.flags).toContain(`final_aftercare_${route.person}_done`);
      expect(availableOptions(finalReading, dialogue).map((option) => option.id)).not.toContain(entry);
    });
  }
});

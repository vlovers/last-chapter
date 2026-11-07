import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { millerVisit } from '../src/content/first-day';
import {
  availableOptions,
  currentNode,
  startDialogue,
  type DialogueStory,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function node(story: DialogueStory, id: string) {
  const result = story.nodes.find((entry) => entry.id === id);
  expect(result, `Missing scene: ${id}`).toBeDefined();
  return result!;
}

describe('player-facing Ukrainian narrator voice across the first and final days', () => {
  it('uses singular ти in the first key handoff and after Miller leaves', () => {
    expect(node(millerVisit, 'arrival').text).toContain('Біля тебе чекає');
    expect(node(millerVisit, 'end').text).toContain('Ти записуєш продану книжку');
  });

  it.each([
    ['morning', 'Ти перевіряєш список'],
    ['rumor-player-accountability', 'Ти підходиш'],
    ['final-aftercare-leo-umbrella-result', 'Ти смієшся й просиш'],
    ['final-aftercare-leo-space-result', 'Ти повертаєшся до каси'],
    ['final-aftercare-iris-return-result', 'Ти киваєш'],
  ])('uses a consistent singular narrator in %s', (id, expected) => {
    expect(node(finalReading, id).text).toContain(expected);
  });

  it('keeps the private ledger callback in the singular narrator voice', () => {
    const state = {
      ...startDialogue(finalReading),
      node: 'ledger-outcome',
      flags: ['final_ledger_record_private'],
    };
    expect(currentNode(finalReading, state).text).toContain('ти встигаєш зачинити шухляду');
  });

  it('does not switch to formal address when Iris hangs one private picture', () => {
    const exhibit = node(finalReading, 'exhibit');
    const privateChoice = exhibit.textWhen?.find((entry) =>
      entry.requires?.includes('iris_exhibition_private_choice'),
    );
    expect(privateChoice?.text).toContain('поки ти шукаєш рівень');
  });

  it('keeps the privacy-breach ending in the same narrative voice', () => {
    const ending = node(finalReading, 'end');
    expect(
      ending.textWhen?.some((entry) =>
        entry.text.includes('Ти не намагаєшся наздогнати її з поясненнями'),
      ),
    ).toBe(true);
  });

  it('remembers singular address in all three rumor accountability callbacks after save/restore', () => {
    const cases = [
      {
        flags: ['anna_heard_rumor_admission', 'thomas_heard_rumor_apology'],
        expected: ['твої вибачення', 'Тепер ти підходиш'],
      },
      {
        flags: ['anna_heard_rumor_admission'],
        expected: ['ти підтримав плітку', 'ти говорив з Анною'],
      },
      {
        flags: ['thomas_heard_rumor_apology'],
        expected: ['твоє вибачення', 'ти йому сказав'],
      },
    ];
    for (const { flags, expected } of cases) {
      const state = {
        ...startDialogue(finalReading),
        node: 'rumor-player-accountability',
        flags,
      };
      const restored = decodeSave(encodeSave({ stage: 'day5-reading', dialogue: state, flags }));
      expect(restored).not.toBeNull();
      const text = currentNode(finalReading, restored!.dialogue).text;
      for (const phrase of expected) expect(text).toContain(phrase);
      expect(availableOptions(finalReading, restored!.dialogue).length).toBeLessThanOrEqual(4);
    }
  });

  it('keeps Miller’s polite ви in speech while addressing the player as ти in narration', () => {
    const callback = node(finalReading, 'rumor').textWhen?.find((entry) =>
      entry.requires?.includes('rumor_challenged'),
    );
    expect(callback?.text).toContain('Пані Міллер помічає тебе');
    expect(callback?.text).toContain('«Пам’ятаєте, ви сказали');
    expect(node(millerVisit, 'hello').text).toContain('ви залишили старий дзвіночок');
  });

  it('keeps the final bookshop return personal rather than formal', () => {
    expect(node(finalReading, 'final-aftercare-leo-space-result').text).toContain(
      'двома булочками для тебе',
    );
  });
});

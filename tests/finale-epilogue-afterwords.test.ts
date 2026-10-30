import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';

function endingWith(...flags: string[]): string {
  const gathering = selectOption(finalReading, startDialogue(finalReading), 'open');
  const state: DialogueState = { ...gathering, flags };
  return currentNode(finalReading, selectOption(finalReading, state, 'close')).text;
}

describe('Composed finale afterwords', () => {
  it('preserves the private letter outcome while showing three independent callbacks', () => {
    const text = endingWith(
      'final_mutual_conversation',
      'final_case_sealed',
      'final_saturday_calendar_offered',
      'final_nora_miller_caption_drafted',
    );
    expect(text).toContain('Ніхто не питає');
    expect(text).toContain('зв’язку з рукописом ніхто не довів');
    expect(text).toContain('лише Елеонорина примітка купити чай');
    expect(text).toContain('Рік зйомки ще не встановили');
  });

  it('keeps a difficult letter ending without erasing deferred decisions', () => {
    const text = endingWith(
      'final_accepted_consequences',
      'final_case_deferred',
      'final_saturday_plans_separate',
      'final_nora_miller_exhibit_deferred',
    );
    expect(text).toContain('не обіцяючи пробачення');
    expect(text).toContain('не оголошує нерозгадану історію розкритою');
    expect(text).toContain('не записує їх у розклад книгарні');
    expect(text).toContain('не друкує афішу');
    expect(text).not.toContain('Рік зйомки ще не встановили');
  });

  it('respects Iris ownership even when the player also disclosed a private letter', () => {
    const text = endingWith('final_letter_breach_disclosed', 'final_case_iris_boundaries');
    expect(text).toContain('не обіцяла пробачення');
    expect(text).toContain('Айріс сама вирішуватиме');
  });

  it('retains established rumor and exhibition endings alongside case consequences', () => {
    const text = endingWith('final_repaired_rumor', 'final_iris_exhibition', 'final_case_sealed');
    expect(text).toContain('Пані Міллер першою вибачається');
    expect(text).toContain('зв’язку з рукописом ніхто не довів');
  });

  it('does not invent side-story progress on the neutral route', () => {
    const text = endingWith();
    expect(text).toContain('Френк застрибує на прилавок');
    expect(text).not.toContain('Наступного ранку');
  });

  it('keeps all closing callbacks independent of authored narration priority', () => {
    const story: DialogueStory = {
      start: 'end',
      nodes: [
        {
          id: 'end',
          speaker: 'Оповідач',
          text: 'Початок',
          textWhen: [{ requires: ['letter'], text: 'Лист залишається приватним' }],
          variantSelection: 'authored',
          afterwordWhen: [
            { requires: ['calendar'], text: 'Календар порожній' },
            { requires: ['cinema'], unless: ['consent_missing'], text: 'Світлина в теці' },
          ],
          options: [],
        },
      ],
    };
    expect(
      currentNode(story, { node: 'end', history: [], flags: ['letter', 'calendar', 'cinema'] })
        .text,
    ).toBe('Лист залишається приватним\n\nКалендар порожній\n\nСвітлина в теці');
    expect(
      currentNode(story, {
        node: 'end',
        history: [],
        flags: ['letter', 'cinema', 'consent_missing'],
      }).text,
    ).toBe('Лист залишається приватним');
  });

  it('validates impossible and empty afterword rules', () => {
    const story: DialogueStory = {
      start: 'end',
      nodes: [
        {
          id: 'end',
          speaker: 'Оповідач',
          text: 'Кінець',
          afterwordWhen: [
            { requires: [], text: '' },
            { requires: ['a', 'a'], unless: ['a'], text: 'Не буде показано' },
          ],
          options: [],
        },
      ],
    };
    const errors = validateDialogue(story);
    expect(errors).toContain('Empty afterword: end');
    expect(errors).toContain('Unconditional afterword: end');
    expect(errors).toContain('Duplicate afterword requires: end');
    expect(errors).toContain('Impossible afterword condition: end');
  });

  it('preserves the complete final-reading dialogue graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});

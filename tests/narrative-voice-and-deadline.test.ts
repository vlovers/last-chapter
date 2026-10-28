import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { eleanorVisit } from '../src/content/eleanor';
import { firstEvening } from '../src/content/evening';
import { noraVisit } from '../src/content/nora';
import { thomasVisit } from '../src/content/thomas';
import { validateDialogue } from '../src/game/dialogue';

describe('Five-day narrative pressure and character voice', () => {
  it('establishes the public reading as a practical deadline on the first evening', () => {
    const opening = firstEvening.nodes.find((node) => node.id === 'box');
    expect(opening?.text).toContain('До п’ятого дня');
    expect(opening?.text).toContain('відкрите читання');
    expect(opening?.text).toContain('Елеонора попросила');
  });

  it('gives Anna a teacher-specific response instead of a generic lesson summary', () => {
    const ending = annaVisit.nodes.find((node) => node.id === 'anna-v3-conversation-end');
    expect(ending?.text).toContain('для уроку');
    expect(ending?.text).toContain('вчителька');
    expect(ending?.text).not.toContain('Не все треба вирішувати одразу');
  });

  it('lets Thomas return to a practical task in his own voice', () => {
    const ending = thomasVisit.nodes.find((node) => node.id === 'thomas-v3-conversation-end');
    expect(ending?.text).toContain('лампу');
    expect(ending?.text).toContain('ящик');
    expect(ending?.text).not.toContain('Не все треба вирішувати одразу');
  });

  it('gives Eleanor and Nora distinct, concrete closing actions', () => {
    const eleanor = eleanorVisit.nodes.find((node) => node.id === 'eleanor-v3-conversation-end');
    const nora = noraVisit.nodes.find((node) => node.id === 'nora-v3-conversation-end');

    expect(eleanor?.text).toContain('рулетку');
    expect(nora?.text).toContain('дату ще перевіряємо');
    expect(nora?.text).toContain('листи залишаються в теці');
  });

  it('keeps all affected dialogue graphs structurally valid', () => {
    expect(validateDialogue(firstEvening)).toEqual([]);
    expect(validateDialogue(annaVisit)).toEqual([]);
    expect(validateDialogue(thomasVisit)).toEqual([]);
    expect(validateDialogue(eleanorVisit)).toEqual([]);
    expect(validateDialogue(noraVisit)).toEqual([]);
  });
});

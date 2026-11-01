import { describe, expect, it } from 'vitest';
import { thomasVisit } from '../src/content/thomas';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';
import { seasonEnding } from '../src/game/endings';

function school(choice: string) {
  let visit: DialogueState = startDialogue(thomasVisit);
  for (const id of ['greet', 'thomas-chairs', choice, 'thomas-chairs-back', 'finish'])
    visit = selectOption(thomasVisit, visit, id);
  let finale: DialogueState = { ...startDialogue(finalReading), flags: visit.flags };
  finale = selectOption(finalReading, finale, 'open');
  return selectOption(finalReading, finale, 'school-reading-followup');
}

function save(dialogue: DialogueState) {
  const chapter = { stage: 'day5-reading' as const, flags: dialogue.flags, dialogue };
  const restored = decodeSave(encodeSave(chapter));
  expect(restored).toEqual(chapter);
  return restored!.dialogue;
}

describe('Production V2: reachable ordinary school follow-up', () => {
  it('needs the actual Thomas conversation, not an Anna flag from a later day', () => {
    const fresh = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(availableOptions(finalReading, fresh).map((o) => o.id)).not.toContain(
      'school-reading-followup',
    );
    expect(currentNode(finalReading, school('thomas-chairs-own')).text).toContain(
      'подзвонив того дня',
    );
    expect(currentNode(finalReading, school('thomas-chairs-fix')).text).toContain(
      'заговорив про нові стільці',
    );
  });

  for (const earlier of ['thomas-chairs-own', 'thomas-chairs-fix']) {
    for (const stance of [
      'school-chairs-defend',
      'school-chairs-listen',
      'school-chairs-reading',
    ]) {
      for (const outcome of ['school-chairs-plan', 'school-chairs-space']) {
        it(`${earlier} / ${stance} / ${outcome} remains distinct and survives restoration`, () => {
          let state = save(selectOption(finalReading, school(earlier), stance));
          const response = currentNode(finalReading, state).text;
          expect(response).toContain(
            stance === 'school-chairs-defend'
              ? 'адвокат'
              : stance === 'school-chairs-listen'
                ? 'Дякую'
                : 'дракона',
          );
          expect(
            state.flags.filter((f) =>
              [
                'final_school_chairs_defended',
                'final_school_chairs_listened',
                'final_school_chairs_reading',
              ].includes(f),
            ),
          ).toHaveLength(1);
          state = save(selectOption(finalReading, state, 'school-chairs-thomas'));
          state = save(selectOption(finalReading, state, outcome));
          state = save(selectOption(finalReading, state, 'school-chairs-outcome-back'));
          expect(state.node).toBe('gathering');
          expect(
            state.flags.filter((f) =>
              ['final_school_chairs_time_agreed', 'final_school_chairs_space_kept'].includes(f),
            ),
          ).toHaveLength(1);
          expect(availableOptions(finalReading, state).map((o) => o.id)).not.toContain(
            'school-reading-followup',
          );
          expect(availableOptions(finalReading, state).map((o) => o.id)).toContain('close');
          expect(seasonEnding({ flags: state.flags }).epilogue).toContain(
            outcome === 'school-chairs-plan' ? 'вимкнув звук' : 'не домовлявся за них',
          );
        });
      }
    }
  }

  it('lets the player end the conversation after hearing Anna', () => {
    let state = selectOption(finalReading, school('thomas-chairs-own'), 'school-chairs-listen');
    state = save(selectOption(finalReading, state, 'school-chairs-finish'));
    expect(state.flags).toContain('final_school_chairs_followup_done');
    expect(state.flags).not.toContain('final_school_chairs_time_agreed');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain('залишилася незакінченою');
  });
});

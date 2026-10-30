import { describe, expect, it } from 'vitest';
import {
  chooseChapterOption,
  finishSeason,
  startFifthDay,
  type ChapterState,
} from '../src/game/chapter';
import { currentNode, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';
import { finalReading } from '../src/content/day-five';

const initialFlags = [
  'final_ledger_scene_complete',
  'final_manuscript_provenance_decided',
  'final_ledger_iris_told',
  'mara_window_plan_discussed',
  'leo_night_course_discussed',
  'mara_window_credit_encouraged',
  'leo_night_course_deferred',
  'nora_cinema_exhibit_discussed',
] as const;

const caseRoutes = [
  {
    name: 'sealed',
    steps: ['case-decision-seal'],
    flag: 'final_case_sealed',
    afterword: 'зв’язку з рукописом ніхто не довів',
    epilogue: 'Після вечора Нора залишила',
  },
  {
    name: 'Iris declined',
    steps: ['case-decision-iris', 'case-iris-decline'],
    flag: 'final_case_iris_declined',
    afterword: 'дозволу на публікацію ніхто не давав',
    epilogue: 'Айріс відмовилася обговорювати підсумок',
  },
] as const;

const calendarRoutes = [
  {
    name: 'offered',
    choice: 'saturday-calendar-offer',
    flag: 'final_saturday_calendar_offered',
    afterword: 'лише Елеонорина примітка купити чай',
    epilogue: 'жодної зустрічі ще не призначили',
  },
  {
    name: 'kept separate',
    choice: 'saturday-calendar-separate',
    flag: 'final_saturday_plans_separate',
    afterword: 'не записує їх у розклад книгарні',
    epilogue: 'Суботній календар книгарні залишився порожнім',
  },
] as const;

const cinemaRoutes = [
  {
    name: 'compared',
    choice: 'final-nora-miller-compare',
    detail: 'final-nora-miller-compare-detail',
    back: 'final-nora-miller-compare-back',
    flag: 'final_nora_miller_notes_compared',
    afterword: 'сімейну листівку Міллер забрала додому',
    epilogue: 'невідомий рік так і не перетворився на факт',
  },
  {
    name: 'caption drafted',
    choice: 'final-nora-miller-caption',
    detail: 'final-nora-miller-caption-detail',
    back: 'final-nora-miller-caption-back',
    flag: 'final_nora_miller_caption_drafted',
    afterword: 'Рік зйомки ще не встановили',
    epilogue: 'Портрети людей не виставляли',
  },
  {
    name: 'deferred',
    choice: 'final-nora-miller-defer',
    detail: 'final-nora-miller-defer-detail',
    back: 'final-nora-miller-defer-back',
    flag: 'final_nora_miller_exhibit_deferred',
    afterword: 'ніхто не друкує афішу',
    epilogue: 'Виставку не оголосили відкритою',
  },
] as const;

function enterFifthDay(): ChapterState {
  const flags = [...initialFlags];
  return startFifthDay({
    stage: 'day4-complete',
    flags,
    dialogue: { ...startDialogue(finalReading), flags },
  });
}

function chooseAndRestore(state: ChapterState, id: string): ChapterState {
  const next = chooseChapterOption(state, id);
  const restored = decodeSave(encodeSave(next));
  expect(restored, `Save/restore failed after ${id}`).toEqual(next);
  return restored!;
}

function follow(state: ChapterState, ids: readonly string[]): ChapterState {
  return ids.reduce(chooseAndRestore, state);
}

describe('Fifth-day cross-story finale journeys', () => {
  for (const caseRoute of caseRoutes) {
    for (const calendar of calendarRoutes) {
      for (const cinema of cinemaRoutes) {
        it(`preserves ${caseRoute.name}, ${calendar.name}, and ${cinema.name} across saves`, () => {
          let state = follow(enterFifthDay(), [
            'open',
            'case-closure',
            'case-topic-timeline',
            'case-timeline-back',
            'case-topic-authors',
            'case-authors-back',
            'case-topic-people',
            'case-people-back',
            'case-topic-finish',
            ...caseRoute.steps,
            'case-result-finish',
            'final-saturday-plans-topic',
            'saturday-talk-calendar',
            calendar.choice,
            'saturday-calendar-result-back',
            'saturday-finish',
            'final-nora-miller-cinema-topic',
            cinema.choice,
            cinema.detail,
            cinema.back,
          ]);

          expect(state.dialogue.node).toBe('gathering');
          for (const flag of [caseRoute.flag, calendar.flag, cinema.flag]) {
            expect(state.flags).toContain(flag);
          }
          for (const other of caseRoutes) {
            if (other !== caseRoute) expect(state.flags).not.toContain(other.flag);
          }
          for (const other of calendarRoutes) {
            if (other !== calendar) expect(state.flags).not.toContain(other.flag);
          }
          for (const other of cinemaRoutes) {
            if (other !== cinema) expect(state.flags).not.toContain(other.flag);
          }

          state = chooseAndRestore(state, 'close');
          const finalText = currentNode(finalReading, state.dialogue).text;
          for (const phrase of [caseRoute.afterword, calendar.afterword, cinema.afterword]) {
            expect(finalText).toContain(phrase);
          }
          const season = finishSeason(state);
          expect(season.stage).toBe('season-complete');
          const ending = seasonEnding(season);
          for (const phrase of [caseRoute.epilogue, calendar.epilogue, cinema.epilogue]) {
            expect(ending.epilogue).toContain(phrase);
          }
          expect(finalText).not.toContain('авторство доведено');
          expect(season.flags).not.toContain('final_manuscript_author_identified');
        });
      }
    }
  }
});

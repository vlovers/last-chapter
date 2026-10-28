import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  advanceToDayFourLeo,
  advanceToDayFourMara,
  chooseChapterOption,
  finishFourthDay,
  finishSeason,
  finishThirdDay,
  skipBookClub,
  stageStory,
  startChapter,
  startFifthDay,
  startFourthDay,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, currentNode, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from '../src/game/save';
import { seasonEnding } from '../src/game/endings';
import { FiveDayStory } from '../src/phaser/five-day-story';

function restored(state: ChapterState): ChapterState {
  const saved = decodeSave(encodeSave(state));
  expect(saved).toEqual(state);
  return saved!;
}
function follow(initial: ChapterState, ...choices: string[]): ChapterState {
  return choices.reduce((state, choice) => restored(chooseChapterOption(state, choice)), initial);
}
function discover() {
  const nora = {
    ...startChapter(),
    stage: 'nora' as const,
    dialogue: { ...startDialogue(stageStory('nora')), node: 'end' },
  };
  return follow(
    restored(skipBookClub(nora)),
    'tidy-books',
    'examine-page',
    'paper-back',
    'keep-page',
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('manuscript investigation and custody', () => {
  for (const first of ['stars', 'window'] as const) {
    for (const custody of ['return', 'archive'] as const) {
      it(`examines ${first} first, saves every step and completes the ${custody} ending`, () => {
        let state = restored(startFourthDay(restored(finishThirdDay(discover()))));
        state = follow(
          state,
          'welcome',
          'quiet-page',
          `quiet-page-${first}`,
          first === 'stars' ? 'quiet-page-compare' : 'quiet-page-note-window',
        );
        const second = first === 'stars' ? 'window' : 'stars';
        state = follow(
          state,
          `quiet-page-check-${second}`,
          second === 'stars' ? 'quiet-page-compare' : 'quiet-page-note-window',
        );
        expect(
          availableOptions(stageStory(state.stage), state.dialogue).map((o) => o.id),
        ).not.toEqual(
          expect.arrayContaining(['quiet-page-check-stars', 'quiet-page-check-window']),
        );
        const observations = [...state.flags];
        state = follow(
          state,
          custody === 'return' ? 'quiet-page-respect' : 'quiet-page-ask',
          'quiet-page-return',
          'leave',
        );
        state = restored(advanceToDayFourMara(state));
        state = follow(state, 'greet', 'finish');
        state = restored(advanceToDayFourLeo(state));
        state = follow(state, 'welcome', 'finish');
        state = restored(startFifthDay(restored(finishFourthDay(state))));
        state = follow(state, 'open', 'quiet-manuscript-followup');
        expect(currentNode(stageStory(state.stage), state.dialogue).text).toContain(
          'Позначки різні',
        );
        state = follow(state, `quiet-manuscript-${custody}`);
        expect(availableOptions(stageStory(state.stage), state.dialogue).map((o) => o.id)).toEqual([
          'quiet-manuscript-result-back',
        ]);
        state = follow(state, 'quiet-manuscript-result-back');
        expect(
          availableOptions(stageStory(state.stage), state.dialogue).some(
            (o) => o.id === 'quiet-manuscript-followup',
          ),
        ).toBe(false);
        state = restored(finishSeason(follow(state, 'close')));
        expect(state.flags).toEqual(expect.arrayContaining(observations));
        expect(state.flags).toContain('book_club_skipped');
        expect(state.flags).not.toContain('book_club_started');
        const ending = seasonEnding(state).epilogue;
        expect(ending).toContain(
          custody === 'return' ? 'Айріс забрала сторінку' : 'сторінку зберегли у книгарні',
        );
        expect(ending).not.toContain(
          custody === 'return' ? 'сторінку зберегли у книгарні' : 'Айріс забрала сторінку',
        );
        expect(ending).not.toContain('автора встановлено');
      });
    }
  }

  it('does not claim possession or unlock Iris when the examined page is left behind', () => {
    const found = discover();
    const nora = {
      ...startChapter(),
      stage: 'nora' as const,
      dialogue: { ...startDialogue(stageStory('nora')), node: 'end' },
    };
    const left = follow(
      skipBookClub(nora),
      'tidy-books',
      'examine-page',
      'paper-back',
      'leave-page',
    );
    expect(left.flags).toContain('quiet_evening_page_examined');
    expect(left.flags).not.toContain('quiet_evening_page_found');
    const welcome = follow(startFourthDay(finishThirdDay(left)), 'welcome');
    expect(
      availableOptions(stageStory(welcome.stage), welcome.dialogue).some(
        (o) => o.id === 'quiet-page',
      ),
    ).toBe(false);
    expect(found.flags).toContain('quiet_evening_page_found');
  });

  it('exposes observations and an explicitly labelled theory in the real journal adapter', () => {
    let state = follow(
      startFourthDay(finishThirdDay(discover())),
      'welcome',
      'quiet-page',
      'quiet-page-window',
      'quiet-page-note-window',
      'quiet-page-respect',
    );
    state = restored(state);
    const storage = new Map([[SAVE_KEY, encodeSave(state)]]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const story = new FiveDayStory();
    expect(story.knownEvidence.find((e) => e.title === 'Загублена сторінка')?.kind).toBe(
      'observation',
    );
    expect(story.knownEvidence.find((e) => e.title === 'Вікно: втеча чи очікування?')?.kind).toBe(
      'inference',
    );
    expect(story.notes.some((note) => note.startsWith('Припущення:'))).toBe(true);
    expect(story.notes.some((note) => note.includes('поки не показувати'))).toBe(true);
  });

  it('anchors a fresh playthrough before optional notes and rejects a corrupt previous save', () => {
    const storage = new Map([[SAVE_KEY, '{broken']]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const fresh = new FiveDayStory();
    expect(fresh.hasRestoredProgress).toBe(false);
    expect(decodeSave(storage.get(SAVE_KEY)!)?.stage).toBe('miller');
    const resumed = new FiveDayStory();
    expect(resumed.hasRestoredProgress).toBe(true);
    expect(resumed.open()).toEqual(fresh.open());
  });
});

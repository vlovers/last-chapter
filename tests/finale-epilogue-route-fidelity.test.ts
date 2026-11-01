import { describe, expect, it } from 'vitest';
import { counterEncountersNodes } from '../src/content/counter-encounters';
import { finalReading } from '../src/content/day-five';
import { readerDebatesNodes } from '../src/content/reader-debates-final';
import { selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

const readerRoutes = [
  [
    ['reader-romance', 'romance-two-books', 'romance-two-back'],
    ['reader-romance', 'romance-defend', 'romance-defend-back'],
    ['reader-romance', 'romance-furniture', 'romance-furniture-back'],
  ],
  [
    ['reader-audio', 'audio-choices', 'audio-choices-back'],
    ['reader-audio', 'audio-ask-ruth', 'audio-ruth-back'],
    ['reader-audio', 'audio-ask-anna', 'audio-anna-back'],
  ],
  [
    ['reader-villain', 'villain-no-spoilers', 'villain-spoilers-back'],
    ['reader-villain', 'villain-nora', 'villain-nora-back'],
    ['reader-villain', 'villain-iris', 'villain-iris-back'],
  ],
] as const;

const counterRoutes = [
  [
    ['counter-ruth', 'ruth-ask', 'ruth-ask-back'],
    ['counter-ruth', 'ruth-print', 'ruth-print-back'],
    ['counter-ruth', 'ruth-short', 'ruth-short-back'],
  ],
  [
    ['counter-sam', 'sam-dough', 'sam-dough-back'],
    ['counter-sam', 'sam-memoir', 'sam-memoir-back'],
    ['counter-sam', 'sam-ask-mara', 'sam-ask-back'],
  ],
  [
    ['counter-reed', 'reed-envelope', 'reed-envelope-back'],
    ['counter-reed', 'reed-book', 'reed-book-back'],
    ['counter-reed', 'reed-wait', 'reed-wait-back'],
  ],
] as const;

const epilogueMarkers = [
  [
    'Мара залишила біля вікна два романи',
    'Міллер розповіла про Артура й поїзди',
    'жарт про подругу героїні й зниклий диван',
  ],
  [
    'Біля каталогу залишили картку',
    'Рут сфотографувала назву морської збірки',
    'Анна занотувала ідеї для уроку',
  ],
  [
    'Міллер закрила детектив',
    'Айріс намалювала на серветці порожнє крісло',
    'Нора записала ідею виставки',
  ],
  [
    'Рут пішла з трьома запитаннями',
    'Рут записала назви видань із великим шрифтом',
    'Рут сфотографувала обкладинки коротких історій про море',
  ],
  [
    'Сем купив початкову книжку про тісто',
    'Сем забрав додому кумедні спогади',
    'Сем вирішив запитати Мару про навчання',
  ],
  [
    'Пан Рід сам запечатав чужу записку',
    'Пан Рід залишив стару книжку собі',
    'Пан Рід забрав книжку додому',
  ],
] as const;

type Routes = readonly (readonly (readonly string[])[])[];

function play(state: DialogueState, route: readonly string[]): DialogueState {
  for (const id of route) state = selectOption(finalReading, state, id);
  return state;
}

function choices(index: number): readonly number[] {
  return [index % 3, Math.floor(index / 3) % 3, Math.floor(index / 9)];
}

function finishHub(
  state: DialogueState,
  entry: string,
  routes: Routes,
  selected: readonly number[],
  exit: string,
): DialogueState {
  state = selectOption(finalReading, state, entry);
  for (let topic = 0; topic < routes.length; topic++) {
    state = play(state, routes[topic]![selected[topic]!]!);
  }
  return selectOption(finalReading, state, exit);
}

function finishEvening(
  reader: readonly number[],
  counter: readonly number[],
  counterFirst: boolean,
): DialogueState {
  let state = play(startDialogue(finalReading), ['open']);
  const readerHub = (current: DialogueState) =>
    finishHub(current, 'final-reader-debates', readerRoutes, reader, 'reader-debates-close');
  const counterHub = (current: DialogueState) =>
    finishHub(current, 'final-counter-encounters', counterRoutes, counter, 'counter-close');
  state = counterFirst ? readerHub(counterHub(state)) : counterHub(readerHub(state));
  return state;
}

function assertOnlyEarnedOutcomes(epilogue: string, selected: readonly number[]): void {
  for (let topic = 0; topic < epilogueMarkers.length; topic++) {
    for (let choice = 0; choice < 3; choice++) {
      const marker = epilogueMarkers[topic]![choice]!;
      expect(epilogue.includes(marker), marker).toBe(selected[topic] === choice);
    }
  }
}

describe('Finale epilogue: actual objects and all six independent reader/visitor decisions', () => {
  it('matches 729 complete reader and counter route combinations without invented outcomes', () => {
    for (let readerIndex = 0; readerIndex < 27; readerIndex++) {
      for (let counterIndex = 0; counterIndex < 27; counterIndex++) {
        const reader = choices(readerIndex);
        const counter = choices(counterIndex);
        const state = finishEvening(reader, counter, (readerIndex + counterIndex) % 2 === 0);
        expect(state.node).toBe('gathering');
        assertOnlyEarnedOutcomes(seasonEnding(state).epilogue, [...reader, ...counter]);
      }
    }
  });

  it('preserves all six outcomes across actual save encoding and both hub orders', () => {
    for (let index = 0; index < 27; index++) {
      for (const counterFirst of [false, true]) {
        const reader = choices(index);
        const counter = choices((index * 7) % 27);
        const state = finishEvening(reader, counter, counterFirst);
        const saved = encodeSave({ stage: 'day5-reading', dialogue: state, flags: state.flags });
        const restored = decodeSave(saved);
        expect(restored).not.toBeNull();
        expect(restored?.dialogue.node).toBe('gathering');
        const epilogue = seasonEnding(restored!).epilogue;
        expect(epilogue).toBe(seasonEnding(state).epilogue);
        assertOnlyEarnedOutcomes(epilogue, [...reader, ...counter]);
      }
    }
  });

  it('describes photos and the actual artist instead of inventing lists or co-authors', () => {
    const ruth = counterEncountersNodes.find((node) => node.id === 'final-counter-ruth-short');
    const audio = readerDebatesNodes.find((node) => node.id === 'final-reader-audio-ruth');
    const sketch = readerDebatesNodes.find((node) => node.id === 'final-reader-villain-nora');
    expect(ruth?.text).toContain('фотографує обкладинки');
    expect(audio?.text).toContain('Рут фотографує назву');
    expect(sketch?.text).toContain('Айріс бере олівець і малює');
    const epilogue = seasonEnding({
      flags: [
        'final_counter_ruth_shortlist',
        'final_reader_audio_ruth_story',
        'final_reader_villain_nora_view',
      ],
    }).epilogue;
    expect(epilogue).toContain('сфотографувала обкладинки');
    expect(epilogue).toContain('сфотографувала назву');
    expect(epilogue).toContain('Айріс намалювала');
    expect(epilogue).not.toContain('Нора й Айріс намалювали');
    expect(epilogue).not.toContain('Рут забрала список');
  });
});

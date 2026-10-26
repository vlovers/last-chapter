import type { ChapterState } from '../game/chapter';

/** A separate set of optional puzzles: story choices remain in the canonical dialogue graph. */
export interface Clue {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly flag: string;
  readonly required: readonly string[];
}

export const CLUES: readonly Clue[] = [
  {
    id: 'bookmark',
    label: 'Закладка біля вікна',
    detail:
      'Між книжками на підставці біля вікна лежить закладка з нерівним відбитком старого штампа книгарні.',
    flag: 'clue_bookmark',
    required: ['explored_window'],
  },
  {
    id: 'stamp',
    label: 'Старий штамп',
    detail:
      'У прилавку — штамп з таким самим надщербленим краєм. Його використовували ще до затоплення.',
    flag: 'clue_stamp',
    required: ['explored_counter'],
  },
  {
    id: 'shelf',
    label: 'Нотатка на форзаці',
    detail: 'За книжками є короткий запис: «Не плутати дату бронювання з датою отримання».',
    flag: 'clue_shelf',
    required: ['explored_shelves'],
  },
  {
    id: 'timeline',
    label: 'Зіставити три знахідки',
    detail:
      'Закладка, штамп і нотатка вказують на старі записи замовлень. Це привід перевірити хронологію, а не звинувачувати когось.',
    flag: 'clue_timeline',
    required: ['clue_bookmark', 'clue_stamp', 'clue_shelf'],
  },
];

export function accessibleClues(flags: readonly string[]): readonly Clue[] {
  return CLUES.filter(
    (clue) => flags.includes(clue.flag) || clue.required.every((flag) => flags.includes(flag)),
  );
}

export function collectClue(state: ChapterState, id: string): ChapterState {
  const clue = accessibleClues(state.flags).find((item) => item.id === id);
  if (!clue) throw new Error('Clue is not accessible');
  if (state.flags.includes(clue.flag)) return state;
  const flags = [...state.flags, clue.flag];
  return { ...state, flags, dialogue: { ...state.dialogue, flags } };
}

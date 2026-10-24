/** Ukrainian on-screen cast labels. No speculative portrait likenesses. */
export interface CastMember {
  readonly id: string;
  readonly name: string;
  readonly monogram: string;
  readonly motif: string;
}
export const cast: readonly CastMember[] = [
  { id: 'miller', name: 'Пані Міллер', monogram: 'М', motif: '✦' },
  { id: 'mara', name: 'Мара', monogram: 'М', motif: '❋' },
  { id: 'iris', name: 'Айріс', monogram: 'А', motif: '✎' },
  { id: 'anna', name: 'Анна', monogram: 'А', motif: '❖' },
  { id: 'leo', name: 'Лео', monogram: 'Л', motif: '⌁' },
  { id: 'eleanor', name: 'Елеонора', monogram: 'Е', motif: '✧' },
  { id: 'thomas', name: 'Томас', monogram: 'Т', motif: '⚡' },
  { id: 'nora', name: 'Нора', monogram: 'Н', motif: '✿' },
];
export function castMember(speaker: string): CastMember | undefined {
  return cast.find((member) => member.name === speaker);
}

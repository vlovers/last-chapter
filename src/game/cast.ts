/** Ukrainian on-screen cast labels. No speculative portrait likenesses. */
export interface CastMember {
  readonly id: string;
  readonly name: string;
  readonly monogram: string;
  readonly motif: string;
  readonly portrait: string;
}
export const cast: readonly CastMember[] = [
  { id: 'miller', name: 'Пані Міллер', monogram: 'М', motif: '✦', portrait: '/art/portraits/miller.svg' },
  { id: 'mara', name: 'Мара', monogram: 'М', motif: '❋', portrait: '/art/portraits/mara.svg' },
  { id: 'iris', name: 'Айріс', monogram: 'А', motif: '✎', portrait: '/art/portraits/iris.svg' },
  { id: 'anna', name: 'Анна', monogram: 'А', motif: '❖', portrait: '/art/portraits/anna.svg' },
  { id: 'leo', name: 'Лео', monogram: 'Л', motif: '⌁', portrait: '/art/portraits/leo.svg' },
  { id: 'eleanor', name: 'Елеонора', monogram: 'Е', motif: '✧', portrait: '/art/portraits/eleanor.svg' },
  { id: 'thomas', name: 'Томас', monogram: 'Т', motif: '⚡', portrait: '/art/portraits/thomas.svg' },
  { id: 'nora', name: 'Нора', monogram: 'Н', motif: '✿', portrait: '/art/portraits/nora.svg' },
];
export function castMember(speaker: string): CastMember | undefined {
  return cast.find((member) => member.name === speaker);
}

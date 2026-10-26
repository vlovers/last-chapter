import { bellwickEncounters } from '../content/optional/bellwick-encounters';

export const bellwickSchedule = [
  { id: 'mara', day: 1, title: 'Мара · Кривий пиріг' },
  { id: 'miller', day: 1, title: 'Міллер · Черга за детективом' },
  { id: 'leo', day: 2, title: 'Лео · Квиток без поїзда' },
  { id: 'thomas', day: 2, title: 'Томас · Стілець із характером' },
  { id: 'anna', day: 3, title: 'Анна · П’ятилапий кіт' },
  { id: 'nora', day: 3, title: 'Нора · Поганий роман' },
  { id: 'iris', day: 4, title: 'Айріс · Суп замість дощу' },
  { id: 'sophie', day: 4, title: 'Софі · Квіти без приводу' },
  { id: 'eleanor', day: 5, title: 'Елеонора · Книга з плямою' },
  { id: 'frank', day: 5, title: 'Френк · Заборонена полиця' },
] as const;

export type BellwickEncounterId = (typeof bellwickSchedule)[number]['id'];
export const bellwickStorageKey = 'last-chapter:optional:bellwick:v1';

export function bellwickAvailable(day: number, finished: readonly string[]) {
  return bellwickSchedule.filter((scene) => scene.day === day && !finished.includes(scene.id));
}

export function bellwickStory(id: BellwickEncounterId) {
  return bellwickEncounters[id]!;
}

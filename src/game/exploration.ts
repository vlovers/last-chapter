import type { ChapterState } from './chapter';

export type ShopSpotId = 'shelves' | 'window' | 'counter' | 'plant' | 'frank';
export interface ShopSpot {
  readonly id: ShopSpotId;
  readonly title: string;
  readonly description: string;
  readonly detail: string;
  readonly discoveryFlag: string;
}

export const shopSpots: readonly ShopSpot[] = [
  { id: 'frank', title: 'Френк', description: 'Погладити кота', detail: 'Френк — маленький сірий девон-рекс із великими вухами й хвилястою шерстю. Він муркоче та притримує лапою закладку: «Не кожна таємниця просить, щоб її розкрили».', discoveryFlag: 'met_frank' },
  {
    id: 'shelves',
    title: 'Книжкові полиці',
    description: 'Переглянути книжки',
    detail:
      'На корінцях книжок — вицвілі назви, акуратні наліпки й маленькі сліди колишніх читачів. П’ять нових видань чекають, поки хтось знайде для них потрібну людину.',
    discoveryFlag: 'explored_shelves',
  },
  {
    id: 'window',
    title: 'Осіннє вікно',
    description: 'Подивитися на вулицю',
    detail:
      'Над Беллвіком повільно пливуть хмари. Краплі дощу креслять на склі доріжки, а за вікном хтось поспішає з паперовим пакетом із пекарні.',
    discoveryFlag: 'explored_window',
  },
  {
    id: 'counter',
    title: 'Прилавок',
    description: 'Оглянути робоче місце',
    detail:
      'Тут лежать картки замовлень, олівець і чашка, у якій чай давно охолов. На внутрішньому боці шухляди хтось колись написав: «Спочатку вислухай».',
    discoveryFlag: 'explored_counter',
  },
  {
    id: 'plant',
    title: 'Рослина біля вікна',
    description: 'Перевірити рослину',
    detail:
      'Зелена рослина пережила зміну господарів, ремонт і кілька особливо похмурих зим. Один листок уперто тягнеться до сонця, навіть коли його майже немає.',
    discoveryFlag: 'explored_plant',
  },
];

export function inspectShopSpot(state: ChapterState, id: ShopSpotId): ChapterState {
  const spot = shopSpots.find((item) => item.id === id);
  if (!spot) throw new Error('Unknown shop spot');
  if (state.flags.includes(spot.discoveryFlag)) return state;
  const flags = [...state.flags, spot.discoveryFlag];
  return { ...state, flags, dialogue: { ...state.dialogue, flags } };
}

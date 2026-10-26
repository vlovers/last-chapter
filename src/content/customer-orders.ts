import type { ChapterStage } from '../game/chapter';
export type Fit = 'excellent' | 'alternative' | 'unexpected' | 'poor';
export interface RequestContext {
  readonly question: string;
  readonly answer: string;
  readonly reactions: Readonly<Record<string, { fit: Fit; text: string }>>;
}
export interface CustomerOrderDefinition extends RequestContext {
  readonly id: string;
  readonly stage: ChapterStage;
  readonly node: string;
  readonly choices: readonly { book: string; choice: string; receipt: string }[];
  readonly decline: string;
}
// Existing accepted books, branches and receipt flags are the narrative authority.
const copy: Record<'miller' | 'mara' | 'anna', RequestContext> = {
  miller: {
    question: '«Вам ближча тиха загадка чи суперечливі свідчення?»',
    answer:
      '«Люблю помічати дрібниці. Але й посперечатися з автором іноді приємно. Тільки без кривавих сцен».',
    reactions: {
      orchard: {
        fit: 'excellent',
        text: '«Сад, ключі й давні обіцянки? Оце саме для дощового вечора». Пані Міллер кладе книжку до сумки.',
      },
      witnesses: {
        fit: 'alternative',
        text: '«Шестеро свідків? Матиму з ким посперечатися». Пані Міллер усміхається й бере книжку.',
      },
      letters: {
        fit: 'unexpected',
        text: '«Листування — це цікаво, але сьогодні хочеться розгадати загадку. Покажете ще щось?»',
      },
    },
  },
  mara: {
    question: '«Подарунок має бути про його захоплення чи для спільного читання?»',
    answer:
      '«Він любить потяги. Але, може, нам обом було б добре читати щось разом. Я ще сама обираю».',
    reactions: {
      station: {
        fit: 'excellent',
        text: '«О, станція! Хочу, щоб він побачив: я пам’ятаю, що йому цікаво». Мара бережно бере книжку.',
      },
      roads: {
        fit: 'alternative',
        text: '«Можна читати вдвох. Якщо він теж захоче». Мара відкладає книжку для подарунка.',
      },
      letters: {
        fit: 'unexpected',
        text: '«Трохи особисто… Але я сама вирішу, що сказати». Мара бере книжку, замислившись.',
      },
    },
  },
  anna: {
    question: '«Для уроку важливіша подорож чи різні погляди на одну подію?»',
    answer:
      '«Мандрівка зачепить одних, суперечливі свідчення — інших. Головне, щоб можна було не погоджуватися й слухати одне одного».',
    reactions: {
      roads: {
        fit: 'excellent',
        text: '«Карта без єдиної правильної дороги — чудовий початок розмови». Анна кладе книжку поруч із зошитами.',
      },
      witnesses: {
        fit: 'alternative',
        text: '«Різні свідчення? Спробуємо вислухати кожного». Анна бере книжку для підготовки до уроку.',
      },
      station: {
        fit: 'unexpected',
        text: '«Для одного учня це було б влучно. Для спільного читання пошукаємо ще». Замовлення залишається відкритим.',
      },
    },
  },
};
export const customerOrders: readonly CustomerOrderDefinition[] = [
  {
    id: 'order_miller_day1',
    stage: 'miller',
    node: 'order',
    ...copy.miller,
    choices: [
      { book: 'orchard', choice: 'orchard', receipt: 'sold_orchard' },
      { book: 'witnesses', choice: 'witnesses', receipt: 'sold_witnesses' },
    ],
    decline: '«Гарна обкладинка, та сьогодні хочеться іншої історії. Пошукаймо ще».',
  },
  {
    id: 'order_mara_day1',
    stage: 'mara',
    node: 'order',
    ...copy.mara,
    choices: [
      { book: 'station', choice: 'station', receipt: 'sold_station' },
      { book: 'roads', choice: 'roads', receipt: 'sold_roads' },
      { book: 'letters', choice: 'letters', receipt: 'sold_letters' },
    ],
    decline: '«Мабуть, це сьогодні не для нього. Подивімося ще». Мара повертає книжку на прилавок.',
  },
  {
    id: 'order_anna_day2',
    stage: 'anna',
    node: 'books',
    ...copy.anna,
    choices: [
      { book: 'roads', choice: 'maps', receipt: 'anna_chose_maps' },
      { book: 'witnesses', choice: 'mystery', receipt: 'anna_chose_mystery' },
    ],
    decline: '«Для нашої розмови в класі я шукаю інше. Є ще варіанти?»',
  },
];

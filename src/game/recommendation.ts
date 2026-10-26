import { books } from '../content/books';
import type { ChapterStage } from './chapter';

export type Fit = 'excellent' | 'alternative' | 'unexpected' | 'poor';
export interface RequestContext {
  readonly question: string;
  readonly answer: string;
  readonly reactions: Readonly<Record<string, { fit: Fit; text: string }>>;
}
// Editorial reactions add no objective facts, relationship scores or story flags.
const requests: Partial<Record<ChapterStage, RequestContext>> = {
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
export function requestContext(stage: ChapterStage): RequestContext | null {
  return requests[stage] ?? null;
}
export function assessRecommendation(stage: ChapterStage, bookId: string) {
  if (!books.some((book) => book.id === bookId)) return null;
  const request = requestContext(stage);
  if (!request) return null;
  return (
    request.reactions[bookId] ?? {
      fit: 'poor' as const,
      text:
        stage === 'mara'
          ? '«Мабуть, це сьогодні не для нього. Подивімося ще». Мара повертає книжку на прилавок.'
          : stage === 'anna'
            ? '«Для нашої розмови в класі я шукаю інше. Є ще варіанти?»'
            : '«Гарна обкладинка, та сьогодні хочеться іншої історії. Пошукаймо ще».',
    }
  );
}
export const SERVICE_KEY = 'last-chapter:service:v1';
export interface ServiceMemory {
  version: 1;
  asked: string[];
  attempts: { stage: ChapterStage; book: string }[];
}
export function restoreService(raw: string): ServiceMemory {
  const empty: ServiceMemory = { version: 1, asked: [], attempts: [] };
  try {
    const data = JSON.parse(raw);
    if (
      data?.version !== 1 ||
      !Array.isArray(data.asked) ||
      !Array.isArray(data.attempts) ||
      data.asked.length > 3 ||
      data.attempts.length > 30
    )
      return empty;
    if (
      !data.asked.every(
        (stage: unknown) => typeof stage === 'string' && Object.hasOwn(requests, stage),
      )
    )
      return empty;
    if (
      !data.attempts.every(
        (a: ServiceMemory['attempts'][number]) =>
          a && Object.hasOwn(requests, a.stage) && books.some((b) => b.id === a.book),
      )
    )
      return empty;
    return {
      version: 1,
      asked: [...new Set<string>(data.asked)],
      attempts: data.attempts.map((a: ServiceMemory['attempts'][number]) => ({
        stage: a.stage,
        book: a.book,
      })),
    };
  } catch {
    return empty;
  }
}

import {
  advanceChapter,
  advanceSecondDay,
  advanceToLeo,
  advanceToThomas,
  advanceToNora,
  advanceToDayFourMara,
  advanceToDayFourLeo,
  chooseChapterOption,
  finishSecondDay,
  finishThirdDay,
  finishFourthDay,
  finishSeason,
  startBookClub,
  startChapter,
  startSecondDay,
  startThirdDay,
  startFourthDay,
  startFifthDay,
  stageStory,
  type ChapterState,
  type ChapterStage,
} from '../game/chapter';
import { availableOptions, currentNode } from '../game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from '../game/save';
import { castMember } from '../game/cast';
import { bookForChoice } from '../content/books';
import { seasonEnding } from '../game/endings';
import { inspectShopSpot, shopSpots, type ShopSpotId } from '../game/exploration';
import { completedOrders } from '../game/service';
import { storyProgress } from '../game/progress';
import { catalogEntries, type CatalogFilter } from '../game/catalog';
import { journalFacts } from './journal-facts';

const stagePeople: Partial<Record<ChapterStage, { name: string; actor: string | null }>> = {
  miller: { name: 'Пані Міллер', actor: 'miller' },
  mara: { name: 'Мара', actor: 'mara' },
  evening: { name: 'Вечір у книгарні', actor: null },
  iris: { name: 'Айріс', actor: 'iris' },
  anna: { name: 'Анна', actor: 'anna' },
  leo: { name: 'Лео', actor: 'leo' },
  eleanor: { name: 'Елеонора', actor: 'eleanor' },
  thomas: { name: 'Томас', actor: 'thomas' },
  nora: { name: 'Нора', actor: 'nora' },
  'book-club': { name: 'Книжковий клуб', actor: null },
  'day4-iris': { name: 'Айріс', actor: 'iris' },
  'day4-mara': { name: 'Мара', actor: 'mara' },
  'day4-leo': { name: 'Лео', actor: 'leo' },
  'day5-reading': { name: 'Вечір історій', actor: null },
};

const checkpoints: Partial<
  Record<ChapterStage, { label: string; next: (state: ChapterState) => ChapterState }>
> = {
  complete: { label: 'Почати другий день', next: startSecondDay },
  'day2-complete': { label: 'Почати третій день', next: startThirdDay },
  'day3-complete': { label: 'Почати четвертий день', next: startFourthDay },
  'day4-complete': { label: 'Почати п’ятий день', next: startFifthDay },
};
const sequence: Partial<
  Record<ChapterStage, { label: string; next: (state: ChapterState) => ChapterState }>
> = {
  miller: { label: 'Зустріти Мару', next: advanceChapter },
  mara: { label: 'Завершити день у книгарні', next: advanceChapter },
  evening: { label: 'Завершити перший день', next: advanceChapter },
  iris: { label: 'Зустріти Анну', next: advanceSecondDay },
  anna: { label: 'Зустріти Лео', next: advanceToLeo },
  leo: { label: 'Завершити другий день', next: finishSecondDay },
  eleanor: { label: 'Зустріти Томаса', next: advanceToThomas },
  thomas: { label: 'Зустріти Нору', next: advanceToNora },
  nora: { label: 'Відкрити книжковий клуб', next: startBookClub },
  'book-club': { label: 'Завершити третій день', next: finishThirdDay },
  'day4-iris': { label: 'Зустріти Мару', next: advanceToDayFourMara },
  'day4-mara': { label: 'Зустріти Лео', next: advanceToDayFourLeo },
  'day4-leo': { label: 'Завершити четвертий день', next: finishFourthDay },
  'day5-reading': { label: 'Завершити перший сезон', next: finishSeason },
};
const dayOf = (stage: ChapterStage): number =>
  ['miller', 'mara', 'evening', 'complete'].includes(stage)
    ? 1
    : ['iris', 'anna', 'leo', 'day2-complete'].includes(stage)
      ? 2
      : ['eleanor', 'thomas', 'nora', 'book-club', 'day3-complete'].includes(stage)
        ? 3
        : ['day4-iris', 'day4-mara', 'day4-leo', 'day4-complete'].includes(stage)
          ? 4
          : 5;

export class FiveDayStory {
  private chapter: ChapterState;
  constructor() {
    let saved: ChapterState | null = null;
    try {
      saved = decodeSave(localStorage.getItem(SAVE_KEY) ?? '');
    } catch {
      /* Storage may be blocked. */
    }
    this.chapter = saved ?? startChapter();
  }
  get stage(): ChapterStage {
    return this.chapter.stage;
  }
  get day(): number {
    return dayOf(this.chapter.stage);
  }
  get visitor(): string {
    return (
      stagePeople[this.stage]?.name ??
      (this.stage === 'season-complete' ? 'Завершення історії' : 'Наступний день')
    );
  }
  get actor(): string | null {
    return stagePeople[this.stage]?.actor ?? null;
  }
  get progress() {
    return storyProgress(this.stage);
  }
  get notes(): readonly string[] {
    return journalFacts
      .filter(([flag]) => this.chapter.flags.includes(flag))
      .map(([, text]) => text);
  }
  get orders() {
    return completedOrders(this.chapter);
  }
  catalog(filter: CatalogFilter = 'all') {
    return catalogEntries(filter);
  }
  inspect(id: string) {
    const spot = shopSpots.find((item) => item.id === id);
    if (!spot) return null;
    this.chapter = inspectShopSpot(this.chapter, id as ShopSpotId);
    this.persist();
    return { speaker: spot.title, text: spot.detail, choices: [], portrait: '' };
  }
  private persist(): void {
    try {
      localStorage.setItem(SAVE_KEY, encodeSave(this.chapter));
    } catch {
      /* Continue without persistence. */
    }
  }
  open() {
    const checkpoint = checkpoints[this.stage];
    if (checkpoint)
      return {
        speaker: 'Книгарня',
        text: `День ${this.day} завершено. Ваші рішення залишаються з вами.`,
        choices: [{ id: '__advance', label: checkpoint.label }],
        portrait: '',
      };
    if (this.stage === 'season-complete') {
      const ending = seasonEnding(this.chapter);
      return {
        speaker: ending.title,
        text: [ending.letter, ending.community, ending.epilogue].join('\n\n'),
        choices: [{ id: '__restart', label: 'Почати історію знову' }],
        portrait: '',
      };
    }
    const story = stageStory(this.stage);
    const node = currentNode(story, this.chapter.dialogue);
    const choices = availableOptions(story, this.chapter.dialogue).map((option) => {
      const book = ['miller', 'mara'].includes(this.stage)
        ? bookForChoice(this.stage as 'miller' | 'mara', node.id, option.id)
        : undefined;
      return {
        id: option.id,
        label: option.label,
        ...(book
          ? {
              book: {
                title: book.title,
                genre: book.genre,
                length: book.length,
                blurb: book.blurb,
                readerFit: book.readerFit,
                possibleImpact: book.possibleImpact,
              },
            }
          : {}),
      };
    });
    if (!choices.length && sequence[this.stage])
      choices.push({ id: '__advance', label: sequence[this.stage]!.label });
    const member = castMember(node.speaker);
    return {
      speaker: node.speaker,
      text: node.text,
      choices,
      portrait: member?.id === 'mara' ? '/art/bookshop/mara.svg' : (member?.portrait ?? ''),
    };
  }
  choose(id: string) {
    if (id === '__restart' && this.stage === 'season-complete') this.chapter = startChapter();
    else if (id === '__advance') {
      const action = checkpoints[this.stage] ?? sequence[this.stage];
      if (!action) throw new Error('No valid next stage');
      this.chapter = action.next(this.chapter);
    } else this.chapter = chooseChapterOption(this.chapter, id);
    this.persist();
    return this.open();
  }
}

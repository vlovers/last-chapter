import {
  assessRecommendation,
  requestContext,
  orderDefinition,
  orderBook,
  restoreService,
  SERVICE_KEY,
} from '../game/recommendation';
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
  exploreAfterBookClub,
  skipBookClub,
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
import { seasonEnding } from '../game/endings';
import { inspectShopSpot, shopSpots, type ShopSpotId } from '../game/exploration';
import { completedOrders } from '../game/service';
import { storyProgress } from '../game/progress';
import { catalogEntries, type CatalogFilter } from '../game/catalog';
import { journalFacts, journalEvidence } from './journal-facts';
import { accessibleClues, collectClue } from './clue-board';

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
  'quiet-evening': { name: 'Тихий вечір у книгарні', actor: null },
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
  'quiet-evening': { label: 'Завершити третій день', next: finishThirdDay },
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
      : ['eleanor', 'thomas', 'nora', 'book-club', 'quiet-evening', 'day3-complete'].includes(stage)
        ? 3
        : ['day4-iris', 'day4-mara', 'day4-leo', 'day4-complete'].includes(stage)
          ? 4
          : 5;

export class FiveDayStory {
  private chapter: ChapterState;
  private service = restoreService('');
  private saveAvailable = true;
  private choicePage = 0;
  private choicePageKey = '';
  constructor() {
    let saved: ChapterState | null = null;
    try {
      saved = decodeSave(localStorage.getItem(SAVE_KEY) ?? '');
    } catch {
      // Reading may be blocked before the first player choice.
      this.saveAvailable = false;
    }
    this.chapter = saved ?? startChapter();
    if (saved) {
      try {
        this.service = restoreService(localStorage.getItem(SERVICE_KEY) ?? '');
      } catch {
        /* optional */
      }
    } else {
      // Service attempts belong to the narrative save. Without a valid chapter,
      // discard orphaned recommendations before a new playthrough can inherit them.
      this.persistService();
    }
  }
  /** False when the most recent narrative save could not be persisted. */
  get isProgressSaved(): boolean {
    return this.saveAvailable;
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
  get knownEvidence() {
    return journalEvidence
      .filter((entry) => this.chapter.flags.includes(entry.flag))
      .map((entry) => ({
        title: entry.title,
        kind: entry.kind,
        source: entry.source,
        detail: journalFacts.find(([flag]) => flag === entry.flag)![1],
      }));
  }
  get inspectedSpots(): readonly string[] {
    return shopSpots
      .filter((spot) => this.chapter.flags.includes(spot.discoveryFlag))
      .map((spot) => spot.id);
  }
  get evidence() {
    return accessibleClues(this.chapter.flags).map((clue) => ({
      ...clue,
      collected: this.chapter.flags.includes(clue.flag),
    }));
  }
  gatherEvidence(id: string) {
    this.chapter = collectClue(this.chapter, id);
    this.persist();
    return this.evidence.find((clue) => clue.id === id);
  }
  get recommendationChoices() {
    const node = currentNode(stageStory(this.stage), this.chapter.dialogue);
    const order = orderDefinition(this.stage, node.id);
    if (!order || order.choices.some((choice) => this.chapter.flags.includes(choice.receipt)))
      return [];
    const available = availableOptions(stageStory(this.stage), this.chapter.dialogue);
    return order.choices.flatMap((choice) =>
      available.some((option) => option.id === choice.choice)
        ? [{ id: choice.choice, bookId: choice.book }]
        : [],
    );
  }

  get request() {
    if (!this.recommendationChoices.length) return null;
    const context = requestContext(this.stage);
    return context
      ? {
          ...context,
          asked: this.service.asked.includes(this.stage),
          customer: this.visitor,
          prompt: currentNode(stageStory(this.stage), this.chapter.dialogue).text,
        }
      : null;
  }
  clarifyRequest() {
    if (!this.request) return;
    this.service.asked = [...new Set([...this.service.asked, this.stage])];
    this.persistService();
  }
  recommend(bookId: string) {
    if (!this.request) return null;
    const reaction = assessRecommendation(this.stage, bookId);
    if (!reaction) return null;
    const choice = this.recommendationChoices.find((option) => option.bookId === bookId);
    this.service.attempts = [...this.service.attempts, { stage: this.stage, book: bookId }].slice(
      -30,
    );
    this.persistService();
    if (choice) this.choose(choice.id);
    if (typeof window !== 'undefined')
      window.dispatchEvent(
        new CustomEvent('last-chapter:recommendation', {
          detail: { bookId, accepted: Boolean(choice), text: reaction.text },
        }),
      );
    return { ...reaction, accepted: Boolean(choice) };
  }
  get lastRecommendation() {
    const order = orderDefinition(this.stage);
    if (!order) return null;
    const attempt = [...this.service.attempts]
      .reverse()
      .find((attempt) => attempt.stage === this.stage);
    // The original receipt flag wins over optional diagnostics, including old saves
    // or a purchase made directly through the authored dialogue rather than catalog.
    const receipt = order.choices.find((choice) => this.chapter.flags.includes(choice.receipt));
    const bookId = receipt?.book ?? attempt?.book;
    if (!bookId) return null;
    const accepted = Boolean(receipt);
    if (!accepted && !this.request) return null;
    const reaction = assessRecommendation(this.stage, bookId);
    return reaction ? { text: reaction.text, accepted } : null;
  }
  get guidance() {
    if (this.request)
      return {
        action: 'Обрати книжку',
        text: `${this.visitor} чекає на книжку. Відкрийте каталог і запропонуйте видання.`,
      };
    if (checkpoints[this.stage])
      return {
        action: 'Наступний день',
        text: 'День завершено. Продовжте історію, коли будете готові.',
      };
    if (this.stage === 'season-complete')
      return {
        action: 'Підсумок',
        text: 'Історію завершено. Можна перечитати нотатник або почати знову.',
      };
    const node = this.open();
    return {
      action: node.choices.some((choice) => choice.id === '__advance') ? 'Далі' : 'Розмова',
      text: `${this.visitor}. Натисніть кнопку дня, щоб продовжити. Огляди й додаткові розмови — за бажанням.`,
    };
  }
  private persistService() {
    try {
      localStorage.setItem(SERVICE_KEY, JSON.stringify(this.service));
    } catch {
      /* optional */
    }
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
      this.saveAvailable = true;
    } catch {
      // Continue playing, but expose the failure so the UI can warn the player.
      this.saveAvailable = false;
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
      const book = orderBook(this.stage, node.id, option.id);
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
    if (!choices.length && sequence[this.stage]) {
      choices.push({ id: '__advance', label: sequence[this.stage]!.label });
      if (this.stage === 'nora')
        choices.push({ id: '__skip_club', label: 'Залишитися в книгарні на тихий вечір' });
      if (this.stage === 'book-club')
        choices.push({
          id: '__explore_after_club',
          label: 'Прибрати після клубу й оглянути книгарню',
        });
    }
    const pageKey = this.stage + ':' + node.id + ':' + choices.map((choice) => choice.id).join(',');
    if (this.choicePageKey !== pageKey) {
      this.choicePageKey = pageKey;
      this.choicePage = 0;
    }
    // Keep topic navigation from crowding out a direct reply to the current line.
    // Show three conversation choices and one stable pagination control.
    const totalPages = choices.length <= 3 ? 1 : Math.ceil(choices.length / 3);
    this.choicePage = Math.min(this.choicePage, totalPages - 1);
    const visibleChoices =
      totalPages === 1
        ? choices
        : [
            ...choices.slice(this.choicePage * 3, (this.choicePage + 1) * 3),
            {
              id: '__more_choices',
              label: this.choicePage < totalPages - 1 ? 'Інші варіанти →' : '← Попередні варіанти',
            },
          ];
    const member = castMember(node.speaker);
    return {
      speaker: node.speaker,
      text: node.text,
      choices: visibleChoices,
      canRecommend: this.recommendationChoices.length > 0,
      portrait: member?.id === 'mara' ? '/art/bookshop/mara.svg' : (member?.portrait ?? ''),
    };
  }
  choose(id: string) {
    const restarting = id === '__restart' && this.stage === 'season-complete';
    if (id === '__restart' && this.stage === 'season-complete') this.chapter = startChapter();
    else if (id === '__more_choices') {
      const options = this.open().choices;
      const pageCount = availableOptions(stageStory(this.stage), this.chapter.dialogue).length;
      const pages = pageCount <= 3 ? 1 : Math.ceil(pageCount / 3);
      this.choicePage = this.choicePage < pages - 1 ? this.choicePage + 1 : 0;
      return this.open();
    } else if (id === '__explore_after_club') {
      this.chapter = exploreAfterBookClub(this.chapter);
    } else if (id === '__skip_club') {
      this.chapter = skipBookClub(this.chapter);
    } else if (id === '__advance') {
      const action = checkpoints[this.stage] ?? sequence[this.stage];
      if (!action) throw new Error('No valid next stage');
      // A stage can advance only when the actual dialogue graph has no
      // remaining choices. Checkpoints are already completed stages.
      if (!checkpoints[this.stage]) {
        const graph = stageStory(this.stage);
        if (availableOptions(graph, this.chapter.dialogue).length > 0)
          throw new Error('Finish the conversation before advancing');
      }
      this.chapter = action.next(this.chapter);
    } else {
      // Internal control actions are never valid dialogue option IDs.
      if (id.startsWith('__')) throw new Error('Unknown story action');
      this.chapter = chooseChapterOption(this.chapter, id);
    }
    this.persist();
    if (restarting) {
      this.service = restoreService('');
      this.persistService();
    }
    if (restarting && typeof window !== 'undefined')
      window.dispatchEvent(new Event('last-chapter:new-game'));
    return this.open();
  }
}

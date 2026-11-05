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
import { decodeSave, encodeSave, isNewerSaveVersion, SAVE_KEY } from '../game/save';
import { castMember } from '../game/cast';
import { seasonEnding } from '../game/endings';
import { inspectShopSpot, shopSpots, type ShopSpotId } from '../game/exploration';
import { completedOrders } from '../game/service';
import { discardOrphanedOptionalProgress } from './optional-progress';
import { storyProgress } from '../game/progress';
import { catalogEntries, type CatalogFilter } from '../game/catalog';
import { journalFacts, journalEvidence, journalFlagVisible } from './journal-facts';
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

/**
 * Keep the finale's closing action one tap away without hiding optional
 * conversations. Other dialogue screens retain their three-choice pages.
 */
function paginateChoices<T extends { readonly id: string }>(
  stage: ChapterStage,
  nodeId: string,
  choices: readonly T[],
) {
  const pinnedClose =
    stage === 'day5-reading' && nodeId === 'gathering'
      ? choices.find((choice) => choice.id === 'close')
      : undefined;
  const pageable = pinnedClose ? choices.filter((choice) => choice.id !== 'close') : choices;
  const firstPageSize = pinnedClose ? 2 : 3;
  const pageCount =
    pageable.length <= firstPageSize ? 1 : 1 + Math.ceil((pageable.length - firstPageSize) / 3);
  return { pinnedClose, pageable, firstPageSize, pageCount };
}

export class FiveDayStory {
  private chapter: ChapterState;
  private service = restoreService('');
  private saveAvailable = true;
  private saveRecoveryPending = false;
  private serviceDirty = false;
  private choicePage = 0;
  private choicePageKey = '';
  constructor() {
    let saved: ChapterState | null = null;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      saved = decodeSave(raw ?? '');
      if (!saved && raw && isNewerSaveVersion(raw)) {
        // An older game build must not overwrite a save from a newer build.
        this.saveAvailable = false;
        this.saveRecoveryPending = true;
      }
    } catch {
      // Reading may be blocked before the first player choice.
      this.saveAvailable = false;
      this.saveRecoveryPending = true;
    }
    this.chapter = saved ?? startChapter();
    if (saved) {
      try {
        this.service = restoreService(localStorage.getItem(SERVICE_KEY) ?? '');
      } catch {
        /* optional */
      }
    } else if (!this.saveRecoveryPending) {
      // Optional conversations, personal notes and service attempts belong to
      // the chapter save. Never inherit them after a missing/corrupt save.
      discardOrphanedOptionalProgress();
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
    const flags = new Set(this.chapter.flags);
    return journalFacts.filter(([flag]) => journalFlagVisible(flag, flags)).map(([, text]) => text);
  }
  get knownEvidence() {
    const flags = new Set(this.chapter.flags);
    return journalEvidence
      .filter((entry) => journalFlagVisible(entry.flag, flags))
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
    // Commit the chapter choice first: a failed save must not leave a durable
    // recommendation receipt pointing at a chapter that never advanced.
    if (choice) this.choose(choice.id);
    this.service.attempts = [...this.service.attempts, { stage: this.stage, book: bookId }].slice(
      -30,
    );
    this.persistService();
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
    // An unreadable or newer chapter may own previous recommendation history.
    if (this.saveRecoveryPending || !this.saveAvailable) {
      this.serviceDirty = true;
      return;
    }
    try {
      localStorage.setItem(SERVICE_KEY, JSON.stringify(this.service));
      this.serviceDirty = false;
    } catch {
      // Retry when the next chapter write succeeds.
      this.serviceDirty = true;
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
      if (this.saveRecoveryPending && localStorage.getItem(SAVE_KEY) !== null) {
        // A failed read or unsupported version is not a missing save. Never overwrite an
        // existing chapter after starting a temporary in-memory fallback.
        this.saveAvailable = false;
        return;
      }
      localStorage.setItem(SAVE_KEY, encodeSave(this.chapter));
      this.saveAvailable = true;
      if (this.saveRecoveryPending) {
        // Storage recovered and there was no earlier chapter to preserve.
        // Only now is it safe to discard orphaned optional progress.
        this.saveRecoveryPending = false;
        discardOrphanedOptionalProgress();
        this.service = restoreService('');
        this.persistService();
      } else if (this.serviceDirty) {
        // A previously unsaved recommendation can now follow its durable chapter.
        this.persistService();
      }
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
        ...(option.delivery ? { delivery: option.delivery } : {}),
        ...(option.spokenText ? { spokenText: option.spokenText } : {}),
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
    const { pinnedClose, pageable, firstPageSize, pageCount } = paginateChoices(
      this.stage,
      node.id,
      choices,
    );
    this.choicePage = Math.min(this.choicePage, pageCount - 1);
    const offset = this.choicePage === 0 ? 0 : firstPageSize + (this.choicePage - 1) * 3;
    const pageSize = this.choicePage === 0 ? firstPageSize : 3;
    // Never exceed four mobile buttons. Only the gathering pins "finish";
    // all optional replies remain in their original order on subsequent pages.
    const visibleChoices = [
      ...pageable.slice(offset, offset + pageSize),
      ...(pageCount > 1
        ? [
            {
              id: '__more_choices',
              label: this.choicePage < pageCount - 1 ? 'Інші варіанти →' : '↩ На початок списку',
            },
          ]
        : []),
      ...(this.choicePage === 0 && pinnedClose ? [pinnedClose] : []),
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
    const chapterBeforeRestart = restarting ? this.chapter : null;
    if (id === '__restart' && this.stage === 'season-complete') this.chapter = startChapter();
    else if (id === '__more_choices') {
      const visible = this.open().choices;
      if (!visible.some((choice) => choice.id === '__more_choices'))
        throw new Error('No additional dialogue choices');
      const options = availableOptions(stageStory(this.stage), this.chapter.dialogue);
      const { pageCount } = paginateChoices(this.stage, this.chapter.dialogue.node, options);
      this.choicePage = this.choicePage < pageCount - 1 ? this.choicePage + 1 : 0;
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
    if (restarting && !this.saveAvailable) {
      // The previous run still owns its optional progress. Stay on the finale
      // and let the player retry rather than erasing an unsaved replacement.
      this.chapter = chapterBeforeRestart!;
      return this.open();
    }
    if (restarting) {
      // Restart must clear the previous run even when the DOM journal has not
      // mounted (or its new-game event listener has already been removed).
      discardOrphanedOptionalProgress();
      this.service = restoreService('');
      this.persistService();
    }
    if (restarting && typeof window !== 'undefined')
      window.dispatchEvent(new Event('last-chapter:new-game'));
    return this.open();
  }
}

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
    if (checkpoints[this.stage]) return 'Наступний день';
    if (this.stage === 'season-complete') return 'Завершення історії';
    return currentNode(stageStory(this.stage), this.chapter.dialogue).speaker;
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
      return { id: option.id, label: book ? `${option.label} · «${book.title}»` : option.label };
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

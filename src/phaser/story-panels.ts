import { availableOptions, currentNode, selectOption, startDialogue, type DialogueState } from '../game/dialogue';
import { oliverUnreadBook } from '../content/optional/oliver';
import type { FiveDayStory } from './five-day-story';
import {
  answerConversation,
  conversationAvailable,
  conversationView,
  normalizeMemories,
  restoreConversation,
  startConversation,
  type ConversationSession,
} from './conversation-engine';
import { maraBookClub } from './mara-book-club';
import { maraAfterHours } from './mara-after-hours';
import { maraReturnVisit } from './mara-return-visit';
import { maraLetterDecision } from './mara-letter-decision';
import { allowedMaraTopic, availableMaraTopics } from './mara-topic-availability';

declare global {
  interface Window {
    __lastChapterRefresh?: () => void;
  }
}
import type { CatalogFilter } from '../game/catalog';

/** The Phaser shell owns movement; this accessible DOM dock owns reading and reference material. */
export function mountStoryPanels(story: FiveDayStory): () => void {
  const root = document.querySelector<HTMLElement>('#story-tools');
  const journal = document.querySelector<HTMLButtonElement>('#journal-toggle');
  const catalog = document.querySelector<HTMLButtonElement>('#catalog-toggle');
  const panel = document.querySelector<HTMLElement>('#story-panel');
  const timeline = document.querySelector<HTMLOListElement>('#day-timeline');
  const continueButton = document.querySelector<HTMLButtonElement>('#story-continue');
  if (!root || !journal || !catalog || !panel || !timeline || !continueButton) {
    throw new Error('Не знайдено панель історії');
  }
  const controls = { journal, catalog };
  let mode: 'journal' | 'catalog' | 'conversation' | 'oliver' | null = null;
  const oliverKey = 'last-chapter:optional:oliver:v1';
  let oliverSession: DialogueState | null = null;
  let oliverFinished = false;
  try { oliverFinished = localStorage.getItem(oliverKey) === 'done'; } catch { /* optional */ }
  const saveOliver = () => { try { localStorage.setItem(oliverKey, 'done'); } catch { /* optional */ } };
  const conversationKey = 'last-chapter:conversation:mara:v1';
  let selectedTopic = maraBookClub;
  const letterKey = 'last-chapter:conversation:mara:letter:v1';
  let letterDecision: ConversationSession = startConversation(maraLetterDecision);
  const returnKey = 'last-chapter:conversation:mara:return:v1';
  let returnVisit: ConversationSession = startConversation(maraReturnVisit);
  const afterHoursKey = 'last-chapter:conversation:mara:after-hours:v1';
  let conversation: ConversationSession = startConversation(maraBookClub);
  let afterHours: ConversationSession = startConversation(maraAfterHours);
  const sharedMemories = () =>
    normalizeMemories([
      ...conversation.memories,
      ...afterHours.memories,
      ...returnVisit.memories,
      ...letterDecision.memories,
    ]);
  try {
    const saved = localStorage.getItem(conversationKey);
    if (saved) conversation = restoreConversation(maraBookClub, saved) ?? conversation;
    const savedAfterHours = localStorage.getItem(afterHoursKey);
    if (savedAfterHours)
      afterHours = restoreConversation(maraAfterHours, savedAfterHours) ?? afterHours;
    const savedReturn = localStorage.getItem(returnKey);
    if (savedReturn) returnVisit = restoreConversation(maraReturnVisit, savedReturn) ?? returnVisit;
    const savedLetter = localStorage.getItem(letterKey);
    if (savedLetter)
      letterDecision = restoreConversation(maraLetterDecision, savedLetter) ?? letterDecision;
  } catch {
    /* storage may be unavailable */
  }
  const saveConversation = () => {
    try {
      localStorage.setItem(conversationKey, JSON.stringify(conversation));
      localStorage.setItem(afterHoursKey, JSON.stringify(afterHours));
      localStorage.setItem(returnKey, JSON.stringify(returnVisit));
      localStorage.setItem(letterKey, JSON.stringify(letterDecision));
    } catch {
      /* optional */
    }
  };
  const conversationButton = document.createElement('button');
  conversationButton.type = 'button';
  conversationButton.textContent = 'Поговорити з Марою';
  conversationButton.setAttribute('aria-label', 'Поговорити з Марою');
  conversationButton.setAttribute('aria-expanded', 'false');
  root.querySelector('.story-toolbar-actions')?.append(conversationButton);
  const oliverButton = document.createElement('button');
  oliverButton.type = 'button';
  oliverButton.textContent = 'Поговорити з Олівером';
  root.querySelector('.story-toolbar-actions')?.append(oliverButton);
  let filter: CatalogFilter = 'all';
  const element = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text: string,
    className = '',
  ): HTMLElementTagNameMap[K] => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const sessionFor = (id: string) =>
    id === maraBookClub.id
      ? conversation
      : id === maraAfterHours.id
        ? afterHours
        : id === maraReturnVisit.id
          ? returnVisit
          : letterDecision;
  const refresh = () => {
    timeline.replaceChildren();
    for (const day of story.progress) {
      const item = element('li', String(day.day), `day-step day-step--${day.status}`);
      item.title = day.label;
      item.setAttribute(
        'aria-label',
        `${day.label} · ${day.status === 'completed' ? 'завершено' : day.status === 'current' ? 'зараз' : 'попереду'}`,
      );
      if (day.status === 'current') item.setAttribute('aria-current', 'step');
      timeline.append(item);
    }
    continueButton.textContent = `День ${story.day} · ${story.visitor} · Продовжити`;
    for (const [name, button] of Object.entries(controls)) {
      button.setAttribute('aria-expanded', String(mode === name));
    }
    const count = availableMaraTopics(story.day).filter((t) =>
      conversationAvailable(t, sessionFor(t.id)),
    ).length;
    conversationButton.dataset.new = count ? String(count) : '✓';
    conversationButton.title = count ? `Доступно тем: ${count}` : 'Доступні розмови завершено';
    conversationButton.setAttribute('aria-expanded', String(mode === 'conversation'));
    oliverButton.hidden = story.day !== 2 || oliverFinished;
    oliverButton.setAttribute('aria-expanded', String(mode === 'oliver'));
    if (mode === 'oliver' && oliverButton.hidden) mode = null;
    panel.hidden = mode === null;
    document.body.classList.toggle('reading', mode !== null);
    panel.setAttribute('aria-label', 'Сторінки книгарні');
    panel.replaceChildren();
    if (mode !== null) {
      const close = element('button', '×', 'panel-close');
      close.type = 'button';
      close.setAttribute('aria-label', 'Повернутися до книгарні');
      close.addEventListener('click', () => {
        mode = null;
        refresh();
        conversationButton.focus({ preventScroll: true });
      });
      panel.append(close);
    }
    if (mode === 'oliver') {
      if (!oliverSession) oliverSession = startDialogue(oliverUnreadBook);
      const node = currentNode(oliverUnreadBook, oliverSession);
      panel.append(element('h2', 'Олівер · Книжка, якої ми не читали'));
      panel.append(element('h3', node.speaker), element('p', node.text));
      const options = availableOptions(oliverUnreadBook, oliverSession);
      for (const option of options) {
        const button = element('button', option.label);
        button.type = 'button';
        button.addEventListener('click', () => {
          if (!oliverSession) return;
          oliverSession = selectOption(oliverUnreadBook, oliverSession, option.id);
          refresh();
        });
        panel.append(button);
      }
      if (options.length === 0) {
        const finish = element('button', 'Завершити розмову');
        finish.type = 'button';
        finish.addEventListener('click', () => {
          oliverFinished = true;
          saveOliver();
          oliverSession = null;
          mode = null;
          refresh();
        });
        panel.append(finish);
      }
    } else if (mode === 'conversation') {
      const topics = availableMaraTopics(story.day).filter((t) =>
        conversationAvailable(t, sessionFor(t.id)),
      );
      selectedTopic =
        topics.find((t) => t.id === selectedTopic.id) ??
        topics[0] ??
        allowedMaraTopic(story.day, selectedTopic);
      if (!topics.length) {
        panel.append(element('p', 'Усі доступні розмови завершено. Нові теми з’являться згодом.'));
        return;
      }
      const topicSelector = element('div', '', 'story-filters');
      for (const topic of topics) {
        const button = element('button', topic.title);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(selectedTopic.id === topic.id));
        button.addEventListener('click', () => {
          selectedTopic = topic;
          refresh();
        });
        topicSelector.append(button);
      }
      panel.append(topicSelector, element('h2', selectedTopic.title));
      const activeConversation =
        selectedTopic.id === maraBookClub.id
          ? conversation
          : selectedTopic.id === maraAfterHours.id
            ? afterHours
            : selectedTopic.id === maraReturnVisit.id
              ? returnVisit
              : letterDecision;
      if (activeConversation.finished) {
        panel.append(element('p', 'Розмову завершено.'));
        if (selectedTopic.repeatability === 'repeatable') {
          const again = element('button', 'Почати ще одну розмову');
          again.addEventListener('click', () => {
            const next = startConversation(selectedTopic, sharedMemories());
            if (selectedTopic.id === maraAfterHours.id) afterHours = next;
            else if (selectedTopic.id === maraReturnVisit.id) returnVisit = next;
            else if (selectedTopic.id === maraLetterDecision.id) letterDecision = next;
            else conversation = next;
            saveConversation();
            refresh();
          });
          panel.append(again);
        }
      } else {
        const node = conversationView(selectedTopic, {
          ...activeConversation,
          memories: sharedMemories(),
        });
        panel.append(element('h3', node.speaker), element('p', node.text));
        for (const choice of node.choices) {
          const button = element('button', choice.label);
          button.type = 'button';
          button.addEventListener('click', () => {
            const next = answerConversation(
              selectedTopic,
              { ...activeConversation, memories: sharedMemories() },
              choice.id,
            );
            if (selectedTopic.id === maraAfterHours.id) afterHours = next;
            else if (selectedTopic.id === maraReturnVisit.id) returnVisit = next;
            else if (selectedTopic.id === maraLetterDecision.id) letterDecision = next;
            else conversation = next;
            saveConversation();
            if (next.suspended) mode = null;
            refresh();
            (panel.querySelector('button') ?? conversationButton).focus({ preventScroll: true });
          });
          panel.append(button);
        }
      }
    } else if (mode === 'journal') {
      panel.append(element('h2', 'Нотатник книгаря'));
      panel.append(element('h3', 'Дошка знахідок'));
      const evidence = element('div', '', 'story-book-grid');
      for (const clue of story.evidence) {
        const card = element('article', '', 'story-book');
        card.append(element('h3', clue.label));
        if (clue.collected) card.append(element('p', clue.detail));
        else {
          card.append(element('p', 'Знахідка доступна для дослідження.'));
          const gather = element('button', 'Дослідити');
          gather.type = 'button';
          gather.addEventListener('click', () => {
            story.gatherEvidence(clue.id);
            refresh();
          });
          card.append(gather);
        }
        evidence.append(card);
      }
      if (!story.evidence.length)
        evidence.append(
          element('p', 'Огляньте полиці, прилавок і підставку біля вікна, щоб поповнити нотатник.'),
        );
      panel.append(evidence);
      const notes = element('ul', '', 'story-notes');
      for (const note of story.notes) notes.append(element('li', note));
      if (!story.notes.length) notes.append(element('li', 'Поки що тут немає записів.'));
      panel.append(notes, element('h3', 'Замовлення відвідувачів'));
      for (const order of story.orders) {
        const receipt = element('article', '', 'story-receipt');
        receipt.append(
          element('strong', order.customer),
          element('span', order.book.title),
          element('small', order.note),
        );
        panel.append(receipt);
      }
      if (!story.orders.length) panel.append(element('p', 'Ще немає виконаних замовлень.'));
    } else if (mode === 'catalog') {
      panel.append(element('h2', 'Книжки на полицях'));
      const filters = element('div', '', 'story-filters');
      const labels: readonly [CatalogFilter, string][] = [
        ['all', 'Усі'],
        ['mystery', 'Детективи'],
        ['literary', 'Проза та листи'],
      ];
      for (const [value, label] of labels) {
        const button = element('button', label);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(filter === value));
        button.addEventListener('click', () => {
          filter = value;
          refresh();
        });
        filters.append(button);
      }
      panel.append(filters);
      const shelf = element('div', '', 'story-book-grid');
      for (const book of story.catalog(filter)) {
        const card = element('article', '', 'story-book');
        card.append(
          element('h3', book.title),
          element('small', `${book.genre} · ${book.length}`),
          element('p', book.blurb),
        );
        const details = element('details', '');
        const summary = element('summary', 'Чому варто прочитати');
        details.append(summary, element('p', book.readerFit), element('p', book.possibleImpact));
        card.append(details);
        shelf.append(card);
      }
      panel.append(shelf);
    }
  };
  const toggle = (next: 'journal' | 'catalog' | 'conversation' | 'oliver') => {
    mode = mode === next ? null : next;
    refresh();
    if (mode) (panel.querySelector('button') ?? panel).focus({ preventScroll: true });
  };
  const conversationClick = () => toggle('conversation');
  const oliverClick = () => toggle('oliver');
  const journalClick = () => toggle('journal');
  const catalogClick = () => toggle('catalog');
  const continueClick = () => {
    mode = null;
    refresh();
    window.dispatchEvent(new CustomEvent('last-chapter:continue'));
  };
  conversationButton.addEventListener('click', conversationClick);
  oliverButton.addEventListener('click', oliverClick);
  journal.addEventListener('click', journalClick);
  catalog.addEventListener('click', catalogClick);
  continueButton.addEventListener('click', continueClick);
  const panelKeys = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      mode = null;
      refresh();
      conversationButton.focus({ preventScroll: true });
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>('button'));
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      event.preventDefault();
      buttons[
        (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
      ]?.focus({ preventScroll: true });
    }
  };
  panel.addEventListener('keydown', panelKeys);
  const newGame = () => {
    conversation = startConversation(maraBookClub);
    afterHours = startConversation(maraAfterHours);
    returnVisit = startConversation(maraReturnVisit);
    letterDecision = startConversation(maraLetterDecision);
    selectedTopic = maraBookClub;
    oliverSession = null;
    oliverFinished = false;
    try { localStorage.removeItem(oliverKey); } catch { /* optional */ }
    mode = null;
    saveConversation();
    refresh();
  };
  window.addEventListener('last-chapter:new-game', newGame);
  window.__lastChapterRefresh = refresh;
  refresh();
  return () => {
    oliverButton.removeEventListener('click', oliverClick);
    oliverButton.remove();
    conversationButton.removeEventListener('click', conversationClick);
    conversationButton.remove();
    journal.removeEventListener('click', journalClick);
    catalog.removeEventListener('click', catalogClick);
    continueButton.removeEventListener('click', continueClick);
    panel.removeEventListener('keydown', panelKeys);
    window.removeEventListener('last-chapter:new-game', newGame);
    window.__lastChapterRefresh = undefined;
  };
}

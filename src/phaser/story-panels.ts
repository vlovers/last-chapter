import { evidenceKindLabels } from './journal-facts';
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
  journal.setAttribute('aria-label', 'Нотатник');
  catalog.setAttribute('aria-label', 'Каталог книжок');
  let mode: 'journal' | 'catalog' | 'conversation' | null = null;
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
    const saved = story.hasRestoredProgress ? localStorage.getItem(conversationKey) : null;
    if (saved) conversation = restoreConversation(maraBookClub, saved) ?? conversation;
    const savedAfterHours = story.hasRestoredProgress ? localStorage.getItem(afterHoursKey) : null;
    if (savedAfterHours)
      afterHours = restoreConversation(maraAfterHours, savedAfterHours) ?? afterHours;
    const savedReturn = story.hasRestoredProgress ? localStorage.getItem(returnKey) : null;
    if (savedReturn) returnVisit = restoreConversation(maraReturnVisit, savedReturn) ?? returnVisit;
    const savedLetter = story.hasRestoredProgress ? localStorage.getItem(letterKey) : null;
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
  if (!story.hasRestoredProgress) saveConversation();
  const conversationButton = document.createElement('button');
  conversationButton.type = 'button';
  conversationButton.textContent = 'Поговорити з Марою';
  conversationButton.setAttribute('aria-label', 'Поговорити з Марою');
  conversationButton.setAttribute('aria-expanded', 'false');
  conversationButton.setAttribute('aria-controls', 'story-panel');
  root.querySelector('.story-toolbar-actions')?.append(conversationButton);
  let filter: CatalogFilter = 'all';
  let search = '';
  let journalTab = 'people';
  let reaction: { text: string; accepted: boolean } | null = null;
  let returnFocus: HTMLElement | null = null;
  let personalNotes = '';
  try {
    personalNotes = story.hasRestoredProgress
      ? (localStorage.getItem('last-chapter:notes:v1') ?? '').slice(0, 4000)
      : '';
    if (!story.hasRestoredProgress) localStorage.setItem('last-chapter:notes:v1', '');
  } catch {
    /* optional */
  }
  const discoveredPeople = () => {
    const visits = [
      ['miller', 'Пані Міллер'],
      ['mara', 'Мара'],
      ['iris', 'Айріс'],
      ['anna', 'Анна'],
      ['leo', 'Лео'],
      ['eleanor', 'Елеонора'],
      ['thomas', 'Томас'],
      ['nora', 'Нора'],
    ];
    const stages = [
      'miller',
      'mara',
      'evening',
      'complete',
      'iris',
      'anna',
      'leo',
      'day2-complete',
      'eleanor',
      'thomas',
      'nora',
      'book-club',
      'quiet-evening',
      'day3-complete',
      'day4-iris',
      'day4-mara',
      'day4-leo',
      'day4-complete',
      'day5-reading',
      'season-complete',
    ];
    return visits.filter(([stage]) => stages.indexOf(stage!) <= stages.indexOf(story.stage));
  };
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
  const saveWarning = document.createElement('p');
  saveWarning.id = 'save-warning';
  saveWarning.setAttribute('role', 'alert');
  saveWarning.textContent =
    'Не вдалося зберегти прогрес. Після оновлення сторінки останні рішення можуть зникнути.';
  saveWarning.hidden = true;
  root.prepend(saveWarning);
  const refresh = () => {
    saveWarning.hidden = story.isProgressSaved;
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
    continueButton.textContent = `День ${story.day} · ${story.visitor}`;
    continueButton.setAttribute(
      'aria-label',
      `День ${story.day} · ${story.visitor} · ${story.guidance.action}`,
    );
    continueButton.dataset.action = story.guidance.action;
    continueButton.title = story.guidance.text;
    continueButton.setAttribute('data-stage', story.stage);
    for (const [name, button] of Object.entries(controls)) {
      button.setAttribute('aria-expanded', String(mode === name));
    }
    const count = availableMaraTopics(story.day).filter((t) =>
      conversationAvailable(t, sessionFor(t.id)),
    ).length;
    const maraKnown = discoveredPeople().some(([id]) => id === 'mara');
    const maraPresent = story.actor === 'mara';
    conversationButton.hidden = !maraKnown;
    conversationButton.disabled = !maraPresent;
    conversationButton.dataset.new = maraPresent ? (count ? String(count) : '✓') : '';
    conversationButton.title = !maraPresent
      ? 'Мари зараз немає у книгарні.'
      : count
        ? `Доступно тем: ${count}`
        : 'Доступні розмови завершено';
    conversationButton.setAttribute('aria-expanded', String(mode === 'conversation'));
    panel.hidden = mode === null;
    document.body.classList.toggle('reading', mode !== null);
    panel.setAttribute('aria-label', 'Сторінки книгарні');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    const blocked = mode !== null;
    const talking = document.querySelector('#stage')?.classList.contains('talking');
    const loading = !document.querySelector<HTMLElement>('#loading')?.hidden;
    for (const selector of ['#game', '#hotspots', '.hud', '#context-action']) {
      const surface = document.querySelector<HTMLElement>(selector);
      if (surface) surface.inert = blocked || Boolean(talking) || loading;
    }
    const toolbar = root.querySelector<HTMLElement>('.story-toolbar');
    if (toolbar) toolbar.inert = blocked || loading;

    panel.replaceChildren();
    if (mode !== null) {
      const close = element('button', '×', 'panel-close');
      close.type = 'button';
      close.setAttribute('aria-label', 'Повернутися до книгарні');
      close.addEventListener('click', () => {
        mode = null;
        refresh();
        (returnFocus ?? conversationButton).focus({ preventScroll: true });
      });
      panel.append(close);
    }
    if (mode === 'conversation') {
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
      panel.append(
        topicSelector,
        element('h2', selectedTopic.title),
        element(
          'p',
          'Додаткова розмова. Її можна відкласти й продовжити пізніше.',
          'optional-hint',
        ),
      );
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
      const tabs = element('nav', '', 'journal-tabs');
      tabs.setAttribute('aria-label', 'Розділи нотатника');
      for (const [id, label] of [
        ['people', 'Люди'],
        ['clues', 'Знахідки'],
        ['orders', 'Замовлення'],
        ['rumors', 'Чутки'],
        ['notes', 'Мої записи'],
      ]) {
        const button = element('button', label!);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(journalTab === id));
        button.addEventListener('click', () => {
          journalTab = id!;
          refresh();
          panel.querySelector<HTMLButtonElement>("[aria-pressed='true']")?.focus();
        });
        tabs.append(button);
      }
      panel.append(tabs);
      if (journalTab === 'people') {
        for (const [id, name] of discoveredPeople()) {
          const card = element('article', '', 'evidence-card');
          card.append(
            element('h3', name!),
            element(
              'p',
              story.actor === id
                ? 'Зараз у книгарні. Можна продовжити розмову.'
                : 'Ви вже зустрічалися в книгарні.',
            ),
          );
          panel.append(card);
        }
        // Keep optional authored conversations accessible without another persistent HUD control.
        const talk = element('button', 'Поговорити з Марою');
        talk.addEventListener('click', () => {
          mode = 'conversation';
          refresh();
          panel.querySelector<HTMLButtonElement>('button')?.focus();
        });
        talk.disabled = story.actor !== 'mara';
        if (discoveredPeople().some(([id]) => id === 'mara')) {
          panel.append(talk);
          if (talk.disabled)
            panel.append(
              element(
                'p',
                'Мари зараз немає у книгарні. Додаткові розмови можна продовжити під час її візиту.',
              ),
            );
        }
        const decisions = story.notes.filter((note) => !note.startsWith('Чутка:'));
        if (decisions.length) {
          panel.append(element('h3', 'Почуте й важливі рішення'));
          const list = element('ul', '', 'story-notes');
          for (const note of decisions) list.append(element('li', note));
          panel.append(list);
        }
      } else if (journalTab === 'clues') {
        const collected = story.evidence.filter((clue) => clue.collected);
        for (const entry of story.knownEvidence) {
          const card = element('article', '', 'evidence-card');
          card.append(
            element('small', `${evidenceKindLabels[entry.kind]} · ${entry.source}`),
            element('h3', entry.title),
            element('p', entry.detail),
          );
          panel.append(card);
        }
        for (const clue of collected) {
          const card = element('article', '', 'evidence-card');
          card.append(
            element('small', evidenceKindLabels[clue.kind]),
            element('h3', clue.label),
            element('p', clue.detail),
          );
          panel.append(card);
        }
        panel.append(element('h3', 'Відкриті запитання'));
        panel.append(
          element(
            'p',
            collected.length || story.knownEvidence.length
              ? 'Що ці знахідки підтверджують? Про що варто запитати, не роблячи висновків за інших?'
              : 'Огляньте книгарню. Тут з’являться лише досліджені знахідки.',
          ),
        );
        // Available evidence remains an explicit investigation action, separate from discovered cards.
        for (const clue of story.evidence.filter((clue) => !clue.collected)) {
          const gather = element('button', `Дослідити: ${clue.label}`);
          gather.type = 'button';
          gather.addEventListener('click', () => {
            story.gatherEvidence(clue.id);
            refresh();
          });
          panel.append(gather);
        }
      } else if (journalTab === 'orders') {
        if (story.request)
          panel.append(
            element(
              'p',
              `${story.request.customer} чекає на рекомендацію. Підберіть книжку в каталозі.`,
            ),
          );
        for (const order of story.orders) {
          const receipt = element('article', '', 'story-receipt');
          receipt.append(
            element('strong', order.customer),
            element('span', order.book.title),
            element('small', `Виконано · ${order.note}`),
          );
          panel.append(receipt);
        }
        if (!story.orders.length) panel.append(element('p', 'Ще немає виконаних замовлень.'));
      } else if (journalTab === 'rumors') {
        panel.append(element('p', 'Чутки — це чужі слова, а не підтвердження подій.'));
        const rumors = story.notes.filter((note) => note.startsWith('Чутка:'));
        for (const note of rumors) panel.append(element('p', note, 'evidence-card'));
        if (!rumors.length) panel.append(element('p', 'Ви ще не чули чуток.'));
      } else {
        const label = element('label', 'Ваші думки й запитання');
        label.htmlFor = 'personal-notes';
        const notes = element('textarea', '', 'personal-notes');
        notes.id = 'personal-notes';
        notes.maxLength = 4000;
        notes.value = personalNotes;
        notes.addEventListener('input', () => {
          personalNotes = notes.value;
          try {
            localStorage.setItem('last-chapter:notes:v1', personalNotes);
          } catch {
            /* optional */
          }
        });
        panel.append(label, notes, element('p', 'Ці записи залишаються лише у вашому браузері.'));
      }
    } else if (mode === 'catalog') {
      panel.append(element('h2', 'Книжки на полицях'));
      if (reaction) {
        const result = element('div', '', 'evidence-card');
        result.setAttribute('role', 'status');
        result.append(
          element('p', reaction.text),
          element('strong', reaction.accepted ? 'Замовлення виконано' : 'Шукаємо далі'),
        );
        if (reaction.accepted) {
          const resume = element('button', 'Продовжити розмову');
          resume.addEventListener('click', () => {
            mode = null;
            refresh();
            window.dispatchEvent(new Event('last-chapter:continue'));
          });
          result.append(resume);
        }
        panel.append(result);
      }
      const request = story.request;
      if (request) {
        const brief = element('div', '', 'evidence-card');
        brief.append(element('strong', `Підбираємо книжку · ${request.customer}`));
        brief.append(element('p', request.prompt));
        if (request.asked) brief.append(element('p', request.answer));
        else {
          const clarify = element('button', request.question);
          clarify.addEventListener('click', () => {
            story.clarifyRequest();
            refresh();
            panel.querySelector<HTMLButtonElement>('.panel-close')?.focus();
          });
          brief.append(clarify);
        }
        panel.append(brief);
      }
      const tools = element('div', '', 'panel-tools');
      const searchInput = element('input', '', 'catalog-search');
      searchInput.type = 'search';
      searchInput.placeholder = 'Знайти назву, жанр або тему…';
      searchInput.setAttribute('aria-label', 'Пошук книжок');
      searchInput.value = search;
      searchInput.addEventListener('input', () => {
        search = searchInput.value;
        const cursor = searchInput.selectionStart;
        refresh();
        const next = panel.querySelector<HTMLInputElement>('.catalog-search');
        next?.focus();
        if (cursor !== null) next?.setSelectionRange(cursor, cursor);
      });
      const filters = element('div', '', 'story-filters');
      const labels: readonly [CatalogFilter, string][] = [
        ['all', 'Усі'],
        ['mystery', 'Детективи'],
        ['literary', 'Проза та листи'],
      ];
      for (const [value, label] of labels) {
        const button = element('button', label!);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(filter === value));
        button.addEventListener('click', () => {
          filter = value;
          refresh();
          panel.querySelector<HTMLButtonElement>(".story-filters [aria-pressed='true']")?.focus();
        });
        filters.append(button);
      }
      tools.append(searchInput, filters);
      panel.append(tools);
      const shelf = element('div', '', 'story-book-grid');
      for (const book of story
        .catalog(filter)
        .filter((book) =>
          `${book.title} ${book.genre} ${book.blurb}`
            .toLocaleLowerCase('uk-UA')
            .includes(search.toLocaleLowerCase('uk-UA').trim()),
        )) {
        const card = element('article', '', 'story-book');
        const cover = element('div', book.title[0]!, 'book-cover');
        cover.setAttribute('aria-hidden', 'true');
        cover.style.setProperty(
          '--cover',
          (
            {
              orchard: '#697b5e',
              witnesses: '#736481',
              station: '#577a83',
              roads: '#a47755',
              letters: '#9b6665',
            } as Record<string, string>
          )[book.id]!,
        );
        card.append(
          cover,
          element('h3', book.title),
          element('small', `${book.genre} · ${book.length}`),
        );
        const details = element('details', '');
        const summary = element('summary', 'Про книжку');
        details.append(summary, element('p', book.blurb), element('p', book.tone));
        card.append(details);
        if (request) {
          const recommend = element('button', 'Запропонувати книжку');
          recommend.type = 'button';
          recommend.setAttribute('aria-label', `Запропонувати «${book.title}»`);
          recommend.addEventListener('click', () => {
            reaction = story.recommend(book.id);
            refresh();
            panel.scrollTop = 0;
            panel.querySelector<HTMLButtonElement>('.panel-close')?.focus();
          });
          card.append(recommend);
        }
        shelf.append(card);
      }
      if (!shelf.children.length)
        shelf.append(element('p', 'За цим запитом книжок немає. Спробуйте інше слово.'));
      panel.append(shelf);
    }
  };
  const toggle = (next: 'journal' | 'catalog' | 'conversation') => {
    if (next === 'conversation' && story.actor !== 'mara') return;
    returnFocus = document.activeElement as HTMLElement;
    reaction = next === 'catalog' ? story.lastRecommendation : null;
    mode = mode === next ? null : next;
    refresh();
    if (mode) (panel.querySelector('button') ?? panel).focus({ preventScroll: true });
  };
  const conversationClick = () => toggle('conversation');
  const journalClick = () => toggle('journal');
  const catalogClick = () => toggle('catalog');
  const continueClick = () => {
    mode = null;
    refresh();
    window.dispatchEvent(
      new CustomEvent(story.request ? 'last-chapter:catalog-open' : 'last-chapter:continue'),
    );
  };
  conversationButton.addEventListener('click', conversationClick);
  journal.addEventListener('click', journalClick);
  catalog.addEventListener('click', catalogClick);
  continueButton.addEventListener('click', continueClick);
  const panelKeys = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>('button, input, textarea, summary, a[href]'),
      ).filter(
        (node) => !node.hidden && !node.matches(':disabled') && node.getClientRects().length > 0,
      );
      const first = focusable[0],
        last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    if (event.key === 'Escape') {
      mode = null;
      refresh();
      (returnFocus ?? conversationButton).focus({ preventScroll: true });
    }
    if (
      (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
      !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
    ) {
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
    mode = null;
    personalNotes = '';
    try {
      localStorage.setItem('last-chapter:notes:v1', '');
    } catch {
      /* optional */
    }
    saveConversation();
    refresh();
  };
  const openOrderCatalog = () => {
    mode = 'catalog';
    reaction = story.lastRecommendation;
    refresh();
    panel.querySelector<HTMLButtonElement>('button')?.focus();
  };
  window.addEventListener('last-chapter:catalog-open', openOrderCatalog);
  window.addEventListener('last-chapter:new-game', newGame);
  window.__lastChapterRefresh = refresh;
  refresh();
  return () => {
    conversationButton.removeEventListener('click', conversationClick);
    conversationButton.remove();
    saveWarning.remove();
    journal.removeEventListener('click', journalClick);
    catalog.removeEventListener('click', catalogClick);
    continueButton.removeEventListener('click', continueClick);
    panel.removeEventListener('keydown', panelKeys);
    window.removeEventListener('last-chapter:catalog-open', openOrderCatalog);
    window.removeEventListener('last-chapter:new-game', newGame);
    if (window.__lastChapterRefresh === refresh) window.__lastChapterRefresh = undefined;
    mode = null;
    panel.hidden = true;
    panel.replaceChildren();
    document.body.classList.remove('reading');
    const toolbar = root.querySelector<HTMLElement>('.story-toolbar');
    if (toolbar) toolbar.inert = false;
  };
}

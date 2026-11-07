import { assetFallback } from './assets.js';
import { portraitDataUrl } from './visitor-portraits.js';
import { normalizeEmotion, emotionLabel } from './visitor-emotions.js';
import { spokenChoice } from './player-turn.js';
import { paginateDialogue, paginateAnswers } from './dialogue-pages.js';
/** Keep character/story conversations at a stable dock height between replies. */
export function shouldCompactDialogue(node, isConversation) {
  return !isConversation && node.choices.length <= 2 && node.text.length < 550;
}

/** Follow visual DOM order, including the catalog shortcut and scrollable prose. */
export function dialogueTabStops(element) {
  return [...element.querySelectorAll('button, [tabindex="0"]')].filter(
    (node) => !node.disabled && !node.closest('[hidden], [inert]'),
  );
}

export class DialogueUI {
  constructor(onChoose, onClose) {
    this.lifecycle = new AbortController();
    const options = { signal: this.lifecycle.signal };
    this.element = document.querySelector('#dialogue');
    this.name = document.querySelector('#speaker');
    this.text = document.querySelector('#dialogue-text');
    this.text.tabIndex = 0;
    this.text.setAttribute('role', 'region');
    this.text.setAttribute('aria-label', 'Репліка. Сторінки: стрілки ліворуч і праворуч.');
    this.choices = document.querySelector('#choices');
    this.portrait = document.querySelector('#portrait');
    this.fallback = document.querySelector('#portrait-fallback');
    this.mood = document.querySelector('#mood');
    this.close = document.querySelector('#close-dialogue');
    this.onChoose = onChoose;
    this.history = [];
    this.historyButton = document.createElement('button');
    this.historyButton.type = 'button';
    this.historyButton.id = 'dialogue-history-toggle';
    this.historyButton.textContent = 'Історія';
    this.historyButton.setAttribute('aria-expanded', 'false');
    this.historyButton.addEventListener('click', () => this.toggleHistory(), options);
    this.element.querySelector('.dialogue-title').insertBefore(this.historyButton, this.close);
    this.pager = document.createElement('nav');
    this.pager.id = 'dialogue-pages';
    this.pager.setAttribute('aria-label', 'Сторінки розмови');
    const control = (id, label, action) => {
      const button = document.createElement('button');
      button.id = id;
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', action, options);
      this.pager.append(button);
      return button;
    };
    this.previous = control('dialogue-previous', '←', () => this.turnPage(-1));
    this.previous.setAttribute('aria-label', 'Попередня сторінка репліки');
    this.pageLabel = document.createElement('span');
    this.pageLabel.setAttribute('aria-live', 'polite');
    this.pager.append(this.pageLabel);
    this.next = control('dialogue-next', 'Далі →', () => this.turnPage(1));
    this.next.setAttribute('aria-label', 'Наступна сторінка репліки');
    this.answerNext = control('answers-next', 'Ще відповіді →', () => {
      this.answerPage = (this.answerPage + 1) % this.answerPages.length;
      this.renderAnswers();
      this.answerNext.focus({ preventScroll: true });
    });
    this.text.after(this.pager);
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.element.hidden && this.node) this.layoutPages();
    });
    this.resizeObserver.observe(this.text);
    this.resizeObserver.observe(this.choices);
    this.skip = document.createElement('button');
    this.skip.type = 'button';
    this.skip.id = 'typewriter-skip';
    this.skip.textContent = 'Уся репліка';
    this.skip.setAttribute('aria-label', 'Показати весь текст');
    this.skip.addEventListener('click', () => this.finishTyping(), options);
    this.element.querySelector('.dialogue-title').insertBefore(this.skip, this.close);
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) this.finishTyping();
      },
      options,
    );
    this.close.addEventListener('click', onClose, options);
    this.portrait.addEventListener(
      'error',
      () => this.useFallback('mara-portrait', this.name.textContent),
      options,
    );
    this.element.addEventListener(
      'keydown',
      (event) => {
        if (event.repeat && ['Enter', 'Space', 'Tab'].includes(event.code)) {
          event.preventDefault();
          return;
        }
        if (event.code === 'Escape') {
          event.preventDefault();
          onClose();
          return;
        }
        if (event.isComposing) return;
        if (['ArrowLeft', 'ArrowRight'].includes(event.code) && !this.historyOpen) {
          event.preventDefault();
          this.turnPage(event.code === 'ArrowLeft' ? -1 : 1);
          return;
        }
        const buttons = dialogueTabStops(this.element);
        const index = buttons.indexOf(document.activeElement);
        // Arrow keys scroll the prose region natively. On answers they navigate.
        if (
          event.code === 'Tab' ||
          (['ArrowDown', 'ArrowUp'].includes(event.code) && document.activeElement !== this.text)
        ) {
          event.preventDefault();
          const direction = event.code === 'ArrowUp' || event.shiftKey ? -1 : 1;
          buttons[(index + direction + buttons.length) % buttons.length]?.focus();
        }
      },
      options,
    );
  }
  useFallback(id, speaker = '') {
    const fallback = assetFallback(id);
    this.portrait.hidden = true;
    this.fallback.hidden = false;
    this.fallback.textContent = speaker.trim().charAt(0) || fallback.initials;
    this.fallback.style.background = fallback.color;
  }
  show(node, isMara, completed, reduced, actor = null) {
    this.element.hidden = false;
    this.element.closest('#stage').classList.add('talking');
    this.element.classList.toggle('object-note', !isMara);
    this.element.classList.toggle('compact', false);
    const emotion = normalizeEmotion(node.mood);
    this.element.dataset.mood = emotion;
    this.mood.textContent = emotionLabel(emotion);
    this.name.textContent = node.speaker;
    const visitorNames = {
      'Пані Міллер': 'miller',
      Мара: 'mara',
      Айріс: 'iris',
      Анна: 'anna',
      Лео: 'leo',
      Елеонора: 'eleanor',
      Томас: 'thomas',
      Нора: 'nora',
    };
    this.element.dataset.visitor =
      visitorNames[node.speaker] ??
      (node.speaker === 'Оповідач' ? 'narrator' : (actor ?? 'narrator'));
    this.finishTyping();
    this.node = node;
    this.reduced = reduced;
    this.playerTurn = this.pendingPlayerTurn;
    this.pendingPlayerTurn = null;
    this.pageIndex = 0;
    this.answerPage = 0;
    this.historyOpen = false;
    this.historyButton.setAttribute('aria-expanded', 'false');
    const last = this.history.at(-1);
    if (
      !node.ephemeral &&
      (!last || last.text !== node.text || last.speaker !== node.speaker || this.playerTurn)
    ) {
      if (this.playerTurn) this.history.push({ speaker: 'Ви', text: this.playerTurn });
      this.history.push({ speaker: node.speaker, text: node.text });
      this.history = this.history.slice(-80);
    }
    const visitor = this.element.dataset.visitor;
    const image = isMara ? portraitDataUrl(visitor, emotion) : null;
    if (image) {
      this.portrait.hidden = false;
      this.fallback.hidden = true;
      this.portrait.alt = `Піксельний портрет: ${node.speaker}`;
      if (this.portrait.getAttribute('src') !== image) this.portrait.src = image;
    } else {
      this.useFallback('object', node.speaker);
    }
    this.close.textContent = node.choices.length ? 'Пізніше' : '×';
    this.close.setAttribute(
      'aria-label',
      node.choices.length ? 'Продовжити пізніше' : 'Закрити розмову',
    );
    this.choices.replaceChildren();
    this.element.querySelector('#browse-order')?.remove();
    if (node.canRecommend) {
      const browse = document.createElement('button');
      browse.id = 'browse-order';
      browse.type = 'button';
      browse.textContent = 'Обрати книжку в каталозі';
      browse.addEventListener('click', () =>
        window.dispatchEvent(new Event('last-chapter:order-catalog')),
      );
      this.element.querySelector('.dialogue-title').insertBefore(browse, this.close);
    }
    const opened = performance.now();
    this.readyAt = opened + 220;
    for (const choice of node.choices) {
      const button = document.createElement('button');
      button.type = 'button';
      if (choice.book) {
        const detail = document.createElement('span');
        detail.className = 'recommendation';
        const name = document.createElement('strong');
        name.textContent = choice.book.title;
        const meta = document.createElement('small');
        meta.textContent = `${choice.book.genre} · ${choice.book.length}`;
        const summary = document.createElement('span');
        summary.textContent = choice.book.blurb;
        const reader = document.createElement('span');
        reader.textContent = `Чому підходить: ${choice.book.readerFit}`;
        const impact = document.createElement('span');
        impact.textContent = `Що може змінитися: ${choice.book.possibleImpact}`;
        detail.append(name, meta);
        button.append(detail);
        button.setAttribute('aria-label', `${choice.label}: ${choice.book.title}`);
      } else button.textContent = choice.label;
      button.dataset.choice = choice.id;
      button.addEventListener('click', () => {
        if (button.disabled || performance.now() - opened < 220) return;
        // A rapid second tap can arrive after the first choice has replaced
        // this button. Never replay a stale dialogue action.
        button.disabled = true;
        button.dataset.selected = 'true';
        this.finishTyping();
        this.pendingPlayerTurn = spokenChoice(choice);
        try {
          this.onChoose(choice.id);
        } catch (error) {
          this.pendingPlayerTurn = null;
          button.disabled = false;
          delete button.dataset.selected;
          throw error;
        }
      });
      this.choices.append(button);
    }
    if (!node.choices.length) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = completed && isMara ? 'Повернутися до книгарні' : 'Продовжити';
      button.addEventListener('click', () => {
        if (performance.now() - opened >= 220) this.close.click();
      });
      this.choices.append(button);
    }
    this.element.classList.toggle('still', reduced);
    this.layoutPages();
    (this.choices.querySelector('button:not([hidden])') ?? this.next).focus({
      preventScroll: true,
    });
    this.element.scrollTop = 0;
  }
  layoutPages() {
    if (this.historyOpen) return;
    this.finishTyping();
    const fits = (page) => {
      this.buildPage(page);
      return this.text.scrollHeight <= this.text.clientHeight + 1;
    };
    this.pages = paginateDialogue(this.node.text, this.playerTurn, fits);
    this.pageIndex = Math.min(this.pageIndex, this.pages.length - 1);
    this.renderPage();
    const buttons = [...this.choices.querySelectorAll('button')];
    for (const button of buttons) button.hidden = false;
    const columns = getComputedStyle(this.choices).gridTemplateColumns.split(' ').length;
    // Desktop has two columns; phones/short landscape use complete rows.
    const heights = buttons.map((button) => button.getBoundingClientRect().height);
    const rowHeights = [];
    for (let i = 0; i < heights.length; i += columns)
      rowHeights.push(Math.max(...heights.slice(i, i + columns)));
    this.answerPages = paginateAnswers(rowHeights, this.choices.clientHeight - 8, 8).map((rows) =>
      rows.flatMap((row) =>
        Array.from({ length: columns }, (_, i) => row * columns + i).filter(
          (i) => i < buttons.length,
        ),
      ),
    );
    this.answerPage = Math.min(this.answerPage, Math.max(0, this.answerPages.length - 1));
    this.renderAnswers();
  }
  renderAnswers() {
    const visible = this.answerPages[this.answerPage] ?? [];
    [...this.choices.querySelectorAll('button')].forEach((button, index) => {
      button.hidden = !visible.includes(index);
    });
    this.answerNext.hidden = this.answerPages.length < 2;
    this.answerNext.textContent = `Відповіді ${this.answerPage + 1}/${this.answerPages.length} →`;
  }
  buildPage(page) {
    this.text.replaceChildren();
    if (page.playerText) {
      const turn = document.createElement('section');
      turn.id = 'player-turn';
      const name = document.createElement('strong');
      name.textContent = 'Ви';
      const words = document.createElement('p');
      words.textContent = page.playerText;
      turn.append(name, words);
      this.text.append(turn);
      if (page.text) {
        const replyName = document.createElement('strong');
        replyName.className = 'npc-turn-label';
        replyName.textContent = this.node.speaker;
        this.text.append(replyName);
      }
    }
    const accessible = document.createElement('span');
    accessible.className = 'sr-only';
    accessible.textContent = page.text;
    this.visualText = document.createElement('span');
    this.visualText.setAttribute('aria-hidden', 'true');
    this.visualText.textContent = page.text;
    this.text.append(accessible, this.visualText);
  }
  renderPage() {
    const page = this.pages[this.pageIndex];
    if (!page) return;
    this.buildPage(page);
    this.fullText = page.text;
    this.text.scrollTop = 0;
    this.previous.disabled = this.pageIndex === 0;
    this.next.disabled = this.pageIndex === this.pages.length - 1;
    this.pageLabel.textContent = `${page.text ? 'Репліка' : 'Ви'} · ${this.pageIndex + 1} / ${this.pages.length}`;
    this.skip.hidden = this.reduced;
    this.visualText.textContent = this.reduced ? page.text : '';
    if (!this.reduced) {
      const characters = Array.from(page.text);
      let shown = 0;
      this.typing = window.setInterval(() => {
        shown = Math.min(characters.length, shown + Math.max(2, Math.ceil(characters.length / 38)));
        this.visualText.textContent = characters.slice(0, shown).join('');
        if (shown === characters.length) this.finishTyping();
      }, 24);
    }
    this.element.dataset.pageSpeaker = page.text ? 'reply' : 'player';
  }
  turnPage(direction) {
    this.finishTyping();
    this.pageIndex = Math.max(0, Math.min(this.pages.length - 1, this.pageIndex + direction));
    this.renderPage();
    this.text.focus({ preventScroll: true });
  }
  toggleHistory() {
    this.finishTyping();
    this.historyOpen = !this.historyOpen;
    this.historyButton.setAttribute('aria-expanded', String(this.historyOpen));
    this.element.classList.toggle('history-open', this.historyOpen);
    if (!this.historyOpen) {
      this.layoutPages();
      return;
    }
    this.text.replaceChildren();
    for (const entry of this.history) {
      const line = document.createElement('p');
      const name = document.createElement('strong');
      name.textContent = entry.speaker + ': ';
      line.append(name, document.createTextNode(entry.text));
      this.text.append(line);
    }
    this.text.scrollTop = this.text.scrollHeight;
    this.text.focus({ preventScroll: true });
  }
  finishTyping() {
    window.clearInterval(this.typing);
    this.typing = null;
    if (this.visualText) this.visualText.textContent = this.fullText;
    if (this.skip) {
      const focused = document.activeElement === this.skip;
      this.skip.hidden = true;
      if (focused)
        (this.choices.querySelector('button:not([hidden])') ?? this.close).focus({
          preventScroll: true,
        });
    }
  }
  hide() {
    this.pendingPlayerTurn = null;
    this.finishTyping();
    this.element.classList.remove('history-open');
    this.element.hidden = true;
    this.element.closest('#stage').classList.remove('talking');
  }
  destroy() {
    this.lifecycle.abort();
    this.resizeObserver.disconnect();
    this.historyButton.remove();
    this.pager.remove();
    this.skip.remove();
    this.hide();
  }
}

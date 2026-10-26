import { assetFallback } from './assets.js';
import { portraitDataUrl } from './visitor-portraits.js';
import { normalizeEmotion, emotionLabel } from './visitor-emotions.js';
export class DialogueUI {
  constructor(onChoose, onClose) {
    this.lifecycle = new AbortController();
    const options = { signal: this.lifecycle.signal };
    this.element = document.querySelector('#dialogue');
    this.name = document.querySelector('#speaker');
    this.text = document.querySelector('#dialogue-text');
    this.choices = document.querySelector('#choices');
    this.portrait = document.querySelector('#portrait');
    this.fallback = document.querySelector('#portrait-fallback');
    this.mood = document.querySelector('#mood');
    this.close = document.querySelector('#close-dialogue');
    this.onChoose = onChoose;
    this.skip = document.createElement('button');
    this.skip.type = 'button';
    this.skip.id = 'typewriter-skip';
    this.skip.textContent = 'Показати весь текст';
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
        if (event.repeat) {
          event.preventDefault();
          return;
        }
        if (event.code === 'Escape') {
          event.preventDefault();
          onClose();
          return;
        }
        const buttons = [
          ...this.choices.querySelectorAll('button'),
          ...(!this.skip.hidden ? [this.skip] : []),
          this.close,
        ];
        const index = buttons.indexOf(document.activeElement);
        if (['ArrowDown', 'ArrowUp', 'Tab'].includes(event.code)) {
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
    this.element.classList.toggle('compact', node.choices.length <= 2 && node.text.length < 550);
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
    this.fullText = node.text;
    this.text.replaceChildren();
    const accessible = document.createElement('span');
    accessible.className = 'sr-only';
    accessible.textContent = node.text;
    this.visualText = document.createElement('span');
    this.visualText.setAttribute('aria-hidden', 'true');
    this.text.append(accessible, this.visualText);
    this.skip.hidden = reduced;
    this.text.style.minHeight = '';
    this.visualText.textContent = node.text;
    const maxTextHeight = Number.parseFloat(getComputedStyle(this.text).maxHeight);
    this.text.style.minHeight = `${Math.min(this.text.scrollHeight, maxTextHeight || this.text.scrollHeight)}px`;
    if (!reduced) this.visualText.textContent = '';
    if (reduced) this.visualText.textContent = node.text;
    else {
      const characters = Array.from(node.text);
      let shown = 0;
      this.typing = window.setInterval(() => {
        shown = Math.min(characters.length, shown + Math.max(2, Math.ceil(characters.length / 38)));
        this.visualText.textContent = characters.slice(0, shown).join('');
        if (shown === characters.length) this.finishTyping();
      }, 24);
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
      this.choices.append(browse);
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
        if (performance.now() - opened < 220) return;
        button.dataset.selected = 'true';
        this.finishTyping();
        this.onChoose(choice.id);
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
    (this.choices.querySelector('button') ?? this.close).focus({ preventScroll: true });
    this.element.scrollTop = 0;
  }
  finishTyping() {
    window.clearInterval(this.typing);
    this.typing = null;
    if (this.visualText) this.visualText.textContent = this.fullText;
    if (this.skip) this.skip.hidden = true;
  }
  hide() {
    this.finishTyping();
    this.element.hidden = true;
    this.element.closest('#stage').classList.remove('talking');
  }
  destroy() {
    this.lifecycle.abort();
    this.skip.remove();
    this.hide();
  }
}

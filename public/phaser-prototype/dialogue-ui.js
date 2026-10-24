import { assetFallback, ASSET_MANIFEST } from './assets.js';
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
        const buttons = [...this.choices.querySelectorAll('button'), this.close];
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
  show(node, isMara, completed, reduced) {
    this.element.hidden = false;
    this.element.closest('#stage').classList.add('talking');
    this.element.classList.toggle('object-note', !isMara);
    this.element.dataset.mood = node.mood ?? 'quiet';
    this.mood.textContent =
      { warm: 'Усміхається', thoughtful: 'Замислилася', firm: 'Рішуче' }[node.mood] ?? 'Тиха мить';
    this.name.textContent = node.speaker;
    this.text.textContent = node.text;
    this.portrait.hidden = !isMara;
    this.fallback.hidden = isMara;
    if (isMara) {
      const id = ['thoughtful', 'firm'].includes(node.mood) ? `mara-${node.mood}` : 'mara-portrait';
      const path = node.portrait ?? ASSET_MANIFEST.find((entry) => entry.id === id).path;
      if (this.portrait.getAttribute('src') !== path) this.portrait.src = path;
      if (this.portrait.complete && !this.portrait.naturalWidth)
        this.useFallback('mara-portrait', node.speaker);
    } else this.useFallback('object');
    this.close.textContent = '×';
    this.close.setAttribute(
      'aria-label',
      node.choices.length ? 'Продовжити пізніше' : 'Закрити розмову',
    );
    this.choices.replaceChildren();
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
        detail.append(name, meta, summary, reader, impact);
        button.append(detail);
        button.setAttribute('aria-label', `${choice.label}: ${choice.book.title}`);
      } else button.textContent = choice.label;
      button.addEventListener('click', () => {
        if (performance.now() - opened < 220) return;
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
    this.element.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  hide() {
    this.element.hidden = true;
    this.element.closest('#stage').classList.remove('talking');
  }
  destroy() {
    this.lifecycle.abort();
    this.hide();
  }
}

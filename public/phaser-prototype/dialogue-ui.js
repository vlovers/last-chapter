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
  show(node, isMara, completed, reduced, actor = null) {
    this.element.hidden = false;
    this.element.closest('#stage').classList.add('talking');
    this.element.classList.toggle('object-note', !isMara);
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
    this.text.textContent = node.text;
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
      button.dataset.choice = choice.id;
      button.addEventListener('click', () => {
        if (performance.now() - opened < 220) return;
        button.dataset.selected = 'true';
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
  hide() {
    this.element.hidden = true;
    this.element.closest('#stage').classList.remove('talking');
  }
  destroy() {
    this.lifecycle.abort();
    this.hide();
  }
}

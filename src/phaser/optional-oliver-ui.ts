import type { FiveDayStory } from './five-day-story';
import { chooseOliver, oliverLine, type OliverSession } from '../game/optional-oliver';
import { availableOptions } from '../game/dialogue';
import { oliverUnreadBook } from '../content/optional/oliver';
import './optional-oliver-ui.css';

/** Optional, accessible Day 2 conversation; never replaces the main Phaser dialogue. */
export function mountOliverConversation(story: FiveDayStory): () => void {
  const toolbar = document.querySelector<HTMLElement>('.story-toolbar-actions');
  const timeline = document.querySelector<HTMLElement>('#day-timeline');
  if (!toolbar || !timeline) return () => {};

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'oliver-trigger';
  trigger.textContent = 'Поговорити з Олівером';
  trigger.hidden = true;
  trigger.setAttribute('aria-controls', 'oliver-side-dialogue');
  trigger.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('section');
  panel.id = 'oliver-side-dialogue';
  panel.className = 'oliver-side-dialogue';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'oliver-side-heading');
  panel.hidden = true;

  const heading = document.createElement('h2');
  heading.id = 'oliver-side-heading';
  heading.textContent = 'Олівер · Розмова про книжку';
  const line = document.createElement('p');
  line.className = 'oliver-side-line';
  line.setAttribute('aria-live', 'polite');
  const choices = document.createElement('div');
  choices.className = 'oliver-side-choices';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Повернутися до книгарні';
  let session: OliverSession | null = null;

  const refresh = () => {
    trigger.hidden = !story.oliverAvailable;
    if (!story.oliverAvailable) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      session = null;
    }
  };

  const dismiss = () => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    refresh();
    if (!trigger.hidden) trigger.focus();
  };

  const paint = () => {
    if (!session) return;
    const current = oliverLine(session);
    line.textContent = current.speaker + ': «' + current.text + '»';
    choices.replaceChildren();
    if (session.complete) {
      const finish = document.createElement('button');
      finish.type = 'button';
      finish.textContent = 'Завершити розмову';
      finish.addEventListener('click', () => {
        if (!session) return;
        story.completeOliver(session);
        dismiss();
        window.__lastChapterRefresh?.();
      });
      choices.append(finish);
    } else {
      for (const option of availableOptions(oliverUnreadBook, session.dialogue)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = option.label;
        button.addEventListener('click', () => {
          if (!session) return;
          session = chooseOliver(session, option.id);
          paint();
        });
        choices.append(button);
      }
    }
    choices.querySelector<HTMLButtonElement>('button')?.focus();
  };

  trigger.addEventListener('click', () => {
    if (!story.oliverAvailable) return;
    session ??= story.beginOliver();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    paint();
  });
  close.addEventListener('click', dismiss);
  panel.addEventListener('keydown', (event) => {
    // Do not let the Phaser movement/interaction shortcuts consume dialogue keys.
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
    }
  });

  panel.append(heading, line, choices, close);
  toolbar.append(trigger);
  toolbar.parentElement?.after(panel);
  const newGame = () => {
    session = null;
    dismiss();
  };
  window.addEventListener('last-chapter:new-game', newGame);
  const observer = new MutationObserver(refresh);
  observer.observe(timeline, { childList: true, subtree: true });
  refresh();

  return () => {
    observer.disconnect();
    window.removeEventListener('last-chapter:new-game', newGame);
    trigger.remove();
    panel.remove();
  };
}

declare global {
  interface Window {
    __lastChapterRefresh?: () => void;
  }
}

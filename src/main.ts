import { opening } from './content/intro';
import { millerVisit } from './content/first-day';
import { availableOptions, currentNode, selectOption, startDialogue } from './game/dialogue';
import { advance, initialStory } from './game/model';
import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Не знайдено контейнер гри');

let state = initialStory();
let conversation = startDialogue(millerVisit);

function render(): void {
  if (!app) return;
  app.replaceChildren();

  const container = document.createElement('main');
  container.className = 'scene';

  const scene = document.createElement('div');
  scene.className = 'illustration';
  scene.setAttribute('role', 'img');
  scene.setAttribute('aria-label', 'Стилізована книгарня: книжкові полиці, вікно та тепле світло лампи');
  scene.innerHTML = '<div class="window"><div class="moon"></div></div><div class="shelves"><span>▤ ▥ ▤ ▥</span><span>▥ ▤ ▥ ▤</span><span>▤ ▥ ▤ ▥</span></div><div class="lamp"></div><div class="counter"></div>';

  const heading = document.createElement('h1');
  heading.textContent = `${opening.shop} · ${opening.town}`;

  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = `День ${state.day} · ${state.phase === 'day' ? 'Книгарня відкрита' : 'Після закриття'}`;

  const dialogue = document.createElement('blockquote');
  const node = currentNode(millerVisit, conversation);
  dialogue.textContent =
    state.phase === 'day'
      ? `${node.speaker}: «${node.text}»`
      : 'У книгарні запанувала тиша. Ви розгортаєте нотатник і пригадуєте почуте.';

  const actions = document.createElement('div');
  actions.className = 'actions';
  if (state.phase === 'day') {
    for (const option of availableOptions(millerVisit, conversation)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.label;
      button.addEventListener('click', () => {
        conversation = selectOption(millerVisit, conversation, option.id);
        render();
      });
      actions.append(button);
    }
  }

  if (state.phase === 'evening' || node.id === 'end') {
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'next';
    next.textContent = state.phase === 'day' ? 'Зачинити книгарню →' : 'Почати наступний день →';
    next.addEventListener('click', () => {
      state = advance(state);
      if (state.phase === 'day') conversation = startDialogue(millerVisit);
      render();
    });
    actions.append(next);
  }

  const notebook = document.createElement('section');
  notebook.className = 'notebook';
  const label = document.createElement('h2');
  label.textContent = 'Нотатник книгаря';
  const details = document.createElement('p');
  details.textContent = conversation.flags.includes('rumor_heard')
    ? 'Пані Міллер бачила Томаса біля громадського центру. Це не доказ зради.'
    : 'Ви ще не записали жодних міських чуток.';
  const journal = document.createElement('ul');
  if (conversation.flags.includes('heard_about_leak')) {
    const item = document.createElement('li');
    item.textContent = 'За словами пані Міллер, книгарню колись затопило.';
    journal.append(item);
  }
  if (conversation.flags.includes('sold_orchard') || conversation.flags.includes('sold_witnesses')) {
    const item = document.createElement('li');
    item.textContent = 'Першу книжку продано.';
    journal.append(item);
  }
  notebook.append(label, details, journal);
  container.append(scene, heading, subtitle, dialogue, actions, notebook);
  app.append(container);
}
render();

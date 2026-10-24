import { opening } from './content/intro';
import { advance, choose, initialStory, type Choice } from './game/model';
import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing app root');
let state = initialStory();

function render() {
  if (!app) return;
  app.replaceChildren();
  const container = document.createElement('main');
  container.className = 'scene';
  const scene = document.createElement('div');
  scene.className = 'illustration';
  scene.setAttribute('aria-label', 'Stylized pixel-bookshop counter under a glowing lamp');
  scene.innerHTML = '<div class="window"><div class="moon"></div></div><div class="shelves"><span>▤ ▥ ▤ ▥</span><span>▥ ▤ ▥ ▤</span><span>▤ ▥ ▤ ▥</span></div><div class="lamp"></div><div class="counter"></div>';
  const heading = document.createElement('h1');
  heading.textContent = `${opening.shop} · ${opening.town}`;
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = `Day ${state.day} · ${state.phase === 'day' ? 'Shop hours' : 'After closing'}`;
  const dialogue = document.createElement('blockquote');
  dialogue.textContent = state.phase === 'day' ? `Mrs. Miller: “${opening.line}”` : 'The shop falls quiet. You open your notebook and revisit what you heard.';
  const actions = document.createElement('div');
  actions.className = 'actions';
  if (state.phase === 'day') {
    const options: { label: string; choice: Choice }[] = [
      { label: 'Ask her to tell the whole story', choice: 'listen' },
      { label: 'Repeat the rumor to another customer', choice: 'share' },
      { label: 'Ask for evidence before believing it', choice: 'verify' },
    ];
    for (const option of options) {
      const button = document.createElement('button');
      button.textContent = option.label;
      button.addEventListener('click', () => { state = choose(state, option.choice); render(); });
      actions.append(button);
    }
  }
  const next = document.createElement('button');
  next.className = 'next';
  next.textContent = state.phase === 'day' ? 'Close the shop →' : 'Begin next day →';
  next.addEventListener('click', () => { state = advance(state); render(); });
  actions.append(next);
  const notebook = document.createElement('section');
  notebook.className = 'notebook';
  const label = document.createElement('h2');
  label.textContent = 'Notebook · Prototype state';
  const details = document.createElement('p');
  details.textContent = `Knowledge: ${state.knowledge} · Trust: ${state.trust} · Reputation: ${state.reputation}`;
  const journal = document.createElement('ul');
  for (const entry of state.journal.slice(-3)) {
    const item = document.createElement('li');
    item.textContent = entry;
    journal.append(item);
  }
  notebook.append(label, details, journal);
  container.append(scene, heading, subtitle, dialogue, actions, notebook);
  app.append(container);
}
render();

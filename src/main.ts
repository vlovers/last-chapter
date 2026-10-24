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
  scene.setAttribute('aria-label', 'Стилізована піксельна книгарня з прилавком під лампою');
  scene.innerHTML = '<div class="window"><div class="moon"></div></div><div class="shelves"><span>▤ ▥ ▤ ▥</span><span>▥ ▤ ▥ ▤</span><span>▤ ▥ ▤ ▥</span></div><div class="lamp"></div><div class="counter"></div>';
  const heading = document.createElement('h1');
  heading.textContent = `${opening.shop} · ${opening.town}`;
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = `День ${state.day} · ${state.phase === 'day' ? 'Книгарня відкрита' : 'Після закриття'}`;
  const dialogue = document.createElement('blockquote');
  dialogue.textContent = state.phase === 'day' ? `Пані Міллер: “${opening.line}”` : 'У книгарні запанувала тиша. Ви розгортаєте нотатник і пригадуєте почуте.';
  const actions = document.createElement('div');
  actions.className = 'actions';
  if (state.phase === 'day') {
    const options: { label: string; choice: Choice }[] = [
      { label: 'Розпитати про цю історію', choice: 'listen' },
      { label: 'Переказати чутку іншому відвідувачу', choice: 'share' },
      { label: 'Спершу з'ясувати, чи є докази', choice: 'verify' },
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
  next.textContent = state.phase === 'day' ? 'Зачинити книгарню →' : 'Почати наступний день →';
  next.addEventListener('click', () => { state = advance(state); render(); });
  actions.append(next);
  const notebook = document.createElement('section');
  notebook.className = 'notebook';
  const label = document.createElement('h2');
  label.textContent = 'Нотатник · Стан прототипу';
  const details = document.createElement('p');
  details.textContent = `Відомості: ${state.knowledge === 'rumor' ? 'чутка' : 'спостереження'} · Довіра: ${state.trust} · Репутація: ${state.reputation}`;
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

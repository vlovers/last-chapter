import { opening } from './content/intro';
import { advanceChapter, chooseChapterOption, stageStory, startChapter } from './game/chapter';
import { availableOptions, currentNode } from './game/dialogue';
import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Не знайдено контейнер гри');
let chapter = startChapter();

const stageNames = {
  miller: 'Ранок · Пані Міллер',
  mara: 'День · Мара',
  evening: 'Вечір · Стара коробка',
  complete: 'Кінець першого дня',
} as const;

function render(): void {
  if (!app) return;
  app.replaceChildren();
  const container = document.createElement('main');
  container.className = 'scene';

  const illustration = document.createElement('div');
  illustration.className = 'illustration';
  illustration.setAttribute('role', 'img');
  illustration.setAttribute('aria-label', 'Книгарня з книжковими полицями, вікном і теплою лампою');
  illustration.innerHTML = '<div class="window"><div class="moon"></div></div><div class="shelves"><span>▤ ▥ ▤ ▥</span><span>▥ ▤ ▥ ▤</span><span>▤ ▥ ▤ ▥</span></div><div class="lamp"></div><div class="counter"></div>';

  const heading = document.createElement('h1');
  heading.textContent = `${opening.shop} · ${opening.town}`;
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = stageNames[chapter.stage];
  const dialogue = document.createElement('blockquote');
  const actions = document.createElement('div');
  actions.className = 'actions';

  if (chapter.stage === 'complete') {
    dialogue.textContent = 'Перший день добіг кінця. Це лише короткий сюжетний прототип. Продовження ще створюється.';
    const restart = document.createElement('button');
    restart.type = 'button';
    restart.textContent = 'Почати знову';
    restart.addEventListener('click', () => { chapter = startChapter(); render(); });
    actions.append(restart);
  } else {
    const story = stageStory(chapter.stage);
    const node = currentNode(story, chapter.dialogue);
    dialogue.textContent = `${node.speaker}: «${node.text}»`;
    for (const option of availableOptions(story, chapter.dialogue)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.label;
      button.addEventListener('click', () => {
        chapter = chooseChapterOption(chapter, option.id);
        render();
      });
      actions.append(button);
    }
    if (node.options.length === 0) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'next';
      next.textContent = chapter.stage === 'evening' ? 'Завершити перший день →' : 'Наступна сцена →';
      next.addEventListener('click', () => { chapter = advanceChapter(chapter); render(); });
      actions.append(next);
    }
  }

  const notebook = document.createElement('section');
  notebook.className = 'notebook';
  const label = document.createElement('h2');
  label.textContent = 'Нотатник книгаря';
  const notes = document.createElement('ul');
  const facts: readonly [string, string][] = [
    ['heard_about_leak', 'Пані Міллер каже, що сім років тому книгарню затопило.'],
    ['rumor_heard', 'Чутка: пані Міллер бачила Томаса з жінкою біля громадського центру. Це не доказ зради.'],
    ['leo_likes_trains', 'Мара каже, що Лео любить потяги й розклади.'],
    ['mara_talked_about_leo', 'Мара хоче подарувати Лео книжку, яка покаже, що вона його розуміє.'],
    ['saw_receipt', 'Картка бронювання: Лео Марш. Підпису про отримання немає.'],
    ['saw_envelope', 'У книжці знайдено запечатаний лист від Айріс до Лео.'],
    ['opened_private_letter', 'Ви розкрили приватного листа без дозволу.'],
    ['letter_secured', 'Лист залишився у безпечному місці.'],
    ['ask_eleanor_next_day', 'Завтра слід запитати Елеонору про закриття книгарні.'],
  ];
  for (const [flag, text] of facts) {
    if (!chapter.flags.includes(flag)) continue;
    const item = document.createElement('li');
    item.textContent = text;
    notes.append(item);
  }
  if (!notes.children.length) {
    const item = document.createElement('li');
    item.textContent = 'Поки що тут немає записів.';
    notes.append(item);
  }
  notebook.append(label, notes);
  container.append(illustration, heading, subtitle, dialogue, actions, notebook);
  app.append(container);
}
render();

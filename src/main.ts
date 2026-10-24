import { opening } from './content/intro';
import { bookForChoice, type Book } from './content/books';
import {
  advanceChapter,
  advanceSecondDay,
  advanceToLeo,
  chooseChapterOption,
  finishSecondDay,
  stageStory,
  startChapter,
  startSecondDay,
  startThirdDay,
  advanceToThomas,
  advanceToNora,
  finishThirdDay,
} from './game/chapter';
import { availableOptions, currentNode } from './game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from './game/save';
import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Не знайдено контейнер гри');
let chapter = restoreChapter();
let previewBook: Book | null = null;

function restoreChapter() {
  try {
    return decodeSave(localStorage.getItem(SAVE_KEY) ?? '') ?? startChapter();
  } catch {
    return startChapter();
  }
}

function persistChapter(): void {
  try {
    localStorage.setItem(SAVE_KEY, encodeSave(chapter));
  } catch {
    // Private browsing or blocked storage must not prevent playing.
  }
}

const stageNames = {
  miller: 'Ранок · Пані Міллер',
  mara: 'День · Мара',
  evening: 'Вечір · Стара коробка',
  complete: 'Кінець першого дня',
  iris: 'День другий · Айріс',
  anna: 'День другий · Анна',
  leo: 'День другий · Лео',
  'day2-complete': 'Кінець другого дня',
  eleanor: 'День третій · Елеонора',
  thomas: 'День третій · Томас',
  nora: 'День третій · Нора',
  'day3-complete': 'Кінець поточного третього дня',
} as const;

function render(): void {
  if (!app) return;
  app.replaceChildren();
  const container = document.createElement('main');
  container.className = 'scene';
  container.dataset.stage = chapter.stage;

  const illustration = document.createElement('div');
  illustration.className = 'illustration';
  illustration.setAttribute('role', 'img');
  illustration.setAttribute('aria-label', 'Книгарня з книжковими полицями, вікном і теплою лампою');
  illustration.innerHTML = `
    <div class="scene-wall-art" aria-hidden="true"><span>ОСТАННІЙ РОЗДІЛ</span></div>
    <div class="scene-window" aria-hidden="true"><div class="scene-sky"></div><div class="scene-roof"></div><div class="scene-leaves">✦ ✧ ✦</div><div class="scene-window-cross"></div></div>
    <div class="scene-bookshelf scene-bookshelf-left" aria-hidden="true">
      <div class="shelf-books"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="shelf-books"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="shelf-books"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="scene-bookshelf scene-bookshelf-right" aria-hidden="true">
      <div class="shelf-books"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="shelf-books"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="scene-pendant" aria-hidden="true"></div>
    <div class="scene-plant" aria-hidden="true"><span>❦</span></div>
    <div class="scene-counter" aria-hidden="true"><div class="counter-books"></div><div class="counter-cup"></div></div>
    <div class="scene-foreground" aria-hidden="true"></div>
  `;

  const heading = document.createElement('h1');
  heading.textContent = `${opening.shop} · ${opening.town}`;
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = stageNames[chapter.stage];
  const dialogue = document.createElement('blockquote');
  dialogue.className = 'dialogue-card';
  const actions = document.createElement('div');
  actions.className = 'actions';

  if (
    chapter.stage === 'complete' ||
    chapter.stage === 'day2-complete' ||
    chapter.stage === 'day3-complete'
  ) {
    dialogue.textContent =
      chapter.stage === 'complete'
        ? 'Перший день завершено. Ваші рішення та знахідки залишаться з вами. Наступного ранку до книгарні завітає Айріс.'
        : chapter.stage === 'day2-complete'
          ? 'Другий день завершено. Наступного ранку до книгарні завітає Елеонора.'
          : 'Розмови з Елеонорою, Томасом і Норою завершені. Книжковий клуб ще готується.';
    if (chapter.stage === 'complete') {
      const continueButton = document.createElement('button');
      continueButton.type = 'button';
      continueButton.textContent = 'Почати другий день →';
      continueButton.addEventListener('click', () => {
        chapter = startSecondDay(chapter);
        persistChapter();
        render();
      });
      actions.append(continueButton);
    }
    if (chapter.stage === 'day2-complete') {
      const continueButton = document.createElement('button');
      continueButton.type = 'button';
      continueButton.textContent = 'Почати третій день →';
      continueButton.addEventListener('click', () => {
        chapter = startThirdDay(chapter);
        persistChapter();
        render();
      });
      actions.append(continueButton);
    }
    const restart = document.createElement('button');
    restart.type = 'button';
    restart.textContent = 'Почати знову';
    restart.addEventListener('click', () => {
      chapter = startChapter();
      previewBook = null;
      persistChapter();
      render();
    });
    actions.append(restart);
  } else {
    const story = stageStory(chapter.stage);
    const node = currentNode(story, chapter.dialogue);
    dialogue.textContent = `${node.speaker}: «${node.text}»`;
    if (node.id === 'order' && (chapter.stage === 'miller' || chapter.stage === 'mara')) {
      const shelf = document.createElement('section');
      shelf.className = 'book-shelf';
      const shelfHeading = document.createElement('h2');
      shelfHeading.textContent = 'Оберіть книжку для відвідувача';
      shelf.append(shelfHeading);
      for (const option of availableOptions(story, chapter.dialogue)) {
        const book = bookForChoice(chapter.stage, node.id, option.id);
        if (!book) continue;
        const card = document.createElement('article');
        card.className = 'book-card';
        const title = document.createElement('h3');
        title.textContent = book.title;
        const meta = document.createElement('p');
        meta.className = 'book-meta';
        meta.textContent = `${book.genre} · ${book.length} · ${book.tone}`;
        const blurb = document.createElement('p');
        blurb.textContent = book.blurb;
        const inspect = document.createElement('button');
        inspect.type = 'button';
        inspect.className = 'book-inspect';
        inspect.textContent =
          previewBook?.id === book.id ? 'Згорнути подробиці' : 'Докладніше про книжку';
        inspect.setAttribute('aria-expanded', String(previewBook?.id === book.id));
        inspect.addEventListener('click', () => {
          previewBook = previewBook?.id === book.id ? null : book;
          render();
        });
        card.append(title, meta, blurb, inspect);
        if (previewBook?.id === book.id) {
          const details = document.createElement('div');
          details.className = 'book-details';
          const fit = document.createElement('p');
          const fitHeading = document.createElement('strong');
          fitHeading.textContent = 'Чому ця книжка підходить: ';
          fit.append(fitHeading, document.createTextNode(book.readerFit));
          const impact = document.createElement('p');
          const impactHeading = document.createElement('strong');
          impactHeading.textContent = 'Що може змінитися: ';
          impact.append(impactHeading, document.createTextNode(book.possibleImpact));
          const confirm = document.createElement('button');
          confirm.type = 'button';
          confirm.textContent = `Порадити «${book.title}»`;
          confirm.addEventListener('click', () => {
            chapter = chooseChapterOption(chapter, option.id);
            previewBook = null;
            persistChapter();
            render();
          });
          details.append(fit, impact, confirm);
          card.append(details);
        }
        shelf.append(card);
      }
      actions.append(shelf);
    } else {
      for (const option of availableOptions(story, chapter.dialogue)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = option.label;
        button.addEventListener('click', () => {
          chapter = chooseChapterOption(chapter, option.id);
          previewBook = null;
          persistChapter();
          render();
        });
        actions.append(button);
      }
    }
    if (node.options.length === 0) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'next';
      next.textContent =
        chapter.stage === 'evening'
          ? 'Завершити перший день →'
          : chapter.stage === 'iris'
            ? 'Зустріти Анну →'
            : chapter.stage === 'anna'
              ? 'Зустріти Лео →'
              : chapter.stage === 'leo'
                ? 'Завершити зустрічі →'
                : chapter.stage === 'eleanor'
                  ? 'Зустріти Томаса →'
                  : chapter.stage === 'thomas'
                    ? 'Зустріти Нору →'
                    : chapter.stage === 'nora'
                      ? 'Завершити зустріч →'
                      : 'Наступна сцена →';
      next.addEventListener('click', () => {
        chapter =
          chapter.stage === 'iris'
            ? advanceSecondDay(chapter)
            : chapter.stage === 'anna'
              ? advanceToLeo(chapter)
              : chapter.stage === 'leo'
                ? finishSecondDay(chapter)
                : chapter.stage === 'eleanor'
                  ? advanceToThomas(chapter)
                  : chapter.stage === 'thomas'
                    ? advanceToNora(chapter)
                    : chapter.stage === 'nora'
                      ? finishThirdDay(chapter)
                      : advanceChapter(chapter);
        persistChapter();
        render();
      });
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
    [
      'rumor_heard',
      'Чутка: пані Міллер бачила Томаса з жінкою біля громадського центру. Це не доказ зради.',
    ],
    ['leo_likes_trains', 'Мара каже, що Лео любить потяги й розклади.'],
    ['mara_talked_about_leo', 'Мара хоче подарувати Лео книжку, яка покаже, що вона його розуміє.'],
    ['saw_receipt', 'Картка бронювання: Лео Марш. Підпису про отримання немає.'],
    ['nora_interested_in_letters', 'Нора цікавиться книжками про листування й право на відповідь.'],
    [
      'nora_confidentiality_respected',
      'Ви не наполягали на розголошенні приватних звернень до центру.',
    ],
    ['nora_confidentiality_pressed', 'Ви наполягали на розмові про чужу приватність.'],
    ['thomas_shared_work_stress', 'Томас розповів про нерівномірні замовлення та втому.'],
    ['thomas_rumor_respected', 'Ви вирішили не поширювати неперевірені чутки про Томаса.'],
    ['thomas_privacy_pressed', 'Ви наполягали на поясненнях щодо особистого життя Томаса.'],
    ['eleanor_confirmed_closure', 'Елеонора підтвердила закриття книгарні після затоплення.'],
    [
      'eleanor_confirmed_reservation',
      'Елеонора пам’ятає бронювання Лео, але не знає, чи він приходив.',
    ],
    ['eleanor_confirmed_missing_notification', 'Немає доказів, що Лео повідомили про закриття.'],
    [
      'eleanor_supported_privacy',
      'Елеонора радить поважати право авторки й адресата листа на рішення.',
    ],
    ['leo_shared_future_plan', 'Лео й Мара мріють разом побачити зимове море.'],
    [
      'leo_letter_disclosed_carefully',
      'Ви повідомили Лео про лист, не наполягаючи на його відкритті.',
    ],
    ['leo_letter_pressured', 'Ви тиснули на Лео через знайдений лист.'],
    ['anna_listened_to', 'Ви вислухали Анну, не роблячи висновків про її шлюб.'],
    ['anna_rumor_boundary', 'Анна попросила не обговорювати її сім’ю через чутки.'],
    ['anna_rumor_pressed', 'Ви наполягали на розмові про непідтверджену чутку.'],
    ['iris_boundary_respected', 'Ви поважали бажання Айріс не поспішати з особистою розмовою.'],
    ['iris_requested_privacy', 'Айріс попросила поки що не передавати знайдений лист.'],
    ['iris_recalled_closure', 'Айріс пам’ятає зачинену книгарню перед своїм від’їздом.'],
    ['saw_repair_note', 'Журнал ремонту підтверджує, що книгарню закрили через протікання.'],
    ['mara_boundaries_respected', 'Мара вдячна, що ви не наполягали на особистій розмові.'],
    ['mara_listened_about_work', 'Мара зізналася, що їй важко відмовляти в додатковій роботі.'],
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
  const storyPanel = document.createElement('section');
  storyPanel.className = 'story-panel';
  storyPanel.append(heading, subtitle, dialogue, actions);
  container.append(illustration, storyPanel, notebook);
  app.append(container);
}
render();

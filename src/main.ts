import { opening } from './content/intro';
import { bookForChoice, type Book } from './content/books';
import { catalogEntries, matchingOrderOptions, type CatalogFilter } from './game/catalog';
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
import { inspectShopSpot, shopSpots, type ShopSpotId } from './game/exploration';
import { completedOrders, currentCustomer } from './game/service';
import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Не знайдено контейнер гри');
let chapter = restoreChapter();
let previewBook: Book | null = null;
let activeSpot: ShopSpotId | null = null;
let catalogFilter: CatalogFilter = 'all';

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
  illustration.setAttribute(
    'aria-label',
    'Інтерактивна книгарня з книжковими полицями, вікном і прилавком',
  );
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

  const hotspots = document.createElement('div');
  hotspots.className = 'shop-hotspots';
  for (const spot of shopSpots) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `shop-hotspot shop-hotspot--${spot.id}`;
    button.textContent = spot.description;
    button.setAttribute('aria-label', spot.title + ': ' + spot.description);
    button.setAttribute('aria-pressed', String(activeSpot === spot.id));
    if (chapter.flags.includes(spot.discoveryFlag)) button.classList.add('shop-hotspot--visited');
    button.addEventListener('click', () => {
      chapter = inspectShopSpot(chapter, spot.id);
      activeSpot = activeSpot === spot.id ? null : spot.id;
      persistChapter();
      render();
    });
    hotspots.append(button);
  }
  illustration.append(hotspots);

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
      activeSpot = null;
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
    ['explored_shelves', 'Ви оглянули книжкові полиці та знайшли п’ять видань для рекомендацій.'],
    ['explored_window', 'За вікном книгарні — дощовий осінній Беллвік.'],
    ['explored_counter', 'На шухляді прилавка написано: «Спочатку вислухай».'],
    ['explored_plant', 'Рослина біля вікна пережила багато зим.'],
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
  const orderHeading = document.createElement('h3');
  orderHeading.className = 'orders-heading';
  orderHeading.textContent = 'Замовлення відвідувачів';
  const orders = document.createElement('div');
  orders.className = 'orders-list';
  const receipts = completedOrders(chapter);
  const customer = currentCustomer(chapter.stage);
  if (customer && !receipts.some((receipt) => receipt.customer === customer)) {
    const pending = document.createElement('p');
    pending.className = 'order-pending';
    pending.textContent = `${customer}: очікує на вашу рекомендацію.`;
    orders.append(pending);
  }
  if (receipts.length === 0 && !orders.childNodes.length) {
    const empty = document.createElement('p');
    empty.className = 'order-pending';
    empty.textContent = 'Ще немає виконаних замовлень.';
    orders.append(empty);
  }
  for (const receipt of receipts) {
    const row = document.createElement('article');
    row.className = 'order-receipt';
    const name = document.createElement('strong');
    name.textContent = receipt.customer;
    const title = document.createElement('span');
    title.textContent = receipt.book.title;
    const note = document.createElement('small');
    note.textContent = receipt.note;
    row.append(name, title, note);
    orders.append(row);
  }
  notebook.append(label, notes, orderHeading, orders);
  const storyPanel = document.createElement('section');
  storyPanel.className = 'story-panel';
  storyPanel.append(heading, subtitle);
  if (activeSpot) {
    const spot = shopSpots.find((item) => item.id === activeSpot);
    if (spot) {
      const inspection = document.createElement('aside');
      inspection.className = 'shop-inspection';
      const inspectionHeading = document.createElement('h2');
      inspectionHeading.textContent = spot.title;
      const inspectionText = document.createElement('p');
      inspectionText.textContent = spot.detail;
      const closeInspection = document.createElement('button');
      closeInspection.type = 'button';
      closeInspection.textContent = 'Повернутися до розмови';
      closeInspection.addEventListener('click', () => {
        activeSpot = null;
        render();
      });
      inspection.append(inspectionHeading, inspectionText);
      if (activeSpot === 'shelves') {
        const filterGroup = document.createElement('div');
        filterGroup.className = 'catalog-filters';
        filterGroup.setAttribute('role', 'group');
        filterGroup.setAttribute('aria-label', 'Фільтр книжок');
        const filters: readonly [CatalogFilter, string][] = [
          ['all', 'Усі'],
          ['mystery', 'Детективи'],
          ['literary', 'Проза та листи'],
        ];
        for (const [id, title] of filters) {
          const filterButton = document.createElement('button');
          filterButton.type = 'button';
          filterButton.textContent = title;
          filterButton.setAttribute('aria-pressed', String(catalogFilter === id));
          filterButton.addEventListener('click', () => {
            catalogFilter = id;
            render();
          });
          filterGroup.append(filterButton);
        }
        inspection.append(filterGroup);
        const catalog = document.createElement('div');
        catalog.className = 'catalog-list';
        const story = stageStory(chapter.stage);
        const node = currentNode(story, chapter.dialogue);
        const options = availableOptions(story, chapter.dialogue);
        const orderOptions = matchingOrderOptions(chapter.stage, node.id, options);
        for (const entry of catalogEntries(catalogFilter)) {
          const card = document.createElement('article');
          card.className = 'catalog-entry';
          const name = document.createElement('h3');
          name.textContent = entry.title;
          const genre = document.createElement('p');
          genre.className = 'catalog-meta';
          genre.textContent = `${entry.genre} · ${entry.length}`;
          const blurb = document.createElement('p');
          blurb.textContent = entry.blurb;
          card.append(name, genre, blurb);
          const availableOrder = orderOptions.find((option) => option.id === entry.id);
          if (availableOrder) {
            const recommend = document.createElement('button');
            recommend.type = 'button';
            recommend.textContent = `Порадити «${entry.title}»`;
            recommend.addEventListener('click', () => {
              chapter = chooseChapterOption(chapter, availableOrder.id);
              activeSpot = null;
              previewBook = null;
              persistChapter();
              render();
            });
            card.append(recommend);
          }
          catalog.append(card);
        }
        inspection.append(catalog);
      }
      inspection.append(closeInspection);
      storyPanel.append(inspection);
    }
  }
  storyPanel.append(dialogue, actions);
  container.append(illustration, storyPanel, notebook);
  app.append(container);
}
render();

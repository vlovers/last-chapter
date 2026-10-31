import { storyProgress } from './game/progress';
import { castMember } from './game/cast';
import { sceneMood } from './game/scene-mood';
import { seasonEnding } from './game/endings';
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
  startBookClub,
  exploreAfterBookClub,
  skipBookClub,
  startFourthDay,
  finishFourthDay,
  advanceToDayFourMara,
  advanceToDayFourLeo,
  startFifthDay,
  finishSeason,
} from './game/chapter';
import { availableOptions, currentNode } from './game/dialogue';
import { decodeSave, encodeSave, SAVE_KEY } from './game/save';
import { inspectShopSpot, shopSpots, type ShopSpotId } from './game/exploration';
import { completedOrders, currentCustomer } from './game/service';
import { journalFacts } from './phaser/journal-facts';
import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Не знайдено контейнер гри');
let chapter = restoreChapter();
let previewBook: Book | null = null;
let activeSpot: ShopSpotId | null = null;
let catalogFilter: CatalogFilter = 'all';
let journalOpen = false;
let dialoguePage = 0;
let dialoguePageKey = '';

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
  'book-club': 'День третій · Книжковий клуб',
  'quiet-evening': 'День третій · Тихий вечір у книгарні',
  'day3-complete': 'Кінець третього дня',
  'day4-iris': 'День четвертий · Айріс',
  'day4-mara': 'День четвертий · Мара',
  'day4-leo': 'День четвертий · Лео',
  'day4-complete': 'Кінець четвертого дня',
  'day5-reading': 'День п’ятий · Вечір історій',
  'season-complete': 'Перший сезон · Завершено',
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
  illustration.classList.add('illustration--pixel');
  illustration.dataset.mood = sceneMood(chapter.stage);
  illustration.innerHTML = `
    <div class="pixel-stage">
      <img class="pixel-scene" src="/art/bookshop-pixel.svg" alt="" />
      <div class="pixel-rain" aria-hidden="true"></div>
      <div class="pixel-lamp-glow" aria-hidden="true"></div>
    </div>
  `;

  const hotspots = document.createElement('div');
  hotspots.className = 'shop-hotspots';
  for (const spot of shopSpots) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `shop-hotspot shop-hotspot--${spot.id}`;
    button.textContent = '';
    const spotGlyphs: Record<ShopSpotId, string> = {
      shelves: '▤',
      window: '☂',
      counter: '✉',
      plant: '✿',
      frank: '🐈',
    };
    button.textContent = spotGlyphs[spot.id];
    button.title = spot.description;
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
  illustration.querySelector('.pixel-stage')?.append(hotspots);
  // Preserve the immersive scene while letting keyboard users discover the controls.
  const sceneHint = document.createElement('p');
  sceneHint.className = 'scene-hint';
  sceneHint.textContent = 'Огляньте книгарню: полиці, вікно, прилавок, рослину і Френка';
  illustration.append(sceneHint);

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
    chapter.stage === 'day3-complete' ||
    chapter.stage === 'day4-complete' ||
    chapter.stage === 'season-complete'
  ) {
    dialogue.textContent =
      chapter.stage === 'complete'
        ? 'Перший день завершено. Ваші рішення та знахідки залишаться з вами. Наступного ранку до книгарні завітає Айріс.'
        : chapter.stage === 'day2-complete'
          ? 'Другий день завершено. Наступного ранку до книгарні завітає Елеонора.'
          : chapter.stage === 'day3-complete'
            ? chapter.flags.includes('book_club_started')
              ? 'Книжковий клуб завершився. Наступного ранку Айріс повернеться до книгарні.'
              : 'Тихий вечір у книгарні завершився. Наступного ранку Айріс повернеться до книгарні.'
            : chapter.stage === 'day4-complete'
              ? 'Четвертий день завершено. Завтра книгарня запросить сусідів на спільне читання.'
              : seasonEnding(chapter).letter;
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
    if (chapter.stage === 'day3-complete') {
      const continueButton = document.createElement('button');
      continueButton.type = 'button';
      continueButton.textContent = 'Почати четвертий день →';
      continueButton.addEventListener('click', () => {
        chapter = startFourthDay(chapter);
        persistChapter();
        render();
      });
      actions.append(continueButton);
    }
    if (chapter.stage === 'day4-complete') {
      const continueButton = document.createElement('button');
      continueButton.type = 'button';
      continueButton.textContent = 'Почати п’ятий день →';
      continueButton.addEventListener('click', () => {
        chapter = startFifthDay(chapter);
        persistChapter();
        render();
      });
      actions.append(continueButton);
    }
    if (chapter.stage === 'season-complete') {
      const ending = seasonEnding(chapter);
      const epilogue = document.createElement('section');
      epilogue.className = 'season-epilogue';
      const title = document.createElement('h2');
      title.textContent = ending.title;
      const community = document.createElement('p');
      community.textContent = ending.community;
      const future = document.createElement('p');
      future.textContent = ending.epilogue;
      epilogue.append(title, community, future);
      actions.append(epilogue);
    }
    const restart = document.createElement('button');
    restart.type = 'button';
    restart.textContent = 'Почати знову';
    restart.addEventListener('click', () => {
      chapter = startChapter();
      previewBook = null;
      activeSpot = null;
      journalOpen = false;
      persistChapter();
      render();
    });
    actions.append(restart);
  } else {
    const story = stageStory(chapter.stage);
    const node = currentNode(story, chapter.dialogue);
    const member = castMember(node.speaker);
    if (member) {
      dialogue.classList.add('dialogue-card--character');
      const portrait = document.createElement('div');
      portrait.className = `character-portrait character-portrait--${member.id}`;
      portrait.setAttribute('aria-hidden', 'true');
      const artwork = document.createElement('img');
      artwork.className = 'character-portrait__image';
      artwork.src = member.portrait;
      artwork.alt = '';
      artwork.width = 64;
      artwork.height = 80;
      artwork.decoding = 'async';
      portrait.append(artwork);
      const speech = document.createElement('div');
      speech.className = 'dialogue-card__speech';
      const speakerName = document.createElement('strong');
      speakerName.className = 'dialogue-card__speaker';
      speakerName.textContent = member.name;
      const speechText = document.createElement('p');
      speechText.textContent = node.text;
      speech.append(speakerName, speechText);
      dialogue.append(portrait, speech);
    } else {
      dialogue.textContent = `${node.speaker}: «${node.text}»`;
    }
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
      const available = availableOptions(story, chapter.dialogue);
      const pageKey =
        chapter.stage +
        ':' +
        chapter.dialogue.node +
        ':' +
        available.map((option) => option.id).join(',');
      if (pageKey !== dialoguePageKey) {
        dialoguePageKey = pageKey;
        dialoguePage = 0;
      }
      const pageSize = 3;
      const totalPages = Math.max(1, Math.ceil(available.length / pageSize));
      dialoguePage = Math.min(dialoguePage, totalPages - 1);
      const visible = available.slice(dialoguePage * pageSize, (dialoguePage + 1) * pageSize);
      const groups =
        node.id === 'gathering'
          ? [
              {
                title: 'Люди та стосунки',
                matches: (id: string) =>
                  id.includes('couple') ||
                  [
                    'final-v3-mara-option',
                    'final-v3-leo-option',
                    'final-v3-anna-option',
                    'final-v3-thomas-option',
                  ].includes(id),
              },
              {
                title: 'Довіра, таємниці й мистецтво',
                matches: (id: string) =>
                  id.includes('iris') ||
                  id.includes('letter') ||
                  id.includes('rumor') ||
                  id.includes('privacy') ||
                  id.includes('trust'),
              },
              {
                title: 'Історії книгарні та спільноти',
                matches: (id: string) =>
                  id !== 'close' &&
                  !id.includes('couple') &&
                  ![
                    'final-v3-mara-option',
                    'final-v3-leo-option',
                    'final-v3-anna-option',
                    'final-v3-thomas-option',
                  ].includes(id) &&
                  !id.includes('iris') &&
                  !id.includes('letter') &&
                  !id.includes('rumor') &&
                  !id.includes('privacy') &&
                  !id.includes('trust'),
              },
              { title: 'Завершення вечора', matches: (id: string) => id === 'close' },
            ]
          : [{ title: '', matches: () => true }];
      for (const group of groups) {
        const options = visible.filter((option) => group.matches(option.id));
        if (options.length === 0) continue;
        const section = document.createElement('section');
        section.className = 'dialogue-options-group';
        if (group.title) {
          const heading = document.createElement('h3');
          heading.className = 'dialogue-options-group__title';
          heading.textContent = group.title;
          section.append(heading);
        }
        for (const option of options) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = option.label;
          button.addEventListener('click', () => {
            chapter = chooseChapterOption(chapter, option.id);
            previewBook = null;
            persistChapter();
            render();
          });
          section.append(button);
        }
        actions.append(section);
      }
      if (totalPages > 1) {
        const pager = document.createElement('div');
        pager.className = 'dialogue-options-group';
        const navigation = document.createElement('button');
        navigation.type = 'button';
        navigation.textContent =
          dialoguePage < totalPages - 1 ? 'Інші варіанти →' : '← Попередні варіанти';
        navigation.addEventListener('click', () => {
          dialoguePage = dialoguePage < totalPages - 1 ? dialoguePage + 1 : 0;
          render();
        });
        pager.append(navigation);
        actions.append(pager);
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
                      ? 'Відкрити книжковий клуб →'
                      : chapter.stage === 'book-club' || chapter.stage === 'quiet-evening'
                        ? 'Завершити третій день →'
                        : chapter.stage === 'day4-iris'
                          ? 'Зустріти Мару →'
                          : chapter.stage === 'day4-mara'
                            ? 'Зустріти Лео →'
                            : chapter.stage === 'day4-leo'
                              ? 'Завершити четвертий день →'
                              : chapter.stage === 'day5-reading'
                                ? 'Завершити перший сезон →'
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
                      ? startBookClub(chapter)
                      : chapter.stage === 'book-club' || chapter.stage === 'quiet-evening'
                        ? finishThirdDay(chapter)
                        : chapter.stage === 'day4-iris'
                          ? advanceToDayFourMara(chapter)
                          : chapter.stage === 'day4-mara'
                            ? advanceToDayFourLeo(chapter)
                            : chapter.stage === 'day4-leo'
                              ? finishFourthDay(chapter)
                              : chapter.stage === 'day5-reading'
                                ? finishSeason(chapter)
                                : advanceChapter(chapter);
        persistChapter();
        render();
      });
      actions.append(next);
      if (chapter.stage === 'book-club') {
        const exploreButton = document.createElement('button');
        exploreButton.type = 'button';
        exploreButton.textContent = 'Прибрати після клубу й оглянути книгарню →';
        exploreButton.addEventListener('click', () => {
          chapter = exploreAfterBookClub(chapter);
          persistChapter();
          render();
        });
        actions.append(exploreButton);
      }
      if (chapter.stage === 'nora') {
        const quietButton = document.createElement('button');
        quietButton.type = 'button';
        quietButton.textContent = 'Залишитися у книгарні на тихий вечір →';
        quietButton.addEventListener('click', () => {
          chapter = skipBookClub(chapter);
          persistChapter();
          render();
        });
        actions.append(quietButton);
      }
    }
  }

  const notebook = document.createElement('section');
  notebook.className = 'notebook';
  const label = document.createElement('h2');
  label.textContent = 'Нотатник книгаря';
  const notes = document.createElement('ul');
  const facts = journalFacts;
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
  if (
    customer &&
    !receipts.some((receipt) => receipt.customer === customer) &&
    (chapter.stage === 'miller' || chapter.stage === 'mara'
      ? chapter.dialogue.node === 'order'
      : chapter.dialogue.node === 'books')
  ) {
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
  const notebookDrawer = document.createElement('details');
  notebookDrawer.className = 'notebook-drawer';
  const notebookToggle = document.createElement('summary');
  notebookToggle.textContent = 'Нотатник і замовлення';
  const notebookContents = document.createElement('div');
  notebookContents.className = 'notebook-drawer__contents';
  notebookContents.append(label, notes, orderHeading, orders);
  notebookDrawer.open = journalOpen;
  notebookDrawer.addEventListener('toggle', () => {
    journalOpen = notebookDrawer.open;
  });
  notebookDrawer.append(notebookToggle, notebookContents);
  notebook.append(notebookDrawer);
  const storyPanel = document.createElement('section');
  storyPanel.className = 'story-panel';
  storyPanel.append(heading, subtitle);
  const timeline = document.createElement('ol');
  timeline.className = 'day-timeline';
  timeline.setAttribute('aria-label', 'Прогрес історії');
  for (const day of storyProgress(chapter.stage)) {
    const marker = document.createElement('li');
    marker.className = `day-timeline__day day-timeline__day--${day.status}`;
    marker.textContent = String(day.day);
    marker.title = `${day.label} · ${day.status === 'completed' ? 'завершено' : day.status === 'current' ? 'зараз' : 'попереду'}`;
    marker.setAttribute('aria-label', marker.title);
    if (day.status === 'current') marker.setAttribute('aria-current', 'step');
    timeline.append(marker);
  }
  storyPanel.append(timeline);
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

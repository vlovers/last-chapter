import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-v5-qa');
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const results = [];
let page, context, route;
const saveKey = 'last-chapter:save:v1';
const readSave = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey);
const shot = (name) => page.screenshot({ path: `${output}/${route}-${name}.png`, fullPage: true });
const openStory = async () => {
  if (!(await page.locator('#dialogue').isVisible())) await page.locator('#story-continue').click();
  await page.locator('#dialogue:not([hidden])').waitFor();
};
const choose = async (id) => {
  // Respect the accidental-double-tap guard. Every state change comes from a
  // real UI click: no injected saves, story API calls or scene shortcuts.
  await page.waitForTimeout(240);
  const before = await readSave();
  await page.locator(`#choices button[data-choice="${id}"]`).click();
  await page.waitForFunction(
    ({ key, before }) => localStorage.getItem(key) !== before,
    { key: saveKey, before: JSON.stringify(before) },
    { timeout: 3000 },
  );
  const after = await readSave();
  assert.ok(after, `A save must follow ${id}`);
  assert.equal(new Set(after.flags).size, after.flags.length);
  if (id !== '__restart') assert.ok(before.flags.every((flag) => after.flags.includes(flag)));
  results.at(-1).clicks++;
  if (after.stage !== before.stage) results.at(-1).visited.push(after.stage);
};
const follow = async (...ids) => {
  for (const id of ids.flat()) await choose(id);
};
const at = async (stage) => {
  assert.equal(await page.locator('#story-continue').getAttribute('data-stage'), stage);
  assert.equal((await readSave()).stage, stage);
};
const storedProgress = () =>
  page.evaluate(() => ({
    save: localStorage.getItem('last-chapter:save:v1'),
    optional: localStorage.getItem('last-chapter:conversation:mara:v1'),
    notes: localStorage.getItem('last-chapter:notes:v1'),
    service: localStorage.getItem('last-chapter:service:v1'),
  }));
const choiceIds = () =>
  page.locator('#choices [data-choice]').evaluateAll((nodes) => nodes.map((n) => n.dataset.choice));
const reload = async () => {
  const before = await storedProgress();
  const text = await page.locator('#dialogue-text .sr-only').textContent();
  const choices = await choiceIds();
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await openStory();
  assert.deepEqual(await storedProgress(), before, 'Reload must preserve the whole playthrough');
  assert.equal(await page.locator('#dialogue-text .sr-only').textContent(), text);
  assert.deepEqual(await choiceIds(), choices);
  results.at(-1).reloads++;
};
const checkpoint = async (stage, next) => {
  await at(stage);
  if (route === 'D') await reload();
  await choose('__advance');
  await at(next);
};
const purchase = async (title, question) => {
  await page.keyboard.press('Escape');
  await page.locator('#catalog-toggle').click();
  await page.getByRole('button', { name: question, exact: true }).click();
  await page.getByRole('button', { name: `Запропонувати «${title}»`, exact: true }).click();
  await page.getByText('Замовлення виконано', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Продовжити розмову', exact: true }).click();
};
const journal = async (tab) => {
  await page.keyboard.press('Escape');
  await page.locator('#journal-toggle').click();
  await page.getByRole('button', { name: tab, exact: true }).click();
};
const optionalMara = async () => {
  await journal('Люди');
  await page
    .locator('#story-panel')
    .getByRole('button', { name: 'Поговорити з Марою', exact: true })
    .click();
};

try {
  for (route of ['A', 'B', 'C', 'D']) {
    const quiet = route !== 'A',
      archive = route === 'C';
    const errors = [];
    const result = { route, status: 'running', visited: ['miller'], clicks: 0, reloads: 0, errors };
    results.push(result);
    context = await fixture.browser.newContext({
      viewport: route === 'D' ? { width: 390, height: 844 } : { width: 1280, height: 900 },
      reducedMotion: 'reduce',
      hasTouch: route === 'D',
    });
    await context.tracing.start({ screenshots: true, snapshots: true });
    page = await context.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    console.log(`Route ${route}: starting real five-day UI playthrough`);
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    assert.equal(await page.locator('#day-timeline li').count(), 5);
    await journal('Знахідки');
    await page.getByText('Огляньте книгарню. Тут з’являться лише досліджені знахідки.').waitFor();
    await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
    await page.getByLabel('Ваші думки й запитання').fill('Запитати Елеонору про дату ремонту.');
    await page.keyboard.press('Escape');
    await openStory();
    if (route === 'D') await reload();
    await follow('greet', 'town', 'gossip', 'what-saw', 'challenge', 'boundary-order');
    await purchase(
      archive ? 'Ніхто не знає кінцівки' : 'Опівнічний сад',
      '«Вам ближча тиха загадка чи суперечливі свідчення?»',
    );
    await follow(archive ? 'leave-witnesses' : 'leave-orchard', '__advance');
    await at('mara');
    if (route === 'D') {
      await optionalMara();
      await page
        .getByRole('button', { name: 'Тамліна варто спробувати зрозуміти', exact: true })
        .click();
      await page.getByRole('button', { name: 'Мені треба обслужити клієнта', exact: true }).click();
      await openStory();
      await reload();
      await optionalMara();
      await page
        .getByRole('button', { name: 'Мотиви важливі, але наслідки теж', exact: true })
        .waitFor();
      await shot('optional-resumed');
      await page.keyboard.press('Escape');
      await openStory();
    }
    await follow('hello', 'joke', 'trains', 'to-order-trains');
    await purchase(
      archive ? 'Мапи незавершених доріг' : 'Скляна станція',
      '«Подарунок має бути про його захоплення чи для спільного читання?»',
    );
    await follow(archive ? 'finish-roads' : 'finish-station', '__advance');
    await at('evening');
    await follow(
      'receipt',
      'receipt-back',
      'eleanor-notes',
      'eleanor-history',
      'repair-back',
      'letter',
      'letter-conclude',
      'keep-and-ask',
      '__advance',
    );
    await checkpoint('complete', 'iris');
    await follow(
      'welcome',
      'ask-art',
      'art-more',
      'art-more-back',
      'ask-letter',
      'letter-ask',
      'keep-back',
      '__advance',
    );
    await at('anna');
    await follow(
      'hello',
      'anna-book-disagreement',
      archive ? 'anna-disagreement-quiet' : 'anna-disagreement-debate',
      'anna-disagreement-back',
      'books',
    );
    await purchase(
      archive ? 'Ніхто не знає кінцівки' : 'Мапи незавершених доріг',
      '«Для уроку важливіша подорож чи різні погляди на одну подію?»',
    );
    await follow('purchase-end', '__advance');
    await at('leo');
    await follow(
      'greet',
      'mara',
      archive ? 'gift-roads' : 'gift-station',
      archive ? 'gift-roads-back' : 'gift-station-back',
      'finish',
      '__advance',
    );
    await checkpoint('day2-complete', 'eleanor');
    await follow('greet', 'timeline', 'timeline-check', 'timeline-back', 'finish', '__advance');
    await at('thomas');
    await follow(
      'greet',
      'thomas-reading-challenge',
      'thomas-reading-argue',
      'thomas-reading-back',
      'finish',
      '__advance',
    );
    await at('nora');
    await follow('hello', 'work', 'work-follow', 'rest-back', 'end');
    await choose(quiet ? '__skip_club' : '__advance');
    await at(quiet ? 'quiet-evening' : 'book-club');
    if (quiet) {
      await journal('Люди');
      assert.equal(
        await page.locator('#story-panel .evidence-card h3').count(),
        8,
        'Quiet evening must retain all met characters',
      );
      await page.keyboard.press('Escape');
      await openStory();
      await follow('sit-frank', 'frank-books', 'examine-page', 'paper-back');
      await shot('manuscript-discovery');
      if (route === 'D') await reload();
      await choose('keep-page');
      await journal('Знахідки');
      await page.getByRole('heading', { name: 'Загублена сторінка', exact: true }).waitFor();
      await shot('evidence-journal');
      await page.keyboard.press('Escape');
      await openStory();
    } else {
      await follow(
        'welcome',
        'discuss-books',
        'maps-follow',
        'maps-back',
        'ask-mara',
        'mara-listen',
      );
      await shot('book-club');
      await choose('close');
    }
    await choose('__advance');
    assert.match(
      await page.locator('#dialogue-text .sr-only').textContent(),
      quiet ? /Тихий вечір/ : /Книжковий клуб/,
    );
    await checkpoint('day3-complete', 'day4-iris');
    await choose('welcome');
    if (quiet) {
      await follow(
        'quiet-page',
        archive ? 'quiet-page-window' : 'quiet-page-stars',
        archive ? 'quiet-page-note-window' : 'quiet-page-compare',
      );
      if (route === 'D') {
        await reload();
        await follow('quiet-page-check-window', 'quiet-page-note-window');
      }
      await choose(archive ? 'quiet-page-ask' : 'quiet-page-respect');
      await shot('iris-investigation');
      await choose('quiet-page-return');
    }
    await follow('art', 'art-back', 'letter', 'respect', 'respect-back', 'leave', '__advance');
    await at('day4-mara');
    if (route === 'D') {
      await optionalMara();
      await page.getByRole('button', { name: 'Книжкові суперечки з Марою', exact: true }).click();
      await page
        .getByRole('button', { name: 'Мотиви важливі, але наслідки теж', exact: true })
        .click();
      await shot('optional-day-four');
      await page.keyboard.press('Escape');
      await openStory();
    }
    await follow('greet', 'future', 'future-back', 'finish', '__advance');
    await at('day4-leo');
    await follow(
      'welcome',
      'evidence',
      'evidence-back',
      'letter',
      'letter-ask',
      'ask-back',
      'finish',
      '__advance',
    );
    await checkpoint('day4-complete', 'day5-reading');
    await choose('open');
    if (quiet) {
      await choose('quiet-manuscript-followup');
      await shot('custody-choice');
      await choose(archive ? 'quiet-manuscript-archive' : 'quiet-manuscript-return');
      if (route === 'D') await reload();
      await choose('quiet-manuscript-result-back');
      assert.equal(await page.locator('[data-choice="quiet-manuscript-followup"]').count(), 0);
    }
    await follow(
      'anna',
      'anna-back',
      'thomas-book-callback',
      'thomas-book-callback-back',
      'iris',
      'iris-exhibit',
      'exhibit-back',
      'letter',
      quiet ? 'wait' : 'mutual',
      quiet ? 'wait-back' : 'mutual-back',
      'frank-evening',
      'frank-pet',
      'frank-trust-back',
      'close',
    );
    await shot('final-reading');
    await choose('__advance');
    await at('season-complete');
    const ending = await page.locator('#dialogue-text .sr-only').textContent();
    assert.match(ending, /Мара почала шукати/);
    assert.match(ending, /Вікна Беллвіка/);
    if (quiet) {
      assert.match(
        ending,
        archive ? /сторінку зберегли у книгарні/ : /Айріс забрала сторінку додому/,
      );
      assert.doesNotMatch(
        ending,
        archive ? /Айріс забрала сторінку/ : /сторінку зберегли у книгарні/,
      );
      assert.doesNotMatch(ending, /нове оголошення про книжковий клуб/);
    } else {
      assert.match(ending, /нове оголошення про книжковий клуб/);
      assert.match(ending, /Айріс і Лео поговорили наодинці/);
      assert.doesNotMatch(ending, /Знайдену сторінку|Айріс забрала сторінку/);
    }
    await reload();
    assert.equal(await page.locator('#day-timeline .day-step--completed').count(), 5);
    await shot('season-finale');
    await writeFile(
      `${output}/${route}-final-save.json`,
      JSON.stringify(await readSave(), null, 2),
    );
    await journal('Замовлення');
    assert.equal(await page.locator('.story-receipt').count(), 3);
    await page.keyboard.press('Escape');
    await openStory();
    await choose('__restart');
    await at('miller');
    assert.deepEqual((await readSave()).flags, []);
    await journal('Мої записи');
    assert.equal(await page.getByLabel('Ваші думки й запитання').inputValue(), '');
    const optional = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('last-chapter:conversation:mara:v1')),
    );
    assert.deepEqual(optional.memories, []);
    assert.equal(optional.finished, false);
    assert.deepEqual(errors, []);
    assert.equal(new Set(result.visited).size, 19);
    result.status = 'passed';
    result.ending = ending;
    await context.tracing.stop({ path: `${output}/${route}-trace.zip` });
    await context.close();
    context = null;
    console.log(`Route ${route}: passed (${result.clicks} choices, ${result.reloads} reloads)`);
  }
} catch (error) {
  if (results.length) {
    results.at(-1).status = 'failed';
    results.at(-1).failure = String(error);
  }
  if (page && !page.isClosed()) await shot('failure').catch(() => {});
  if (context)
    await context.tracing.stop({ path: `${output}/${route}-failure-trace.zip` }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ results, output }, null, 2));
  await fixture.close();
}

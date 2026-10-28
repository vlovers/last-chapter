import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchQaBrowser } from './qa-browser.mjs';
import { clickStoryChoice } from './qa-story-ui.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT || '/private/tmp/last-chapter-production-recovery';
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const results = [],
  errors = [];
let page;
const enter = async () => {
  await page.goto(base);
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
};
const toMara = async () => {
  await page.locator('#story-continue').click();
  for (const id of ['greet', 'books', 'orchard', 'leave-orchard', '__advance'])
    await clickStoryChoice(page, id);
  await page.keyboard.press('Escape');
};
try {
  for (const damage of ['missing', 'corrupt']) {
    const context = await fixture.browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    page = await context.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    await enter();
    await toMara();
    await page.locator('#journal-toggle').click();
    await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
    await page.getByLabel('Ваші думки й запитання').fill('Попереднє проходження');
    await page.getByRole('button', { name: 'Люди', exact: true }).click();
    await page
      .locator('#story-panel')
      .getByRole('button', { name: 'Поговорити з Марою', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Тамліна варто спробувати зрозуміти', exact: true })
      .click();
    assert.ok(
      (
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem('last-chapter:conversation:mara:v1')),
        )
      ).memories.length,
    );
    // Deliberate storage damage is confined to this recovery test. The four
    // gameplay routes never inject narrative states or skip through an API.
    await page.evaluate((damage) => {
      if (damage === 'missing') localStorage.removeItem('last-chapter:save:v1');
      else localStorage.setItem('last-chapter:save:v1', '{broken');
    }, damage);
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    assert.equal(await page.locator('#story-continue').getAttribute('data-stage'), 'miller');
    const fresh = await page.evaluate(() => ({
      chapter: JSON.parse(localStorage.getItem('last-chapter:save:v1')),
      optional: JSON.parse(localStorage.getItem('last-chapter:conversation:mara:v1')),
      notes: localStorage.getItem('last-chapter:notes:v1'),
      service: JSON.parse(localStorage.getItem('last-chapter:service:v1')),
    }));
    assert.deepEqual(fresh.chapter.flags, []);
    assert.deepEqual(fresh.optional.memories, []);
    assert.equal(fresh.optional.finished, false);
    assert.equal(fresh.notes, '');
    assert.deepEqual(fresh.service.attempts, []);
    await toMara();
    await page.locator('#journal-toggle').click();
    // The disabled Mara control appears before the enabled tabs in some
    // journal states; the focus trap must cycle through enabled controls only.
    await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
    const note = page.getByLabel('Ваші думки й запитання');
    assert.equal(await note.inputValue(), '');
    await note.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#story-panel .panel-close:focus').count(), 1);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#personal-notes:focus').count(), 1);
    await page.screenshot({ path: `${output}/${damage}-save-recovery.png`, fullPage: true });
    results.push({
      test: `${damage} narrative save clears orphan conversations, notes and receipts; keyboard focus`,
      status: 'passed',
    });
    await context.close();
  }
  const context = await fixture.browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage unavailable in recovery fixture');
      },
    });
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(String(error)));
  await enter();
  await page.locator('#save-warning:not([hidden])').waitFor();
  await page.locator('#story-continue').click();
  await clickStoryChoice(page, 'greet');
  await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
  assert.ok(await page.locator('#choices [data-choice]').count());
  await page.keyboard.press('Escape');
  await page.locator('#save-warning:not([hidden])').waitFor();
  results.push({
    test: 'blocked browser storage shows the save warning and leaves dialogue playable',
    status: 'passed',
  });
  await context.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, errors, output }, null, 2));
} catch (error) {
  if (page && !page.isClosed())
    await page.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
  await fixture.close();
}

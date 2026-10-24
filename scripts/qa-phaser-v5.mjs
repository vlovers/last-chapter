import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-v5-qa');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
try {
  await page.goto(base);
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-tools').waitFor();
  assert.equal(await page.locator('#day-timeline li').count(), 5);
  assert.equal(await page.locator('#story-continue').textContent(),
    'День 1 · Пані Міллер · Продовжити');

  await page.getByRole('button', { name: 'Каталог книжок' }).click();
  assert.equal(await page.locator('.story-book').count(), 5);
  await page.getByRole('button', { name: 'Детективи' }).click();
  assert.ok((await page.locator('.story-book').count()) > 0);
  await page.getByRole('button', { name: 'Нотатник' }).click();
  await page.getByText('Поки що тут немає записів.').waitFor();

  await page.locator('#story-continue').click();
  await page.getByText('Дзвіночок над дверима озвався двічі.', { exact: false }).waitFor();
  const firstChoice = page.locator('#choices button').first();
  await page.waitForTimeout(260);
  await firstChoice.click();
  await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
  const save = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
  assert.ok(save?.includes('"stage":"miller"'));
  await page.screenshot({ path: `${output}/first-visit.png`, fullPage: true });

  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-continue').click();
  await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), save);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Нотатник' }).click();
  await page.getByRole('heading', { name: 'Нотатник книгаря' }).waitFor();

  // Check the integration controller across the 19-stage canon.
  const walk = await page.evaluate(() => {
    const story = window.__lastChapterStory;
    if (!story) throw new Error('Missing five-day story');
    const visited = new Set();
    for (let i = 0; i < 250 && story.stage !== 'season-complete'; i++) {
      visited.add(story.stage);
      const next = story.open().choices[0];
      if (!next) throw new Error(`No next step: ${story.stage}`);
      story.choose(next.id);
    }
    return { stage: story.stage, visited: [...visited], progress: story.progress };
  });
  assert.equal(walk.stage, 'season-complete');
  assert.equal(walk.visited.length, 18);
  assert.ok(walk.progress.every((day) => day.status === 'completed'));
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ walk, errors }, null, 2));
  console.log(JSON.stringify({ walk, errors, output }, null, 2));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await browser.close();
}

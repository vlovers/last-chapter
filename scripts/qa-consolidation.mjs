import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { launchQaBrowser } from './qa-browser.mjs';
import { chooseById } from './qa-dialogue.mjs';

const engine = process.env.QA_ENGINE || 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine), 'Known browser engine');
const playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-consolidation-qa');
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(playwright[engine], {
  channel: engine === 'chromium' ? process.env.BROWSER_CHANNEL || 'chromium' : null,
});
const results = [];
const errors = [];
let activePage;

async function seed(page, stage, flags = []) {
  await page.goto(base);
  await page.evaluate(
    async ({ stage, flags }) => {
      const { stageStory } = await import('/src/game/chapter.ts');
      const { startDialogue } = await import('/src/game/dialogue.ts');
      const { encodeSave, decodeSave, SAVE_KEY } = await import('/src/game/save.ts');
      const dialogue = { ...startDialogue(stageStory(stage)), flags };
      const raw = encodeSave({ stage, dialogue, flags });
      assertSave(raw);
      function assertSave(raw) {
        if (!decodeSave(raw)) throw new Error('Invalid authored consolidation fixture');
      }
      localStorage.setItem(SAVE_KEY, raw);
    },
    { stage, flags },
  );
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню', exact: true }).click();
}

const save = (page) => page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
const trigger = (page) => page.getByRole('button', { name: 'Поговорити з Олівером', exact: true });
const panel = (page) => page.getByRole('dialog', { name: 'Розмова з Олівером', exact: true });

async function geometry(page) {
  const actual = await page.evaluate(() => {
    const dock = document.querySelector('#story-panel');
    const rect = dock.getBoundingClientRect();
    const controls = [...dock.querySelectorAll('button')].map((button) => {
      const r = button.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { height: r.height, hit: top === button || button.contains(top) };
    });
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: innerWidth,
      height: innerHeight,
      overflow: document.documentElement.scrollWidth,
      controls,
      inert: document.querySelector('#game').inert,
    };
  });
  assert.ok(actual.left >= -1 && actual.top >= -1);
  assert.ok(actual.right <= actual.width + 1 && actual.bottom <= actual.height + 1);
  assert.ok(actual.overflow <= actual.width + 1, 'No horizontal overflow');
  assert.equal(actual.inert, true, 'World cannot consume dialogue keys');
  for (const button of actual.controls) {
    assert.ok(button.height >= 44, 'Touch controls retain 44px targets');
    assert.ok(button.hit, 'Every response has an unobscured pointer target');
  }
}

try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 956, height: 440 },
  ]) {
    const context = await fixture.browser.newContext({
      viewport,
      reducedMotion: 'reduce',
      hasTouch: engine !== 'firefox',
    });
    const page = (activePage = await context.newPage());
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню', exact: true }).click();
    assert.equal(await trigger(page).isVisible(), false, 'Oliver is absent on Day 1');
    await seed(page, 'iris');
    const before = await save(page);
    const canvas = await page.locator('#game canvas').boundingBox();
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    await panel(page).waitFor();
    await geometry(page);
    await page.screenshot({ path: `${output}/${engine}-${viewport.width}-oliver.png` });
    assert.equal(await panel(page).locator('.conversation-actions button').count(), 3);
    await panel(page).getByRole('button', { name: 'Назви книжку.', exact: true }).click();
    const text = await panel(page).locator('.conversation-exchange').textContent();
    await page.keyboard.press('Escape');
    assert.equal(await panel(page).count(), 0);
    assert.equal(await trigger(page).evaluate((node) => node === document.activeElement), true);
    await trigger(page).click();
    assert.equal(
      await panel(page).locator('.conversation-exchange').textContent(),
      text,
      'Dismiss/reopen retains an unfinished conversation in the same page session',
    );
    assert.equal(await save(page), before, 'Unfinished optional choices do not change the chapter');
    assert.deepEqual(await page.locator('#game canvas').boundingBox(), canvas);
    await page.keyboard.press('Escape');
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню', exact: true }).click();
    await trigger(page).click();
    assert.match(
      await panel(page).locator('.conversation-exchange').textContent(),
      /У мене є пропозиція/,
      'A full reload starts an unfinished optional encounter afresh',
    );
    await panel(page).getByRole('button', { name: 'Назви книжку.', exact: true }).click();
    const buttons = panel(page).locator('button');
    await buttons.last().focus();
    await page.keyboard.press('Tab');
    assert.equal(
      await buttons.first().evaluate((node) => node === document.activeElement),
      true,
      'Tab stays inside the active reading panel',
    );
    await page.keyboard.press('Shift+Tab');
    assert.equal(await buttons.last().evaluate((node) => node === document.activeElement), true);
    await panel(page).getByRole('button', { name: 'Море вкрало всі листи.', exact: true }).click();
    await panel(page).getByRole('button', { name: 'На цьому зійдемося.', exact: true }).click();
    await panel(page).getByRole('button', { name: 'Завершити розмову', exact: true }).click();
    assert.equal(await trigger(page).isVisible(), false);
    assert.equal(
      await page.locator('#story-continue').evaluate((node) => node === document.activeElement),
      true,
    );
    const done = JSON.parse(await save(page));
    assert.equal(done.stage, 'iris');
    assert.ok(done.flags.includes('optional_oliver_unread_completed'));
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню', exact: true }).click();
    assert.equal(await trigger(page).isVisible(), false, 'Completion survives reload');
    await seed(page, 'iris');
    await trigger(page).click();
    await panel(page).getByRole('button', { name: 'Сьогодні не можу.', exact: true }).click();
    await panel(page).getByRole('button', { name: 'Завершити розмову', exact: true }).click();
    assert.equal(
      await trigger(page).isVisible(),
      false,
      'Declining also completes the optional encounter',
    );
    await seed(page, 'season-complete', ['optional_oliver_unread_completed']);
    await page.locator('#story-continue').click();
    await chooseById(page, '__restart');
    assert.equal(JSON.parse(await save(page)).stage, 'miller');
    assert.ok(
      !JSON.parse(await save(page)).flags.includes('optional_oliver_unread_completed'),
      'A real new-game action clears the previous Oliver completion',
    );
    await page.keyboard.press('Escape');
    await seed(page, 'iris');
    assert.equal(await trigger(page).isVisible(), true, 'Oliver is available again in a new Day 2');
    await seed(page, 'eleanor');
    assert.equal(await trigger(page).isVisible(), false, 'Oliver is absent after Day 2');
    await page.screenshot({ path: `${output}/${engine}-${viewport.width}-bookshop.png` });
    await page.getByRole('button', { name: 'Каталог книжок', exact: true }).click();
    await page.screenshot({ path: `${output}/${engine}-${viewport.width}-catalog.png` });
    await page.keyboard.press('Escape');
    results.push({ engine, viewport, optionalRoutes: ['complete', 'decline'], keyboard: 'passed' });
    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser errors across tested engines/layouts');
  await writeFile(
    `${output}/consolidation-${engine}.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(JSON.stringify({ results, errors, output }, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed())
    await activePage.screenshot({ path: `${output}/failure-${engine}.png` }).catch(() => {});
  throw error;
} finally {
  await fixture.close();
}

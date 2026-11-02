import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { launchQaBrowser } from './qa-browser.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const matrix = JSON.parse(
  await readFile(new URL('../tests/fixtures/production-v2-journeys.json', import.meta.url), 'utf8'),
);
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-narrative-v2-qa');
const grouped = matrix.scenarios.filter(
  (scenario) => !process.env.QA_GROUP || scenario.group === process.env.QA_GROUP,
);
assert.ok(grouped.length > 0, 'Known narrative QA group required');
const scenarios = process.env.QA_SCENARIO
  ? grouped.filter((scenario) => scenario.id === process.env.QA_SCENARIO)
  : grouped;
assert.ok(scenarios.length > 0, 'Known narrative scenario required');
const viewports = [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
].filter((viewport) => !process.env.QA_WIDTH || String(viewport.width) === process.env.QA_WIDTH);
assert.ok(viewports.length > 0, 'Known narrative viewport required');
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const results = [];
let activePage;
let activeErrors = [];

async function saved(page) {
  const raw = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
  return raw ? JSON.parse(raw) : { stage: 'miller', flags: [] };
}

async function choose(page, id, viewport) {
  for (let index = 0; index < 40; index++) {
    // The game deliberately ignores taps during its 220 ms stale-button guard.
    await page.waitForTimeout(240);
    const buttons = page.locator('#choices button');
    assert.ok((await buttons.count()) <= 4, 'At most four visible choice buttons');
    const choice = page.locator(`#choices button[data-choice="${id}"]`);
    if (await choice.count()) {
      assert.equal(await choice.count(), 1);
      await choice.scrollIntoViewIfNeeded();
      const box = await choice.boundingBox();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(
        documentWidth <= viewport.width + 1,
        `No horizontal overflow at ${viewport.width}px: document is ${documentWidth}px wide`,
      );
      assert.ok(
        box && box.x >= -1 && box.x + box.width <= viewport.width + 1,
        `Choice fits screen horizontally: ${id}, ${JSON.stringify(box)}`,
      );
      assert.ok(
        box.y >= -1 && box.y + box.height <= viewport.height + 1,
        'Choice is reachable vertically: ' + id,
      );
      const before = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
      const canvasBefore = await page.locator('#game canvas').boundingBox();
      assert.ok(canvasBefore, 'Phaser canvas must exist');
      await choice.tap();
      await page.waitForFunction(
        (raw) => localStorage.getItem('last-chapter:save:v1') !== raw,
        before,
      );
      assert.deepEqual(
        await page.locator('#game canvas').boundingBox(),
        canvasBefore,
        'A reply must not resize the game scene',
      );
      return;
    }
    const more = page.locator('#choices button[data-choice="__more_choices"]');
    assert.equal(await more.count(), 1, 'Unavailable story choice ' + id);
    await more.tap();
  }
  throw new Error('Choice not found across pages: ' + id);
}

async function reloadConversation(page) {
  const raw = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
  const text = await page.locator('#dialogue-text .sr-only').textContent();
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-continue').click();
  await page.locator('#dialogue:not([hidden])').waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), raw);
  assert.equal(await page.locator('#dialogue-text .sr-only').textContent(), text);
}

try {
  for (const viewport of viewports) {
    for (const scenario of scenarios) {
      const context = await fixture.browser.newContext({
        viewport,
        hasTouch: true,
        reducedMotion: 'reduce',
      });
      const page = (activePage = await context.newPage());
      const errors = (activeErrors = []);
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(base);
      await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
      await page.locator('#story-continue').click();
      await page.locator('#dialogue:not([hidden])').waitFor();
      console.log(`Starting narrative QA: ${scenario.id} at ${viewport.width}x${viewport.height}`);
      const stages = [];
      let steps = 0;
      let reloads = 0;
      while ((await saved(page)).stage !== 'season-complete') {
        const { stage } = await saved(page);
        assert.ok(!stages.includes(stage), 'Stage must not repeat: ' + stage);
        stages.push(stage);
        console.log(`Narrative QA stage: ${scenario.id} / ${viewport.width}px / ${stage}`);
        const route = scenario.overrides[stage] ?? matrix.common[stage];
        assert.ok(route, 'Missing stage route: ' + stage);
        for (const id of route) {
          await choose(page, id, viewport);
          steps++;
          if (
            [
              'opened-conclude',
              'admit-opened',
              'reading-station',
              'reading-roads',
              'reading-letters',
              'school-chairs-plan',
              'ledger-resolution',
              'case-audit-box-back',
              'frank-shop-rest-cups-back',
            ].includes(id)
          ) {
            await reloadConversation(page);
            reloads++;
          }
          if (
            viewport.width === 390 &&
            scenario.id === 'mutual' &&
            [
              'timeline',
              'reading-station',
              'school-chairs-plan',
              'ledger-resolution',
              'case-audit-box-back',
              'frank-shop-rest-cups-back',
            ].includes(id)
          ) {
            await page.screenshot({
              path: `${output}/${viewport.width}-${id}.png`,
              fullPage: true,
            });
            const textPanel = page.locator('#dialogue-text');
            assert.equal(
              await textPanel.locator('[aria-hidden="true"]').textContent(),
              await textPanel.locator('.sr-only').textContent(),
              'Visual narration retains the complete accessible text',
            );
            const scroll = await textPanel.evaluate((element) => {
              element.scrollTop = element.scrollHeight;
              return {
                top: element.scrollTop,
                end: element.scrollHeight - element.clientHeight,
              };
            });
            assert.ok(Math.abs(scroll.top - scroll.end) <= 1, 'Long narration can reach its end');
            if (scroll.end > 1) {
              await page.screenshot({
                path: `${output}/${viewport.width}-${id}-continued.png`,
                fullPage: true,
              });
            }
          }
        }
        assert.ok(steps < 400, 'Bounded five-day route');
      }
      const end = await saved(page);
      for (const flag of scenario.expected)
        assert.ok(end.flags.includes(flag), 'Missing final fact ' + flag);
      for (const flag of scenario.absent)
        assert.ok(!end.flags.includes(flag), 'Unexpected final fact ' + flag);
      assert.ok(
        (await page.locator('#dialogue-text .sr-only').textContent()).includes(scenario.summary),
      );
      assert.equal(await page.locator('#day-timeline .day-step--completed').count(), 5);
      await reloadConversation(page);
      reloads++;
      // Endings are a scrollable reading panel; the restart action must remain reachable.
      const restart = page.locator('#choices button[data-choice="__restart"]');
      await restart.scrollIntoViewIfNeeded();
      assert.ok(await restart.isVisible());
      await page.screenshot({
        path: `${output}/${viewport.width}-${scenario.id}-ending.png`,
        fullPage: true,
      });
      await choose(page, '__restart', viewport);
      const clean = await saved(page);
      assert.equal(clean.stage, 'miller');
      assert.deepEqual(clean.flags, []);
      assert.equal(await page.locator('#day-timeline .day-step--completed').count(), 0);
      if (await page.locator('#dialogue[hidden]').count())
        await page.locator('#story-continue').click();
      await reloadConversation(page);
      reloads++;
      assert.deepEqual(errors, []);
      results.push({ viewport, scenario: scenario.id, stages, steps, reloads, errors });
      console.log(JSON.stringify(results.at(-1)));
      await writeFile(`${output}/results.json`, JSON.stringify({ results }, null, 2));
      await context.close();
    }
  }
} catch (error) {
  await writeFile(
    `${output}/failure.json`,
    JSON.stringify({ error: String(error), errors: activeErrors, completed: results }, null, 2),
  );
  await activePage?.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await fixture.close();
}

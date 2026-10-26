import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT || 'docs/qa/mobile-overhaul';
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const browser = fixture.browser;
const errors = [],
  results = [];
const snapshot = (page) =>
  page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const scene = game.scene.getScene('bookshop');
    const canvas = game.canvas.getBoundingClientRect();
    return {
      canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
      scale: scene.cameras.main.zoom,
      player: { x: scene.characters.player.x, y: scene.characters.player.y },
      failed: scene.failed,
      fps: game.loop.actualFps,
      lowEffects: scene.frameBudget.reduced,
      nodes: scene.children.length,
    };
  });
const choose = async (page, id) => {
  await page.waitForTimeout(240);
  await page.locator(`#choices button[data-choice="${id}"]`).click();
};
const shot = async (page, name) => {
  await page.waitForTimeout(1050);
  return page.screenshot({ path: `${output}/${name}.png` });
};
let page;
try {
  for (const [width, height] of [
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1440, 900],
    [844, 390],
  ]) {
    page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 900 });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.waitForTimeout(900);
    const before = await snapshot(page);
    assert.equal(before.failed, false);
    assert.ok(Number.isInteger(before.scale));
    await shot(page, `${width}-room`);
    // Real touch movement, measured through the running scene and shared collision model.
    const target = await page.evaluate(async () => {
      const { game } = await import('/phaser-prototype/scene.js');
      const s = game.scene.getScene('bookshop');
      const c = s.cameras.main;
      const p = s.characters.player;
      return { x: (p.x + 32 - c.scrollX) * c.zoom, y: (p.y - c.scrollY) * c.zoom };
    });
    if (width < 900)
      await page.touchscreen.tap(before.canvas.x + target.x, before.canvas.y + target.y);
    else await page.mouse.click(before.canvas.x + target.x, before.canvas.y + target.y);
    await page.waitForFunction(
      async (initialX) => {
        const { game } = await import('/phaser-prototype/scene.js');
        const scene = game.scene.getScene('bookshop');
        return scene.characters.player.x > initialX + 10;
      },
      before.player.x,
      { timeout: 2500 },
    );
    assert.ok((await snapshot(page)).player.x > before.player.x + 10);
    await page.locator('#game').focus();
    const x = (await snapshot(page)).player.x;
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowRight');
    assert.ok((await snapshot(page)).player.x > x);
    const stable = await snapshot(page);
    await page.locator('#story-continue').click();
    await page.locator('#dialogue:not([hidden])').waitFor();
    assert.deepEqual((await snapshot(page)).canvas, stable.canvas);
    assert.equal((await snapshot(page)).scale, stable.scale);
    await shot(page, `${width}-dialogue`);
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('#dialogue :focus').count());
    if (width === 390 || width === 1440) {
      await choose(page, 'greet');
      await shot(page, `${width}-portrait`);
      assert.deepEqual((await snapshot(page)).canvas, stable.canvas);
    }
    await page.keyboard.press('Escape');
    await page.locator('#catalog-toggle').click();
    await page.getByRole('heading', { name: 'Книжки на полицях' }).waitFor();
    assert.deepEqual((await snapshot(page)).canvas, stable.canvas);
    await page.getByRole('searchbox').fill('сад');
    assert.equal(await page.locator('.story-book').count(), 1);
    await page.getByRole('searchbox').fill('');
    await shot(page, `${width}-catalog`);
    await page.keyboard.press('Escape');
    await page.locator('#journal-toggle').click();
    await page.getByRole('button', { name: 'Чутки', exact: true }).click();
    assert.equal(await page.getByText('Ви ще не чули чуток.', { exact: true }).count(), 1);
    await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
    await page.getByLabel('Ваші думки й запитання').fill('Перевірити час у журналі ремонту.');
    await page.getByRole('button', { name: 'Люди', exact: true }).click();
    assert.equal(
      await page
        .locator('#story-panel')
        .getByRole('heading', { name: 'Айріс', exact: true })
        .count(),
      0,
    );
    assert.deepEqual((await snapshot(page)).canvas, stable.canvas);
    await shot(page, `${width}-journal`);
    await page.keyboard.press('Escape');
    assert.ok(
      await page.locator('#journal-toggle:focus').count(),
      'Closing the journal returns focus to its opener',
    );
    if (width === 390) {
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(350);
      assert.equal((await snapshot(page)).canvas.width, 844);
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(350);
      assert.deepEqual((await snapshot(page)).canvas, stable.canvas);
    }
    if (height === 390) {
      await page.locator('#game').focus();
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(650);
      await page.keyboard.up('ArrowRight');
      await page.keyboard.down('ArrowDown');
      await page.waitForTimeout(1600);
      await page.keyboard.up('ArrowDown');
      const visible = await page.evaluate(async () => {
        const { game } = await import('/phaser-prototype/scene.js');
        const scene = game.scene.getScene('bookshop');
        const camera = scene.cameras.main;
        return {
          top: (scene.characters.player.y - 46 - camera.scrollY) * camera.zoom,
          bottom: (scene.characters.player.y - camera.scrollY) * camera.zoom,
          height: camera.height,
          y: scene.characters.player.y,
        };
      });
      assert.ok(visible.y > 300);
      assert.ok(visible.top >= 0 && visible.bottom <= visible.height);
    }
    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth > innerWidth,
      y: document.documentElement.scrollHeight > innerHeight,
    }));
    assert.deepEqual(overflow, { x: false, y: false });
    results.push({ width, height, before, stable, overflow });
    await page.close();
  }
  // Complete real catalog loops for three customers, then all 19 narrative checkpoints.
  page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base);
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  const visited = [],
    orders = [];
  for (let step = 0; step < 19; step++) {
    await page.locator('#story-continue').click();
    const plan = await page.evaluate(async () => {
      const { stageStory, chooseChapterOption } = await import('/src/game/chapter.ts');
      const { availableOptions } = await import('/src/game/dialogue.ts');
      const { decodeSave, SAVE_KEY } = await import('/src/game/save.ts');
      const story = window.__lastChapterStory,
        stage = story.stage;
      if (
        ['complete', 'day2-complete', 'day3-complete', 'day4-complete', 'season-complete'].includes(
          stage,
        )
      )
        return { stage, route: [] };
      // Prefer an order node for the three serviced visitors, otherwise a terminal.
      const service = ['miller', 'mara', 'anna'].includes(stage);
      const initial =
        decodeSave(localStorage.getItem(SAVE_KEY)) ||
        (await import('/src/game/chapter.ts')).startChapter();
      const queue = [{ state: initial, route: [] }],
        seen = new Set();
      for (let i = 0; i < queue.length && i < 8000; i++) {
        const e = queue[i],
          sig = JSON.stringify([
            e.state.dialogue.node,
            [...e.state.flags].sort(),
            e.state.dialogue.completed,
          ]);
        if (seen.has(sig)) continue;
        seen.add(sig);
        const opts = availableOptions(stageStory(stage), e.state.dialogue);
        if (
          service ? e.state.dialogue.node === (stage === 'anna' ? 'books' : 'order') : !opts.length
        )
          return { stage, route: e.route, service };
        for (const c of opts)
          queue.push({ state: chooseChapterOption(e.state, c.id), route: [...e.route, c.id] });
      }
      throw Error('Missing route ' + stage);
    });
    visited.push(plan.stage);
    for (const id of plan.route) await choose(page, id);
    if (plan.service) {
      await page.locator('#browse-order').click();
      await page.locator('#story-panel .evidence-card button').first().click();
      // A poor suggestion remains open and survives reloading.
      if (plan.stage === 'miller') {
        await page
          .getByRole('button', { name: 'Запропонувати «Скляна станція»', exact: true })
          .click();
        await page.getByText('Шукаємо далі', { exact: true }).waitFor();
        const save = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
        await page.reload();
        await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
        assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), save);
        await page.locator('#catalog-toggle').click();
      }
      const title = {
        miller: 'Опівнічний сад',
        mara: 'Скляна станція',
        anna: 'Мапи незавершених доріг',
      }[plan.stage];
      await page.getByRole('button', { name: `Запропонувати «${title}»`, exact: true }).click();
      await page.getByText('Замовлення виконано', { exact: true }).waitFor();
      await shot(page, `order-${plan.stage}`);
      orders.push({
        stage: plan.stage,
        count: await page.evaluate(() => window.__lastChapterStory.orders.length),
      });
      await page.reload();
      await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
      assert.equal(
        await page.evaluate(() => window.__lastChapterStory.orders.length),
        orders.at(-1).count,
      );
      await page.locator('#story-continue').click();
      while (
        await page.locator('#choices button[data-choice]:not([data-choice="__advance"])').count()
      ) {
        const id = await page
          .locator('#choices button[data-choice]:not([data-choice="__advance"])')
          .first()
          .getAttribute('data-choice');
        await choose(page, id);
      }
    }
    if (plan.stage === 'season-complete') {
      await shot(page, 'five-day-finale');
      break;
    }
    await choose(page, '__advance');
    await page.keyboard.press('Escape');
  }
  assert.equal(visited.at(-1), 'season-complete');
  assert.equal(new Set(visited).size, 19);
  assert.equal(orders.length, 3);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2500);
  const perf = await snapshot(page);
  assert.equal(perf.failed, false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(200);
  assert.ok(await page.locator('body.reduced').count());
  results.push({ visited, orders, performance: perf });
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors, output }, null, 2));
} catch (e) {
  if (page && !page.isClosed()) await shot(page, 'failure');
  throw e;
} finally {
  await fixture.close();
}

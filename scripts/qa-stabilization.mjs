import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchQaBrowser } from './qa-browser.mjs';
import { clickStoryChoice } from './qa-story-ui.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.QA_OUTPUT || '/private/tmp/last-chapter-stabilization/qa';
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium),
  browser = fixture.browser;
const results = [],
  errors = [];
let page;
const capture = (page) => {
  page.on('pageerror', (error) => errors.push(String(error)));
};
const enter = async (page) => {
  await page.goto(base);
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
};
const choose = async (page, id) => {
  await clickStoryChoice(page, id);
};
const state = (page) =>
  page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js'),
      s = game.scene.getScene('bookshop');
    const rect = game.canvas.getBoundingClientRect();
    return {
      canvas: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      zoom: s.cameras.main.zoom,
      nodes: s.children.length,
      stage: s.story.stage,
      orders: s.story.orders.length,
      failed: s.failed,
      typing: s.dialogue.typing,
      reduced: s.reduced,
      fps: game.loop.actualFps,
    };
  });
const screenshot = async (page, name) => {
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/${name}.png` });
};
async function listeners(page) {
  const client = await page.context().newCDPSession(page);
  const counts = {};
  for (const name of ['window', 'document']) {
    const handle = await client.send('Runtime.evaluate', { expression: name });
    const result = await client.send('DOMDebugger.getEventListeners', {
      objectId: handle.result.objectId,
    });
    counts[name] = result.listeners.length;
    await client.send('Runtime.releaseObject', { objectId: handle.result.objectId });
  }
  await client.detach();
  return counts;
}
try {
  // First-use route, including postponing an actual conversation.
  page = await browser.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true });
  capture(page);
  await enter(page);
  assert.ok(
    (await page.locator('#story-continue').getAttribute('data-action')).includes('Розмова'),
  );
  assert.equal(
    await page
      .locator('.story-toolbar-actions button[aria-label="Поговорити з Марою"]')
      .isVisible(),
    false,
  );
  const before = await state(page);
  await screenshot(page, 'first-visit');
  await page.locator('#story-continue').click();
  await choose(page, 'greet');
  const save = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-continue').click();
  assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), save);
  await choose(page, 'books');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#story-continue').getAttribute('data-action'), 'Обрати книжку');
  await page.locator('#story-continue').click();
  await page.getByRole('heading', { name: 'Книжки на полицях' }).waitFor();
  await screenshot(page, 'request-small-phone');
  assert.deepEqual((await state(page)).canvas, before.canvas);
  results.push({ test: 'first-use guidance and suspend/reload', passed: true });
  await page.close();
  // Every real catalog book for every existing customer, through touch UI.
  const orders = [
    ['miller', 'order'],
    ['mara', 'order'],
    ['anna', 'books'],
  ];
  const catalog = ['orchard', 'witnesses', 'station', 'roads', 'letters'];
  for (const [stage, node] of orders)
    for (const [index, book] of catalog.entries()) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
      });
      page = await context.newPage();
      capture(page);
      await page.addInitScript(
        ({ stage, node }) => {
          localStorage.setItem(
            'last-chapter:save:v1',
            JSON.stringify({
              version: 1,
              stage,
              node,
              flags: [],
              history: [],
              completed: [],
              pending: [],
            }),
          );
        },
        { stage, node },
      );
      await enter(page);
      // Remove the reload initializer after boot; subsequent reload must use the real save.
      const expected = await page.evaluate(
        async ({ stage, book }) => {
          const { customerOrders } = await import('/src/content/customer-orders.ts');
          return customerOrders
            .find((order) => order.stage === stage)
            .choices.some((choice) => choice.book === book);
        },
        { stage, book },
      );
      await page.locator('#story-continue').click();
      await page.getByRole('heading', { name: 'Книжки на полицях' }).waitFor();
      if (index % 2 === 0) await page.locator('#story-panel .evidence-card button').first().click();
      const title = await page.evaluate(async (id) => {
        const { books } = await import('/src/content/books.ts');
        return books.find((book) => book.id === id).title;
      }, book);
      await page.getByRole('button', { name: `Запропонувати «${title}»`, exact: true }).tap();
      await page
        .getByText(expected ? 'Замовлення виконано' : 'Шукаємо далі', { exact: true })
        .waitFor();
      const saved = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
      await page.keyboard.press('Escape');
      await page.locator('#catalog-toggle').click();
      await page
        .getByText(expected ? 'Замовлення виконано' : 'Шукаємо далі', { exact: true })
        .waitFor();
      assert.equal((await state(page)).orders, expected ? 1 : 0);
      // A new page in the same context reads saved progress without resetting fixtures.
      await page.close();
      page = await context.newPage();
      capture(page);
      await enter(page);
      assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), saved);
      await page.locator('#catalog-toggle').click();
      await page
        .getByText(expected ? 'Замовлення виконано' : 'Шукаємо далі', { exact: true })
        .waitFor();
      if (expected) {
        assert.equal(
          await page.getByRole('button', { name: 'Запропонувати', exact: false }).count(),
          0,
        );
        await page.getByRole('button', { name: 'Продовжити розмову', exact: true }).click();
        for (let i = 0; i < 8; i++) {
          if (await page.locator('#choices button[data-choice="__advance"]').count()) break;
          const choice = await page
            .locator('#choices button[data-choice]')
            .first()
            .getAttribute('data-choice');
          assert.ok(choice);
          await choose(page, choice);
        }
        await choose(page, '__advance');
        assert.notEqual((await state(page)).stage, stage);
        if (stage === 'miller')
          assert.equal(
            await page
              .locator('.story-toolbar-actions button[aria-label="Поговорити з Марою"]')
              .getAttribute('disabled'),
            null,
          );
        if (stage === 'mara')
          assert.equal(
            await page
              .locator('.story-toolbar-actions button[aria-label="Поговорити з Марою"]')
              .getAttribute('disabled'),
            '',
          );
        assert.equal((await state(page)).orders, 1);
      } else {
        await page.getByRole('button', { name: `Запропонувати «${title}»`, exact: true }).tap();
        await page.getByText('Шукаємо далі', { exact: true }).waitFor();
        assert.equal((await state(page)).orders, 0);
      }
      if (book === 'letters')
        await screenshot(page, `order-${stage}-${expected ? 'accepted' : 'open'}`);
      results.push({ test: 'catalog matrix', stage, book, accepted: expected, passed: true });
      await context.close();
    }
  // Repeated real overlays, long renderer fixture, rotation, keyboard, reduced motion, large save.
  page = await browser.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true });
  capture(page);
  await enter(page);
  const original = await state(page),
    initialListeners = await listeners(page),
    started = Date.now();
  for (let i = 0; i < 120; i++) {
    await page.locator(i % 2 ? '#journal-toggle' : '#catalog-toggle').click();
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(await listeners(page), initialListeners);
  assert.equal((await state(page)).nodes, original.nodes);
  await page.locator('#story-continue').click();
  // Explicit renderer stress fixture; this text is not shipped narrative content.
  await page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const s = game.scene.getScene('bookshop');
    s.dialogue.show(
      {
        ...s.story.open(),
        speaker: 'Айріс',
        text: 'Текст для перевірки довгого читання. Дощ торкається шибки, а в книгарні можна спокійно повернутися до розмови.\n\n'.repeat(
          35,
        ),
      },
      true,
      false,
      false,
      'iris',
    );
  });
  await page.locator('#typewriter-skip').click();
  assert.ok(
    await page.locator('#dialogue :focus').count(),
    'Skipping text preserves dialogue focus',
  );
  const long = await page.locator('#dialogue-text').evaluate((node) => ({
    scroll: node.scrollHeight,
    height: node.clientHeight,
    width: node.scrollWidth,
    clientWidth: node.clientWidth,
  }));
  assert.ok(long.scroll > long.height);
  assert.ok(long.width <= long.clientWidth + 1);
  await screenshot(page, 'long-text-fixture');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#dialogue :focus').count(), 1);
  await page.setViewportSize({ width: 667, height: 375 });
  await page.waitForTimeout(250);
  assert.equal((await state(page)).canvas.width, 667);
  await page.keyboard.press('Escape');
  assert.equal((await state(page)).typing, null);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#story-continue').click();
  assert.equal((await state(page)).reduced, true);
  assert.equal((await state(page)).typing, null);
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const data = JSON.parse(
      localStorage.getItem('last-chapter:save:v1') ||
        '{"version":1,"stage":"miller","node":"arrival"}',
    );
    data.flags = Array.from({ length: 600 }, (_, i) => `private_fact_${i}`);
    data.history = Array(5000).fill('greet');
    data.completed = [];
    data.pending = [];
    localStorage.setItem('last-chapter:save:v1', JSON.stringify(data));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  assert.equal((await state(page)).stage, 'miller');
  await page.locator('#journal-toggle').click();
  assert.equal(await page.getByText('private_fact_0', { exact: false }).count(), 0);
  await page.keyboard.press('Escape');
  // A valid mid-story save fixture exercises the actual provenance cards.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('last-chapter:save:v1'));
    data.flags.push(
      'saw_receipt',
      'heard_about_leak',
      'clue_bookmark',
      'clue_stamp',
      'clue_shelf',
      'clue_timeline',
    );
    localStorage.setItem('last-chapter:save:v1', JSON.stringify(data));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#journal-toggle').click();
  await page.getByRole('button', { name: 'Знахідки', exact: true }).click();
  await page.getByText('Документ · Старі записи книгарні', { exact: true }).waitFor();
  await page.getByText('Свідчення · слова співрозмовника · Пані Міллер', { exact: true }).waitFor();
  await page.getByText('Припущення · потребує перевірки', { exact: true }).waitFor();
  await screenshot(page, 'journal-provenance');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(Number(process.env.QA_SOAK_MS || 30000));
  const final = await state(page);
  assert.equal(final.nodes, original.nodes);
  assert.equal(final.failed, false);
  assert.deepEqual(await listeners(page), initialListeners);
  results.push({
    test: 'overlay/listener soak, long text, rotation, reduced motion and large save',
    openCloseCycles: 120,
    elapsedMs: Date.now() - started,
    initialListeners,
    finalListeners: await listeners(page),
    long,
    final,
    passed: true,
  });
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors, output }, null, 2));
} catch (error) {
  if (page && !page.isClosed())
    await page.screenshot({ path: `${output}/failure.png` }).catch(() => {});
  throw error;
} finally {
  await fixture.close();
}

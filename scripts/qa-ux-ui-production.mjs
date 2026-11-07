import { chooseById, readReply, revealAnswer } from './qa-dialogue.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchQaBrowser } from './qa-browser.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT || '/private/tmp/last-chapter-ux-ui';
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const results = [],
  errors = [];
const viewports = [
  [320, 568],
  [360, 780],
  [375, 667],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1440, 900],
  [844, 390],
];
let page;
const save = () => page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
const shot = (name) => page.screenshot({ path: `${output}/${name}.png` });
const choose = (id) => chooseById(page, id, { touch: page.viewportSize().width < 900 });
const geometry = () =>
  page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    canvas: document.querySelector('#game canvas').getBoundingClientRect().toJSON(),
  }));

try {
  for (const [width, height] of viewports) {
    console.log(`UX/UI QA ${width} × ${height}`);
    page = await fixture.browser.newPage({
      viewport: { width, height },
      hasTouch: width < 900,
      reducedMotion: 'reduce',
    });
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    await page.locator('#enter').click();
    assert.equal(
      await page.locator('#hotspots .hotspot:not([hidden])').evaluateAll((buttons) =>
        buttons.every((button) => {
          const rect = button.getBoundingClientRect();
          return rect.left >= -1 && rect.right <= innerWidth + 1;
        }),
      ),
      true,
      'Initial touch targets use the current camera before the first interaction',
    );
    await page.waitForTimeout(300);
    const world = await geometry();
    assert.ok(world.width <= width && world.height <= height, 'No document scrolling');
    await shot(`${width}-${height}-world`);
    await page.locator('#explore-toggle').click();
    await page.locator('#explore-menu[open]').waitFor();
    assert.equal(
      await page.locator('#explore-menu [data-spot="frank"]').count(),
      1,
      'Offscreen Frank has a touch route',
    );
    if ([320, 390, 1440].includes(width)) {
      await page.locator('#explore-menu [data-spot="frank"]').click();
      await page.locator('#dialogue:not([hidden])').waitFor({ timeout: 20000 });
      await choose('pet');
      assert.equal(await page.locator('#player-turn').count(), 0, 'Petting is an action');
      await shot(`${width}-frank`);
      await page.keyboard.press('Escape');
    } else await page.keyboard.press('Escape');

    await page.locator('#story-continue').click();
    await choose('greet');
    assert.equal(
      await page.locator('#player-turn').count(),
      0,
      'Greeting action invents no speech',
    );
    await choose('town');
    const words = '«Я тільки приїхав. Тут усі так уважно стежать одне за одним?»';
    assert.equal(await page.locator('#player-turn').count(), 1);
    assert.equal(await page.locator('#player-turn p').textContent(), words);
    assert.equal(
      await page.locator('#speaker').textContent(),
      'Пані Міллер',
      'Reply follows the player speech',
    );
    const completeReply = await readReply(page);
    assert.ok(completeReply.length > 0, 'NPC reply remains readable after the player');
    // The dialogue auto-focuses the first reply. A Playwright Enter after
    // multiple DOM assertions is not an immediate key repeat: it can be a
    // legitimate choice after the 220ms guard. Test prose keyboard isolation
    // separately from a truly synchronous double activation.
    const once = await save();
    await page.locator('#dialogue-text').focus();
    await page.keyboard.press('Enter');
    assert.equal(await save(), once, 'Enter on dialogue prose cannot select a reply');
    assert.deepEqual((await geometry()).canvas, world.canvas, 'Dialogue never resizes the world');
    const reading = await page
      .locator('#dialogue-text')
      .evaluate((node) => ({ height: node.clientHeight, content: node.scrollHeight }));
    assert.ok(
      reading.height > 0 && reading.content <= reading.height + 1,
      'Prose page fits without scrolling',
    );
    await shot(`${width}-${height}-player-turn`);
    await page.locator('#dialogue-text').focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(
      await page.locator('#dialogue-text:focus').count(),
      1,
      'Arrow keys retain prose focus',
    );
    for (let i = 0; i < 12 && !(await page.locator('#choices button:focus').count()); i++)
      await page.keyboard.press('Tab');
    assert.equal(
      await page.locator('#choices button:focus').count(),
      1,
      'Tab reaches a visible answer',
    );

    // Exercise a real stale-button double tap without introducing fabricated
    // option IDs or advancing the authored journey twice.
    await page.waitForTimeout(240);
    await revealAnswer(page, page.locator('#choices [data-choice="gossip"]'));
    const staleChoice = await page.locator('#choices [data-choice="gossip"]').elementHandle();
    await staleChoice.click();
    const afterFirst = await save();
    await staleChoice.evaluate((button) => button.click());
    assert.equal(await save(), afterFirst, 'Detached prior reply cannot advance the next node');
    for (const id of ['what-saw', 'challenge']) await choose(id);
    const flags = JSON.parse(await save()).flags;
    assert.equal(flags.filter((flag) => flag === 'rumor_challenged').length, 1);
    const checkpoint = await save();
    const npc = await readReply(page);
    await page.reload();
    await page.locator('#enter').click();
    await page.locator('#story-continue').click();
    assert.equal(
      await page.locator('#player-turn').count(),
      0,
      'Reload does not replay the player turn',
    );
    assert.equal(await save(), checkpoint, 'Reload applies no extra flags');
    assert.equal(await readReply(page), npc);
    await page.keyboard.press('Escape');
    await page.locator('#catalog-toggle').click();
    assert.equal(await page.locator('.story-book').count(), 5);
    await page
      .locator('.book-cover')
      .evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    assert.equal(
      await page
        .locator('.book-cover')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
      true,
      'All local covers loaded',
    );
    await page.getByRole('searchbox').fill('сад');
    assert.equal(await page.locator('.story-book').count(), 1);
    await page.getByRole('searchbox').fill('');
    await page.getByRole('button', { name: 'Детективи', exact: true }).click();
    assert.equal(await page.locator('.story-book').count(), 2);
    await page.getByRole('button', { name: 'Усі', exact: true }).click();
    await shot(`${width}-${height}-catalog`);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#catalog-toggle:focus').count(), 1);
    await page.locator('#journal-toggle').click();
    await page
      .locator('.person-card img')
      .evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    assert.equal(
      await page
        .locator('.person-card img')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
      true,
    );
    assert.equal(await page.locator('.person-card').count(), 1, 'Future people remain hidden');
    await shot(`${width}-${height}-journal`);
    await page.getByRole('button', { name: 'Чутки', exact: true }).click();
    assert.equal(await page.locator('[data-kind="rumor"]').count(), 1);
    await page.getByRole('button', { name: 'Події', exact: true }).click();
    assert.ok(!(await page.locator('.story-notes').textContent()).includes('Чутка:'));
    await page.getByRole('button', { name: 'Завдання', exact: true }).click();
    assert.equal(
      await page.getByRole('button', { name: 'Повернутися до історії', exact: true }).count(),
      1,
    );
    await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
    await page.locator('#personal-notes').fill('Мої думки: <img src=x onerror=alert(1)>');
    assert.equal(await page.locator('#story-panel img').count(), 0, 'Personal notes remain text');
    const layout = await geometry();
    assert.ok(layout.width <= width && layout.height <= height);
    await page.keyboard.press('Escape');
    await page.reload();
    await page.locator('#enter').click();
    await page.locator('#journal-toggle').click();
    await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
    assert.equal(
      await page.locator('#personal-notes').inputValue(),
      'Мої думки: <img src=x onerror=alert(1)>',
    );
    await page.keyboard.press('Escape');
    results.push({ width, height, passed: true });
    await page.close();
  }
  // An isolated compatible legacy save tests day-one Mara and full-length Ukrainian prose.
  page = await fixture.browser.newPage({ viewport: { width: 320, height: 568 }, hasTouch: true });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem(
      'last-chapter:save:v1',
      JSON.stringify({ version: 1, stage: 'mara', node: 'hello', flags: [], history: [] }),
    );
    sessionStorage.setItem('seeded', 'yes');
  });
  await page.goto(base);
  await page.locator('#enter').click();
  await page.locator('#story-continue').click();
  await choose('joke');
  assert.equal(
    await page.locator('#player-turn p').textContent(),
    '«Двері перемагають. Може, їм зарплату платити?»',
  );
  if (await page.locator('#typewriter-skip').isVisible())
    await page.locator('#typewriter-skip').evaluate((button) => button.click());
  assert.equal(
    await page.locator('#dialogue-text [aria-hidden="true"]').textContent(),
    await page.locator('#dialogue-text .sr-only').textContent(),
  );
  const once = await save();
  await page.reload();
  await page.locator('#enter').click();
  await page.locator('#story-continue').click();
  assert.equal(await page.locator('#player-turn').count(), 0);
  assert.equal(await save(), once);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
  await page.locator('.conversation-replies button').first().tap();
  // Send the next activation without locator stability/scroll waits. Those waits
  // can exceed the deliberate 220ms guard and turn a double tap into two normal inputs.
  const optionalRapid = await page.evaluate(() => {
    const key = 'last-chapter:conversation:mara:v1';
    const once = localStorage.getItem(key);
    document.querySelector('.conversation-replies button').click();
    return { once, after: localStorage.getItem(key) };
  });
  assert.equal(
    optionalRapid.after,
    optionalRapid.once,
    'Optional rapid activation cannot advance another node',
  );
  assert.equal(
    await page.locator('.player-turn p').textContent(),
    'Тамліна варто спробувати зрозуміти',
  );
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
  assert.equal(
    await page.locator('.player-turn').count(),
    0,
    'Optional speech is not replayed on reopen',
  );
  for (const label of ['У книжці мені цікаві навіть небезпечні герої', 'На сьогодні досить']) {
    await page.waitForTimeout(240);
    await page.getByRole('button', { name: label, exact: true }).click();
  }
  assert.equal(
    await page.locator('#story-panel').isVisible(),
    false,
    'An exit returns to the shop',
  );
  assert.equal(
    await page
      .getByRole('button', { name: 'Поговорити з Марою', exact: true })
      .evaluate((button) => document.activeElement === button),
    true,
    'Completing a topic restores keyboard focus',
  );
  const completedOptional = await page.evaluate(() =>
    localStorage.getItem('last-chapter:conversation:mara:v1'),
  );
  assert.equal(JSON.parse(completedOptional).finished, true);
  await page.reload();
  await page.locator('#enter').click();
  await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
  assert.equal(
    await page.locator('.player-turn').count(),
    0,
    'A completed goodbye is not replayed',
  );
  assert.equal(
    await page.getByRole('button', { name: 'Книжкові суперечки з Марою', exact: true }).count(),
    0,
    'A completed topic stays absent after reload',
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem('last-chapter:conversation:mara:v1')),
    completedOptional,
    'Opening the next topic does not rewrite the completed session',
  );
  await page.keyboard.press('Escape');
  await page.locator('#story-continue').click();
  // View-only fixture: no mutation of authored content or the simulation.
  await page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const ui = game.scene.getScene('bookshop').dialogue;
    ui.pendingPlayerTurn = '«' + 'Можна ще раз перевірити ці записи разом? '.repeat(30) + '»';
    ui.show(
      {
        speaker: 'Мара',
        text: 'Українська репліка без скорочень. '.repeat(40),
        choices: [{ id: 'fixture', label: 'Повернутися' }],
      },
      true,
      false,
      true,
      'mara',
    );
  });
  assert.equal(await page.locator('#player-turn').count(), 1);
  const longText = await readReply(page);
  assert.equal(
    longText,
    'Українська репліка без скорочень. '.repeat(40).trim(),
    'Every word of long Ukrainian narration is reachable through pages',
  );
  assert.ok(
    await page.locator('#dialogue-pages span').textContent(),
    'Pages have a visible position indicator',
  );
  await shot('320-long-ukrainian-turns');
  await page.close();
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ results, errors, legacySave: true, longText: true }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ results, errors, output }));
} catch (error) {
  if (page && !page.isClosed()) await shot('failure');
  throw error;
} finally {
  await fixture.close();
}

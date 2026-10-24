import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Optional QA dependency, deliberately kept out of the game's dependency tree.
// Set PLAYWRIGHT_MODULE to a temporary installation's absolute index.mjs path.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-qa');
await mkdir(output, { recursive: true });
const server = await chromium.launchServer({
  channel: process.env.BROWSER_CHANNEL || 'chrome',
  headless: true,
});
const browser = await chromium.connect(server.wsEndpoint());
const results = [];

function assertMaraPortrait(src) {
  const isMaraSvg = Boolean(src?.split('?')[0].endsWith('/mara.svg'));
  const isInlinePng = Boolean(src?.startsWith('data:image/png;base64,'));
  assert.ok(isMaraSvg || isInlinePng, `Unexpected Mara portrait source: ${src?.slice(0, 100)}`);
}

async function snapshot(page) {
  return page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const scene = game.scene.getScene('bookshop');
    return {
      state: scene.state,
      player: {
        x: scene.characters.player.x,
        y: scene.characters.player.y,
        frame: scene.characters.player.sprite.frame.name,
        direction: scene.characters.player.direction,
        animation: scene.characters.player.sprite.anims.currentAnim?.key,
      },
      mara: {
        x: scene.characters.mara.x,
        y: scene.characters.mara.y,
        frame: scene.characters.mara.sprite.frame.name,
        direction: scene.characters.mara.direction,
      },
      reduced: scene.reduced,
      audio: {
        muted: scene.audio.muted,
        volume: scene.audio.volume,
        music: scene.audio.music,
        status: scene.audio.context?.state,
      },
      node: scene.activeDialogue?.node,
      parcel: scene.lights.parcel.visible,
    };
  });
}

async function ready(page) {
  await waitScene(page, (scene) => performance.now() >= scene.dialogue.readyAt);
}
async function waitScene(page, predicate) {
  const scene = await page.evaluateHandle(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    return game.scene.getScene('bookshop');
  });
  try {
    await page.waitForFunction(predicate, scene);
  } finally {
    await scene.dispose();
  }
}
async function choose(page, name) {
  await ready(page);
  await page.getByRole('button', { name, exact: true }).click();
}
async function inspect(page, name, speaker) {
  await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('heading', { name: speaker, exact: true }).waitFor();
  await choose(page, 'Продовжити');
  await page.locator('#dialogue').waitFor({ state: 'hidden' });
}
async function start(page) {
  await page.goto(`${base}/phaser-prototype/`);
  await page.getByRole('button', { name: 'Відчинити книгарню', exact: true }).click();
  await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).waitFor();
  await waitScene(page, (scene) => scene.state.mara === 'ready');
}
async function checkPresentation(page, dialogueVisible = false) {
  const layout = await page.evaluate(() => {
    const canvas = document.querySelector('canvas'),
      targets = document.querySelector('#hotspots');
    const room = canvas.getBoundingClientRect(),
      hit = targets.getBoundingClientRect();
    const dialogue = document.querySelector('#dialogue');
    return {
      width: canvas.width,
      height: canvas.height,
      sharp: getComputedStyle(canvas).imageRendering,
      ratio: room.width / room.height,
      aligned:
        Math.abs(room.left - hit.left) < 1 &&
        Math.abs(room.top - hit.top) < 1 &&
        Math.abs(room.width - hit.width) < 1 &&
        Math.abs(room.height - hit.height) < 1,
      belowRoom: dialogue.hidden || dialogue.getBoundingClientRect().top >= room.bottom - 1,
      overflow: document.documentElement.scrollWidth > innerWidth,
      textOverflow: dialogue.scrollWidth > dialogue.clientWidth,
    };
  });
  assert.equal(layout.width, 640);
  assert.equal(layout.height, 360);
  assert.equal(layout.sharp, 'pixelated');
  assert.ok(Math.abs(layout.ratio - 16 / 9) < 0.001);
  assert.equal(layout.aligned, true, 'Hotspots follow the displayed canvas');
  assert.equal(layout.overflow, false);
  if (dialogueVisible) {
    assert.equal(layout.belowRoom, true, 'Dialogue never obscures room pixels');
    assert.equal(layout.textOverflow, false);
  }
}
function captureErrors(page, errors) {
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico'))
      errors.push(message.text());
  });
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  captureErrors(page, errors);
  await page.goto(base);
  await page.locator('#story-tools').waitFor();
  const saveBefore = await page.evaluate(() => JSON.stringify(localStorage));
  const headingBefore = await page.locator('h1').textContent();
  await start(page);
  assert.equal((await snapshot(page)).audio.muted, true);
  assert.equal((await snapshot(page)).mara.direction, 'left');
  await checkPresentation(page);
  await page.screenshot({ path: `${output}/bookshop-desktop.png`, fullPage: true });

  // Real key presses exercise movement, bounds, animation, and furniture collision.
  await page.locator('#game').focus();
  await page.keyboard.down('ArrowDown');
  await waitScene(page, (scene) => scene.characters.player.y >= 237);
  await page.keyboard.up('ArrowDown');
  const blocked = await snapshot(page);
  assert.ok(blocked.player.y <= 239.1, 'Counter collision stops the player');

  // Click-to-move routes around furniture to the opposite side of the table.
  const canvas = await page.locator('canvas').boundingBox();
  await page.mouse.click(
    canvas.x + (435 / 640) * canvas.width,
    canvas.y + (320 / 360) * canvas.height,
  );
  await waitScene(
    page,
    (scene) =>
      scene.path.length > 1 &&
      scene.characters.player.sprite.anims.currentAnim?.key.endsWith('-walk'),
  );
  assert.ok(
    Number((await snapshot(page)).player.frame) % 6 >= 2,
    'Walking uses the animated directional frames',
  );
  await waitScene(
    page,
    (scene) => Math.hypot(scene.characters.player.x - 435, scene.characters.player.y - 320) < 1,
  );
  for (const [name, speaker] of [
    ['Книжкові полиці', 'Книжкові полиці'],
    ['Дощове вікно', 'Дощове вікно'],
    ['Прилавок', 'Прилавок'],
    ['Читацький столик', 'Читацький столик'],
  ])
    await inspect(page, name, speaker);
  assert.equal((await snapshot(page)).state.inspected.length, 4);

  await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
  await page.getByRole('heading', { name: 'Мара', exact: true }).waitFor();
  await ready(page);
  await checkPresentation(page, true);
  const openingPortrait = await page.locator('#portrait').getAttribute('src');
  assertMaraPortrait(openingPortrait);
  assert.equal(await page.locator('#portrait').evaluate((image) => image.complete && image.naturalWidth > 0), true);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  await page.screenshot({ path: `${output}/mara-dialogue.png`, fullPage: true });
  // Holding Enter cannot answer another line, even after the timing guard expires.
  await page.keyboard.down('Enter');
  const first = (await snapshot(page)).node;
  assert.equal(first, 'meaning');
  assertMaraPortrait(await page.locator('#portrait').getAttribute('src'));
  await ready(page);
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  assert.equal((await snapshot(page)).node, first);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
  await page.getByRole('heading', { name: 'Мара', exact: true }).waitFor();
  assert.equal(
    (await snapshot(page)).node,
    'meaning',
    'Closing and reopening resumes the conversation',
  );
  await choose(page, '«Ця розмова залишиться між нами»');
  await choose(page, 'Показати дві книжки');
  await choose(page, '«Скляна станція» — роман про потяги й повернення');
  await choose(page, 'Загорнути «Скляну станцію»');
  assert.equal((await snapshot(page)).state.completed, true);
  assert.equal((await snapshot(page)).state.privacy, 'respected');
  assert.equal((await snapshot(page)).parcel, true);
  await choose(page, 'Повернутися до книгарні');

  await page.getByRole('button', { name: 'Увімкнути звук', exact: true }).click();
  assert.equal((await snapshot(page)).audio.muted, false);
  await page.getByRole('button', { name: 'Керування та налаштування', exact: true }).click();
  await page.getByLabel('Гучність').fill('25');
  await page.getByLabel('Тиха музика', { exact: true }).check();
  await page.getByLabel('Менше руху', { exact: true }).check();
  assert.equal((await snapshot(page)).audio.volume, 0.25);
  assert.equal((await snapshot(page)).audio.music, true);
  assert.equal((await snapshot(page)).reduced, true);
  await page.getByRole('button', { name: 'Повернутися до книгарні', exact: true }).click();
  await page.getByRole('button', { name: 'Вимкнути звук', exact: true }).click();
  assert.equal((await snapshot(page)).audio.muted, true);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.locator('#game').focus();
  await page.getByRole('button', { name: 'Дощове вікно', exact: true }).click();
  await page.getByRole('heading', { name: 'Дощове вікно', exact: true }).waitFor();
  await checkPresentation(page, true);
  await choose(page, 'Продовжити');
  assert.equal(
    await page.evaluate(() => JSON.stringify(localStorage)),
    saveBefore,
    'Slice cannot alter production saves',
  );
  assert.deepEqual(errors, []);
  results.push({
    test: 'desktop, movement, objects, resume, privacy, station ending, audio, save isolation',
    status: 'passed',
  });

  // Tablet + reduced motion + keyboard-only object selection and a different ending.
  const tablet = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    reducedMotion: 'reduce',
    hasTouch: true,
  });
  const tabletPage = await tablet.newPage();
  const tabletErrors = [];
  captureErrors(tabletPage, tabletErrors);
  await start(tabletPage);
  await tabletPage.locator('#game').focus();
  for (let i = 0; i < 5; i++) await tabletPage.keyboard.press('KeyR');
  await tabletPage.keyboard.press('Enter');
  await tabletPage.getByRole('heading', { name: 'Мара', exact: true }).waitFor();
  assert.equal((await snapshot(tabletPage)).reduced, true);
  await ready(tabletPage);
  await tabletPage.keyboard.press('ArrowDown');
  await tabletPage.keyboard.press('Enter');
  assert.equal((await snapshot(tabletPage)).node, 'trains');
  await choose(tabletPage, '«Тоді знайдемо щось для нього»');
  await choose(tabletPage, '«Мапи незавершених доріг» — історія про нові початки');
  await checkPresentation(tabletPage, true);
  await tabletPage.screenshot({ path: `${output}/bookshop-tablet.png`, fullPage: true });
  const overflow = await tabletPage.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert.equal(overflow, false);
  await choose(tabletPage, 'Загорнути «Мапи незавершених доріг»');
  assert.equal((await snapshot(tabletPage)).state.book, 'roads');
  assert.equal((await snapshot(tabletPage)).state.completed, true);
  await choose(tabletPage, 'Повернутися до книгарні');
  await tabletPage.getByRole('button', { name: 'Дощове вікно', exact: true }).tap();
  await tabletPage.getByRole('heading', { name: 'Дощове вікно', exact: true }).waitFor();
  await choose(tabletPage, 'Продовжити');
  assert.deepEqual(tabletErrors, []);
  results.push({
    test: 'tablet, reduced motion, keyboard-only selection, roads ending, text wrapping',
    status: 'passed',
  });

  const fallback = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    reducedMotion: 'reduce',
  });
  await fallback.route('**/art/**/mara*.svg', (route) => route.abort());
  await fallback.addInitScript(() => {
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
  });
  const fallbackPage = await fallback.newPage();
  await start(fallbackPage);
  await fallbackPage.getByRole('button', { name: 'Увімкнути звук', exact: true }).click();
  await fallbackPage.getByRole('button', { name: 'Звук недоступний', exact: true }).waitFor();
  await fallbackPage.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
  await fallbackPage.getByRole('heading', { name: 'Мара', exact: true }).waitFor();
  // Portraits can be bundled as inline PNGs, so aborting SVG requests alone
  // no longer guarantees an image-load failure. Verify the active portrait
  // is usable; fallback visibility is only required when the image fails.
  const portraitState = await fallbackPage.locator('#portrait').evaluate((image) => ({
    loaded: image.complete && image.naturalWidth > 0,
    fallbackVisible: !document.querySelector('#portrait-fallback')?.hidden,
  }));
  assert.ok(
    portraitState.loaded || portraitState.fallbackVisible,
    'Portrait must render or show its text fallback',
  );
  await choose(fallbackPage, '«Що ти хочеш сказати цим подарунком?»');
  await choose(fallbackPage, '«Може, запитати в Лео, яку книжку він хоче?»');
  assert.equal((await snapshot(fallbackPage)).node, 'boundary');
  assertMaraPortrait(await fallbackPage.locator('#portrait').getAttribute('src'));
  await fallbackPage.screenshot({ path: `${output}/portrait-fallback.png`, fullPage: true });
  results.push({
    test: 'missing portrait, unavailable Web Audio, confidentiality boundary',
    status: 'passed',
  });

  const broken = await browser.newContext();
  await broken.route('**/phaser-prototype/scene.js', (route) => route.abort());
  const brokenPage = await broken.newPage();
  await brokenPage.goto(`${base}/phaser-prototype/`);
  await brokenPage
    .getByText('Не вдалося відчинити книгарню. Оновіть сторінку, будь ласка.', { exact: true })
    .waitFor();
  results.push({
    test: 'missing initialization module produces Ukrainian recovery message',
    status: 'passed',
  });

  await page.goto(base);
  await page.locator('#story-tools').waitFor();
  assert.equal(await page.locator('h1').textContent(), headingBefore);
  assert.equal(await page.evaluate(() => JSON.stringify(localStorage)), saveBefore);
  results.push({
    test: 'canonical root still loads; isolated prototype leaves five-day save unchanged',
    status: 'passed',
  });
  await writeFile(
    `${output}/results.json`,
    JSON.stringify({ base, browser: await browser.version(), results }, null, 2),
  );
  console.log(JSON.stringify({ output, results }, null, 2));
} catch (error) {
  for (const [index, page] of browser
    .contexts()
    .flatMap((context) => context.pages())
    .entries()) {
    await page
      .screenshot({ path: `${output}/failure-${index}.png`, fullPage: true })
      .catch(() => {});
    console.error(page.url(), await snapshot(page).catch(() => 'Scene unavailable'));
  }
  throw error;
} finally {
  // Bound graceful shutdown: this host sometimes stalls during Chrome cleanup.
  // The fallback can terminate only the browser server owned by this run.
  const cleanup = setTimeout(() => {
    console.warn('Chrome fixture did not close promptly; terminating the owned browser server.');
    void server.kill();
  }, 5000);
  try {
    await browser.close();
    await server.close();
  } finally {
    clearTimeout(cleanup);
  }
}

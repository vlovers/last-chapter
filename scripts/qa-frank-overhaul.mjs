import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.QA_OUTPUT || 'docs/qa/mobile-overhaul';
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const browser = fixture.browser;
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }),
  errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const cat = () =>
  page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const s = game.scene.getScene('bookshop');
    const { canStand } = await import('/phaser-prototype/world.js');
    return {
      activity: s.frank.state.activity,
      elevation: s.frank.state.elevation,
      x: s.frank.state.x,
      y: s.frank.state.y,
      pets: s.frank.state.pets,
      meals: s.frank.state.meals,
      games: s.frank.state.games,
      valid: canStand(s.frank.state),
      nodes: s.children.length,
      fps: game.loop.actualFps,
    };
  });
const choose = async (id) => {
  await page.waitForTimeout(250);
  await page.locator(`#choices button[data-choice="${id}"]`).click();
};
const waitActivity = async (name, ms = 15000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const state = await cat();
    assert.ok(state.valid);
    if (state.activity === name) return state;
    await page.waitForTimeout(250);
  }
  throw Error('No ' + name + ': ' + JSON.stringify(await cat()));
};
try {
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173');
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.getByRole('button', { name: 'Побути з Френком', exact: true }).click();
  await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
  const paused = await cat();
  await page.waitForTimeout(500);
  assert.equal((await cat()).x, paused.x);
  await choose('pet');
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: `${output}/frank-pet.png`,
  });
  assert.equal((await cat()).pets, 1);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Побути з Френком', exact: true }).click();
  await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
  await choose('pet');
  assert.equal((await cat()).pets, 1);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Насипати корм Френкові', exact: true }).click();
  await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
  await choose('feed');
  const eating = await waitActivity('eating');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/frank-eating.png` });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Побути з Френком', exact: true }).click();
  await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
  await choose('play');
  assert.equal((await cat()).activity, 'playing');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/frank-play.png` });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Котяче дерево Френка', exact: true }).click();
  await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
  await choose('tree');
  const resting = await waitActivity('resting', 20000);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${output}/frank-tree.png` });
  assert.equal(resting.elevation, 85);
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  const loaded = await cat();
  assert.equal(loaded.pets, 1);
  assert.equal(loaded.meals, 1);
  assert.equal(loaded.games, 1);
  await page.getByRole('button', { name: 'Посидіти з книжкою', exact: true }).click();
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${output}/reading-chair.png` });
  await page.locator('#game').focus();
  await page.keyboard.press('ArrowDown');
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/frank-results.json`,
    JSON.stringify({ paused, eating, resting, loaded, errors }, null, 2),
  );
  console.log(JSON.stringify({ paused, eating, resting, loaded, errors }, null, 2));
} catch (e) {
  await page.screenshot({ path: `${output}/frank-failure.png` });
  throw e;
} finally {
  await fixture.close();
}

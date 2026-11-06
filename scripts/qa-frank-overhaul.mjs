import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const outputBase = process.env.QA_OUTPUT || 'docs/qa/mobile-overhaul';
let output = outputBase;
await mkdir(outputBase, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const browser = fixture.browser;
let page;
const errors = [],
  results = [];
let touch = false;
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
      simulationMs: s.frank.state.elapsed,
    };
  });
// The phone camera starts at the counter while Frank may be in another aisle.
// Offscreen hotspots are deliberately hidden from pointer input, but remain
// keyboard-selectable. Use the real R/Enter navigation instead of waiting for
// a roaming cat to wander into view (or mutating scene state in the test).
const openRoamingFrank = async () => {
  const hotspot = page.getByRole('button', { name: 'Побути з Френком', exact: true });
  const heading = page.getByRole('heading', { name: 'Френк', exact: true });
  if (touch && (await hotspot.isVisible())) {
    try {
      // On phones, verify the actual touch target when Frank is on-camera.
      // The hotspot moves with the cat, so Playwright's stability wait is
      // unsuitable; force still sends a real touch event.
      await hotspot.tap({ force: true });
      await heading.waitFor({ timeout: 20000 });
      return;
    } catch (error) {
      // A visible, nonfunctional touch target is a genuine mobile failure.
      // Only use keyboard navigation when Frank has left the camera.
      if (await hotspot.isVisible()) throw error;
    }
  }
  // On desktop the roaming button can move between Playwright's coordinate
  // lookup and pointerdown, sending the click to the canvas underneath.
  // Exercise the real accessible R/Enter approach instead; the stationary
  // bowl and tree still receive pointer clicks later in this suite.
  await page.locator('#game').focus();
  let selected = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    await page.keyboard.press('r');
    selected = await page.evaluate(async () => {
      const { game } = await import('/phaser-prototype/scene.js');
      return game.scene.getScene('bookshop').interactions.selected?.id ?? null;
    });
    if (selected === 'frank') break;
  }
  assert.equal(selected, 'frank', 'Offscreen Frank must remain keyboard-selectable');
  console.log(
    `Frank QA: navigating to ${touch ? 'offscreen mobile' : 'roaming desktop'} Frank with R/Enter`,
  );
  await page.keyboard.press('Enter');
  // The game must walk the player to the cat and open the real conversation.
  await heading.waitFor({ timeout: 30000 });
};
const choose = async (id) => {
  await page.waitForTimeout(250);
  assert.ok((await page.locator('#choices button').count()) <= 4, 'Four Frank choices maximum');
  const button = page.locator(`#choices button[data-choice="${id}"]`);
  if (touch) await button.tap();
  else await button.click();
};
const waitActivity = async (name, simulationBudget = 15000) => {
  const initial = await cat();
  const end = Date.now() + 90000;
  while (Date.now() < end) {
    const state = await cat();
    assert.ok(state.valid);
    if (state.activity === name) return state;
    if (state.simulationMs - initial.simulationMs >= simulationBudget) break;
    await page.waitForTimeout(250);
  }
  throw Error('No ' + name + ' within simulation/wall budget: ' + JSON.stringify(await cat()));
};
try {
  const viewports = [
    [1440, 900],
    [320, 568],
    [390, 844],
  ].filter(([width]) => !process.env.QA_WIDTH || String(width) === process.env.QA_WIDTH);
  assert.ok(viewports.length, 'Known Frank viewport required');
  for (const [width, height] of viewports) {
    touch = width < 900;
    output = `${outputBase}/${width}`;
    await mkdir(output, { recursive: true });
    page = await browser.newPage({ viewport: { width, height }, hasTouch: touch });
    page.on('pageerror', (e) => errors.push(String(e)));
    console.log(`Frank QA: ${width}x${height}`);
    await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173');
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await openRoamingFrank();
    assert.equal(await page.locator('#choices button').count(), 4);
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
    await openRoamingFrank();
    await choose('pet');
    assert.equal((await cat()).pets, 1, 'Repeated petting must not bypass its cooldown');
    await page.keyboard.press('Escape');
    await openRoamingFrank();
    await choose('frank-more');
    assert.equal(await page.locator('#choices button').count(), 4);
    await choose('watch');
    assert.equal((await cat()).pets, 1);
    await page.keyboard.press('Escape');
    if (touch) {
      // Care hotspots can be off-camera after approaching a roaming cat.
      await page.locator('#game').focus();
      await page.keyboard.down('ArrowRight');
      await page.waitForTimeout(1500);
      await page.keyboard.up('ArrowRight');
    }
    await page.getByRole('button', { name: 'Насипати корм Френкові', exact: true }).click();
    await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
    await choose('feed');
    const eating = await waitActivity('eating');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${output}/frank-eating.png` });
    await page.keyboard.press('Escape');
    await openRoamingFrank();
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
    // The reading chair is outside the initial phone camera. Its desktop
    // regression remains here; mobile camera movement is covered by mobile QA.
    if (!touch) {
      await page.getByRole('button', { name: 'Посидіти з книжкою', exact: true }).click();
      await page.waitForTimeout(6000);
      await page.screenshot({ path: `${output}/reading-chair.png` });
    }
    await page.locator('#game').focus();
    await page.keyboard.press('ArrowDown');
    assert.deepEqual(errors, []);
    await writeFile(
      `${output}/frank-results.json`,
      JSON.stringify({ paused, eating, resting, loaded, errors }, null, 2),
    );
    await page.evaluate(() => window.dispatchEvent(new Event('last-chapter:new-game')));
    const clean = await cat();
    assert.deepEqual([clean.pets, clean.meals, clean.games], [0, 0, 0]);
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    const restarted = await cat();
    assert.deepEqual([restarted.pets, restarted.meals, restarted.games], [0, 0, 0]);
    results.push({ width, height, paused, eating, resting, loaded, errors: [...errors] });
    console.log(JSON.stringify(results.at(-1)));
    await page.close();
  }
  await writeFile(`${outputBase}/frank-results.json`, JSON.stringify({ results, errors }, null, 2));
} catch (e) {
  await page?.screenshot({ path: `${output}/frank-failure.png` }).catch(() => {});
  throw e;
} finally {
  await fixture.close();
}

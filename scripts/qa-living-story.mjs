import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchQaBrowser } from './qa-browser.mjs';
import { chooseById, readReply, waitForDialogue, revealAnswer } from './qa-dialogue.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT || '/private/tmp/last-chapter-living-story';
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const results = [],
  errors = [];
let page;
const shot = (name) => page.screenshot({ path: `${output}/${name}.png` });
// Fail with actionable layout evidence instead of masking blocked controls with force clicks.
async function clickStoryContinue() {
  const button = page.locator('#story-continue');
  await button.waitFor({ state: 'visible' });
  const hit = await button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const target = document.elementFromPoint(x, y);
    const style = getComputedStyle(element);
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      viewport: { width: innerWidth, height: innerHeight },
      target: target?.tagName.toLowerCase() ?? null,
      targetId: target?.id ?? null,
      targetClass: typeof target?.className === 'string' ? target.className : null,
      pointerEvents: style.pointerEvents,
      position: style.position,
      zIndex: style.zIndex,
      parent: element.parentElement?.className ?? null,
      clickable: target === element || element.contains(target),
    };
  });
  assert.ok(hit.clickable, `Story continue is covered or outside viewport: ${JSON.stringify(hit)}`);
  await button.click();
}

const sceneState = () =>
  page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const scene = game.scene.getScene('bookshop'),
      actor = scene.characters.mara;
    return {
      x: actor.x,
      y: actor.y,
      visible: actor.sprite.visible,
      angle: actor.sprite.angle,
      direction: actor.direction,
      animation: actor.sprite.anims.currentAnim?.key,
      staging: scene.director.active,
      failed: scene.failed,
      environment: scene.story.environment,
      cat: { x: scene.frank.state.x, y: scene.frank.state.y, activity: scene.frank.state.activity },
    };
  });
async function open(viewport, reduced = true, stage = 'leo') {
  page = await fixture.browser.newPage({
    viewport,
    hasTouch: viewport.width < 900,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(base);
  // Visual fixtures use actual authored nodes and a validated, engine-produced save.
  // The full journey suite covers natural progression into these same nodes.
  await page.evaluate(async (stage) => {
    const { startDialogue } = await import('/src/game/dialogue.ts');
    const { stageStory } = await import('/src/game/chapter.ts');
    const { encodeSave, decodeSave, SAVE_KEY } = await import('/src/game/save.ts');
    const dialogue = startDialogue(stageStory(stage));
    const raw = encodeSave({ stage, flags: [], dialogue });
    if (!decodeSave(raw)) throw new Error('Invalid authored visual fixture');
    localStorage.setItem(SAVE_KEY, raw);
  }, stage);
  await page.reload();
  await page.locator('#enter').click();
  await clickStoryContinue();
}
async function layout() {
  return page.evaluate(() => {
    const dock = document.querySelector('#dialogue').getBoundingClientRect();
    const text = document.querySelector('#dialogue-text');
    const answers = [...document.querySelectorAll('#choices button:not([hidden])')].map(
      (button) => {
        const r = button.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, height: r.height };
      },
    );
    return {
      height: dock.height,
      top: dock.top,
      bottom: dock.bottom,
      viewport: innerHeight,
      width: document.documentElement.scrollWidth,
      textHeight: text.clientHeight,
      textScroll: text.scrollHeight,
      answers,
    };
  });
}
async function fits(expectedHeight) {
  const geometry = await layout();
  assert.ok(
    Math.abs(geometry.height - expectedHeight) < 1,
    'Dialogue height is stable across narration, speech, replies and choice pages',
  );
  assert.ok(geometry.width <= page.viewportSize().width, 'No document overflow');
  assert.ok(geometry.textScroll <= geometry.textHeight + 1, 'No clipped prose');
  for (const answer of geometry.answers) {
    assert.ok(
      answer.y >= geometry.top && answer.bottom <= geometry.bottom - 3,
      'Whole answer fits its stable region',
    );
    assert.ok(
      answer.x >= 0 && answer.right <= page.viewportSize().width,
      'Whole answer fits horizontally',
    );
    assert.ok(answer.height >= 44, 'Touch answer is at least 44 CSS pixels high');
  }
  return geometry;
}
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
  ]) {
    await open(viewport);
    await waitForDialogue(page);
    const initial = await layout();
    assert.match(await readReply(page), /До пекарні ще встигаю/);
    await chooseById(page, 'greet', { touch: viewport.width < 900 });
    await waitForDialogue(page);
    await fits(initial.height);
    await shot(`${viewport.width}-leo`);
    await readReply(page);
    // Read all four authored answers, including rows on the answer pager.
    const answerIds = await page
      .locator('#choices button')
      .evaluateAll((buttons) => buttons.map((button) => button.dataset.choice));
    assert.equal(answerIds.length, 4);
    for (const id of answerIds) {
      await revealAnswer(page, page.locator(`[data-choice="${id}"]`));
      await fits(initial.height);
    }
    await chooseById(page, 'leo-course-now', { touch: viewport.width < 900 });
    await readReply(page);
    await fits(initial.height);
    await chooseById(page, 'leo-course-ask-boss');
    await chooseById(page, 'leo-course-boss-continue');
    await chooseById(page, 'leo-course-negotiate');
    await readReply(page);
    await fits(initial.height);
    const save = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
    const environment = (await sceneState()).environment;
    await page.reload();
    await page.locator('#enter').click();
    await clickStoryContinue();
    assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), save);
    assert.deepEqual(
      (await sceneState()).environment,
      environment,
      'Reload preserves authored weather/time',
    );
    await readReply(page);
    await fits(initial.height);
    await chooseById(page, 'leo-course-negotiate-finish');
    await chooseById(page, 'leo-course-return');
    const text = await readReply(page);
    assert.ok(text.length > 0);
    assert.equal(
      await page.locator('[data-choice="leo-course-now"]').count(),
      0,
      'Completed career topic stays hidden',
    );
    await page.locator('#dialogue-history-toggle').click();
    assert.ok(
      (await page.locator('#dialogue-text').textContent()).includes('Лео:'),
      'History is available after replies',
    );
    await page.locator('#dialogue-history-toggle').click();
    await fits(initial.height);
    await page.locator('#dialogue-text').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(
      await page.locator('#dialogue-text:focus').count(),
      1,
      'Keyboard page control keeps reading focus',
    );
    await page.keyboard.press('Escape');
    await page.locator('#catalog-toggle').click();
    assert.equal(await page.locator('.story-book').count(), 5);
    await shot(`${viewport.width}-catalog`);
    await page.keyboard.press('Escape');
    await page.locator('#journal-toggle').click();
    await shot(`${viewport.width}-journal`);
    await page.keyboard.press('Escape');
    results.push({
      viewport,
      reducedMotion: true,
      dialogueHeight: initial.height,
      answerIds,
      saveReload: true,
      history: true,
      keyboard: true,
    });
    await page.close();
    console.log('Living Story layout PASS ' + viewport.width + 'x' + viewport.height);
  }
  // Observe real-time motion before narration; then speaking, interruption and skip.
  await open({ width: 1440, height: 900 }, false);
  await page.locator('#dialogue[data-staging]').waitFor();
  const before = await sceneState();
  await shot('1440-movement-start');
  await page.waitForTimeout(550);
  const during = await sceneState();
  assert.ok(during.x < before.x - 5, 'Visitor visibly walks before arrival narration');
  assert.equal(
    await page.locator('#choices').getAttribute('inert'),
    '',
    'Replies are held until staging finishes',
  );
  assert.ok(
    (await page.locator('#dialogue-text').textContent()).includes('Мить у книгарні'),
    'Action has not been claimed early',
  );
  await shot('1440-movement-mid');
  await page.locator('#stage-skip').click();
  await waitForDialogue(page);
  const after = await sceneState();
  assert.ok(
    Math.abs(after.x - 240) < 1 && Math.abs(after.y - 235) < 1,
    'Skip settles an exact authored position',
  );
  await shot('1440-movement-end');
  await chooseById(page, 'greet');
  await waitForDialogue(page);
  const pose1 = await sceneState();
  await shot('1440-speaking-a');
  await page.waitForTimeout(180);
  const pose2 = await sceneState();
  await shot('1440-speaking-b');
  assert.notEqual(pose1.angle, pose2.angle, 'Conversational nod is visible over time');
  assert.equal(pose1.direction, 'left', 'Visitor turns to the bookseller');
  await chooseById(page, 'finish');
  await page.locator('#dialogue[data-staging]').waitFor();
  await page.keyboard.press('Escape');
  assert.equal((await sceneState()).staging, false, 'Closing during an exit cancels the timeline');
  assert.equal((await sceneState()).visible, false, 'Interrupted exit settles the departed pose');
  await clickStoryContinue();
  await waitForDialogue(page);
  assert.ok((await readReply(page)).includes('Лео вже біля дверей'));
  results.push({
    realMotion: true,
    before,
    during,
    after,
    speakingAngles: [pose1.angle, pose2.angle],
    interruption: true,
    skip: true,
  });
  await page.close();
  // Actual sky pixels for all authored times/weather; same persisted node on reload.
  for (const stage of [
    'miller',
    'mara',
    'evening',
    'anna',
    'eleanor',
    'thomas',
    'day4-iris',
    'day4-leo',
    'day5-reading',
    'season-complete',
  ]) {
    await open({ width: 1440, height: 900 }, true, stage);
    await waitForDialogue(page);
    await page.keyboard.press('Escape');
    // Compose a window view using the same supported camera presentation cue.
    await page.evaluate(async () => {
      const { game } = await import('/phaser-prototype/scene.js');
      game.scene.getScene('bookshop').cameraLook = { x: 320 };
    });
    await page.waitForTimeout(80);
    const state = await sceneState();
    assert.equal(state.failed, false);
    await shot(`weather-${stage}`);
    results.push({ stage, environment: state.environment });
    await page.close();
  }
  await open({ width: 390, height: 844 }, false, 'day5-reading');
  await page.locator('#dialogue[data-staging]').waitFor();
  const catBefore = (await sceneState()).cat;
  await page.locator('#stage-skip').click();
  await waitForDialogue(page);
  const catAfter = (await sceneState()).cat;
  assert.equal(catAfter.x, 292);
  assert.equal(catAfter.y, 235);
  assert.equal(catAfter.activity, 'looking');
  await shot('390-frank-staged');
  results.push({ frankStaging: true, catBefore, catAfter });
  await page.close();
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2) + '\n');
  console.log(JSON.stringify({ results, errors }));
} catch (error) {
  if (page && !page.isClosed()) await shot('failure');
  await writeFile(
    `${output}/failure.json`,
    JSON.stringify({ error: String(error), results, errors }, null, 2),
  );
  throw error;
} finally {
  await fixture.close();
}

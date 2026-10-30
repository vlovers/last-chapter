import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-polish-v1');
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const browser = fixture.browser;
const results = [];
const errors = [];
let currentPage;
async function sceneSnapshot(page) {
  return page.evaluate(async () => {
    const { game } = await import('/phaser-prototype/scene.js');
    const s = game.scene.getScene('bookshop');
    const { canStand } = await import('/phaser-prototype/world.js');
    return {
      frank: { x: s.frank.state.x, y: s.frank.state.y, activity: s.frank.state.activity },
      simulationMs: s.frank.state.elapsed,
      valid: canStand(s.frank.state),
      mode: s.state.mode,
      failed: s.failed,
      fps: game.loop.actualFps,
    };
  });
}
async function openMara(page) {
  const toolbar = page
    .locator('.story-toolbar-actions')
    .getByRole('button', { name: 'Поговорити з Марою', exact: true });
  if (await toolbar.isVisible()) await toolbar.click();
  else {
    await page.locator('#journal-toggle').click();
    await page
      .locator('#story-panel')
      .getByRole('button', { name: 'Поговорити з Марою', exact: true })
      .click();
  }
}
async function choose(page, id) {
  await page.waitForTimeout(250);
  const choice = page.locator(`#choices button[data-choice="${id}"]`);
  const visitedPages = new Set();
  // The playable UI shows three replies and a fourth pagination button.
  // Walk real pages instead of assuming every engine option is rendered at once.
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await choice.isVisible()) {
      await choice.click();
      return;
    }
    const visibleIds = await page
      .locator('#choices button[data-choice]')
      .evaluateAll((buttons) => buttons.map((button) => button.dataset.choice));
    const signature = visibleIds.join(',');
    if (visitedPages.has(signature)) break;
    visitedPages.add(signature);
    const nextPage = page.locator('#choices button[data-choice="__more_choices"]');
    if (!(await nextPage.isVisible())) break;
    await nextPage.click();
  }
  throw new Error(
    `Choice "${id}" is not reachable through UI pages: ${[...visitedPages].join(' -> ')}`,
  );
}
async function layout(page) {
  await page.waitForTimeout(300);
  const measured = await page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return {
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };
    return {
      height: innerHeight,
      width: innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      y: scrollY,
      canvas: rect('canvas'),
      game: rect('#game'),
      hits: rect('#hotspots'),
      dialogue: rect('#dialogue'),
      choices: rect('#choices'),
      clippedChoices: Array.from(document.querySelectorAll('#choices button')).filter(
        (button) => button.scrollHeight > button.clientHeight + 1,
      ).length,
    };
  });
  assert.equal(measured.clippedChoices, 0, 'Wrapped choice text must fit its button');
  return measured;
}
try {
  for (const [device, width, height] of [
    ['desktop', 1280, 900],
    ['tablet', 820, 1180],
    ['mobile', 390, 844],
    ['compact', 1280, 720],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    currentPage = page;
    page.on('pageerror', (error) => errors.push(`${device}: ${error}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`${device}: ${m.text()}`);
    });
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${output}/after-${device}.png`, fullPage: true });
    // Ambient movement is observed in the running scene, not injected via fixtures.
    if (device === 'desktop') {
      const initial = await sceneSnapshot(page);
      const samples = [];
      // Safe simulation substeps are capped at 50ms. Slow software-rendered CI
      // must get the same amount of game time, rather than a fixed wall-clock race.
      const deadline = Date.now() + 45000;
      while (
        (samples.at(-1)?.simulationMs ?? initial.simulationMs) - initial.simulationMs < 7000 &&
        Date.now() < deadline
      ) {
        await page.waitForTimeout(700);
        const sample = await sceneSnapshot(page);
        samples.push(sample);
        assert.ok(sample.valid);
        assert.equal(sample.failed, false);
      }
      assert.ok(
        (samples.at(-1)?.simulationMs ?? 0) - initial.simulationMs >= 7000,
        'The running scene must advance seven simulated seconds within 45s',
      );
      assert.ok(
        samples.some(
          (s) => Math.hypot(s.frank.x - initial.frank.x, s.frank.y - initial.frank.y) > 10,
        ),
      );
      await page.getByRole('button', { name: 'Побути з Френком', exact: true }).click();
      await page.getByRole('heading', { name: 'Френк', exact: true }).waitFor();
      const paused = await sceneSnapshot(page);
      await page.waitForTimeout(450);
      assert.deepEqual((await sceneSnapshot(page)).frank, paused.frank);
      await choose(page, 'pet');
      await page.getByText('Ледь чутне муркотіння', { exact: false }).waitFor();
      await page.screenshot({ path: `${output}/frank-petting.png`, fullPage: true });
      await page.keyboard.press('Escape');
      results.push({
        device,
        ambient: { initial, final: samples.at(-1), samples: samples.length },
      });
    }
    await page.locator('#story-continue').click();
    const dimensions = await layout(page);
    assert.ok(dimensions.scrollWidth <= width + 1, `${device}: horizontal overflow`);
    assert.ok(
      dimensions.scrollHeight <= height + 2,
      `${device}: document scroll ${dimensions.scrollHeight}`,
    );
    assert.ok(
      dimensions.canvas.left >= dimensions.game.left - 1 &&
        dimensions.canvas.right <= dimensions.game.right + 1,
      `${device}: canvas outside parent`,
    );
    assert.ok(Math.abs(dimensions.canvas.left - dimensions.hits.left) < 1);
    assert.ok(Math.abs(dimensions.canvas.top - dimensions.hits.top) < 1);
    assert.ok(dimensions.choices.bottom <= height);
    assert.equal(dimensions.y, 0);
    await page.screenshot({ path: `${output}/after-${device}-dialogue.png`, fullPage: true });
    await choose(page, 'greet');
    await layout(page);
    await page.screenshot({ path: `${output}/${device}-portrait.png`, fullPage: true });
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('#choices button:focus').count(), 1);
    const save = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.locator('#story-continue').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), save);
    await page.keyboard.press('Escape');
    // Optional conversations require Mara to be physically in this visit.
    assert.equal(
      await page
        .locator('.story-toolbar-actions')
        .getByRole('button', { name: 'Поговорити з Марою', exact: true })
        .isVisible(),
      false,
    );
    await page.locator('#story-continue').click();
    for (const id of ['books', 'orchard', 'leave-orchard', '__advance']) await choose(page, id);
    await page.keyboard.press('Escape');
    // Optional topic finishes once; the day-unlocked next topic replaces it.
    await openMara(page);
    // The panel heading is now generic; the selected topic lives in its details summary.
    await page.getByRole('heading', { name: 'Розмова з Марою', exact: true }).waitFor();
    assert.match(
      (await page.locator('.conversation-topics summary').textContent()) ?? '',
      /Книжкові суперечки з Марою/,
    );
    await page.getByRole('button', { name: 'Повернімося до роботи', exact: true }).click();
    assert.equal(
      await page.getByRole('button', { name: 'Книжкові суперечки з Марою', exact: true }).count(),
      0,
    );
    assert.equal(
      await page.getByRole('button', { name: 'Поговорити знову', exact: true }).count(),
      0,
    );
    await page.keyboard.press('Escape');
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await openMara(page);
    assert.equal(
      await page.getByRole('button', { name: 'Книжкові суперечки з Марою', exact: true }).count(),
      0,
    );
    await page.keyboard.press('Escape');
    // A shortest valid narrative route is computed in the pure engine; every
    // choice is then made through the real UI and persisted by the running game.
    const visited = ['miller']; // Completed through the real UI before Mara's optional scene.
    for (let step = 0; step < 19; step++) {
      const plan = await page.evaluate(async () => {
        const { stageStory, chooseChapterOption } = await import('/src/game/chapter.ts');
        const { availableOptions } = await import('/src/game/dialogue.ts');
        const { decodeSave, SAVE_KEY } = await import('/src/game/save.ts');
        const story = window.__lastChapterStory;
        const stage = story.stage;
        if (
          [
            'complete',
            'day2-complete',
            'day3-complete',
            'day4-complete',
            'season-complete',
          ].includes(stage)
        )
          return { stage, day: story.day, route: [] };
        const initial = decodeSave(localStorage.getItem(SAVE_KEY));
        const queue = [{ state: initial, route: [] }],
          seen = new Set();
        for (let i = 0; i < queue.length && i < 5000; i++) {
          const entry = queue[i];
          const signature = JSON.stringify([
            entry.state.dialogue.node,
            [...entry.state.flags].sort(),
            entry.state.dialogue.completed,
          ]);
          if (seen.has(signature)) continue;
          seen.add(signature);
          const options = availableOptions(stageStory(stage), entry.state.dialogue);
          if (!options.length) return { stage, day: story.day, route: entry.route };
          for (const choice of options)
            queue.push({
              state: chooseChapterOption(entry.state, choice.id),
              route: [...entry.route, choice.id],
            });
        }
        throw new Error('No terminal route: ' + stage);
      });
      visited.push(plan.stage);
      await page.locator('#story-continue').click();
      await page.locator('#dialogue:not([hidden])').waitFor();
      if (['miller', 'iris', 'eleanor', 'day4-iris', 'day5-reading'].includes(plan.stage)) {
        await layout(page);
        await page.screenshot({ path: `${output}/${device}-day-${plan.day}.png`, fullPage: true });
      }
      if (plan.stage === 'mara' && device === 'desktop') {
        for (const id of ['hello', 'thank', 'talk', 'bakery']) await choose(page, id);
        // Suspending the actual story dialogue and reloading retains its node.
        await page.reload();
        await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
        await page.locator('#story-continue').click();
        assert.equal(await page.locator('#choices button[data-choice="bakery-tired"]').count(), 1);
        for (const id of ['bakery-tired', 'tired-ask', 'silence-return']) await choose(page, id);
        assert.equal(await page.locator('#choices button[data-choice="bakery"]').count(), 0);
        await page.reload();
        await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
        await page.locator('#story-continue').click();
        assert.equal(await page.locator('#choices button[data-choice="bakery"]').count(), 0);
        await layout(page);
        await page.screenshot({
          path: `${output}/desktop-mara-completed-topic.png`,
          fullPage: true,
        });
        plan.route = ['gift-now', 'station', 'finish-station'];
      }
      for (const id of plan.route) await choose(page, id);
      if (plan.stage === 'season-complete') {
        await page.keyboard.press('Escape');
        break;
      }
      await choose(page, '__advance');
      await page.keyboard.press('Escape');
    }
    assert.equal(visited.at(-1), 'season-complete');
    assert.equal(new Set(visited).size, 19);
    assert.equal((await sceneSnapshot(page)).failed, false);
    results.push({ device, dimensions, visited });
    await page.locator('#story-continue').click();
    await choose(page, '__restart');
    await page.keyboard.press('Escape');
    const restarted = await page.evaluate(() => ({
      stage: window.__lastChapterStory.stage,
      optional: JSON.parse(localStorage.getItem('last-chapter:conversation:mara:v1')),
    }));
    assert.equal(restarted.stage, 'miller');
    assert.equal(restarted.optional.finished, false);
    assert.deepEqual(restarted.optional.memories, []);
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors, output }, null, 2));
} catch (error) {
  if (currentPage && !currentPage.isClosed())
    await currentPage.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await fixture.close();
}

import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.QA_OUTPUT || 'docs/qa/mobile-overhaul';
await mkdir(output, { recursive: true });

const fixture = await launchQaBrowser(chromium);
const browser = fixture.browser;
const results = [];
try {
  for (const rate of [1, 4]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    try {
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate });
      await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5173');
      await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
      await page.waitForTimeout(1500);

      const samples = [];
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(1000);
        samples.push(
          await page.evaluate(async () => {
            const { game } = await import('/phaser-prototype/scene.js');
            const scene = game.scene.getScene('bookshop');
            return {
              fps: game.loop.actualFps,
              nodes: scene.children.length,
              decorReduced: scene.frameBudget.reduced,
              failed: scene.failed,
            };
          }),
        );
      }

      assert.deepEqual(pageErrors, [], `Browser errors under ${rate}x CPU throttling`);
      assert.ok(
        samples.every((sample) => sample.failed === false),
        'Bookshop scene failed',
      );
      assert.ok(
        samples.every((sample) => Number.isFinite(sample.fps) && sample.fps > 0),
        'Every frame-rate sample must be a positive finite number',
      );
      assert.ok(
        samples.every((sample) => sample.nodes > 0),
        'Scene must contain rendered objects',
      );
      assert.equal(
        new Set(samples.map((sample) => sample.nodes)).size,
        1,
        'Ambient animation must reuse scene objects',
      );

      // Idle-only measurements miss camera and hotspot regressions. Exercise
      // actual keyboard movement on the mobile viewport, including under CPU throttling.
      const snapshot = () =>
        page.evaluate(async () => {
          const { game } = await import('/phaser-prototype/scene.js');
          const scene = game.scene.getScene('bookshop');
          return {
            playerX: scene.characters.player.x,
            cameraX: scene.cameras.main.scrollX,
            nodes: scene.children.length,
            failed: scene.failed,
          };
        });
      const beforeMove = await snapshot();
      await page.locator('#game').focus();
      await page.keyboard.down('ArrowRight');
      try {
        await page.waitForTimeout(2500);
      } finally {
        await page.keyboard.up('ArrowRight');
      }
      const afterMove = await snapshot();
      assert.equal(afterMove.failed, false, 'Scene failed during keyboard navigation');
      assert.ok(
        afterMove.playerX > beforeMove.playerX + 10,
        'Player must move right using keyboard navigation',
      );
      assert.ok(
        afterMove.cameraX > beforeMove.cameraX,
        'Mobile camera must follow the moving player',
      );
      assert.equal(afterMove.nodes, beforeMove.nodes, 'Movement must reuse scene objects');
      assert.deepEqual(pageErrors, [], 'No browser errors during navigation');

      const fps = samples.map((sample) => sample.fps).sort((a, b) => a - b);
      results.push({
        cpuThrottle: rate,
        width: 390,
        height: 844,
        seconds: 10,
        minFps: fps[0],
        medianFps: fps[5],
        maxFps: fps.at(-1),
        navigation: { before: beforeMove, after: afterMove },
        samples,
      });
    } finally {
      await page.close();
    }
  }

  await writeFile(
    `${output}/performance.json`,
    JSON.stringify(
      {
        environment:
          'Headless desktop Chrome, mobile viewport; CPU throttling is a simulation, not a physical phone benchmark.',
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await fixture.close();
}

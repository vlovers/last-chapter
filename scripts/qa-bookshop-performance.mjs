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

      const fps = samples.map((sample) => sample.fps).sort((a, b) => a - b);
      results.push({
        cpuThrottle: rate,
        width: 390,
        height: 844,
        seconds: 10,
        minFps: fps[0],
        medianFps: fps[5],
        maxFps: fps.at(-1),
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

import assert from 'node:assert/strict';
import { launchQaBrowser } from './qa-browser.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const fixture = await launchQaBrowser(chromium);
const SAVE_KEY = 'last-chapter:save:v1';
const SERVICE_KEY = 'last-chapter:service:v1';
const OPTIONAL_KEYS = [
  'last-chapter:conversation:mara:v1',
  'last-chapter:conversation:mara:after-hours:v1',
  'last-chapter:conversation:mara:return:v1',
  'last-chapter:conversation:mara:letter:v1',
  'last-chapter:notes:v1',
];
try {
  for (const damage of ['missing', 'corrupt', 'future']) {
    const context = await fixture.browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript(({ damage, saveKey, serviceKey, optionalKeys }) => {
      if (damage === 'corrupt') localStorage.setItem(saveKey, '{broken');
      if (damage === 'future') localStorage.setItem(saveKey, JSON.stringify({ version: 999 }));
      if (damage === 'missing') localStorage.removeItem(saveKey);
      localStorage.setItem(serviceKey, 'old-service-record');
      for (const key of optionalKeys) localStorage.setItem(key, 'old-optional-record');
    }, { damage, saveKey: SAVE_KEY, serviceKey: SERVICE_KEY, optionalKeys: OPTIONAL_KEYS });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    const actual = await page.evaluate(({ saveKey, serviceKey, optionalKeys }) => ({
      save: localStorage.getItem(saveKey),
      service: localStorage.getItem(serviceKey),
      optional: optionalKeys.map((key) => localStorage.getItem(key)),
    }), { saveKey: SAVE_KEY, serviceKey: SERVICE_KEY, optionalKeys: OPTIONAL_KEYS });
    if (damage === 'future') {
      assert.equal(JSON.parse(actual.save).version, 999);
      assert.equal(actual.service, 'old-service-record');
      assert.deepEqual(actual.optional, OPTIONAL_KEYS.map(() => 'old-optional-record'));
    } else {
      assert.ok(actual.optional.every((value) => value === null || value === ''));
      assert.deepEqual(JSON.parse(actual.service).attempts, []);
    }
    assert.deepEqual(errors, [], `Browser errors during ${damage} recovery`);
    console.log(`PASS: ${damage} save recovery`);
    await context.close();
  }
  // A browser may deny storage reads entirely (privacy settings, sandboxed iframe).
  // The story must remain interactive and tell the player that progress is unsaved.
  const blockedContext = await fixture.browser.newContext({ reducedMotion: 'reduce' });
  try {
    await blockedContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() { throw new Error('SecurityError: storage blocked'); },
      });
    });
    const page = await blockedContext.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.locator('#save-warning:not([hidden])').waitFor();
    await page.locator('#story-continue').click();
    await page.locator('#choices [data-choice="greet"]').click();
    await page.locator('#save-warning:not([hidden])').waitFor();
    assert.deepEqual(errors, [], 'Browser errors with blocked storage');
    console.log('PASS: blocked storage warns and dialogue remains interactive');
  } finally {
    await blockedContext.close();
  }

} finally {
  await fixture.close();
}

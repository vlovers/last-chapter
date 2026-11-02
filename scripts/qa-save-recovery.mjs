import assert from 'node:assert/strict';
import { launchQaBrowser } from './qa-browser.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const fixture = await launchQaBrowser(chromium);
const SAVE_KEY = 'last-chapter:save:v1';
const SERVICE_KEY = 'last-chapter:service:v1';
const SEED_MARKER = 'last-chapter:qa:save-recovery-seeded:v1';
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
    await context.addInitScript(
      ({ damage, saveKey, serviceKey, optionalKeys, seedMarker }) => {
        // Init scripts run again on reload. Seed only once or a reset would
        // mask a broken save restore by overwriting the actual browser state.
        if (sessionStorage.getItem(seedMarker) === 'done') return;
        if (damage === 'corrupt') localStorage.setItem(saveKey, '{broken');
        if (damage === 'future') localStorage.setItem(saveKey, JSON.stringify({ version: 999 }));
        if (damage === 'missing') localStorage.removeItem(saveKey);
        localStorage.setItem(serviceKey, 'old-service-record');
        for (const key of optionalKeys) localStorage.setItem(key, 'old-optional-record');
        sessionStorage.setItem(seedMarker, 'done');
      },
      {
        damage,
        saveKey: SAVE_KEY,
        serviceKey: SERVICE_KEY,
        optionalKeys: OPTIONAL_KEYS,
        seedMarker: SEED_MARKER,
      },
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    const actual = await page.evaluate(
      ({ saveKey, serviceKey, optionalKeys }) => ({
        save: localStorage.getItem(saveKey),
        service: localStorage.getItem(serviceKey),
        optional: optionalKeys.map((key) => localStorage.getItem(key)),
      }),
      { saveKey: SAVE_KEY, serviceKey: SERVICE_KEY, optionalKeys: OPTIONAL_KEYS },
    );
    // Exercise an actual story write, not just the constructor's storage cleanup.
    await page.locator('#story-continue').click();
    await page.waitForTimeout(240);
    await page.locator('#choices [data-choice="greet"]').click();
    await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
    const afterChoice = await page.evaluate(
      ({ saveKey, serviceKey, optionalKeys }) => ({
        save: localStorage.getItem(saveKey),
        service: localStorage.getItem(serviceKey),
        optional: optionalKeys.map((key) => localStorage.getItem(key)),
      }),
      { saveKey: SAVE_KEY, serviceKey: SERVICE_KEY, optionalKeys: OPTIONAL_KEYS },
    );
    if (damage === 'future') {
      await page.keyboard.press('Escape');
      await page.locator('#journal-toggle').click();
      await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
      const notes = page.getByLabel('Ваші думки й запитання');
      assert.equal(await notes.inputValue(), '', 'Newer notes must not leak into an older chapter');
      await notes.fill('Пробні записи без збереження.');
      assert.equal(
        await page.evaluate((key) => localStorage.getItem(key), OPTIONAL_KEYS.at(-1)),
        'old-optional-record',
        'Editing must not overwrite newer notes',
      );
      await page.keyboard.press('Escape');
      await page.locator('#story-continue').click();
      for (const id of ['books', 'orchard', 'leave-orchard', '__advance']) {
        await page.waitForTimeout(240);
        await page.locator(`#choices [data-choice="${id}"]`).click();
      }
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
      await page.locator('.conversation-replies button').first().click();
      assert.deepEqual(
        await page.evaluate((keys) => keys.map((key) => localStorage.getItem(key)), OPTIONAL_KEYS),
        OPTIONAL_KEYS.map(() => 'old-optional-record'),
        'Optional replies must not overwrite future sidecars',
      );
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY), actual.save);
      assert.equal(afterChoice.save, actual.save);
      assert.equal(JSON.parse(actual.save).version, 999);
      assert.equal(afterChoice.service, 'old-service-record');
      assert.deepEqual(
        afterChoice.optional,
        OPTIONAL_KEYS.map(() => 'old-optional-record'),
      );
    } else {
      assert.ok(afterChoice.save, 'A fresh chapter must become persistable after recovery');
      assert.equal(
        (
          await page.evaluate(async (raw) => {
            const { decodeSave } = await import('/src/game/save.ts');
            return decodeSave(raw);
          }, afterChoice.save)
        ).dialogue.node,
        'hello',
        'A real choice must be persisted',
      );
      assert.ok(actual.optional.every((value) => value === null || value === ''));
      assert.deepEqual(JSON.parse(actual.service).attempts, []);
    }
    // A new document must restore the exact durable state, not silently
    // re-seed a fixture or reset the player to the beginning.
    await page.reload();
    const afterReload = await page.evaluate(
      ({ saveKey, serviceKey, optionalKeys }) => ({
        save: localStorage.getItem(saveKey),
        service: localStorage.getItem(serviceKey),
        optional: optionalKeys.map((key) => localStorage.getItem(key)),
      }),
      { saveKey: SAVE_KEY, serviceKey: SERVICE_KEY, optionalKeys: OPTIONAL_KEYS },
    );
    assert.deepEqual(afterReload, afterChoice, `${damage} state changed across reload`);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.locator('#story-continue').click();
    await page.waitForTimeout(240);
    if (damage === 'future') {
      // The old client must start a disposable chapter, not mutate the future save.
      await page.locator('#choices [data-choice="greet"]').click();
      await page.locator('#save-warning:not([hidden])').waitFor();
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY), actual.save);
    } else {
      // The saved greeting must resume at Miller's next reply, not replay arrival.
      await page.locator('#choices [data-choice="books"]').click();
      await page.waitForFunction(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}').node === 'order',
        SAVE_KEY,
      );
      assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).node, SAVE_KEY), 'order');
      await page.locator('#save-warning[hidden]').waitFor();
    }
    assert.deepEqual(errors, [], `Browser errors during ${damage} recovery and reload`);
    console.log(`PASS: ${damage} save recovery, reload and resumed choice`);
    await context.close();
  }
  // A browser may deny storage reads entirely (privacy settings, sandboxed iframe).
  // The story must remain interactive and tell the player that progress is unsaved.
  const blockedContext = await fixture.browser.newContext({ reducedMotion: 'reduce' });
  try {
    await blockedContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('SecurityError: storage blocked');
        },
      });
    });
    const page = await blockedContext.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.locator('#save-warning:not([hidden])').waitFor();
    await page.locator('#story-continue').click();
    await page.waitForTimeout(240);
    await page.locator('#choices [data-choice="greet"]').click();
    await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
    await page.locator('#save-warning:not([hidden])').waitFor();
    // Denied storage stays denied after a full navigation, without a crash.
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.locator('#save-warning:not([hidden])').waitFor();
    await page.locator('#story-continue').click();
    await page.waitForTimeout(240);
    await page.locator('#choices [data-choice="greet"]').click();
    await page.locator('#save-warning:not([hidden])').waitFor();
    assert.deepEqual(errors, [], 'Browser errors with blocked storage, including reload');
    console.log('PASS: blocked storage warns and dialogue remains interactive after reload');
  } finally {
    await blockedContext.close();
  }
} finally {
  await fixture.close();
}

import { chooseById } from './qa-dialogue.mjs';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { launchQaBrowser } from './qa-browser.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-save-recovery');
await mkdir(output, { recursive: true });
const results = [];
const fixture = await launchQaBrowser(chromium);
const SAVE_KEY = 'last-chapter:save:v1';
const SERVICE_KEY = 'last-chapter:service:v1';
const RECOVERY_KEY = 'last-chapter:save:recovery:v1';
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
    const context = await fixture.browser.newContext({
      reducedMotion: 'reduce',
      ...(damage === 'corrupt' ? { viewport: { width: 320, height: 568 }, hasTouch: true } : {}),
    });
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
    if (damage === 'corrupt') {
      await page.getByRole('button', { name: 'Відчинити книгарню' }).waitFor();
      await page.screenshot({ path: `${output}/320-recovery-notice.png`, fullPage: true });
      const enterBox = await page.getByRole('button', { name: 'Відчинити книгарню' }).boundingBox();
      assert.ok(
        enterBox && enterBox.y >= 0 && enterBox.y + enterBox.height <= 568,
        'Recovery notice leaves the opening action reachable on a small phone',
      );
    }
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
    await chooseById(page, 'greet');
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
        await chooseById(page, id);
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
      if (damage === 'corrupt') {
        const archive = await page.evaluate((key) => localStorage.getItem(key), RECOVERY_KEY);
        const original = JSON.parse(archive).snapshots[0].entries;
        assert.equal(original[SAVE_KEY], '{broken', 'The unreadable save remains recoverable');
        assert.equal(original[SERVICE_KEY], 'old-service-record');
        for (const key of OPTIONAL_KEYS) assert.equal(original[key], 'old-optional-record');
        assert.equal(await page.locator('#save-recovery-notice').count(), 1);
        await page.keyboard.press('Escape');
        await page.locator('#journal-toggle').click();
        await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
        const downloadEvent = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Завантажити резервну копію', exact: true }).click();
        const download = await downloadEvent;
        assert.equal(download.suggestedFilename(), 'last-chapter-recovery.json');
        assert.equal(await download.failure(), null);
        const downloadedPath = resolve(output, 'recovery-export.json');
        await download.saveAs(downloadedPath);
        assert.equal(
          await readFile(downloadedPath, 'utf8'),
          archive,
          'Download retains every original stored string',
        );
        await page.screenshot({ path: `${output}/320-recovery-download.png`, fullPage: true });
        await page.keyboard.press('Escape');
        await page.locator('#story-continue').click();
      }
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
      await chooseById(page, 'greet');
      await page.locator('#save-warning:not([hidden])').waitFor();
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY), actual.save);
    } else {
      // The saved greeting must resume at Miller's next reply, not replay arrival.
      await chooseById(page, 'books');
      await page.waitForFunction(
        (key) => JSON.parse(localStorage.getItem(key) ?? '{}').node === 'order',
        SAVE_KEY,
      );
      assert.equal(
        await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).node, SAVE_KEY),
        'order',
      );
      await page.locator('#save-warning').waitFor({ state: 'hidden' });
      if (damage === 'corrupt') {
        assert.equal(
          JSON.parse(await page.evaluate((key) => localStorage.getItem(key), RECOVERY_KEY))
            .snapshots[0].entries[SAVE_KEY],
          '{broken',
          'A new saved choice and reload do not erase the recovery archive',
        );
      }
    }
    assert.deepEqual(errors, [], `Browser errors during ${damage} recovery and reload`);
    console.log(`PASS: ${damage} save recovery, reload and resumed choice`);
    results.push({ test: damage, passed: true });
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
    await chooseById(page, 'greet');
    await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
    await page.locator('#save-warning:not([hidden])').waitFor();
    // Denied storage stays denied after a full navigation, without a crash.
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    await page.locator('#save-warning:not([hidden])').waitFor();
    await page.locator('#story-continue').click();
    await page.waitForTimeout(240);
    await chooseById(page, 'greet');
    await page.locator('#save-warning:not([hidden])').waitFor();
    assert.deepEqual(errors, [], 'Browser errors with blocked storage, including reload');
    console.log('PASS: blocked storage warns and dialogue remains interactive after reload');
    results.push({ test: 'blocked storage', passed: true });
  } finally {
    await blockedContext.close();
  }
  // A successful chapter read does not imply its independent sidecars were
  // readable. A transient failure must not authorize overwriting valid progress.
  for (const target of ['notes', 'active conversation', 'completed conversation']) {
    const context = await fixture.browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript(
      ({ target }) => {
        const original = Storage.prototype.getItem;
        const denied =
          target === 'notes' ? 'last-chapter:notes:v1' : 'last-chapter:conversation:mara:v1';
        Storage.prototype.getItem = function (key) {
          if (key === denied && original.call(sessionStorage, 'qa-deny-sidecar') === 'once') {
            sessionStorage.setItem('qa-deny-sidecar', 'done');
            throw new Error('Transient read denial');
          }
          return original.call(this, key);
        };
      },
      { target },
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(base);
    const original = await page.evaluate(async (target) => {
      const { FiveDayStory } = await import('/src/phaser/five-day-story.ts');
      const { maraBookClub } = await import('/src/phaser/mara-book-club.ts');
      const { startConversation, answerConversation, conversationView } =
        await import('/src/phaser/conversation-engine.ts');
      const game = new FiveDayStory();
      for (const id of ['greet', 'books', 'orchard', 'leave-orchard', '__advance']) game.choose(id);
      const session = answerConversation(
        maraBookClub,
        startConversation(maraBookClub),
        target === 'completed conversation' ? 'leave' : 'empathy',
      );
      const savedConversation = JSON.stringify(session);
      localStorage.setItem('last-chapter:conversation:mara:v1', savedConversation);
      localStorage.setItem('last-chapter:notes:v1', 'Попередні особисті записи');
      sessionStorage.setItem('qa-deny-sidecar', 'once');
      return {
        chapter: localStorage.getItem('last-chapter:save:v1'),
        conversation: savedConversation,
        topicTitle: maraBookClub.title,
        text: session.finished ? '' : conversationView(maraBookClub, session).text,
      };
    }, target);
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    if (target === 'notes') {
      await page.locator('#journal-toggle').click();
      await page.getByRole('button', { name: 'Мої записи', exact: true }).click();
      assert.equal(await page.locator('#personal-notes').isDisabled(), true);
      assert.equal(
        await page.evaluate(() => localStorage.getItem('last-chapter:notes:v1')),
        'Попередні особисті записи',
      );
      await page.getByRole('button', { name: 'Спробувати прочитати записи', exact: true }).click();
      assert.equal(await page.locator('#personal-notes').isEnabled(), true);
      assert.equal(await page.locator('#personal-notes').inputValue(), 'Попередні особисті записи');
      await page
        .locator('#personal-notes')
        .fill('Попередні особисті записи. Доповнено після відновлення.');
      assert.equal(
        await page.evaluate(() => localStorage.getItem('last-chapter:notes:v1')),
        'Попередні особисті записи. Доповнено після відновлення.',
      );
    } else {
      await page.getByRole('button', { name: 'Поговорити з Марою', exact: true }).click();
      assert.equal(
        await page.locator('.conversation-replies').count(),
        0,
        'Unreadable progress cannot be restarted by a reply',
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem('last-chapter:conversation:mara:v1')),
        original.conversation,
      );
      await page.getByRole('button', { name: 'Спробувати прочитати розмови', exact: true }).click();
      assert.equal(
        await page.evaluate(() => localStorage.getItem('last-chapter:conversation:mara:v1')),
        original.conversation,
      );
      if (target === 'active conversation') {
        assert.equal(await page.locator('.conversation-exchange > p').textContent(), original.text);
        await page
          .getByRole('button', {
            name: 'У книжці мені цікаві навіть небезпечні герої',
            exact: true,
          })
          .click();
        assert.equal(
          JSON.parse(
            await page.evaluate(() => localStorage.getItem('last-chapter:conversation:mara:v1')),
          ).node,
          'fiction',
        );
      } else {
        assert.equal(
          await page.getByRole('button', { name: original.topicTitle, exact: true }).count(),
          0,
        );
        assert.equal(
          JSON.parse(
            await page.evaluate(() => localStorage.getItem('last-chapter:conversation:mara:v1')),
          ).finished,
          true,
        );
      }
    }
    assert.equal(
      await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')),
      original.chapter,
      'Sidecar recovery does not replay chapter choices',
    );
    assert.deepEqual(errors, []);
    results.push({ test: `${target} read denial and retry`, passed: true });
    console.log(`PASS: ${target} read denial preserves progress and retry restores it`);
    await context.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify({ results }, null, 2));
} finally {
  await fixture.close();
}

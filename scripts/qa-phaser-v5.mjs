import { launchQaBrowser } from './qa-browser.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-v5-qa');
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const browser = fixture.browser;
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
try {
  await page.goto(base);
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-tools').waitFor();
  assert.equal(await page.locator('#day-timeline li').count(), 5);
  assert.equal(await page.locator('#story-continue').textContent(), 'День 1 · Пані Міллер');

  await page.getByRole('button', { name: 'Каталог книжок' }).click();
  assert.equal(await page.locator('.story-book').count(), 5);
  await page.getByRole('button', { name: 'Детективи' }).click();
  assert.ok((await page.locator('.story-book').count()) > 0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Нотатник' }).click();
  await page.getByRole('heading', { name: 'Нотатник книгаря' }).waitFor();
  await page.getByRole('button', { name: 'Знахідки', exact: true }).click();
  await page.getByText('Огляньте книгарню. Тут з’являться лише досліджені знахідки.').waitFor();
  await page.keyboard.press('Escape');

  await page.locator('#story-continue').click();
  await page.getByText('Дзвіночок над дверима озвався двічі.', { exact: false }).waitFor();
  const firstChoice = page.locator('#choices button').first();
  await page.waitForTimeout(260);
  await firstChoice.click();
  await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
  const save = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
  assert.ok(save?.includes('"stage":"miller"'));
  await page.screenshot({ path: `${output}/first-visit.png`, fullPage: true });

  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-continue').click();
  await page.getByRole('heading', { name: 'Пані Міллер', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), save);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Нотатник' }).click();
  await page.getByRole('heading', { name: 'Нотатник книгаря' }).waitFor();

  // Walk all 19 stages via reachable terminal routes instead of cycling first options.
  const walk = await page.evaluate(async () => {
    const { chooseChapterOption, stageStory, startChapter } = await import('/src/game/chapter.ts');
    const { availableOptions } = await import('/src/game/dialogue.ts');
    const { decodeSave, SAVE_KEY } = await import('/src/game/save.ts');
    const story = window.__lastChapterStory;
    if (!story) throw new Error('Missing five-day story');
    const checkpoints = ['complete', 'day2-complete', 'day3-complete', 'day4-complete'];
    const visited = new Set();
    const pathToTerminal = (initial) => {
      const queue = [{ state: initial, route: [] }];
      const seen = new Set();
      for (let index = 0; index < queue.length && index < 5000; index++) {
        const entry = queue[index];
        const key = JSON.stringify({
          node: entry.state.dialogue.node,
          flags: [...entry.state.dialogue.flags].sort(),
          completed: [...(entry.state.dialogue.completed ?? [])].sort(),
          pending: entry.state.dialogue.pending ?? [],
        });
        if (seen.has(key)) continue;
        seen.add(key);
        const options = availableOptions(stageStory(initial.stage), entry.state.dialogue);
        if (!options.length) return entry.route;
        for (const option of options) {
          queue.push({
            state: chooseChapterOption(entry.state, option.id),
            route: [...entry.route, option.id],
          });
        }
      }
      throw new Error('No reachable terminal for ' + initial.stage);
    };
    // Verify both optional Day 3 routes before advancing the live season.
    // This uses the same transition engine as the browser story, but leaves
    // the current save untouched.
    const { skipBookClub, startBookClub, finishThirdDay, startFourthDay } =
      await import('/src/game/chapter.ts');
    const { noraVisit } = await import('/src/content/nora.ts');
    const { startDialogue } = await import('/src/game/dialogue.ts');
    const noraFinished = {
      ...startChapter(),
      stage: 'nora',
      dialogue: { ...startDialogue(noraVisit), node: 'end' },
    };
    const quiet = skipBookClub(noraFinished);
    const found = chooseChapterOption(chooseChapterOption(quiet, 'tidy-books'), 'keep-page');
    const quietDayFour = startFourthDay(finishThirdDay(found));
    if (!quietDayFour.flags.includes('quiet_evening_page_found')) {
      throw new Error('Quiet evening lost the manuscript clue');
    }
    if (!quietDayFour.dialogue.flags.includes('book_club_skipped')) {
      throw new Error('Quiet evening lost the skipped-club choice');
    }
    const club = startBookClub(noraFinished);
    if (!club.flags.includes('book_club_started') || club.flags.includes('book_club_skipped')) {
      throw new Error('Book club flags are inconsistent');
    }
    const { exploreAfterBookClub } = await import('/src/game/chapter.ts');
    const afterClub = exploreAfterBookClub({
      ...club,
      dialogue: { ...club.dialogue, node: 'end' },
    });
    const foundAfterClub = chooseChapterOption(
      chooseChapterOption(afterClub, 'tidy-books'),
      'keep-page',
    );
    const clubDayFour = startFourthDay(finishThirdDay(foundAfterClub));
    if (!clubDayFour.flags.includes('book_club_started') ||
        !clubDayFour.flags.includes('quiet_evening_page_found')) {
      throw new Error('Post-club exploration lost the club or manuscript progress');
    }
    for (let i = 0; i < 25 && story.stage !== 'season-complete'; i++) {
      const stage = story.stage;
      visited.add(stage);
      if (!checkpoints.includes(stage)) {
        const state = decodeSave(localStorage.getItem(SAVE_KEY) ?? '') ?? startChapter();
        for (const choice of pathToTerminal(state)) story.choose(choice);
      }
      const button = story.open().choices[0];
      if (button?.id !== '__advance') throw new Error('Cannot advance ' + stage);
      story.choose('__advance');
    }
    return { stage: story.stage, visited: [...visited], progress: story.progress };
  });
  assert.equal(walk.stage, 'season-complete');
  assert.equal(walk.visited.length, 18);
  assert.ok(walk.progress.every((day) => day.status === 'completed'));
  const finalSave = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
  assert.ok(finalSave, 'Completed season must be saved');
  const finalState = JSON.parse(finalSave);
  assert.equal(finalState.stage, 'season-complete');
  await page.reload();
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-continue').click();
  await page.getByRole('heading', { name: 'Останній розділ · Перший сезон' }).waitFor();
  await page.screenshot({ path: `${output}/season-finale.png`, fullPage: true });
  assert.equal(await page.locator('#day-timeline .day-step--completed').count(), 5);
  assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), finalSave);
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify({ walk, errors }, null, 2));
  console.log(JSON.stringify({ walk, errors, output }, null, 2));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await fixture.close();
}

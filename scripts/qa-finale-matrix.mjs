import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { launchQaBrowser } from './qa-browser.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = resolve(process.env.QA_OUTPUT || '/private/tmp/last-chapter-finale-matrix');
await mkdir(output, { recursive: true });
const fixture = await launchQaBrowser(chromium);
const errors = [];
const results = [];
let page;

async function enter() {
  await page.goto(base);
  await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
  await page.locator('#story-tools').waitFor();
}

async function chooseAcrossPages(id) {
  for (let index = 0; index < 40; index++) {
    await page.waitForTimeout(240);
    const count = await page.locator('#choices button').count();
    assert.ok(count <= 4, 'More than four choices shown: ' + count);
    const choice = page.locator('#choices button[data-choice="' + id + '"]');
    if (await choice.count()) {
      await choice.click();
      return;
    }
    const more = page.locator('#choices button[data-choice="__more_choices"]');
    assert.ok(await more.count(), 'Missing choice and pagination: ' + id);
    await more.click();
  }
  throw new Error('Choice not found across 40 pages: ' + id);
}

try {
  page = await fixture.browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await enter();
  // Exercise every ending against the Vite-served browser modules, not only Vitest.
  const matrix = await page.evaluate(async () => {
    const { chooseChapterOption, finishSeason, startFifthDay } =
      await import('/src/game/chapter.ts');
    const { availableOptions, currentNode, startDialogue } = await import('/src/game/dialogue.ts');
    const { seasonEnding } = await import('/src/game/endings.ts');
    const { decodeSave, encodeSave } = await import('/src/game/save.ts');
    const { finalReading } = await import('/src/content/day-five.ts');
    const initialFlags = [
      'final_ledger_scene_complete',
      'final_manuscript_provenance_decided',
      'final_ledger_iris_told',
      'mara_window_plan_discussed',
      'leo_night_course_discussed',
      'mara_window_credit_encouraged',
      'leo_night_course_deferred',
      'nora_cinema_exhibit_discussed',
    ];
    const cases = [
      [
        'sealed',
        ['case-decision-seal'],
        'final_case_sealed',
        'зв’язку з рукописом ніхто не довів',
        'Після вечора Нора залишила',
      ],
      [
        'Iris declined',
        ['case-decision-iris', 'case-iris-decline'],
        'final_case_iris_declined',
        'дозволу на публікацію ніхто не давав',
        'Айріс відмовилася обговорювати підсумок',
      ],
    ];
    const calendars = [
      [
        'offered',
        'saturday-calendar-offer',
        'final_saturday_calendar_offered',
        'лише Елеонорина примітка купити чай',
        'жодної зустрічі ще не призначили',
      ],
      [
        'separate',
        'saturday-calendar-separate',
        'final_saturday_plans_separate',
        'не записує їх у розклад книгарні',
        'Суботній календар книгарні залишився порожнім',
      ],
    ];
    const cinemas = [
      [
        'compared',
        'final-nora-miller-compare',
        'final-nora-miller-compare-detail',
        'final-nora-miller-compare-back',
        'final_nora_miller_notes_compared',
        'сімейну листівку Міллер забрала додому',
        'невідомий рік так і не перетворився на факт',
      ],
      [
        'caption',
        'final-nora-miller-caption',
        'final-nora-miller-caption-detail',
        'final-nora-miller-caption-back',
        'final_nora_miller_caption_drafted',
        'Рік зйомки ще не встановили',
        'Портрети людей не виставляли',
      ],
      [
        'deferred',
        'final-nora-miller-defer',
        'final-nora-miller-defer-detail',
        'final-nora-miller-defer-back',
        'final_nora_miller_exhibit_deferred',
        'ніхто не друкує афішу',
        'Виставку не оголосили відкритою',
      ],
    ];
    const summaries = [];
    const fixtures = [];
    for (const caseRoute of cases) {
      for (const calendar of calendars) {
        for (const cinema of cinemas) {
          const flags = [...initialFlags];
          let state = startFifthDay({
            stage: 'day4-complete',
            flags,
            dialogue: { ...startDialogue(finalReading), flags },
          });
          const steps = [
            'open',
            'case-closure',
            'case-topic-timeline',
            'case-timeline-back',
            'case-topic-authors',
            'case-authors-back',
            'case-topic-people',
            'case-people-back',
            'case-topic-finish',
            ...caseRoute[1],
            'case-result-finish',
            'final-saturday-plans-topic',
            'saturday-talk-calendar',
            calendar[1],
            'saturday-calendar-result-back',
            'saturday-finish',
            'final-nora-miller-cinema-topic',
            cinema[1],
            cinema[2],
            cinema[3],
          ];
          for (const id of steps) {
            if (
              !availableOptions(finalReading, state.dialogue).some((option) => option.id === id)
            ) {
              throw new Error('Unavailable choice ' + id + ' at ' + state.dialogue.node);
            }
            const next = chooseChapterOption(state, id);
            const restored = decodeSave(encodeSave(next));
            if (!restored || encodeSave(restored) !== encodeSave(next)) {
              throw new Error('Save roundtrip changed ' + id);
            }
            state = restored;
          }
          if (state.dialogue.node !== 'gathering') {
            throw new Error('Expected gathering, got ' + state.dialogue.node);
          }
          const beforeCloseSave = encodeSave(state);
          const finished = chooseChapterOption(state, 'close');
          const afterword = currentNode(finalReading, finished.dialogue).text;
          const epilogue = seasonEnding(finishSeason(finished)).epilogue;
          const expected = [
            [caseRoute[2], caseRoute[3], caseRoute[4]],
            [calendar[2], calendar[3], calendar[4]],
            [cinema[4], cinema[5], cinema[6]],
          ];
          for (const [flag, text, ending] of expected) {
            if (!state.flags.includes(flag)) throw new Error('Missing flag ' + flag);
            if (!afterword.includes(text)) throw new Error('Missing afterword ' + text);
            if (!epilogue.includes(ending)) throw new Error('Missing epilogue ' + ending);
          }
          const allFlags = [
            ...cases.map((item) => item[2]),
            ...calendars.map((item) => item[2]),
            ...cinemas.map((item) => item[4]),
          ];
          for (const flag of allFlags) {
            if (!expected.some((item) => item[0] === flag) && state.flags.includes(flag)) {
              throw new Error('Leaked exclusive flag ' + flag);
            }
          }
          if (afterword.includes('авторство доведено')) {
            throw new Error('Unverified authorship claimed as fact');
          }
          summaries.push({ case: caseRoute[0], calendar: calendar[0], cinema: cinema[0] });
          if (summaries.length === 1 || summaries.length === 12) {
            fixtures.push({
              save: beforeCloseSave,
              afterwords: expected.map((item) => item[1]),
              epilogues: expected.map((item) => item[2]),
            });
          }
        }
      }
    }
    return { summaries, fixtures };
  });
  assert.equal(matrix.summaries.length, 12);

  // Verify the opposite outcomes through actual UI choice pagination and reload.
  for (const [index, fixtureCase] of matrix.fixtures.entries()) {
    const [width, height] = index === 0 ? [1280, 900] : [390, 844];
    await page.setViewportSize({ width, height });
    await page.evaluate((save) => {
      localStorage.setItem('last-chapter:save:v1', save);
    }, fixtureCase.save);
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    assert.equal(await page.evaluate(() => window.__lastChapterStory.stage), 'day5-reading');
    await page.locator('#story-continue').click();
    await page.locator('#dialogue:not([hidden])').waitFor();
    await chooseAcrossPages('close');
    await page.locator('#choices button[data-choice="__advance"]').waitFor();
    const afterword = await page.evaluate(() => window.__lastChapterStory.open().text);
    for (const phrase of fixtureCase.afterwords) assert.ok(afterword.includes(phrase), phrase);
    const saved = await page.evaluate(() => localStorage.getItem('last-chapter:save:v1'));
    await page.reload();
    await page.getByRole('button', { name: 'Відчинити книгарню' }).click();
    assert.equal(await page.evaluate(() => localStorage.getItem('last-chapter:save:v1')), saved);
    await page.locator('#story-continue').click();
    await chooseAcrossPages('__advance');
    assert.equal(await page.evaluate(() => window.__lastChapterStory.stage), 'season-complete');
    const epilogue = await page.evaluate(() => window.__lastChapterStory.open().text);
    for (const phrase of fixtureCase.epilogues) assert.ok(epilogue.includes(phrase), phrase);
    await page.screenshot({ path: output + '/finale-' + (index + 1) + '.png', fullPage: true });
    results.push({ width, height, saved: true, callbacks: fixtureCase.afterwords.length });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    output + '/results.json',
    JSON.stringify({ matrix: matrix.summaries, results, errors }, null, 2),
  );
  console.log(
    JSON.stringify({ routes: matrix.summaries.length, results, errors, output }, null, 2),
  );
} catch (error) {
  if (page && !page.isClosed()) {
    await page.screenshot({ path: output + '/failure.png', fullPage: true }).catch(() => {});
  }
  throw error;
} finally {
  await fixture.close();
}

import assert from 'node:assert/strict';

/** Exercise the same two page controls as a reader: reply pages and answer pages. */
export async function waitForDialogue(page) {
  await page.locator('#dialogue:not([hidden]):not([data-staging])').waitFor({ timeout: 20000 });
  await page.waitForTimeout(240);
}
export async function revealAnswer(page, button) {
  for (let i = 0; i < 12; i++) {
    if (await button.isVisible()) return;
    const next = page.locator('#answers-next');
    assert.ok(await next.isVisible(), 'Hidden answer has a page control');
    await next.click();
  }
  throw new Error('Answer page did not become visible');
}
export async function chooseById(page, id, { touch = false } = {}) {
  for (let i = 0; i < 40; i++) {
    await waitForDialogue(page);
    const button = page.locator(`#choices button[data-choice="${id}"]`);
    const target = (await button.count())
      ? button
      : page.locator('#choices button[data-choice="__more_choices"]');
    assert.equal(await target.count(), 1, 'Choice reachable through pages: ' + id);
    await revealAnswer(page, target);
    const box = await target.boundingBox();
    const viewport = page.viewportSize();
    assert.ok(
      box &&
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= viewport.width + 1 &&
        box.y + box.height <= viewport.height + 1,
      'Full answer label fits the viewport: ' + id,
    );
    if (touch) await target.tap();
    else await target.click();
    if (target === button) {
      if (!(await page.locator('#dialogue').isHidden()))
        await page
          .locator('#dialogue:not([hidden]):not([data-staging])')
          .waitFor({ timeout: 20000 });
      return;
    }
  }
  throw new Error('Story choice pagination exceeded its bound: ' + id);
}
export async function readReply(page) {
  await waitForDialogue(page);
  while (await page.locator('#dialogue-previous').isEnabled())
    await page.locator('#dialogue-previous').click();
  const paragraphs = [];
  for (let i = 0; i < 120; i++) {
    if (await page.locator('#typewriter-skip').isVisible())
      await page.locator('#typewriter-skip').evaluate((button) => button.click());
    const current = await page.locator('#dialogue-text').evaluate((node) => ({
      player: node.querySelector('.sr-only')?.textContent === '',
      accessible: node.querySelector('.sr-only')?.textContent,
      visual: node.querySelector('[aria-hidden="true"]')?.textContent,
      clipped: node.scrollHeight > node.clientHeight + 1,
    }));
    assert.equal(current.clipped, false, 'Every prose page fits without scrolling');
    assert.equal(
      current.visual,
      current.accessible,
      'Visual and accessible page contain the same words',
    );
    if (!current.player) paragraphs.push(current.visual);
    if (await page.locator('#dialogue-next').isDisabled())
      return paragraphs.join(' ').replace(/\s+/g, ' ').trim();
    await page.locator('#dialogue-next').click();
  }
  throw new Error('Reply pagination exceeded its bound');
}

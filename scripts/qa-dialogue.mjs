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
    // Pagination is a DOM-only action. A responsive dialogue may keep shifting its
    // button while the viewport settles; dispatch the click without Playwright's
    // pointer-stability wait, while still requiring the control to be visible.
    await next.evaluate((element) => element.click());
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
    // On narrow screens the answer list is independently scrollable. Bring the
    // selected answer into view before checking its hit target and tapping it.
    await target.scrollIntoViewIfNeeded();
    // Playwright can consider an answer visible when only its lower portion is
    // inside the scrollport. Center it within #choices before hit-testing:
    // the dialogue pagination row sits immediately above that scrollport.
    await target.evaluate((element) => {
      const choices = element.closest('#choices');
      if (!choices) return;
      const viewport = choices.getBoundingClientRect();
      const answer = element.getBoundingClientRect();
      const offset =
        answer.top + answer.height / 2 - (viewport.top + viewport.height / 2);
      choices.scrollTop += offset;
    });
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
    // A visible answer may still be covered by a dialogue page control or
    // an overflowing body. Fail with the actual obstructing element instead
    // of waiting 30 seconds for Playwright's generic click timeout.
    const hit = await target.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const top = document.elementFromPoint(x, y);
      const owner = top?.closest('#dialogue-pages, #dialogue-text, #choices, .dialogue-body');
      return {
        hit: top === element || element.contains(top),
        target: element.getAttribute('data-choice'),
        obstruction: top?.outerHTML.slice(0, 250) ?? null,
        owner: owner?.id || owner?.className || null,
        point: { x: Math.round(x), y: Math.round(y) },
        geometry: Object.fromEntries(
          ['#dialogue', '.dialogue-body', '#dialogue-text', '#dialogue-pages', '#choices']
            .map((selector) => {
              const node = document.querySelector(selector);
              if (!node) return null;
              const box = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              return [
                selector,
                {
                  x: Math.round(box.x),
                  y: Math.round(box.y),
                  width: Math.round(box.width),
                  height: Math.round(box.height),
                  display: style.display,
                  position: style.position,
                  overflow: style.overflow,
                  zIndex: style.zIndex,
                },
              ];
            })
            .filter(Boolean),
        ),
      };
    });
    assert.ok(hit.hit, 'Dialogue answer is obscured: ' + JSON.stringify(hit));
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
